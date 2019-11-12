<template>
  <div>
    <DatasetTable :getData="getDatasets" />
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
export default {
  components: {
    DatasetTable
  },
  methods: {
    getDatasets: function (query, callback) {
      return this.apiPostDatasetTable(query, callback)
    }
  }
}
</script>

<style>

</style>
