<template>
  <BaseChart :width="() => 1280" :height="() => getHeight()" :sourceFile="getSourceFile" :filename="getFilename" :loading="loading" v-on:force-redraw="redraw">
    <div slot="chart" ref="chart" />
  </BaseChart>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import datasetApi from '@/mixins/api/dataset.js'
import colorMixin from '@/mixins/colors.js'

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
    xType: {
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
      xTypes: {
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
        climates: {
          itemKey: 'climates',
          idKey: 'climateId',
          apiKey: 'climate',
          nameKey: 'climateName'
        }
      }
    }
  },
  mixins: [ datasetApi, colorMixin ],
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
        return this.xTypes[this.xType].itemKey + '-boxplots-' + this.datasetIds.join('-')
      } else if (this.chartMode === 'datasetByItem') {
        return this.xTypes[this.xType].itemKey + '-boxplots-' + this.xIds.join('-')
      } else {
        return this.xTypes[this.xType].itemKey + '-boxplots'
      }
    },
    getHeight: function () {
      if (this.chartMode === 'itemByGroup') {
        let groups = []

        this.plotData.stats.forEach(s => {
          if (groups.indexOf(s.groupIds) === -1) {
            groups.push(s.groupIds)
          }
        })

        return 200 + this.plotData[this.xTypes[this.xType].itemKey].length * 30 * groups.length
      } else {
        return 200 + this.plotData[this.xTypes[this.xType].itemKey].length * 30 * this.plotData.datasets.length
      }
    },
    redraw: function () {
      this.loading = true

      const query = {
        datasetIds: this.datasetIds,
        xIds: this.xIds,
        yIds: this.yIds,
        yGroupIds: this.yGroupIds
      }

      this.apiPostTraitCompoundStats(this.xTypes[this.xType].apiKey, query, result => {
        this.plotData = result
        this.chart()
        this.loading = false
      })
    },
    chart: function () {
      var div = this.$refs.chart

      this.$plotly.purge(div)

      var y = []

      // Are we plotting datasets and grouping by trait/compound/climate?
      if (this.chartMode === 'datasetByItem') {
        for (var dataset in this.plotData.datasets) {
          for (var i = 0; i < 6; i++) {
            // If so, datasets are our Ys
            y.push(this.plotData.datasets[dataset].datasetName)
          }
        }
      } else if (this.chartMode === 'itemByDataset' || this.chartMode === 'itemByGroup') {
        for (var item in this.plotData[this.xTypes[this.xType].itemKey]) {
          for (var j = 0; j < 6; j++) {
            // Else, use this complicated thing to extract the trait/compound/climate name
            y.push(this.plotData[this.xTypes[this.xType].itemKey][item][this.xTypes[this.xType].nameKey])
          }
        }
      }

      var traces = []

      if (this.chartMode === 'datasetByItem') {
        traces = this.getInvertedData(y)
      } else if (this.chartMode === 'itemByDataset') {
        traces = this.getData(y)
      } else if (this.chartMode === 'itemByGroup') {
        traces = this.getGroupData(y)
      }

      var layout = {
        xaxis: {
          zeroline: false,
          side: 'top'
        },
        height: this.getHeight(),
        margin: { autoexpand: true },
        autosize: true,
        boxmode: 'group',
        yaxis: {
          automargin: true
        },
        legend: {
          orientation: 'h'
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
    getGroupData: function (y) {
      var traces = []

      let groups = []

      this.plotData.stats.forEach(s => {
        if (groups.indexOf(s.groupIds) === -1) {
          groups.push(s.groupIds)
        }
      })

      groups.forEach((group, index) => {
        var x = []

        for (var item in this.plotData[this.xTypes[this.xType].itemKey]) {
          var itemId = this.plotData[this.xTypes[this.xType].itemKey][item][this.xTypes[this.xType].idKey]
          var itemData = this.plotData.stats.filter(s => s.groupIds === group && s.xId === itemId)[0]

          if (itemData) {
            // This trait/compound/climate by group combination is available, add all the information
            x.push(itemData.min)
            x.push(itemData.q1)
            x.push(itemData.median)
            x.push(itemData.median)
            x.push(itemData.q3)
            x.push(itemData.max)
          } else {
            // This trait/compound/climate isn't available in this group, fill everything with NaN to not show anything
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
          name: group,
          marker: { color: this.getColors()[index] },
          type: 'box',
          boxmean: false,
          boxpoints: false,
          orientation: 'h'
        })
      })

      return traces
    },
    getData: function (y) {
      var traces = []
      for (var dataset in this.plotData.datasets) {
        var datasetId = this.plotData.datasets[dataset].datasetId
        var x = []

        for (var item in this.plotData[this.xTypes[this.xType].itemKey]) {
          var itemId = this.plotData[this.xTypes[this.xType].itemKey][item][this.xTypes[this.xType].idKey]
          var itemData = this.plotData.stats.filter(s => s.datasetId === datasetId && s.xId === itemId)[0]

          if (itemData) {
            // This trait/compound/climate by dataset combination is available, add all the information
            x.push(itemData.min)
            x.push(itemData.q1)
            x.push(itemData.median)
            x.push(itemData.median)
            x.push(itemData.q3)
            x.push(itemData.max)
          } else {
            // This trait/compound/climate isn't available in this dataset, fill everything with NaN to not show anything
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
          marker: { color: this.getColors()[dataset] },
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
      for (var item in this.plotData[this.xTypes[this.xType].itemKey]) {
        var itemId = this.plotData[this.xTypes[this.xType].itemKey][item][this.xTypes[this.xType].idKey]
        var x = []

        for (var d in this.plotData.datasets) {
          var datasetId = this.plotData.datasets[d].datasetId
          var datasetData = this.plotData.stats.filter(s => s.xId === itemId && s.datasetId === datasetId)[0]

          if (datasetData && datasetData.min !== datasetData.max) {
            // This dataset by trait/compound/climate combination is available, add all the information
            x.push(datasetData.min)
            x.push(datasetData.q1)
            x.push(datasetData.median)
            x.push(datasetData.median)
            x.push(datasetData.q3)
            x.push(datasetData.max)
          } else {
            // This dataset isn't available in this dataset, fill everything with NaN to not show anything
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
          name: this.plotData[this.xTypes[this.xType].itemKey][item][this.xTypes[this.xType].nameKey],
          marker: { color: this.getColors()[item] },
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
