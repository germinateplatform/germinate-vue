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
import { apiGetStatsFile } from '@/mixins/api/stats.js'
import { Pages } from '@/mixins/pages'
// import { getColors } from '@/mixins/colors.js'
// import { Pages } from '@/mixins/pages'
const d3Dsv = require('d3-dsv')

const Plotly = require('plotly.js/lib/core')
// Only register the chart types we're actually using to reduce the final bundle size
Plotly.register([
  require('plotly.js/lib/sankey')
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
      return 'taxonomy-sankey'
    }
  },
  components: {
    BaseChart
  },
  methods: {
    redraw: function (result) {
      this.sourceFile = result

      // Plotly.purge(this.$refs.taxonomyChart)

      const reader = new FileReader()
      reader.onload = () => {
        const data = d3Dsv.tsvParse(reader.result)

        const labels = new Set()
        const source = []
        const target = []
        const value = []

        data.forEach(t => {
          if (t.subtaxa) {
            t.subtaxa = t.subtaxa.trim()
            labels.add(t.subtaxa)
          }
          if (t.species) {
            t.species = t.species.trim()
            labels.add(t.species)
          }
          if (t.genus) {
            t.genus = t.genus.trim()
            labels.add(t.genus)
          }
        })

        const labelArray = [...labels]

        const genusSpecies = {}

        data.forEach(t => {
          if (t.subtaxa && t.species && t.count > 1) {
            source.push(labelArray.indexOf(t.species))
            target.push(labelArray.indexOf(t.subtaxa))
            value.push(+t.count)
          }
          if (t.species && t.genus) {
            const key = `${t.genus}|${t.species}`

            if (!genusSpecies[key]) {
              genusSpecies[key] = 0
            }

            genusSpecies[key] += +t.count
          }
        })

        Object.keys(genusSpecies).forEach(k => {
          const [genus, species] = k.split('|')

          source.push(labelArray.indexOf(genus))
          target.push(labelArray.indexOf(species))
          value.push(genusSpecies[k])
        })

        const plotData = [{
          arrangement: 'fixed',
          type: 'sankey',
          orientation: 'h',
          node: {
            label: labelArray,
            align: 'left',
            thickness: 30,
            line: {
              color: 'black',
              width: 0.5
            }
          },
          link: {
            source: source,
            target: target,
            value: value
          }
        }]

        const layout = {
          paper_bgcolor: this.storeDarkMode ? '#181a1b' : 'white',
          plot_bgcolor: this.storeDarkMode ? '#181a1b' : 'white',
          font: {
            color: this.storeDarkMode ? 'white' : '#181a1b'
          },
          autosize: true,
          height: 800
        }

        const config = {
          modeBarButtonsToRemove: ['toImage'],
          displayModeBar: false,
          responsive: true,
          displaylogo: false,
          scrollZoom: false
        }

        const chart = this.$refs.taxonomyChart

        Plotly.react(chart, plotData, layout, config)

        chart.on('plotly_click', data => {
          if (data && data.points && data.points.length > 0) {
            let level = null

            switch (data.points[0].depth) {
              case 0:
                level = 'genus'
                break
              case 1:
                level = 'species'
                break
              case 2:
                level = 'subtaxa'
                break
            }

            const query = [{
              column: level,
              comparator: 'equals',
              operator: 'and',
              values: [data.points[0].label]
            }]

            // Navigate to the germplasm page
            this.$router.push({
              name: Pages.germplasm,
              query: {
                'germplasm-filter': JSON.stringify(query)
              }
            })
          }
        })
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
