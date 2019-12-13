<template>
  <div>
    <h1>Datasets</h1>
    <DatasetTable :getData="getData" :filterOn="getFilter(0)"/>
    <DatasetTable :getData="getData" :filterOn="getFilter(1)"/>
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
import datasetApi from '@/mixins/api/dataset.js'

export default {
  data: function () {
    return {
      filterOn: null
    }
  },
  components: {
    DatasetTable
  },
  mixins: [ datasetApi ],
  methods: {
    getData: function (data, callback) {
      return this.apiPostDatasetTable(data, callback)
    },
    getFilter: function (isExternal) {
      var filter = [{
        column: {
          name: 'isExternal',
          type: Boolean
        },
        comparator: 'equals',
        operator: 'and',
        values: [isExternal]
      }]

      if (this.filterOn && this.filterOn.length > 0) {
        filter = filter.concat(this.filterOn)
      }

      return filter
    }
  },
  created: function () {
    if (this.tableFiltering && this.tableFiltering.length > 0) {
      this.filterOn = this.tableFiltering
      this.$store.dispatch('ON_TABLE_FILTERING_CHANGED', null)
    }
  }
}
</script>

<style>
</style>
