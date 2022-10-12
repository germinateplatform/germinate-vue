<template>
  <div>
    <BaseChart :id="id" :width="() => 1280" :height="() => 450" :sourceFile="baseSourceFile" :filename="baseFilename" :loading="loading" >
      <div slot="chart" ref="chart" />

      <template slot="additionalButtons">
        <b-button v-b-tooltip.hover
                  :title="$t('chartTooltipMatrixTour')"
                  @click="showTour()">
          <MdiIcon :path="mdiHelpCircleOutline" />
        </b-button>
      </template>
    </BaseChart>

    <!-- Tour to explain the chart -->
    <Tour :steps="popoverContent" ref="tour" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import BaseChart from '@/components/charts/BaseChart'
import Tour from '@/components/util/Tour'
import { uuidv4 } from '@/mixins/util'

import { mdiHelpCircleOutline } from '@mdi/js'

const Plotly = require('plotly.js-dist-min')

export default {
  props: {
    categories: {
      type: Array,
      default: () => []
    },
    germplasm: {
      type: Array,
      default: () => []
    },
    trait: {
      type: Object,
      default: () => null
    },
    germplasmData: {
      type: Object,
      default: () => {}
    },
    colorMapping: {
      type: Object,
      default: () => null
    },
    getPlotData: {
      type: Function,
      default: () => null
    }
  },
  components: {
    BaseChart,
    MdiIcon,
    Tour
  },
  data: function () {
    const id = 'chart-' + uuidv4()

    return {
      id: id,
      mdiHelpCircleOutline,
      loading: false,
      popoverContent: [{
        title: () => this.$t('popoverChartTourGenericOptionsTitle'),
        text: () => this.$t('popoverChartTourGenericOptionsText'),
        target: () => `#${id} #additional-options`,
        position: 'bottom'
      }]
    }
  },
  watch: {
    colorMapping: function () {
      this.redraw()
    }
  },
  computed: {
    ...mapGetters([
      'storeDarkMode'
    ]),
    baseSourceFile: function () {
      return {
        blob: new Blob([this.getPlotData(this.trait)], { type: 'text/plain' }),
        filename: this.baseFilename,
        extension: 'txt'
      }
    },
    baseFilename: function () {
      return `comparison-${this.trait.traitName.replace(' ', '-')}`
    }
  },
  methods: {
    showTour: function () {
      this.$refs.tour.start()
    },
    getTraces: function () {
      let traces
      if (this.categories && (this.categories.length > 1 || (this.categories[0] !== null && this.categories[0] !== undefined))) {
        // If there are categories, we're going to use them as the traces
        traces = this.categories.map(tr => {
          const color = this.colorMapping[tr]

          // Construct all the x values
          const x = this.germplasm.map(g => {
            // Get the data for this germplasm
            const germplasmData = this.germplasmData[g.id]
            if (germplasmData && germplasmData.values[tr]) {
              // If there is data for this germplasm and treatment, return an array of the same length filled with the name
              return germplasmData.values[tr].map(() => g.name)
            } else {
              // Otherwise, just return an array with the germplasm name
              return [g.name]
            }
          }).reduce((a, b) => a.concat(b), [])
          // Construct all the y values
          const y = this.germplasm.map(g => {
            // Get the data for this germplasm
            const germplasmData = this.germplasmData[g.id]
            if (germplasmData && germplasmData.values[tr]) {
              // If there is data for this germplasm and treatment, return ir
              return germplasmData.values[tr]
            } else {
              // Otherwise, just return an array with null
              return [null]
            }
          }).reduce((a, b) => a.concat(b), [])

          // Let's get all distinct values
          const distinct = new Set()
          y.forEach(a => distinct.add(a))

          // If there are at least two or the individual one isn't null, assume this is valid/present data
          const exists = distinct.size > 2 || distinct.values().next().value !== null

          if (exists) {
            // In this case, return the data as is
            return {
              x: x,
              y: y,
              name: tr || 'N/A',
              type: 'box',
              marker: {
                color: color
              }
            }
          } else {
            // Otherwise, return dummy data that results in the desired chart formatting
            return {
              visible: true,
              x: x,
              y: x.map(() => this.germplasmData.total / this.germplasmData.count),
              hoverinfo: 'none',
              opacity: 0,
              name: tr || 'N/A',
              type: 'box',
              marker: {
                color: color
              }
            }
          }
        })
      } else {
        // Otherwise use the germplasm as traces
        traces = this.germplasm.map(g => {
          // Get and remember the color
          const color = this.colorMapping[g.id]

          // Check if here is data for this germplasm
          const germplasmData = this.germplasmData[g.id]
          if (germplasmData) {
            // If so, simply return it
            return {
              y: germplasmData.values[undefined],
              name: g.name,
              type: 'box',
              marker: {
                color: color
              }
            }
          } else {
            // Otherwise, return dummy data that results in the desired chart formatting
            return {
              visible: true,
              y: [this.germplasmData.total / this.germplasmData.count],
              hoverinfo: 'none',
              opacity: 0,
              name: g.name,
              type: 'box',
              marker: {
                color: color
              }
            }
          }
        })
      }

      return traces
    },
    redraw: function () {
      this.loading = true
      const div = this.$refs.chart

      Plotly.purge(div)

      const traces = this.getTraces()

      const layout = {
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        xaxis: {
          zeroline: false,
          side: 'top',
          title: { font: { color: this.storeDarkMode ? 'white' : 'black' } },
          tickfont: { color: this.storeDarkMode ? 'white' : 'black' }
        },
        height: 400,
        margin: { autoexpand: true },
        autosize: true,
        yaxis: {
          automargin: true,
          title: { text: this.trait.traitName, font: { color: this.storeDarkMode ? 'white' : 'black' } },
          tickfont: { color: this.storeDarkMode ? 'white' : 'black' },
          showgrid: true,
          gridcolor: this.storeDarkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)'
        },
        legend: {
          bgcolor: 'rgba(0,0,0,0)',
          orientation: 'h',
          font: { color: this.storeDarkMode ? 'white' : 'black' }
        },
        shapes: [{
          type: 'line',
          xref: 'paper',
          yref: 'y',
          layer: 'below',
          x0: 0,
          y0: this.germplasmData.total / this.germplasmData.count,
          x1: 1,
          y1: this.germplasmData.total / this.germplasmData.count,
          line: {
            width: 2,
            color: '#666666',
            dash: 'dot'
          }
        }]
      }

      if (this.categories && (this.categories.length > 1 || (this.categories[0] !== null && this.categories[0] !== undefined))) {
        layout.boxmode = 'group'
      }

      const config = {
        modeBarButtonsToRemove: ['toImage'],
        displayModeBar: false,
        responsive: true,
        displaylogo: false
      }

      this.loading = false
      Plotly.newPlot(div, traces, layout, config)
    }
  },
  mounted: function () {
    this.redraw()
  }
}
</script>

<style>

</style>
