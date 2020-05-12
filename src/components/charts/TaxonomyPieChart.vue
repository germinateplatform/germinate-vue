<template>
  <div>
    <BaseChart :width="() => 720" :height="() => 720" :sourceFile="getSourceFile" :filename="getFilename">
      <div slot="chart" id="taxonomy-chart" ref="taxonomyChart" class="chart-taxonomy text-center" />
    </BaseChart>
  </div>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import { plotlyPieChart } from '@/plugins/charts/plotly-pie-chart.js'
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
      return 'taxonomy'
    },
    unpackAndJoin: function (rows, keys) {
      return rows.map(row => keys.map(k => row[k]).join(' '))
    },
    redraw: function (result) {
      this.sourceFile = result

      this.$plotly.purge(this.$refs.taxonomyChart)

      var reader = new FileReader()
      reader.onload = () => {
        var data = this.$plotly.d3.tsv.parse(reader.result)

        this.$plotly.d3.select(this.$refs.taxonomyChart)
          .datum(data)
          .call(plotlyPieChart()
            .labels(rows => this.unpackAndJoin(rows, ['genus', 'species', 'subtaxa']))// Join the genus, species and subtaxa into a single description
            .custom(rows => {
              // Store some custom information per data point, so we can use this later
              return rows.map(r => {
                return {
                  genus: r.genus,
                  species: r.species,
                  subtaxa: r.subtaxa
                }
              })
            })
            .onSliceClicked(selection => {
              // When a slice is clicked, retrieve the custom information
              const index = selection.points[0].i
              const custom = selection.points[0].data.custom[index]

              // Then store a filter using genus, species and subtaxa
              var query

              if (custom.genus && custom.genus !== 'N/A') {
                query = [{
                  column: {
                    name: 'genus',
                    type: String
                  },
                  comparator: 'equals',
                  operator: 'and',
                  values: [custom.genus]
                }]
              } else {
                query = [{
                  column: {
                    name: 'genus',
                    type: String
                  },
                  comparator: 'isNull',
                  operator: 'and',
                  values: []
                }]
              }

              if (custom.species) {
                query.push({
                  column: {
                    name: 'species',
                    type: String
                  },
                  comparator: 'equals',
                  operator: 'and',
                  values: [custom.species]
                })
              }
              if (custom.subtaxa) {
                query.push({
                  column: {
                    name: 'subtaxa',
                    type: String
                  },
                  comparator: 'equals',
                  operator: 'and',
                  values: [custom.subtaxa]
                })
              }

              // Navigate to the germplasm page
              this.$store.commit('ON_TABLE_FILTERING_CHANGED_MUTATION', query)
              this.$router.push({ name: 'germplasm' })
            })
            .height(500)
            .colors(this.serverSettings.colorsCharts))
      }
      reader.readAsText(result)
    }
  },
  mounted: function () {
    this.apiGetStatsFile('taxonomy', result => this.redraw(result))
  }
}
</script>

<style>
.chart-taxonomy g.slice:hover {
  cursor: pointer;
}
</style>
