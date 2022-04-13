<template>
  <div v-if="experiment">
    <h1>{{ $t('pageExperimentDetailsTitle') }} <small>{{ experiment.name }}</small></h1>
    <!-- Table showing all datasets within this experiment -->
    <DatasetTable :getData="getData" :filterOn="getFilter()" />

    <!-- Metadata download -->
    <DatasetMetadataDownload :experimentId="experimentId" />
  </div>
</template>

<script>
import DatasetMetadataDownload from '@/components/util/DatasetMetadataDownload'
import DatasetTable from '@/components/tables/DatasetTable'
import datasetApi from '@/mixins/api/dataset.js'

export default {
  data: function () {
    return {
      experimentId: null,
      experiment: null
    }
  },
  components: {
    DatasetMetadataDownload,
    DatasetTable
  },
  mixins: [datasetApi],
  methods: {
    getData: function (query, callback) {
      return this.apiPostDatasetTable(query, callback)
    },
    getFilter: function () {
      return [{
        column: {
          name: 'experimentId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
        values: [this.experimentId],
        canChange: false
      }]
    }
  },
  mounted: function () {
    const id = this.$route.params.experimentId

    if (id) {
      this.experimentId = parseInt(id)
    }

    if (this.experimentId) {
      // Prepare the query
      const query = {
        page: 1,
        limit: 1,
        filter: [{
          column: 'experimentId',
          comparator: 'equals',
          operator: 'and',
          values: [this.experimentId]
        }]
      }
      // Run against API
      this.apiPostExperimentTable(query, result => {
        if (result && result.data && result.data.length > 0) {
          this.experiment = result.data[0]
        }
      })
    }
  }
}
</script>

<style>

</style>
