<template>
  <div>
    <CoolLightBox 
      :items="coolboxImages" 
      :index="coolboxIndex"
      @on-open="rotateExif"
      @close="coolboxIndex = null" />
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               ref="table"
               v-on="$listeners">
      <!-- Reference table -->
      <template v-slot:cell(imageRefTable)="data">
        <span><i :class="`mdi mdi-18px ${imageTypes[data.item.imageRefTable].icon} fix-alignment`" :style="`color: ${imageTypes[data.item.imageRefTable].color()};`" /> {{ imageTypes[data.item.imageRefTable].text() }}</span>
      </template>
      <!-- Image -->
      <template v-slot:cell(image)="data">
        <a :href="getSrc(data.item, 'large')" @click.prevent="update(data.item)">
          <b-img-lazy :src="getSrc(data.item, 'small')" class="table-image" alt="Image" />
        </a>
      </template>
      <!-- Reference name -->
      <template v-slot:cell(referenceName)="data">
        <!-- Germplasm -->
        <router-link :to="{ name: 'passport', params: { germplasmId: data.item.imageForeignId } }" v-if="data.item.imageRefTable === 'germinatebase'">{{ data.item.referenceName }}</router-link>
        <!-- Trait -->
        <router-link :to="{ name: 'trait-details', params: { traitId: data.item.imageForeignId } }" v-else-if="data.item.imageRefTable === 'phenotypes'">{{ data.item.referenceName }}</router-link>
        <!-- Compound -->
        <router-link :to="{ name: 'compound-details', params: { compoundId: data.item.imageForeignId } }" v-else-if="data.item.imageRefTable === 'compounds'">{{ data.item.referenceName }}</router-link>
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
  </div>
</template>

<script>
import CoolLightBox from 'vue-cool-lightbox'
import 'vue-cool-lightbox/dist/vue-cool-lightbox.min.css'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import typesMixin from '@/mixins/types.js'
import colorMixin from '@/mixins/colors.js'
import { EXIF } from 'exif-js'

export default {
  name: 'ImageTable',
  props: {
    ...defaultProps.BASE,
    ...defaultProps.DOWNLOAD
  },
  data: function () {
    return {
      options: {
        idColumn: 'imageId',
        tableName: 'images'
      },
      tags: [],
      coolboxIndex: null,
      coolboxImages: []
    }
  },
  computed: {
    columns: function () {
      return [
        {
          key: 'imageId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'imageId')}`,
          label: this.$t('tableColumnImageId')
        }, {
          key: 'referenceName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'referenceName')}`,
          label: this.$t('tableColumnImageReferenceName'),
          preferedSortingColumn: true
        }, {
          key: 'imageRefTable',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'imageRefTable')}`,
          label: this.$t('tableColumnImageReferenceTable')
        }, {
          key: 'imageDescription',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'imageDescription')}`,
          label: this.$t('tableColumnImageDescription')
        }, {
          key: 'imagePath',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'imagePath')}`,
          label: this.$t('tableColumnImagePath')
        }, {
          key: 'tags',
          type: 'json',
          sortable: false,
          class: `${this.isTableColumnHidden(this.options.tableName, 'tags')}`,
          label: this.$t('tableColumnImageTags')
        }, {
          key: 'createdOn',
          type: Date,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'createdOn')}`,
          label: this.$t('tableColumnImageCreatedOn'),
          formatter: this.$options.filters.toDateTime
        }, {
          key: 'image',
          type: undefined,
          sortable: false,
          class: `p-0 ${this.isTableColumnHidden(this.options.tableName, 'image')}`,
          label: ''
        }
      ]
    }
  },
  components: {
    BaseTable,
    CoolLightBox
  },
  mixins: [ typesMixin, colorMixin ],
  methods: {
    rotateBasedOnExif: function (image) {
      EXIF.getData(image, function () {
        const orientation = EXIF.getTag(this, 'Orientation')
        if (orientation === 6) {
          image.className = 'rotate90'
        } else if (orientation === 8) {
          image.className = 'rotate270'
        } else if (orientation === 3) {
          image.className = 'rotate180'
        }
      })
    },
    getTextColor: function (tag) {
      const color = this.getTagColor(tag)

      return this.getHighContrastTextColor(color)
    },
    getTagColor: function (tag) {
      let index = this.tags.indexOf(tag.tagName)
      if (index === -1) {
        this.tags.push(tag.tagName)
        index = this.tags.length
      }

      return this.serverSettings.colorsTemplate[index % this.serverSettings.colorsTemplate.length]
    },
    getSrc: function (image, size) {
      const params = {
        name: image.imagePath,
        type: 'database',
        size: size,
        token: this.token ? this.token.imageToken : ''
      }

      const paramString = this.toUrlString(params)

      return this.baseUrl + 'image/src?' + paramString
    },
    update: function (i) {
      this.coolboxImages = [{
        src: this.getSrc(i, 'large'),
        title: i.imageDescription
      }]
      this.coolboxIndex = 0
    },
    rotateExif: function () {
      const overlays = document.querySelectorAll('.cool-lightbox img')

      overlays.forEach(i => {
        if (i.complete && i.naturalHeight !== 0) {
          // Rotate the image on load based on EXIF information
          this.rotateBasedOnExif(i)
        } else {
          i.addEventListener('load', () => {
            // Rotate the image on load based on EXIF information
            this.rotateBasedOnExif(i)
          }, { once: true })
        }
      })
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
