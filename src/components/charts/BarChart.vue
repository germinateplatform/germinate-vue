<template>
  <div>
    <BaseChart :width="() => 1280" :height="() => 600" :sourceFile="baseSourceFile" :filename="baseFilename" v-on:force-redraw="redraw">
      <div slot="chart" id="bar-chart" ref="barChart" class="chart-bar text-center" />
    </BaseChart>
  </div>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import { plotlyBarChart } from '@/plugins/charts/plotly-bar-chart.js'
import colorMixin from '@/mixins/colors.js'
const d3Dsv = require('d3-dsv')
const d3Select = require('d3-selection')

export default {
  props: {
    xTitle: {
      type: String,
      default: null
    },
    yTitle: {
      type: String,
      default: null
    },
    xColumn: {
      type: String,
      default: ''
    },
    downloadName: {
      type: String,
      default: 'bar-chart'
    },
    mode: {
      type: String,
      default: 'traces'
    },
    sourceFile: {
      type: Blob,
      default: null
    },
    height: {
      type: Number,
      default: 500
    }
  },
  computed: {
    baseSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: this.baseFilename
      }
    },
    baseFilename: function () {
      return this.downloadName
    }
  },
  components: {
    BaseChart
  },
  watch: {
    sourceFile: function () {
      this.redraw()
    }
  },
  mixins: [ colorMixin ],
  methods: {
    redraw: function () {
      if (this.sourceFile) {
        this.$plotly.purge(this.$refs.barChart)

        if (this.sourceFile) {
          let reader = new FileReader()
          reader.onload = () => {
            let data = d3Dsv.tsvParse(reader.result)

            d3Select.select(this.$refs.barChart)
              .datum(data)
              .call(plotlyBarChart()
                .darkMode(this.darkMode)
                .height(this.height)
                .colors(this.getColors())
                .x(this.xColumn)
                .xCategory(this.xTitle)
                .yCategory(this.yTitle)
                .mode(this.mode)
                .onPointClicked(data => {
                  this.$emit('bar-clicked', data)
                }))
          }
          reader.readAsText(this.sourceFile)
        }
      }
    }
  },
  mounted: function () {
    this.redraw()
  }
}
</script>

<style>

</style>
