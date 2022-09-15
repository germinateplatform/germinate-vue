<template>
  <div>
    <h2>{{ $t('widgetAdditionalDatasetsTitle') }}</h2>
    <p>{{ $t('widgetAdditionalDatasetsText', { type: datasetType ? datasetTypes[datasetType].text() : '' }) }}</p>
    <!-- This table will show all datasets of the requested type for which the use hasn't accepted the license yet. -->
    <DatasetTable :getData="getData" :filterOn="filterOn" :selectable="false" v-on:data-changed="emitDataChanged" />
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
import { apiPostDatasetTable } from '@/mixins/api/dataset.js'
import { datasetTypes } from '@/mixins/types.js'

export default {
  props: {
    datasetType: {
      type: String,
      default: null
    }
  },
  data: function () {
    let filterOn = null

    if (this.datasetType !== null) {
      filterOn = [{
        column: {
          name: 'datasetType',
          type: String
        },
        comparator: 'equals',
        oparator: 'and',
        values: [this.datasetType],
        canBeChanged: false
      }]
    }

    return {
      datasetTypes,
      filterOn: filterOn
    }
  },
  components: {
    DatasetTable
  },
  methods: {
    emitDataChanged: function (request, data) {
      this.$emit('data-changed', request, data)
    },
    getData: function (data, callback) {
      data.justUnacceptedLicenses = true

      return apiPostDatasetTable(data, callback)
    }
  }
}
</script>

<style>

</style>
