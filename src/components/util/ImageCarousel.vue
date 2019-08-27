<template>
  <b-carousel
    v-if="images"
    :interval="4000"
    controls
    img-width="1650"
    img-height="600"
    indicators>
    <b-carousel-slide
      v-for="image in images[locale]"
      :key="`dashboard-carousel-${image.name}`"
      :caption="image.text"
      :img-src="image.src" />
  </b-carousel>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: function () {
    return {
      images: null
    }
  },
  computed: {
    ...mapState([
      'locale'
    ])
  },
  methods: {
    getImage: function (index) {
      this.apiGetImageSrc({
        name: this.images.en_GB[index].name,
        type: 'template'
      }, result => {
        for (var locale in this.images) {
          var arrayBufferView = new Uint8Array(result)
          var blob = new Blob([ arrayBufferView ], { type: 'image/jpeg' })
          var urlCreator = window.URL || window.webkitURL
          var imageUrl = urlCreator.createObjectURL(blob)
          this.images[locale][index].src = imageUrl
        }
      })
    }
  },
  mounted: function () {
    this.apiGetSettingsFile({
      'file-type': 'carousel'
    }, result => {
      for (var locale in result) {
        result[locale].forEach(i => {
          i.src = null
        })
      }
      this.images = result

      this.images.en_GB.forEach((image, index) => this.getImage(index))
    })
  }
}
</script>

<style>
.carousel-caption {
  background-color: rgba(0,0,0,.5);
}
</style>
