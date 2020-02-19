<template>
  <div>
    <h2>{{ $t('widgetAdditionalDatasetsTitle') }}</h2>
    <p>{{ $t('widgetAdditionalDatasetsText', { type: datasetTypes[datasetType].text() }) }}</p>
    <DatasetTable :getData="getData" :filterOn="filterOn" :selectable="false" v-on:license-accepted="onLicenseAccepted" v-on:data-changed="emitDataChanged" />
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
import datasetApi from '@/mixins/api/dataset.js'

export default {
  props: {
    datasetType: {
      type: String,
      default: null
    }
  },
  data: function () {
    return {
      filterOn: [{
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
  },
  components: {
    DatasetTable
  },
  mixins: [ datasetApi ],
  methods: {
    emitDataChanged: function (request, data) {
      this.$emit('data-changed', request, data)
    },
    getData: function (data, callback) {
      data.justUnacceptedLicenses = true

      return this.apiPostDatasetTable(data, callback)
    },
    onLicenseAccepted: function () {
      this.$emit('license-accepted')
    }
  }
}
</script>

<style>

</style>
