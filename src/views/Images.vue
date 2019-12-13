<template>
  <div>
    <h1>{{ $t('pageImagesTitle') }}</h1>
    <p>{{ $t('pageImagesText') }}</p>
    <ImageGallery :getImages="getImages" />
    <ImageTable :getData="getData" />
  </div>
</template>

<script>
import ImageGallery from '@/components/images/ImageGallery'
import ImageTable from '@/components/tables/ImageTable'
import miscApi from '@/mixins/api/misc.js'

export default {
  components: {
    ImageGallery,
    ImageTable
  },
  mixins: [ miscApi ],
  methods: {
    getImages: function (data, onSuccess, onError) {
      this.apiPostImages(data, onSuccess, onError)
    },
    getData: function (data, callback) {
      return this.apiPostImages(data, callback)
    }
  }
}
</script>

<style>

</style>
