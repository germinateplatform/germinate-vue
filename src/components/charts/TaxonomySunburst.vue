<template>
  <div>
    <BaseChart :width="() => 720" :height="() => 720" :sourceFile="getSourceFile" :filename="getFilename" v-on:force-redraw="redraw(sourceFile)">
      <div slot="chart" id="taxonomy-chart" ref="taxonomyChart" class="chart-taxonomy text-center" />
    </BaseChart>
  </div>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import { plotlySunburstChart } from '@/plugins/charts/plotly-sunburst-chart.js'
import statsApi from '@/mixins/api/stats.js'
import colorMixin from '@/mixins/colors.js'

export default {
  data: function () {
    return {
      sourceFile: null
    }
  },
  components: {
    BaseChart
  },
  mixins: [ statsApi, colorMixin ],
  methods: {
    getSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: this.getFilename()
      }
    },
    getFilename: function () {
      return 'taxonomy-sunburst'
    },
    redraw: function (result) {
      this.sourceFile = result

      this.$plotly.purge(this.$refs.taxonomyChart)

      var reader = new FileReader()
      reader.onload = () => {
        var data = this.$plotly.d3.tsv.parse(reader.result)

        let sunburst = {}

        data.forEach(t => {
          if (t.subtaxa) {
            const key = `${t.subtaxa}->${t.species}`
            if (!sunburst[key]) {
              sunburst[key] = 0
            }

            sunburst[key] += parseInt(t.count)
          }

          if (t.species) {
            const key = `${t.species}->${t.genus}`
            if (!sunburst[key]) {
              sunburst[key] = 0
            }

            sunburst[key] += parseInt(t.count)
          }

          if (t.genus) {
            const key = `${t.genus}->NULL`
            if (!sunburst[key]) {
              sunburst[key] = 0
            }

            sunburst[key] += parseInt(t.count)
          }
        })

        let chartData = {
          labels: [],
          parents: [],
          values: []
        }

        Object.keys(sunburst).forEach(k => {
          let parts = k.split('->')
          chartData.labels.push(parts[0])
          chartData.parents.push(parts[1] === 'NULL' ? '' : parts[1])
          chartData.values.push(sunburst[k])
        })

        this.$plotly.d3.select(this.$refs.taxonomyChart)
          .datum(chartData)
          .call(plotlySunburstChart()
            .height(500)
            .onLeafClicked(path => {
              // Then store a filter using genus, species and subtaxa
              var query

              if (path.length === 1 && path[0] === 'N/A') {
                query = [{
                  column: {
                    name: 'genus',
                    type: String
                  },
                  comparator: 'isNull',
                  operator: 'and',
                  values: []
                }]
              } else {
                query = [{
                  column: {
                    name: 'genus',
                    type: String
                  },
                  comparator: 'equals',
                  operator: 'and',
                  values: [path[0]]
                }]

                if (path.length > 1) {
                  query.push({
                    column: {
                      name: 'species',
                      type: String
                    },
                    comparator: 'equals',
                    operator: 'and',
                    values: [path[1]]
                  })
                }
                if (path.length > 2) {
                  query.push({
                    column: {
                      name: 'subtaxa',
                      type: String
                    },
                    comparator: 'equals',
                    operator: 'and',
                    values: [path[2]]
                  })
                }
              }

              // Navigate to the germplasm page
              this.$store.commit('ON_TABLE_FILTERING_CHANGED_MUTATION', query)
              this.$router.push({ name: 'germplasm' })
            })
            .colors(this.getColors()))
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
