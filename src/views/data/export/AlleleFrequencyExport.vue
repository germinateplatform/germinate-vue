<template>
  <div>
    <h1>{{ $t('pageAlleleFrequencyExportTitle') }}</h1>
    <template v-if="datasets && datasets.length > 0">
      <!-- Selected datasets -->
      <DatasetOverview :datasets="datasets" />
      <GenotypeExportSelection :datasetIds="datasetIds" datasetType="allelefreq" v-on:on-file-loaded="onFileLoaded" ref="exportSelection">
        <template slot="optionalContent">
          <!-- Place the chart inside the export selection -->
          <AlleleFrequencyChart :datasetIds="datasetIds" :sourceFile="chartFile" v-if="chartFile" v-on:trigger-export="triggerExport" />
        </template>
      </GenotypeExportSelection>
    </template>
  </div>
</template>

<script>
import AlleleFrequencyChart from '@/components/charts/AlleleFrequencyChart'
import DatasetOverview from '@/components/export/DatasetOverview'
import GenotypeExportSelection from '@/components/export/GenotypeExportSelection'
import datasetApi from '@/mixins/api/dataset.js'

export default {
  props: [ 'datasetIds' ],
  data: function () {
    return {
      datasets: null,
      chartFile: null
    }
  },
  components: {
    AlleleFrequencyChart,
    DatasetOverview,
    GenotypeExportSelection
  },
  mixins: [ datasetApi ],
  methods: {
    triggerExport: function (binningConfig) {
      this.$refs.exportSelection.exportData(binningConfig)
    },
    redirectBack: function () {
      this.$store.dispatch('ON_TABLE_FILTERING_CHANGED', [{
        column: {
          name: 'datasetId',
          type: Number
        },
        comparator: 'inSet',
        operator: 'and',
        values: this.datasetIds
      }])
      this.$nextTick(() => this.$router.push({ name: 'export', params: { datasetType: 'allelefreq' } }))
    },
    onFileLoaded: function (chartFile) {
      this.chartFile = chartFile
    }
  },
  mounted: function () {
    // Set up the dataset request based on the provided ids
    const request = {
      page: 1,
      limit: this.JAVA_MAX_INTEGER,
      filter: [{
        column: 'datasetType',
        comparator: 'equals',
        operator: 'and',
        values: ['allelefreq']
      }, {
        column: 'isExternal',
        comparator: 'equals',
        operator: 'and',
        values: [0]
      }, {
        column: 'datasetId',
        comparator: 'inSet',
        operator: 'and',
        values: this.datasetIds
      }]
    }

    this.apiPostDatasetTable(request, result => {
      this.datasets = result.data.filter(d => {
        // Exclude the ones where a license exists, but hasn't been accepted
        return (!d.licenseName || this.isAccepted(d))
      })

      if (this.datasets.length < 1) {
        this.redirectBack()
      }
    }, {
      codes: [404],
      callback: () => {
        this.redirectBack()
      }
    })
  }
}
</script>

<style>
</style>
