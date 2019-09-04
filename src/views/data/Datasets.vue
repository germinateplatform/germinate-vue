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
      return [{
        column: {
          name: 'isExternal',
          type: Boolean
        },
        comparator: 'equals',
        operator: 'and',
        values: [isExternal]
      }]
    }
  }
}
</script>

<style>
</style>
