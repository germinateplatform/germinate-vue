<template>
  <div>
    <BaseChart :width="() => 720" :height="() => 720" :sourceFile="baseSourceFile" :filename="baseFilename" v-on:force-redraw="redraw(sourceFile)">
      <div slot="chart" id="taxonomy-chart" ref="taxonomyChart" class="chart-taxonomy text-center" />
    </BaseChart>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseChart from '@/components/charts/BaseChart'
import { plotlySunburstChart } from '@/plugins/charts/plotly-sunburst-chart.js'
import { apiGetStatsFile } from '@/mixins/api/stats.js'
import { getColors } from '@/mixins/colors.js'
const d3Select = require('d3-selection')
const d3Dsv = require('d3-dsv')

const Plotly = require('plotly.js/lib/core')

// Only register the chart types we're actually using to reduce the final bundle size
Plotly.register([
  require('plotly.js/lib/sunburst')
])

export default {
  data: function () {
    return {
      sourceFile: null
    }
  },
  computed: {
    ...mapGetters([
      'storeDarkMode'
    ]),
    baseSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: this.baseFilename
      }
    },
    baseFilename: function () {
      return 'taxonomy-sunburst'
    }
  },
  components: {
    BaseChart
  },
  methods: {
    redraw: function (result) {
      this.sourceFile = result

      Plotly.purge(this.$refs.taxonomyChart)

      const reader = new FileReader()
      reader.onload = () => {
        const data = d3Dsv.tsvParse(reader.result)

        const sunburst = {}

        data.forEach(t => {
          if (t.subtaxa) {
            const key = `${t.subtaxa}->${t.genus} | ${t.species}`
            if (!sunburst[key]) {
              sunburst[key] = 0
            }

            sunburst[key] += parseInt(t.count)
          }

          if (t.species) {
            const key = `${t.genus} | ${t.species}->${t.genus}`
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

        const chartData = {
          labels: [],
          parents: [],
          values: []
        }

        Object.keys(sunburst).forEach(k => {
          const parts = k.split('->')
          chartData.labels.push(parts[0])
          chartData.parents.push(parts[1] === 'NULL' ? '' : parts[1])
          chartData.values.push(sunburst[k])
        })

        d3Select.select(this.$refs.taxonomyChart)
          .datum(chartData)
          .call(plotlySunburstChart(Plotly)
            .darkMode(this.storeDarkMode)
            .height(500)
            .onLeafClicked(path => {
              // Then store a filter using genus, species and subtaxa
              let query

              if (path.length === 1 && path[0] === 'N/A') {
                query = [{
                  column: 'genus',
                  comparator: 'isNull',
                  operator: 'and',
                  values: []
                }]
              } else {
                const genus = path[0]
                const species = path.length > 1 ? path[1].split(' | ')[1] : null
                const subtaxa = path.length > 2 ? path[2] : null
                query = [{
                  column: 'genus',
                  comparator: 'equals',
                  operator: 'and',
                  values: [genus]
                }]

                if (species) {
                  query.push({
                    column: 'species',
                    comparator: 'equals',
                    operator: 'and',
                    values: [species]
                  })
                }
                if (subtaxa) {
                  query.push({
                    column: 'subtaxa',
                    comparator: 'equals',
                    operator: 'and',
                    values: [subtaxa]
                  })
                }
              }

              // Navigate to the germplasm page
              this.$router.push({
                name: 'germplasm',
                query: {
                  'germplasm-filter': JSON.stringify(query)
                }
              })
            })
            .colors(getColors()))
      }
      reader.readAsText(result)
    }
  },
  mounted: function () {
    apiGetStatsFile('taxonomy', result => this.redraw(result))
  }
}
</script>

<style>
.chart-taxonomy g.slice:hover {
  cursor: pointer;
}
</style>
