<template>
  <div v-if="plotData && plotData.length > 0">
    <BaseChart :id="id" :width="() => 1280" :height="() => 600" chartType="plotly" :filename="baseFilename" v-on:resize="update" :supportsPngDownload="true" :supportsSvgDownload="true"  v-on:force-redraw="update">
      <div slot="chart" ref="chart" />
    </BaseChart>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseChart from '@/components/charts/BaseChart'
import { uuidv4 } from '@/mixins/util'
import { hexToRGBA } from '@/mixins/colors'

const Plotly = require('plotly.js/lib/core')

// Only register the chart types we're actually using to reduce the final bundle size
Plotly.register([
  require('plotly.js/lib/scatterpolar')
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
      default: 'radar-chart'
    }
  },
  data: function () {
    const id = 'chart-' + uuidv4()

    return {
      id: id,
      isUpdating: false
    }
  },
  computed: {
    ...mapGetters([
      'storeDarkMode'
    ])
  },
  watch: {
    plotData: function () {
      this.update()
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
          Plotly.purge(div)
        } catch (e) {
          // Nothing
        }

        const data = []

        if (this.stats && this.stats.length > 0) {
          this.stats.forEach(st => {
            data.push({
              type: 'scatterpolar',
              r: st.values,
              theta: st.dims,
              fill: 'toself',
              mode: 'lines',
              marker: {
                color: st.color
              },
              fillcolor: this.plotData.length > 1 ? hexToRGBA(st.color, 0.3) : null,
              name: st.displayName,
              hovertemplate: '%{theta}'
            })
          })
        }

        this.plotData.forEach(pd => {
          data.push({
            type: 'scatterpolar',
            customdata: pd.customdata,
            r: pd.values,
            theta: pd.dims,
            fill: 'toself',
            marker: {
              color: pd.color
            },
            fillcolor: this.plotData.length > 1 ? hexToRGBA(pd.color, 0.3) : null,
            name: pd.displayName,
            hovertemplate: '%{theta}: %{customdata}'
          })
        })

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
              range: [0, 100],
              showticklabels: false
            }
          },
          showlegend: data.length > 1
        }

        const config = {
          modeBarButtonsToRemove: ['toImage'],
          displayModeBar: true,
          responsive: true,
          displaylogo: false
        }

        Plotly.newPlot(div, data, layout, config)

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
