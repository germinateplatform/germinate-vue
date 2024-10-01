<template>
  <div v-if="plotData">
    <BaseChart :id="id" :width="() => 1280" :height="() => 600" chartType="plotly" :filename="baseFilename" v-on:resize="update" :supportsPngDownload="true" :supportsSvgDownload="true"  v-on:force-redraw="update">
      <div slot="chart" ref="chart" />
    </BaseChart>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseChart from '@/components/charts/BaseChart'
import { uuidv4 } from '@/mixins/util'

const Plotly = require('plotly.js/lib/core')

// Only register the chart types we're actually using to reduce the final bundle size
Plotly.register([
  require('plotly.js/lib/scatterpolar')
])

export default {
  props: {
    plotData: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    const id = 'chart-' + uuidv4()

    return {
      id: id
    }
  },
  computed: {
    ...mapGetters([
      'storeDarkMode'
    ]),
    baseFilename: function () {
      if (this.plotData && this.plotData.germplasmId) {
        return `radar-chart-${this.plotData.germplasmId}`
      } else {
        return ''
      }
    }
  },
  watch: {
    plotData: function () {
      this.update()
    }
  },
  components: {
    BaseChart
  },
  methods: {
    update: function () {
      this.$nextTick(() => {
        if (!this.plotData || !this.plotData.dims || this.plotData.dims.length < 1) {
          return
        }

        const div = this.$refs.chart
        try {
          Plotly.purge(div)
        } catch (e) {
          // Nothing
        }

        const data = [{
          type: 'scatterpolar',
          r: this.plotData.values,
          theta: this.plotData.dims,
          fill: 'toself',
          marker: {
            color: this.plotData.color
          },
          name: this.plotData.germplasmName
        }]

        const layout = {
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          polar: {
            bgcolor: 'transparent',
            angularaxis: {
              color: this.storeDarkMode ? '#ccc' : '#333'
            },
            radialaxis: {
              color: this.storeDarkMode ? '#ccc' : '#333',
              visible: true,
              range: [0, 100]
            }
          },
          showlegend: false
        }

        const config = {
          modeBarButtonsToRemove: ['toImage'],
          displayModeBar: true,
          responsive: true,
          displaylogo: false
        }

        Plotly.newPlot(div, data, layout, config)
      })
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>
</style>
