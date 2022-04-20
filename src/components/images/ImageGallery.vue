<template>
  <div>
    <div v-if="(images && images.length > 0) || selectedTag !== null">
      <ImageTags v-on:tag-selected="onTagClicked" :referenceTable="referenceTable" :foreignId="foreignId" ref="tags" />

      <CoolLightBox
        :items="coolboxImages"
        :index="coolboxIndex"
        @on-open="rotateExif"
        @close="coolboxIndex = null" />

      <!-- Show each image node -->
      <b-row v-if="images && images.length > 0" class="image-grid mb-3">
        <b-col cols=12 sm=4 md=3 v-for="(image, index) in images" :key="image.imageId" class="mb-3">
          <ImageNode :image="image" :ref="`image-${index}`" :allTags="imageTags" class="h-100" @image-clicked="coolboxIndex = index" v-on:tags-changed="onTagsChanged" v-on:image-deleted="onImageDeleted" />
        </b-col>
      </b-row>
      <h3 v-else>{{ $t('headingNoData') }}</h3>

      <b-pagination v-if="imageCount > imagesPerPage"
        v-model="currentPage"
        limit=10
        :total-rows="imageCount"
        :per-page="imagesPerPage"
        @change="page => getPage(page)">
      </b-pagination>
    </div>

    <b-button-group>
      <b-button @click="download" v-if="images && images.length > 0"><MdiIcon :path="mdiDownload" /> {{ $t('buttonDownloadImages') }}</b-button>
      <b-button @click="$refs.imageUploadModal.show()" v-if="storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')"><MdiIcon :path="mdiUpload" /> {{ $t('buttonUpload') }}</b-button>
    </b-button-group>

    <ImageUploadModal :foreignId="foreignId" :referenceTable="referenceTable" v-on:images-updated="refresh()" ref="imageUploadModal" v-if="storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import CoolLightBox from 'vue-cool-lightbox'
import 'vue-cool-lightbox/dist/vue-cool-lightbox.min.css'
import ImageNode from '@/components/images/ImageNode'
import ImageTags from '@/components/images/ImageTags'
import ImageUploadModal from '@/components/modals/ImageUploadModal'
import imageMixin from '@/mixins/image'
import miscApi from '@/mixins/api/misc.js'
import utilMixin from '@/mixins/util'
import authApi from '@/mixins/api/auth.js'
import { EXIF } from 'exif-js'

import { mdiDownload, mdiUpload } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      mdiDownload,
      mdiUpload,
      coolboxIndex: null,
      currentPage: 1,
      imagesPerPage: 8,
      images: [],
      imageCount: -1,
      imageTags: [],
      selectedTag: null
    }
  },
  props: {
    referenceTable: {
      type: String,
      default: null
    },
    foreignId: {
      type: Number,
      default: null
    },
    downloadName: {
      type: String,
      default: 'images'
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    coolboxImages: function () {
      return this.images.map(i => {
        return {
          src: this.getSrc(i),
          title: i.imageDescription
        }
      })
    }
  },
  components: {
    CoolLightBox,
    ImageNode,
    ImageTags,
    ImageUploadModal,
    MdiIcon
  },
  mixins: [imageMixin, miscApi, utilMixin, authApi],
  methods: {
    onTagClicked: function (tag) {
      this.selectedTag = tag
      this.refresh()
    },
    download: function () {
      emitter.emit('show-loading', true)

      // Set up images query
      const data = {
        filter: [{
          column: 'imageForeignId',
          comparator: 'equals',
          operator: 'and',
          values: [this.foreignId]
        }, {
          column: 'imageRefTable',
          comparator: 'equals',
          operator: 'and',
          values: [this.referenceTable]
        }]
      }

      if (this.selectedTag) {
        // Optionally add the selected tag
        data.filter.push({
          column: 'tags',
          comparator: 'contains',
          operator: 'and',
          values: [this.selectedTag.tagName]
        })
      }

      this.apiPostImagesExport(data, result => {
        this.downloadBlob({
          blob: result,
          filename: this.downloadName,
          extension: 'zip'
        })
        emitter.emit('show-loading', false)
      })
    },
    getSrc: function (image) {
      return this.getImageUrl(image.imagePath, {
        name: image.imagePath,
        token: this.storeToken ? this.storeToken.imageToken : null,
        type: 'database',
        size: 'large'
      })
    },
    onTagsChanged: function () {
      this.getPage(this.currentPage)
      this.$refs.tags.refresh()
    },
    onImageDeleted: function () {
      this.refresh()
    },
    getPage: function (page) {
      // Set up images query
      const filter = [{
        column: 'imageForeignId',
        comparator: 'equals',
        operator: 'and',
        values: [this.foreignId]
      }, {
        column: 'imageRefTable',
        comparator: 'equals',
        operator: 'and',
        values: [this.referenceTable]
      }]

      if (this.selectedTag) {
        // Optionally add the selected tag
        filter.push({
          column: 'tags',
          comparator: 'contains',
          operator: 'and',
          values: [this.selectedTag.tagName]
        })
      }

      this.apiPostImages({
        limit: this.imagesPerPage,
        page: page,
        orderBy: 'createdOn',
        ascending: 0,
        prevCount: this.imageCount,
        filter: filter
      }, result => {
        this.images = result.data
        this.imageCount = result.count
      })
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
    rotateBasedOnExif: function (image) {
      // Read the EXIF information and then add a rotation class
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
    refresh: function () {
      this.currentPage = 1
      this.imageCount = -1
      this.getPage(this.currentPage)
    }
  },
  mounted: function () {
    this.getPage(this.currentPage)
  }
}
</script>

<style>

</style>
