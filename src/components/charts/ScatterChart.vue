<template>
  <div>
    <BaseChart :width="() => 1280" :height="() => 1280" :sourceFile="getSourceFile" :filename="getFilename" :supportsSvgDownload="false" ref="container">
      <div slot="chart" id="scatter-chart" ref="scatterChart" class="text-center" />
    </BaseChart>
    <b-modal size="xl" ref="passportModal" v-if="germplasmId" @hidden="germplasmId = null">
      <Passport :germplasmId="germplasmId" />
    </b-modal>
  </div>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import Passport from '@/views/data/germplasm/Passport'
import { plotlyScatterPlot } from '@/plugins/charts/plotly-scatter-plot.js'

export default {
  data: function () {
    return {
      sourceFile: null,
      germplasmId: null
    }
  },
  props: {
    datasetIds: {
      type: Array,
      default: () => []
    },
    x: {
      type: String,
      default: ''
    },
    y: {
      type: String,
      default: ''
    }
  },
  components: {
    BaseChart,
    Passport
  },
  methods: {
    getSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: this.getFilename()
      }
    },
    getFilename: function () {
      return 'trials-' + this.datasetIds.join('-')
    },
    redraw: function (result, colorBy) {
      this.sourceFile = result

      this.$plotly.purge(this.$refs.scatterChart)

      var reader = new FileReader()
      reader.onload = () => {
        var dirtyTsv = reader.result
        var firstEOL = dirtyTsv.indexOf('\r\n')
        var tsv = dirtyTsv.substring(firstEOL + 2)
        var data = this.$plotly.d3.tsv.parse(tsv) // Remove the first row (Flapjack header)

        this.$plotly.d3.select(this.$refs.scatterChart)
          .datum(data)
          .call(plotlyScatterPlot()
            .colorBy(colorBy)
            .xCategory(this.x)
            .yCategory(this.y)
            .onPointClicked(p => {
              this.germplasmId = parseInt(p.id.split('-')[0])

              this.$nextTick(() => this.$refs.passportModal.show())
            })
            .colors(this.serverSettings.colorsCharts))
      }
      reader.readAsText(result)
    }
  }
}
</script>

<style>

</style>
