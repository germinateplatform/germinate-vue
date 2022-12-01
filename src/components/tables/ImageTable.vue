<template>
  <div>
    <CoolLightBox
      :items="coolboxImages"
      :index="coolboxIndex"
      effect="fade"
      @close="coolboxIndex = null" />
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="table"
               v-on="$listeners">
      <!-- Reference table -->
      <template v-slot:cell(imageRefTable)="data">
        <b-badge class="w-100" :style="`color: ${getHighContrastTextColor(imageTypes[data.item.imageRefTable].color())}; background-color: ${imageTypes[data.item.imageRefTable].color()};`"><MdiIcon :path="imageTypes[data.item.imageRefTable].path" /> {{ imageTypes[data.item.imageRefTable].text() }}</b-badge>
      </template>
      <!-- Image -->
      <template v-slot:cell(image)="data">
        <a :href="getSrc(data.item, 'large')" @click.prevent="update(data.item)">
          <b-img-lazy :src="getSrc(data.item, 'small')" class="table-image" alt="Image" />
        </a>
      </template>
      <!-- EXIF -->
      <template v-slot:cell(imageExif)="data">
        <template v-if="data.item.imageExif && Object.keys(data.item.imageExif).length > 0">
          <b-button @click="showImageExif(data.item)"><MdiIcon :path="mdiImageText" /> {{ $t('buttonShow') }}</b-button>
        </template>
      </template>
      <!-- Reference name -->
      <template v-slot:cell(referenceName)="data">
        <!-- Germplasm -->
        <router-link :to="{ name: Pages.passport, params: { germplasmId: data.item.imageForeignId } }" v-if="data.item.imageRefTable === 'germinatebase'">{{ data.item.referenceName }}</router-link>
        <!-- Trait -->
        <router-link :to="{ name: Pages.traitDetails, params: { traitId: data.item.imageForeignId } }" v-else-if="data.item.imageRefTable === 'phenotypes'">{{ data.item.referenceName }}</router-link>
        <!-- Anything else -->
        <span v-else>{{ data.item.referenceName }}</span>
      </template>
      <!-- Tags -->
      <template v-slot:cell(tags)="data">
        <div v-if="data.item.tags">
          <b-badge v-for="(tag, index) in data.item.tags" :key="`image-tag-${data.item.imageId}-${index}`" class="mr-1" href="#" @click.native.prevent="$emit('tag-clicked', tag)" :style="`background-color: ${getTagColor(tag)}; color: ${getTextColor(tag)}`">
            {{ tag.tagName }}
          </b-badge>
        </div>
      </template>
    </BaseTable>

    <ImageExifModal :image="selectedImage" ref="imageExifModal" v-if="selectedImage" @hidden="() => { selectedImage = null }" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import CoolLightBox from 'vue-cool-lightbox'
import 'vue-cool-lightbox/dist/vue-cool-lightbox.min.css'
import BaseTable from '@/components/tables/BaseTable'
import ImageExifModal from '@/components/modals/ImageExifModal'
import defaultProps from '@/const/table-props'
import { imageTypes } from '@/mixins/types'
import { getHighContrastTextColor } from '@/mixins/colors'
import { getImageUrl } from '@/mixins/image'
import { Pages } from '@/mixins/pages'

import { mdiImageText } from '@mdi/js'

export default {
  name: 'ImageTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.DOWNLOAD
  },
  data: function () {
    return {
      Pages,
      imageTypes,
      mdiImageText,
      options: {
        idColumn: 'imageId',
        tableName: 'images'
      },
      selectedImage: null,
      tags: [],
      coolboxIndex: null,
      coolboxImages: []
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeServerSettings'
    ]),
    columns: function () {
      return [
        {
          key: 'imageId',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnImageId')
        }, {
          key: 'referenceName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnImageReferenceName'),
          preferredSortingColumn: true
        }, {
          key: 'imageRefTable',
          type: String,
          sortable: true,
          label: this.$t('tableColumnImageReferenceTable')
        }, {
          key: 'imageDescription',
          type: String,
          sortable: true,
          label: this.$t('tableColumnImageDescription')
        }, {
          key: 'imagePath',
          type: String,
          sortable: true,
          label: this.$t('tableColumnImagePath')
        }, {
          key: 'imageExif',
          type: 'json',
          sortable: false,
          label: this.$t('tableColumnImageExif')
        }, {
          key: 'tags',
          type: 'json',
          sortable: false,
          label: this.$t('tableColumnImageTags')
        }, {
          key: 'createdOn',
          type: Date,
          sortable: true,
          label: this.$t('tableColumnImageCreatedOn'),
          formatter: value => value ? new Date(value).toLocaleString() : null
        }, {
          key: 'image',
          type: undefined,
          sortable: false,
          class: 'p-0',
          label: ''
        }
      ]
    }
  },
  components: {
    BaseTable,
    CoolLightBox,
    MdiIcon,
    ImageExifModal
  },
  methods: {
    getHighContrastTextColor,
    showImageExif: function (image) {
      this.selectedImage = image
      this.$nextTick(() => this.$refs.imageExifModal.show())
    },
    getTextColor: function (tag) {
      const color = this.getTagColor(tag)

      return getHighContrastTextColor(color)
    },
    getTagColor: function (tag) {
      let index = this.tags.indexOf(tag.tagName)
      if (index === -1) {
        this.tags.push(tag.tagName)
        index = this.tags.length
      }

      return this.storeServerSettings.colorsTemplate[index % this.storeServerSettings.colorsTemplate.length]
    },
    getSrc: function (image, size) {
      return getImageUrl(image.imagePath, {
        name: image.imagePath,
        type: 'database',
        size: size,
        token: this.storeToken ? this.storeToken.imageToken : ''
      })
    },
    update: function (i) {
      this.coolboxImages = [{
        src: this.getSrc(i, 'large'),
        title: i.imageDescription
      }]
      this.coolboxIndex = 0
    },
    refresh: function () {
      this.$refs.table.refresh()
    }
  }
}
</script>

<style scoped>
.table-image {
  min-width: 200px;
  width: 100%;
  height: 200px;
  object-fit: cover;
}
</style>
