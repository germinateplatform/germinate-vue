<template>
  <b-card no-body class="image-card" v-if="image">
    <!-- The image -->
    <a :href="getSrc('large')" @click.prevent="$emit('image-clicked')" :data-caption="image.imageDescription">
      <div>
        <b-img :src="getSrc('small')" class="card-img" style="height: 300px" :alt="image.imageDescription" @load="() => imageLoaded = true" />
        <b-progress class="image-load-progress" :value="100" striped animated height="6px" v-if="imageLoaded === false" />
        <div style="height: 6px;" v-else />
      </div>
    </a>
    <b-button class="position-absolute image-delete-button" variant="danger" v-b-tooltip="$t('buttonDelete')" @click="deleteImage" v-if="token && token.userType && userIsAtLeast(token.userType, 'Data Curator')"><i class="mdi mdi-18px mdi-delete" /></b-button>
    <b-card-body class="card-image-details">
      <b-input-group v-if="token && token.userType && userIsAtLeast(token.userType, 'Data Curator')" class="mb-2">
        <b-textarea rows="3" max-rows="10" class="image-description" v-model="image.imageDescription"/>
        <b-input-group-append>
          <b-button variant="success" @click="updateImageDescription"><i class="mdi mdi-content-save mdi-18px" /></b-button>
        </b-input-group-append>
      </b-input-group>
      <div class="mb-2" v-else>{{ image.imageDescription }}</div>
      <div class="text-muted mb-2" v-if="image.createdOn"><i class="mdi mdi-18px fix-alignment mdi-calendar-clock" /> {{ image.createdOn | toDateTime }}</div>
      <div>
        <!-- Show tags -->
        <template v-if="image.tags">
          <b-badge v-for="(tag, index) in image.tags" :key="`image-tag-${image.imageId}-${index}`" class="mr-1">
            {{ tag.tagName }}
          </b-badge>
        </template>
        <div v-if="token && token.userType && userIsAtLeast(token.userType, 'Data Curator')">
          <b-badge class="bg-info"
                    v-b-tooltip.hover
                    href="#"
                    event=""
                    @click="showTagEditModal"
                    :title="$t('tooltipTagEdit')" >
            <i class="mdi mdi-18px mdi-pencil" />
          </b-badge>
          <!-- Add/edit tag modal -->
          <EditTagModal :imageId="image.imageId"
                        :allTags="allTags"
                        :prefilledTags="image.tags"
                        v-on:tags-changed="$emit('tags-changed')"
                        ref="editTagModal" />
        </div>
      </div>
    </b-card-body>
    <div disabled class="btn" :style="`color: white; background-color: ${imageTypes[image.imageRefTable].color()}; border: 1px solid ${imageTypes[image.imageRefTable].color()};`">
      <i :class="`mdi mdi-18px ${imageTypes[image.imageRefTable].icon} fix-alignment`" /> {{ image.referenceName }}
    </div>
  </b-card>
</template>

<script>
import EditTagModal from '@/components/modals/EditTagModal'
import typesMixin from '@/mixins/types.js'
import miscApi from '@/mixins/api/misc.js'

export default {
  props: {
    image: {
      type: Object,
      default: () => null
    },
    allTags: {
      type: Array,
      default: () => []
    }
  },
  data: function () {
    return {
      src: null,
      largeSrc: null,
      imageLoaded: false
    }
  },
  components: {
    EditTagModal
  },
  mixins: [ miscApi, typesMixin ],
  methods: {
    showTagEditModal: function () {
      this.$refs.editTagModal.show()
    },
    updateImageDescription: function () {
      this.apiPatchImage(this.image)
    },
    getSrc: function (size) {
      const params = {
        name: this.image.imagePath,
        token: this.token ? this.token.imageToken : null,
        type: 'database',
        size: size
      }
      const paramString = this.toUrlString(params)

      let name = this.image.imagePath
      let index = name.lastIndexOf('\\')
      if (index !== -1) {
        name = name.substring(index + 1)
      }
      index = name.lastIndexOf('/')
      if (index !== -1) {
        name = name.substring(index + 1)
      }

      return `${this.baseUrl}image/src/${encodeURI(name)}?${paramString}`
    },
    deleteImage: function () {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            // Delete the image
            this.apiDeleteImage(this.image.imageId, result => {
              if (result) {
                this.$emit('image-deleted')
              }
            })
          }
        })
    }
  }
}
</script>

<style>
.image-card .card-img {
  width: 100%;
  object-fit: cover;
  transition: transform .2s ease-in-out;
}
.image-card .btn {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.image-load-progress {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.image-delete-button {
  right: 0;
  border-top-left-radius: 0;
  border-bottom-right-radius: 0;
}
.image-description {
  overflow-y: auto !important;
}
</style>
