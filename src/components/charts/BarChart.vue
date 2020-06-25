<template>
  <div>
    <BaseChart :width="() => 1280" :height="() => 600" :sourceFile="getSourceFile" :filename="getFilename" v-on:force-redraw="redraw">
      <div slot="chart" id="bar-chart" ref="barChart" class="chart-bar text-center" />
    </BaseChart>
  </div>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import { plotlyBarChart } from '@/plugins/charts/plotly-bar-chart.js'
import colorMixin from '@/mixins/colors.js'

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
  components: {
    BaseChart
  },
  watch: {
    sourceFile: function (newValue, oldValue) {
      this.redraw()
    }
  },
  mixins: [ colorMixin ],
  methods: {
    getSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: this.getFilename()
      }
    },
    getFilename: function () {
      return this.downloadName
    },
    redraw: function () {
      this.$plotly.purge(this.$refs.barChart)

      if (this.sourceFile) {
        var reader = new FileReader()
        reader.onload = () => {
          var data = this.$plotly.d3.tsv.parse(reader.result)

          this.$plotly.d3.select(this.$refs.barChart)
            .datum(data)
            .call(plotlyBarChart()
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
  },
  mounted: function () {
    this.redraw()
  }
}
</script>

<style>

</style>
