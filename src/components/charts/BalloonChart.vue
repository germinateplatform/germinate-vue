<template>
  <div v-if="plotData && plotData.length > 0">
    <BaseChart :id="id" :width="() => 1280" :height="() => height" chartType="plotly" :filename="baseFilename" v-on:resize="update" :supportsPngDownload="true" :supportsSvgDownload="true"  v-on:force-redraw="update">
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
  require('plotly.js/lib/scatter')
])

export default {
  props: {
    plotData: {
      type: Array,
      default: () => []
    },
    stats: {
      type: Array,
      default: () => []
    },
    baseFilename: {
      type: String,
      default: 'balloon-chart'
    }
  },
  data: function () {
    const id = 'chart-' + uuidv4()

    return {
      id: id,
      isUpdating: false,
      height: 600
    }
  },
  computed: {
    ...mapGetters([
      'storeDarkMode'
    ])
  },
  watch: {
    plotData: {
      deep: true,
      handler: function () {
        this.update()
      }
    },
    stats: function () {
      this.update()
    }
  },
  components: {
    BaseChart
  },
  methods: {
    update: function () {
      if (this.isUpdating) {
        return
      }

      this.isUpdating = true
      this.$nextTick(() => {
        if (!this.plotData || this.plotData.length < 1) {
          return
        }

        const div = this.$refs.chart
        try {
          // Plotly.purge(div)
        } catch (e) {
          // Nothing
        }

        const data = []

        this.height = Math.max(500, this.plotData.length * 175)

        if (this.stats && this.stats.length > 0) {
          this.stats.forEach(st => {
            data.push({
              y: st.values.map(_ => st.displayName),
              x: st.dims,
              mode: 'markers',
              name: st.displayName,
              marker: {
                size: st.values,
                color: st.values.map(_ => st.color),
                opacity: st.values.map(_ => 1)
              }
            })
          })
        }

        this.plotData.forEach(pd => {
          data.push({
            y: pd.values.map(_ => pd.displayName),
            x: pd.dims,
            mode: 'markers',
            customdata: pd.customdata,
            name: pd.displayName,
            marker: {
              size: pd.values,
              color: pd.values.map(_ => pd.color),
              opacity: pd.values.map(_ => 1)
            },
            hovertemplate: '%{y}<br>%{customdata}'
          })
        })

        const layout = {
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          height: this.height,
          showlegend: data.length > 1,
          xaxis: {
            title: { text: null, font: { color: this.storeDarkMode ? 'white' : 'black' } },
            tickfont: { color: this.storeDarkMode ? 'white' : 'black' }
          },
          yaxis: {
            title: { text: null, font: { color: this.storeDarkMode ? 'white' : 'black' } },
            tickfont: { color: this.storeDarkMode ? 'white' : 'black' }
          },
          legend: {
            bgcolor: 'rgba(0,0,0,0)',
            orientation: 'h',
            font: { color: this.storeDarkMode ? 'white' : 'black' },
            x: 0,
            y: 1.1
          }
        }

        const config = {
          modeBarButtonsToRemove: ['toImage'],
          displayModeBar: true,
          responsive: true,
          displaylogo: false
        }

        Plotly.react(div, data, layout, config)

        this.isUpdating = false
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
