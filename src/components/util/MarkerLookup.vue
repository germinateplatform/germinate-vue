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
import { apiPostMapdefinitionTable } from '@/mixins/api/genotype.js'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'
import { debounce } from '@/plugins/debounce'

export default {
  components: {
    VueTypeaheadBootstrap
  },
  props: {
    id: {
      type: String,
      default: null
    },
    mapId: {
      type: Number,
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
        limit: MAX_JAVA_INTEGER
      }

      if (this.mapId) {
        query.filter.push({
          column: 'mapId',
          comparator: 'equals',
          operator: 'and',
          values: [this.mapId]
        })
      }

      apiPostMapdefinitionTable(query, result => {
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
