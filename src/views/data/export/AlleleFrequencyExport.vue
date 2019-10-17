<template>
  <div>
    <h1>{{ $t('pageAlleleFrequencyExportTitle') }}</h1>
    <template v-if="datasets && datasets.length > 0">
      <h2>{{ $t('widgetSelectedDatasetsTitle') }}</h2>
      <ul>
        <li v-for="dataset in datasets" :key="`dataset-list-${dataset.datasetId}`">{{ dataset.datasetId + ' - ' + dataset.datasetName }}</li>
      </ul>
      <GenotypeExportSelection :datasetIds="datasetIds" experimentType="allelefreq" v-on:on-file-loaded="onFileLoaded" ref="exportSelection" />

      <AlleleFrequencyChart :datasetIds="datasetIds" :sourceFile="chartFile" v-if="chartFile" v-on:trigger-export="triggerExport" />
    </template>
  </div>
</template>

<script>
import AlleleFrequencyChart from '@/components/charts/AlleleFrequencyChart'
import GenotypeExportSelection from '@/components/export/GenotypeExportSelection'

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
    GenotypeExportSelection
  },
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
      this.$nextTick(() => this.$router.push({ name: 'export', params: { experimentType: 'allelefreq' } }))
    },
    onFileLoaded: function (chartFile) {
      this.chartFile = chartFile
    }
  },
  mounted: function () {
    const request = {
      page: 1,
      limit: this.JAVA_MAX_INTEGER,
      filter: [{
        column: 'experimentType',
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
