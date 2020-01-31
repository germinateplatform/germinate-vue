<template>
  <div v-if="(images && images.length > 0) || selectedTag !== null">
    <div v-if="imageTags && imageTags.length" class="mb-3">
      <h3>{{ $t('widgetImageTagsTitle') }}</h3>
      <b-badge class="mr-3" href="#" @click.native.prevent="onTagClicked(null)" variant="danger">
        <i class="mdi mdi-close" />
        <span> {{ $t('widgetImageTagsDeselect') }}</span>
      </b-badge>
      <b-badge v-for="(tag, index) in imageTags" :key="`image-tag-${index}`" class="mr-1" href="#" @click.native.prevent="onTagClicked(tag)" :variant="(selectedTag !== null && tag.id === selectedTag.id) ? 'primary' : null">
        <i class="mdi mdi-tag" />
        <span> {{ tag.tagName }}</span>
      </b-badge>
    </div>

    <b-row v-if="images && images.length > 0" class="image-grid">
      <b-col cols=12 sm=4 md=3 v-for="(image, index) in images" :key="image.imageId">
        <ImageNode :image="image" :ref="`image-${index}`" />
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

    <b-button class="mdi mdi-18px mdi-download" @click="download" v-if="downloadImages && images && images.length > 0"> {{ $t('buttonDownloadImages') }}</b-button>
  </div>
</template>

<script>
import baguetteBox from 'baguettebox.js'
import ImageNode from '@/components/images/ImageNode'
import miscApi from '@/mixins/api/misc.js'
import { EventBus } from '@/plugins/event-bus.js'

export default {
  data: function () {
    return {
      currentPage: 1,
      imagesPerPage: 8,
      images: [],
      imageCount: -1,
      imageTags: [],
      selectedTag: null
    }
  },
  props: {
    getImages: {
      type: Function,
      default: () => {
        return {
          data: [],
          count: 0
        }
      }
    },
    downloadImages: {
      type: Function,
      default: () => {
        return []
      }
    },
    downloadName: {
      type: String,
      default: 'images'
    }
  },
  components: {
    ImageNode
  },
  mixins: [ miscApi ],
  methods: {
    onTagClicked: function (tag) {
      this.selectedTag = tag
      this.$emit('tag-clicked', tag)
    },
    download: function () {
      EventBus.$emit('show-loading', true)
      this.downloadImages(result => {
        this.downloadBlob({
          blob: result,
          filename: this.downloadName,
          extension: 'zip'
        })
        EventBus.$emit('show-loading', false)
      })
    },
    getPage: function (page) {
      this.getImages({
        limit: this.imagesPerPage,
        page: page,
        prevCount: this.imageCount
      }, result => {
        this.images = result.data
        this.imageCount = result.count

        this.$nextTick(() => {
          baguetteBox.run('.image-grid', {
            captions: 'true',
            fullscreen: true,
            filter: /.*/i
          })
        })
      })
    },
    refresh: function () {
      this.currentPage = 1
      this.getPage(this.currentPage)
    }
  },
  mounted: function () {
    this.getPage(this.currentPage)

    this.apiGetImageTags(result => {
      if (result) {
        this.imageTags = result.data
      }
    })
  }
}
</script>

<style>

</style>
