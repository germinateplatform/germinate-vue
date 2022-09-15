<template>
  <div>
    <h1>{{ $t('pageImagesTitle') }}</h1>
    <p>{{ $t('pageImagesText') }}</p>

    <ImageTags v-on:tag-selected="(tag) => tagClicked(tag, false)" ref="tags" />
    <!-- Table showing all images -->
    <ImageTable :getData="getData" :downloadTable="downloadImages" :filterOn="filterOn" ref="imageTable" v-on:tag-clicked="(tag) => tagClicked(tag, true)" v-on:filter-changed="onFilterChanged" />
  </div>
</template>

<script>
import ImageTable from '@/components/tables/ImageTable'
import ImageTags from '@/components/images/ImageTags'
import { apiPostImages, apiPostImagesExport } from '@/mixins/api/misc.js'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      tag: null,
      filterOn: null
    }
  },
  watch: {
    tag: function (newValue) {
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
    ImageTable,
    ImageTags
  },
  methods: {
    onFilterChanged: function (filter) {
      if (filter === null || filter.filter == null || filter.filter.length === 0) {
        this.$refs.tags.selectTag(null)
      }
    },
    tagClicked: function (tag, forceRefresh) {
      this.tag = tag
      this.$nextTick(() => this.$refs.imageTable.refresh())

      if (forceRefresh === true) {
        this.$refs.tags.selectTag(tag)
      }
    },
    getImages: function (data, onSuccess, onError) {
      apiPostImages(data, onSuccess, onError)
    },
    getData: function (data, callback) {
      return apiPostImages(data, callback)
    },
    downloadImages: function (data, callback) {
      return apiPostImagesExport(data, result => {
        result.forEach(r => this.$store.commit('ON_ASYNC_JOB_UUID_ADD_MUTATION', r.uuid))

        // Show the sidebar
        emitter.emit('toggle-aside', 'download')
        emitter.emit('show-loading', false)
      })
    }
  }
}
</script>

<style>

</style>
