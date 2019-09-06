<template>
  <div>
    <h1>Datasets</h1>
    <DatasetsTable :getData="getData" :getIds="getIds" :filterOn="getFilter(0)"/>
    <DatasetsTable :getData="getData" :getIds="getIds" :filterOn="getFilter(1)"/>
  </div>
</template>

<script>
import DatasetsTable from '@/components/tables/DatasetsTable'
export default {
  data: function () {
    return {
      filterOn: null
    }
  },
  components: {
    DatasetsTable
  },
  methods: {
    getData: function (data, callback) {
      return this.apiPostDatasetTable(data, callback)
    },
    getIds: function (data, callback) {
      return this.apiPostDatasetTableIds(data, callback)
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
