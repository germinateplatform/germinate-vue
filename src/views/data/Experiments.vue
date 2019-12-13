<template>
  <div v-if="experiment">
    <h1>Experiment details <small>{{ experiment.name }}</small></h1>
    <DatasetTable :getData="getData" :filterOn="getFilter()" />

    <h2 class="mt-4">Download metadata</h2>
    <p>Something here</p>
    <b-button @click="downloadMetadata"><i class="mdi mdi-18px fix-alignment mdi-download" /> {{ $t('buttonDownload') }}</b-button>
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
import { EventBus } from '@/plugins/event-bus.js'
import datasetApi from '@/mixins/api/dataset.js'

export default {
  data: function () {
    return {
      experimentId: null,
      experiment: null
    }
  },
  components: {
    DatasetTable
  },
  mixins: [ datasetApi ],
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
    },
    downloadMetadata: function () {
      EventBus.$emit('show-loading', true)
      const request = {
        experimentId: this.experimentId
      }
      this.apiPostDatasetAttributeExport(request, result => {
        var downloadRequext = {
          blob: result,
          filename: this.experiment.experimenttypeDescription + '-experiment-metadata-' + this.experimentId,
          extension: 'txt'
        }

        this.downloadBlob(downloadRequext)
        EventBus.$emit('show-loading', false)
      })
    }
  },
  mounted: function () {
    const id = this.$route.params.experimentId

    if (id) {
      this.experimentId = parseInt(id)
    }

    if (this.experimentId) {
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
