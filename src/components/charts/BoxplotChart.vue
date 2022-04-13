<template>
  <div>
    <BaseChart :id="id" :width="() => 1280" :height="() => getHeight()" :sourceFile="baseSourceFile" :filename="baseFilename" :loading="loading" v-on:force-redraw="redraw">
      <div slot="chart" ref="chart" />

      <template slot="additionalButtons">
        <b-button v-b-tooltip.hover
                  :title="$t('chartTooltipMatrixTour')"
                  @click="showTour()">
          <i class="mdi mdi-18px mdi-help-circle-outline" />
        </b-button>
      </template>
    </BaseChart>
    <!-- Tour to explain the chart -->
    <Tour :steps="popoverContent" ref="tour" />
  </div>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import datasetApi from '@/mixins/api/dataset.js'
import colorMixin from '@/mixins/colors.js'
import Tour from '@/components/util/Tour'

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
    BaseChart,
    Tour
  },
  data: function () {
    const id = 'chart-' + this.uuidv4()

    return {
      id: id,
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
      },
      popoverContent: [{
        title: () => this.$t('popoverChartTourGenericOptionsTitle'),
        text: () => this.$t('popoverChartTourGenericOptionsText'),
        target: () => `#${id} #additional-options`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourGenericModebarTitle'),
        text: () => this.$t('popoverChartTourGenericModebarText'),
        target: () => `#${id} .modebar`,
        position: 'bottom'
      }]
    }
  },
  computed: {
    baseSourceFile: function () {
      return {
        blob: new Blob([JSON.stringify(this.plotData)], { type: 'application/json' }),
        filename: this.baseFilename,
        extension: 'json'
      }
    },
    baseFilename: function () {
      if (this.chartMode === 'itemByDataset') {
        return this.xTypes[this.xType].itemKey + '-boxplots-' + this.datasetIds.join('-')
      } else if (this.chartMode === 'datasetByItem') {
        return this.xTypes[this.xType].itemKey + '-boxplots-' + this.xIds.join('-')
      } else {
        return this.xTypes[this.xType].itemKey + '-boxplots'
      }
    }
  },
  mixins: [datasetApi, colorMixin],
  methods: {
    showTour: function () {
      this.$refs.tour.start()
    },
    getHeight: function () {
      if (this.chartMode === 'itemByGroup') {
        const groups = []

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
      const div = this.$refs.chart

      this.$plotly.purge(div)

      const y = []

      // Are we plotting datasets and grouping by trait/compound/climate?
      if (this.chartMode === 'datasetByItem') {
        Object.keys(this.plotData.datasets).forEach(dataset => {
          for (let i = 0; i < 6; i++) {
            // If so, datasets are our Ys
            y.push(this.plotData.datasets[dataset].datasetName)
          }
        })
      } else if (this.chartMode === 'itemByDataset' || this.chartMode === 'itemByGroup') {
        Object.keys(this.plotData[this.xTypes[this.xType].itemKey]).forEach(item => {
          for (let j = 0; j < 6; j++) {
            // Else, use this complicated thing to extract the trait/compound/climate name
            y.push(this.plotData[this.xTypes[this.xType].itemKey][item][this.xTypes[this.xType].nameKey])
          }
        })
      }

      let traces = []

      if (this.chartMode === 'datasetByItem') {
        traces = this.getInvertedData(y)
      } else if (this.chartMode === 'itemByDataset') {
        traces = this.getData(y)
      } else if (this.chartMode === 'itemByGroup') {
        traces = this.getGroupData(y)
      }

      const layout = {
        xaxis: {
          zeroline: false,
          side: 'top',
          title: { font: { color: this.darkMode ? 'white' : 'black' } },
          tickfont: { color: this.darkMode ? 'white' : 'black' },
          showgrid: true,
          gridcolor: this.darkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)'
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        height: this.getHeight(),
        margin: { autoexpand: true },
        autosize: true,
        boxmode: 'group',
        yaxis: {
          automargin: true,
          title: { font: { color: this.darkMode ? 'white' : 'black' } },
          tickfont: { color: this.darkMode ? 'white' : 'black' }
        },
        legend: {
          bgcolor: 'rgba(0,0,0,0)',
          orientation: 'h'
        }
      }

      const config = {
        modeBarButtonsToRemove: ['toImage'],
        displayModeBar: true,
        responsive: true,
        displaylogo: false
      }

      this.$plotly.newPlot(div, traces, layout, config)
    },
    getGroupData: function (y) {
      const traces = []

      const groups = []

      this.plotData.stats.forEach(s => {
        if (groups.indexOf(s.groupIds) === -1) {
          groups.push(s.groupIds)
        }
      })

      groups.forEach((group, index) => {
        const x = []

        Object.keys(this.plotData[this.xTypes[this.xType].itemKey]).forEach(item => {
          const itemId = this.plotData[this.xTypes[this.xType].itemKey][item][this.xTypes[this.xType].idKey]
          const itemData = this.plotData.stats.filter(s => s.groupIds === group && s.xId === itemId)[0]

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
        })

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
      const traces = []
      Object.keys(this.plotData.datasets).forEach(dataset => {
        const datasetId = this.plotData.datasets[dataset].datasetId
        const x = []

        Object.keys(this.plotData[this.xTypes[this.xType].itemKey]).forEach(item => {
          const itemId = this.plotData[this.xTypes[this.xType].itemKey][item][this.xTypes[this.xType].idKey]
          const itemData = this.plotData.stats.filter(s => s.datasetId === datasetId && s.xId === itemId)[0]

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
        })

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
      })
      return traces
    },
    getInvertedData: function (y) {
      const traces = []
      Object.keys(this.plotData[this.xTypes[this.xType].itemKey]).forEach(item => {
        const itemId = this.plotData[this.xTypes[this.xType].itemKey][item][this.xTypes[this.xType].idKey]
        const x = []

        Object.keys(this.plotData.datasets).forEach(d => {
          const datasetId = this.plotData.datasets[d].datasetId
          const datasetData = this.plotData.stats.filter(s => s.xId === itemId && s.datasetId === datasetId)[0]

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
        })

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
      })
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
