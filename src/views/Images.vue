<template>
  <div>
    <h1>{{ $t('pageImagesTitle') }}</h1>
    <p>{{ $t('pageImagesText') }}</p>
    <ImageTable :getData="getData" :downloadTable="downloadImages" />
  </div>
</template>

<script>
import ImageTable from '@/components/tables/ImageTable'
import miscApi from '@/mixins/api/misc.js'

export default {
  components: {
    ImageTable
  },
  mixins: [ miscApi ],
  methods: {
    getImages: function (data, onSuccess, onError) {
      this.apiPostImages(data, onSuccess, onError)
    },
    getData: function (data, callback) {
      return this.apiPostImages(data, callback)
    },
    downloadImages: function (data, callback) {
      return this.apiPostImagesExport(data, callback)
    }
  }
}
</script>

<style>

</style>
