<template>
  <div>
    <DatasetTable :getData="getDatasets" :filterOn="getFilter()" :clickHandler="d => { dataset = d }" />

    <div v-if="dataset" class="mt-3">
      <h2>{{ dataset.datasetName }}</h2>
    </div>
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
export default {
  data: function () {
    return {
      dataset: null
    }
  },
  components: {
    DatasetTable
  },
  methods: {
    getDatasets: function (query, callback) {
      return this.apiPostDatasetTable(query, callback)
    },
    getFilter: function () {
      return [{
        column: {
          name: 'isExternal',
          type: Boolean
        },
        comparator: 'equals',
        operator: 'and',
        values: [0],
        canBeChanged: false
      }]
    }
  }
}
</script>

<style>

</style>
