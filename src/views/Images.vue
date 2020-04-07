<template>
  <div>
    <h1>{{ $t('pageImagesTitle') }}</h1>
    <p>{{ $t('pageImagesText') }}</p>
    <!-- Table showing all images -->
    <ImageTable :getData="getData" :downloadTable="downloadImages" :filterOn="filterOn" ref="imageTable" v-on:tag-clicked="tagClicked" />
  </div>
</template>

<script>
import ImageTable from '@/components/tables/ImageTable'
import miscApi from '@/mixins/api/misc.js'

export default {
  data: function () {
    return {
      tag: null,
      filterOn: null
    }
  },
  watch: {
    tag: function (newValue, oldValue) {
      // Filter based on selected tag
      if (!newValue) {
        this.filterOn = []
      } else {
        this.filterOn = [{
          column: {
            name: 'tags',
            type: 'json'
          },
          comparator: 'contains',
          operator: 'and',
          values: [newValue.tagName]
        }]
      }
    }
  },
  components: {
    ImageTable
  },
  mixins: [ miscApi ],
  methods: {
    tagClicked: function (tag) {
      this.tag = tag
      this.$nextTick(() => this.$refs.imageTable.refresh())
    },
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
