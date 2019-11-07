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
    xIds: {
      type: Array,
      default: () => null
    },
    yIds: {
      type: Array,
      default: () => null
    },
    yGroupIds: {
      type: Array,
      default: () => null
    },
    chartMode: {
      type: String,
      default: 'itemByDataset'
    },
    itemType: {
      type: String,
      default: 'traits'
    }
  },
  components: {
    BaseChart
  },
  data: function () {
    return {
      plotData: null,
      loading: false,
      itemTypes: {
        traits: {
          itemKey: 'traits',
          idKey: 'traitId',
          apiKey: 'trial',
          nameKey: 'traitName'
        },
        compounds: {
          itemKey: 'compounds',
          idKey: 'compoundId',
          apiKey: 'compound',
          nameKey: 'compoundName'
        },
        climate: {
          itemKey: 'climates',
          idKey: 'climateId',
          apiKey: 'climate',
          nameKey: 'climateName'
        }
      }
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
      if (this.chartMode === 'itemByDataset') {
        return this.itemTypes[this.itemType].itemKey + '-boxplots-' + this.datasetIds.join('-')
      } else if (this.chartMode === 'datasetByItem') {
        return this.itemTypes[this.itemType].itemKey + '-boxplots-' + this.xIds.join('-')
      } else {
        return this.itemTypes[this.itemType].itemKey + '-boxplots'
      }
    },
    getHeight: function () {
      return 200 + this.plotData[this.itemTypes[this.itemType].itemKey].length * 30 * this.plotData.datasets.length
    },
    redraw: function () {
      this.loading = true

      const query = {
        datasetIds: this.datasetIds,
        xIds: this.xIds,
        yIds: this.yIds,
        yGroupIds: this.yGroupIds
      }

      this.apiPostTraitCompoundStats(this.itemTypes[this.itemType].apiKey, query, result => {
        this.plotData = result
        this.chart()
        this.loading = false
      })
    },
    chart: function () {
      var div = this.$refs.chart

      this.$plotly.purge(div)

      var y = []

      const isInverted = this.chartMode === 'datasetByItem'

      if (isInverted) {
        for (var dataset in this.plotData.datasets) {
          for (var i = 0; i < 6; i++) {
            y.push(this.plotData.datasets[dataset].datasetName)
          }
        }
      } else {
        for (var item in this.plotData[this.itemTypes[this.itemType].itemKey]) {
          for (var j = 0; j < 6; j++) {
            y.push(this.plotData[this.itemTypes[this.itemType].itemKey][item][this.itemTypes[this.itemType].nameKey])
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

        for (var item in this.plotData[this.itemTypes[this.itemType].itemKey]) {
          var itemId = this.plotData[this.itemTypes[this.itemType].itemKey][item][this.itemTypes[this.itemType].idKey]
          var itemData = this.plotData.stats.filter(s => s.datasetId === datasetId && s.xId === itemId)[0]

          if (itemData && itemData.min !== itemData.max) {
            // This trait/dataset combination is available, add all the information
            x.push(itemData.min)
            x.push(itemData.q1)
            x.push(itemData.median)
            x.push(itemData.median)
            x.push(itemData.q3)
            x.push(itemData.max)
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
      for (var item in this.plotData[this.itemTypes[this.itemType].itemKey]) {
        var itemId = this.plotData[this.itemTypes[this.itemType].itemKey][item][this.itemTypes[this.itemType].idKey]
        var x = []

        for (var d in this.plotData.datasets) {
          var datasetId = this.plotData.datasets[d].datasetId
          var datasetData = this.plotData.stats.filter(s => s.xId === itemId && s.datasetId === datasetId)[0]

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
          name: this.plotData[this.itemTypes[this.itemType].itemKey][item][this.itemTypes[this.itemType].nameKey],
          marker: { color: this.serverSettings.colorsCharts[item] },
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
