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
    <b-button class="position-absolute image-delete-button" variant="danger" v-b-tooltip="$t('buttonDelete')" @click="deleteImage" v-if="storeToken && storeToken.userType && userIsAtLeast(storeToken.userType, 'Data Curator')">
      <MdiIcon :path="mdiDelete" />
    </b-button>
    <b-card-body class="card-image-details">
      <b-input-group v-if="storeToken && storeToken.userType && userIsAtLeast(storeToken.userType, 'Data Curator')" class="mb-2">
        <b-textarea rows="3" max-rows="10" class="image-description" v-model="image.imageDescription"/>
        <b-input-group-append>
          <b-button variant="success" @click="updateImageDescription"><MdiIcon :path="mdiContentSave" /></b-button>
        </b-input-group-append>
      </b-input-group>
      <div class="mb-2" v-else>{{ image.imageDescription }}</div>
      <div class="text-muted mb-2" v-if="image.createdOn"><MdiIcon :path="mdiCalendarClock" /> {{ new Date(image.createdOn).toLocaleString() }}</div>
      <div class="mb-2"  v-if="hasExif">
        <b-button @click="$refs.imageExifModal.show()"><MdiIcon :path="mdiImageText" /> {{ $t('buttonShowExif') }}</b-button>
      </div>
      <div>
        <!-- Show tags -->
        <template v-if="image.tags">
          <b-badge v-for="(tag, index) in image.tags" :key="`image-tag-${image.imageId}-${index}`" class="mr-1">
            {{ tag.tagName }}
          </b-badge>
        </template>
        <div v-if="storeToken && storeToken.userType && userIsAtLeast(storeToken.userType, 'Data Curator')">
          <b-badge class="bg-info"
                    v-b-tooltip.hover
                    href="#"
                    event=""
                    @click="showTagEditModal"
                    :title="$t('tooltipTagEdit')" >
            <MdiIcon :path="mdiPencil" />
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
      <MdiIcon :path="imageTypes[image.imageRefTable].path" /> {{ image.referenceName }}
    </div>

    <ImageExifModal :image="image" ref="imageExifModal" v-if="hasExif" />
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import EditTagModal from '@/components/modals/EditTagModal'
import ImageExifModal from '@/components/modals/ImageExifModal'
import { imageTypes } from '@/mixins/types'
import { apiDeleteImage, apiPatchImage } from '@/mixins/api/misc'
import { getImageUrl } from '@/mixins/image'
import { userIsAtLeast } from '@/mixins/api/auth'

import { mdiDelete, mdiContentSave, mdiCalendarClock, mdiPencil, mdiImageText } from '@mdi/js'

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
      imageTypes,
      mdiDelete,
      mdiContentSave,
      mdiCalendarClock,
      mdiPencil,
      mdiImageText,
      src: null,
      largeSrc: null,
      imageLoaded: false
    }
  },
  components: {
    EditTagModal,
    ImageExifModal,
    MdiIcon
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    hasExif: function () {
      return this.image && this.image.imageExif && Object.keys(this.image.imageExif).length > 0
    }
  },
  methods: {
    userIsAtLeast,
    showTagEditModal: function () {
      this.$refs.editTagModal.show()
    },
    updateImageDescription: function () {
      apiPatchImage(this.image)
    },
    getSrc: function (size) {
      return getImageUrl(this.image.imagePath, {
        name: this.image.imagePath,
        token: this.storeToken ? this.storeToken.imageToken : null,
        type: 'database',
        size: size
      })
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
            apiDeleteImage(this.image.imageId, result => {
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
