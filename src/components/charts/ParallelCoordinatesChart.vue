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

const Plotly = require('plotly.js/lib/core')

// Only register the chart types we're actually using to reduce the final bundle size
Plotly.register([
  require('plotly.js/lib/parcoords')
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
      default: 'parallel-coordinates-chart'
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

        const colors = []
        const dims = []

        if (this.stats && this.stats.length > 0) {
          if (dims.length < 1) {
            // Init
            this.stats[0].dims.forEach(d => {
              dims.push({
                label: d,
                range: [0, 100],
                values: []
              })
            })
          }

          this.stats.forEach(st => {
            st.values.forEach((v, i) => {
              dims[i].values.push(v)
            })
            colors.push(st.color)
          })
        }

        if (this.plotData && this.plotData.length > 0) {
          if (dims.length < 1) {
            // Init
            this.stats[0].dims.forEach(d => {
              dims.push({
                label: d,
                range: [0, 100],
                values: []
              })
            })
          }

          this.plotData.forEach(st => {
            st.values.forEach((v, i) => {
              dims[i].values.push(v)
            })
            colors.push(st.color)
          })
        }

        const colorValues = colors.map((c, i) => i / (colors.length - 1))
        const colorScale = colors.map((c, i) => [i / (colors.length - 1), c])

        data.push({
          type: 'parcoords',
          dimensions: dims,
          line: {
            color: colorValues,
            colorscale: colorScale
          }
        })

        console.log(data)

        // if (this.stats && this.stats.length > 0) {
        //   this.stats.forEach(st => {
        //     data.push({
        //       type: 'scatterpolar',
        //       r: st.values,
        //       theta: st.dims,
        //       fill: 'toself',
        //       mode: 'lines',
        //       marker: {
        //         color: st.color
        //       },
        //       fillcolor: this.plotData.length > 1 ? hexToRGBA(st.color, 0.3) : null,
        //       name: st.displayName,
        //       hovertemplate: '%{theta}'
        //     })
        //   })
        // }

        // this.plotData.forEach(pd => {
        //   data.push({
        //     type: 'scatterpolar',
        //     customdata: pd.customdata,
        //     r: pd.values,
        //     theta: pd.dims,
        //     fill: 'toself',
        //     marker: {
        //       color: pd.color
        //     },
        //     fillcolor: this.plotData.length > 1 ? hexToRGBA(pd.color, 0.3) : null,
        //     name: pd.displayName,
        //     hovertemplate: '%{theta}<br>%{customdata}'
        //   })
        // })

        const layout = {
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          height: Math.min(700, div.offsetWidth),
          showlegend: data.length > 1
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
