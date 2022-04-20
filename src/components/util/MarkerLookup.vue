<template>
  <VueTypeaheadBootstrap :id="id"
                         v-model="markerName"
                         :data="markers"
                         :serializer="item => item.markerName"
                         @hit="setMarkerId($event.markerId)"
                         :placeholder="$t('inputPlaceholderMarkerNameAutocomplete')" />
</template>

<script>
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap'
import genotypeApi from '@/mixins/api/genotype.js'
import { debounce } from '@/plugins/debounce'

export default {
  components: {
    VueTypeaheadBootstrap
  },
  props: {
    id: {
      type: String,
      default: null
    }
  },
  watch: {
    markerName: debounce(function (newValue) {
      if (!newValue || newValue.length < 1) {
        this.markerId = null
        this.$emit('change', null)
      }

      const query = {
        filter: [{
          column: 'markerName',
          comparator: 'contains',
          operator: 'and',
          values: [newValue]
        }],
        page: 1,
        ascending: 1,
        orderBy: 'markerName',
        limit: this.MAX_JAVA_INTEGER
      }

      this.apiPostMarkerTable(query, result => {
        // Resolve the result
        this.markers = result.data
      })
    }, 500)
  },
  data: function () {
    return {
      markerName: null,
      markerId: null,
      markers: []
    }
  },
  mixins: [genotypeApi],
  methods: {
    setMarkerId: function (id) {
      this.markerId = id
      this.$emit('change', id)
    }
  }
}
</script>

<style>

</style>
