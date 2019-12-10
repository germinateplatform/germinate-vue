<template>
  <div>
    <b-row v-if="images && images.length > 0" class="image-grid">
      <b-col cols=12 sm=4 md=3 v-for="(image, index) in images" :key="image.imageId">
        <ImageNode :image="image" :ref="`image-${index}`" />
      </b-col>
    </b-row>

    <b-pagination v-if="imageCount > imagesPerPage"
      v-model="currentPage"
      limit=10
      :total-rows="imageCount"
      :per-page="imagesPerPage"
      @change="page => getPage(page)">
    </b-pagination>
  </div>
</template>

<script>
import baguetteBox from 'baguettebox.js'
import ImageNode from '@/components/images/ImageNode'

export default {
  data: function () {
    return {
      currentPage: 1,
      imagesPerPage: 8,
      images: [],
      imageCount: -1
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
    }
  },
  components: {
    ImageNode
  },
  methods: {
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
    }
  },
  mounted: function () {
    this.getPage(this.currentPage)
  }
}
</script>

<style>

</style>
