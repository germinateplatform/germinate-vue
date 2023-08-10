<template>
  <div>
    <h1>{{ $t('pageDatasetsTitle') }}</h1>
    <hr />
    <h2>{{ $t('pageDatasetsInternalTitle') }}</h2>
    <p>{{ $t('pageDatasetsInternalText') }}</p>
    <!-- Internal datasets -->
    <DatasetTable :getData="getData" :filterOn="getFilter(0)"/>
    <h2>{{ $t('pageDatasetsExternalTitle') }}</h2>
    <p>{{ $t('pageDatasetsExternalText') }}</p>
    <!-- External datasets -->
    <DatasetTable :getData="getData" :filterOn="getFilter(1)"/>
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
import { apiPostDatasetTable } from '@/mixins/api/dataset.js'

export default {
  data: function () {
    return {
      filterOn: null
    }
  },
  components: {
    DatasetTable
  },
  methods: {
    getData: function (data, callback) {
      return apiPostDatasetTable(data, callback)
    },
    getFilter: function (isExternal) {
      let filter = [{
        column: {
          name: 'isExternal',
          type: Boolean
        },
        comparator: 'equals',
        operator: 'and',
        values: [isExternal],
        canBeChanged: false
      }]

      if (this.filterOn && this.filterOn.length > 0) {
        filter = filter.concat(this.filterOn)
      }

      return filter
    }
  }
}
</script>

<style>
</style>
