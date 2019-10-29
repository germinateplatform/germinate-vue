<template>
  <BaseChart :width="() => 1280" :height="() => getHeight()" :sourceFile="getSourceFile" :filename="getFilename" :loading="loading">
    <div slot="chart" ref="chart" />
  </BaseChart>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'

export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => null
    },
    traitIds: {
      type: Array,
      default: () => null
    },
    chartMode: {
      type: String,
      default: 'traitByDataset'
    }
  },
  components: {
    BaseChart
  },
  data: function () {
    return {
      plotData: null,
      loading: false
    }
  },
  methods: {
    getSourceFile: function () {
      return {
        blob: new Blob([JSON.stringify(this.plotData)], { type: 'application/json' }),
        filename: this.getFilename(),
        extension: 'json'
      }
    },
    getFilename: function () {
      if (this.chartMode === 'traitByDataset') {
        return 'trait-boxplots-' + this.datasetIds.join('-')
      } else if (this.chartMode === 'datasetByTrait') {
        return 'trait-boxplots-' + this.traitIds.join('-')
      } else {
        return 'trait-boxplots'
      }
    },
    getHeight: function () {
      return 200 + this.plotData.traits.length * 30 * this.plotData.datasets.length
    },
    redraw: function () {
      this.loading = true

      const query = {
        datasetIds: this.datasetIds,
        traitIds: this.traitIds
      }

      this.apiPostTrialsStats(query, result => {
        this.plotData = result
        this.chart()
        this.loading = false
      })
    },
    chart: function () {
      var div = this.$refs.chart

      this.$plotly.purge(div)

      var y = []

      const isInverted = this.chartMode === 'datasetByTrait'

      if (isInverted) {
        for (var dataset in this.plotData.datasets) {
          for (var i = 0; i < 6; i++) {
            y.push(this.plotData.datasets[dataset].datasetName)
          }
        }
      } else {
        for (var trait in this.plotData.traits) {
          for (var j = 0; j < 6; j++) {
            y.push(this.plotData.traits[trait].traitName)
          }
        }
      }

      var traces = []

      if (isInverted) {
        traces = this.getInvertedData(y)
      } else {
        traces = this.getData(y)
      }

      var layout = {
        xaxis: {
          zeroline: false
        },
        height: this.getHeight(),
        margin: { autoexpand: true },
        autosize: true,
        boxmode: 'group',
        yaxis: {
          automargin: true
        }
      }

      var config = {
        modeBarButtonsToRemove: ['toImage'],
        displayModeBar: true,
        responsive: true,
        displaylogo: false
      }

      this.$plotly.newPlot(div, traces, layout, config)
    },
    getData: function (y) {
      var traces = []
      for (var dataset in this.plotData.datasets) {
        var datasetId = this.plotData.datasets[dataset].datasetId
        var x = []

        for (var t in this.plotData.traits) {
          var traitId = this.plotData.traits[t].traitId
          var traitData = this.plotData.stats.filter(s => s.datasetId === datasetId && s.traitId === traitId)[0]

          if (traitData && traitData.min !== traitData.max) {
            // This trait/dataset combination is available, add all the information
            x.push(traitData.min)
            x.push(traitData.q1)
            x.push(traitData.median)
            x.push(traitData.median)
            x.push(traitData.q3)
            x.push(traitData.max)
          } else {
            // This trait isn't available in this dataset, fill everything with NaN to not show anything
            x.push(NaN)
            x.push(NaN)
            x.push(NaN)
            x.push(NaN)
            x.push(NaN)
            x.push(NaN)
          }
        }

        traces.push({
          x: x,
          y: y,
          name: this.plotData.datasets[dataset].datasetName,
          marker: { color: this.serverSettings.colorsCharts[dataset] },
          type: 'box',
          boxmean: false,
          boxpoints: false,
          orientation: 'h'
        })
      }
      return traces
    },
    getInvertedData: function (y) {
      var traces = []
      for (var trait in this.plotData.traits) {
        var traitId = this.plotData.traits[trait].traitId
        var x = []

        for (var d in this.plotData.datasets) {
          var datasetId = this.plotData.datasets[d].datasetId
          var datasetData = this.plotData.stats.filter(s => s.traitId === traitId && s.datasetId === datasetId)[0]

          if (datasetData && datasetData.min !== datasetData.max) {
            // This trait/dataset combination is available, add all the information
            x.push(datasetData.min)
            x.push(datasetData.q1)
            x.push(datasetData.median)
            x.push(datasetData.median)
            x.push(datasetData.q3)
            x.push(datasetData.max)
          } else {
            // This trait isn't available in this dataset, fill everything with NaN to not show anything
            x.push(NaN)
            x.push(NaN)
            x.push(NaN)
            x.push(NaN)
            x.push(NaN)
            x.push(NaN)
          }
        }

        traces.push({
          x: x,
          y: y,
          name: this.plotData.traits[trait].traitName,
          marker: { color: this.serverSettings.colorsCharts[trait] },
          type: 'box',
          boxmean: false,
          boxpoints: false,
          orientation: 'h'
        })
      }
      return traces
    }
  },
  mounted: function () {
    this.redraw()
  }
}
</script>

<style>

</style>
