<template>
  <BaseChart :width="() => 1280" :height="() => 1280" :sourceFile="getSourceFile">
    <div slot="chart" id="matrix-chart" ref="matrixChart" />
  </BaseChart>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import { plotlyScatterMatrix } from '@/plugins/charts/plotly-scatter-matrix.js'

export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => []
    }
  },
  components: {
    BaseChart
  },
  methods: {
    getSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: 'trials-' + this.datasetIds.join('-')
      }
    },
    redraw: function (result, colorBy) {
      this.sourceFile = result

      this.$plotly.purge(this.$refs.matrixChart)

      var reader = new FileReader()
      reader.onload = () => {
        var dirtyTsv = reader.result
        var data = this.$plotly.d3.tsv.parse(dirtyTsv)

        this.$plotly.d3.select(this.$refs.matrixChart)
          .datum(data)
          .call(plotlyScatterMatrix()
            .colorBy(colorBy)
            .columnsToIgnore(['name', 'dbId', 'general_identifier', 'dataset_name', 'dataset_description', 'dataset_version', 'license_name', 'location_name', 'trial_site', 'treatments_description', 'year'])
            .colors(this.serverSettings.colorsCharts))
      }
      reader.readAsText(result)
    }
  }
}
</script>

<style>

</style>
