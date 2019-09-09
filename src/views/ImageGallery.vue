<template>
  <div>
    <ImageGallery :getImages="getImages" />
  </div>
</template>

<script>
import ImageGallery from '@/components/images/ImageGallery'

export default {
  components: {
    ImageGallery
  },
  methods: {
    getImages: function (data, onSuccess, onError) {
      this.apiPostImages(data, onSuccess, onError)
    }
  }
}
</script>

<style>

</style>
