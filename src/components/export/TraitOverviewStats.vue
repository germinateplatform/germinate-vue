<template>
  <div>
    <h1>TEST</h1>
    <div ref="chart" />
  </div>
</template>

<script>
export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => null
    }
  },
  data: function () {
    return {
      plotData: null
    }
  },
  methods: {
    chart: function () {
      var y = []

      for (var trait in this.plotData.traits) {
        for (var i = 0; i < 6; i++) {
          y.push(this.plotData.traits[trait].traitName)
        }
      }

      var traces = []

      for (var dataset in this.plotData.datasets) {
        var datasetId = this.plotData.datasets[dataset].datasetId
        var x = []

        for (var t in this.plotData.traits) {
          var traitId = this.plotData.traits[t].traitId
          var traitData = this.plotData.stats.filter(s => s.datasetId === datasetId && s.traitId === traitId)[0]

          if (traitData) {
            // This trait/dataset combination is available, add all the information
            x.push(traitData.min)
            x.push(traitData.q1)
            x.push(traitData.median)
            x.push(traitData.median)
            x.push(traitData.q3)
            x.push(traitData.max)
          } else {
            // This trait isn't available in this dataset, fill everything with NaN to not show anything
            x.push(NaN)
            x.push(NaN)
            x.push(NaN)
            x.push(NaN)
            x.push(NaN)
            x.push(NaN)
          }
        }

        traces.push({
          x: x,
          y: y,
          name: this.plotData.datasets[dataset].datasetName,
          marker: { color: this.serverSettings.colorsTemplate[dataset] },
          type: 'box',
          boxmean: false,
          boxpoints: false,
          orientation: 'h'
        })
      }

      console.log(traces)

      var div = this.$refs.chart

      var layout = {
        xaxis: {
          zeroline: false
        },
        height: this.plotData.traits.length * 30 * this.plotData.datasets.length,
        margin: { autoexpand: true },
        autosize: true,
        boxmode: 'group',
        yaxis: {
          automargin: true
        }
      }

      var config = {
        modeBarButtonsToRemove: ['toImage'],
        displayModeBar: true,
        responsive: true,
        displaylogo: false
      }

      this.$plotly.newPlot(div, traces, layout, config)
    }
  },
  mounted: function () {
    this.apiPostTrialsStats(this.datasetIds, result => {
      this.plotData = result
      this.chart()
    })
  }
}
</script>

<style>

</style>
