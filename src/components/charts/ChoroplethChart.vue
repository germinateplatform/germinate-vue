<template>
  <div>
    <BaseChart :width="() => 1280" :height="() => 600" :sourceFile="getSourceFile" :filename="getFilename">
      <div slot="chart" id="choropleth-chart" ref="choroplethChart" class="chart-choropleth text-center" />
    </BaseChart>
  </div>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import statsApi from '@/mixins/api/stats.js'

export default {
  data: function () {
    return {
      sourceFile: null
    }
  },
  components: {
    BaseChart
  },
  mixins: [ statsApi ],
  methods: {
    getSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: this.getFilename()
      }
    },
    getFilename: function () {
      return 'choropleth'
    },
    unpack: function (rows, key) {
      return rows.map(r => r[key])
    },
    hexToRgbA: function (hex, a) {
      var c
      if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('')
        if (c.length === 3) {
          c = [c[0], c[0], c[1], c[1], c[2], c[2]]
        }
        c = '0x' + c.join('')
        return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + a + ')'
      }
      return hex
    },
    redraw: function () {
      this.$plotly.purge(this.$refs.choroplethChart)

      var reader = new FileReader()
      reader.onload = () => {
        var rows = this.$plotly.d3.tsv.parse(reader.result)

        const color = (this.serverSettings.colorsCharts && this.serverSettings.colorsCharts.length > 0) ? this.serverSettings.colorsCharts[0] : '#00acef'

        var data = [{
          type: 'choropleth',
          locations: this.unpack(rows, 'code'),
          z: this.unpack(rows, 'count'),
          text: this.unpack(rows, 'country'),
          colorscale: [[0, this.hexToRgbA(color, 0.1)], [1, this.hexToRgbA(color, 1)]],
          autocolorscale: false,
          reversescale: false,
          marker: {
            line: {
              color: 'rgb(180,180,180)',
              width: 0.1
            }
          },
          tick0: 0,
          zmin: 0,
          dtick: 1000,
          colorbar: {
            autotic: false,
            tickprefix: '',
            thickness: 6
          }
        }]

        var layout = {
          autosize: true,
          height: 800,
          geo: {
            showframe: true,
            showcountries: true,
            showcoastlines: false,
            projection: {
              type: 'natural earth'
            }
          }
        }

        var config = {
          modeBarButtonsToRemove: ['toImage'],
          displayModeBar: true,
          responsive: true,
          displaylogo: false,
          scrollZoom: false
        }

        const chart = this.$refs.choroplethChart

        this.$plotly.plot(chart, data, layout, config)

        chart.on('plotly_click', data => {
          if (data && data.points && data.points.length > 0) {
            this.navigateToGermplasmPageFilteredByCountry(data.points[0].text)
          }
        })
      }
      reader.readAsText(this.sourceFile)
    },
    navigateToGermplasmPageFilteredByCountry: function (countryName) {
      // Store the filter
      this.$store.commit('ON_TABLE_FILTERING_CHANGED_MUTATION', [{
        column: {
          name: 'countryName',
          type: String
        },
        comparator: 'equals',
        operator: 'and',
        values: [countryName]
      }])
      // Then navigate
      this.$router.push({ name: 'germplasm' })
    }
  },
  mounted: function () {
    this.apiGetStatsFile('country', result => {
      this.sourceFile = result
      this.redraw()
    })
  }
}
</script>

<style>

</style>
