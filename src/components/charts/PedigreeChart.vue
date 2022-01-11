<template>
  <div v-if="plotData">
    <BaseChart :id="id" :width="() => 1280" :height="() => 600" :sourceFile="baseSourceFile" :filename="baseFilename" chartType="d3.js" v-on:resize="update" :supportsPngDownload="false"  v-on:force-redraw="update">
      <div id="pedigree-chart" slot="chart" ref="pedigreeChart" />

      <template slot="additionalButtons">
        <b-button v-b-tooltip.hover
                  :title="$t('chartTooltipMatrixTour')"
                  @click="showTour()">
          <i class="mdi mdi-18px mdi-help-circle-outline" />
        </b-button>
      </template>
    </BaseChart>
    <!-- Tour to explain the chart -->
    <Tour :steps="popoverContent" ref="tour" />

    <!-- Export button -->
    <b-button @click="downloadPedigree()"><i class="mdi mdi-18px fix-alignment mdi-download" /> {{ $t('buttonDownloadForHelium') }}</b-button>
    <!-- Information about the export formats -->
    <p><span class="text-muted" v-html="$t('pageExportFormatsHeliumText')" />&nbsp;<router-link :to="{ name: 'about-export-formats-specific', params: { format: 'pedigree' } }" v-b-tooltip.hover :title="$t('tooltipExportFormatLearnMore')"> <i class="mdi mdi-18px fix-alignment mdi-information-outline"/></router-link> </p>
  </div>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import Tour from '@/components/util/Tour'
import { EventBus } from '@/plugins/event-bus.js'
import { pedigreeChart } from '@/plugins/charts/d3-dagre-chart.js'
import colors from '@/mixins/colors.js'
import germplasmApi from '@/mixins/api/germplasm.js'

const d3Select = require('d3-selection')
const d3Dsv = require('d3-dsv')
const d3Shape = require('d3-shape')
const dagreD3 = require('dagre-d3')

export default {
  props: {
    germplasm: {
      type: Object,
      default: null
    }
  },
  data: function () {
    const id = 'chart-' + this.uuidv4()

    return {
      id: id,
      plotData: null,
      popoverContent: [{
        title: () => this.$t('popoverChartTourGenericOptionsTitle'),
        text: () => this.$t('popoverChartTourGenericOptionsText'),
        target: () => `#${id} #additional-options`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourClickableSelectionTitle'),
        text: () => this.$t('popoverChartTourClickableSelectionText'),
        target: () => `#${id} #pedigree-chart`,
        position: 'top'
      }]
    }
  },
  computed: {
    baseSourceFile: function () {
      return {
        blob: this.plotData,
        filename: this.baseFilename,
        extension: 'helium'
      }
    },
    baseFilename: function () {
      return 'pedigree-' + this.germplasm.id
    }
  },
  components: {
    BaseChart,
    Tour
  },
  mixins: [ colors, germplasmApi ],
  methods: {
    showTour: function () {
      this.$refs.tour.start()
    },
    update: function () {
      this.$nextTick(() => {
        while (this.$refs.pedigreeChart.firstChild) {
          this.$refs.pedigreeChart.firstChild.remove()
        }

        if (this.plotData) {
          const reader = new FileReader()
          reader.onload = () => {
            // Remove the first row (Helium header)
            const dirtyTsv = reader.result
            const firstEOL = dirtyTsv.indexOf('\n')
            const parsedTsv = d3Dsv.tsvParse(dirtyTsv.substring(firstEOL + 1))

            let nodes = {}
            let connections = []

            // First, add the parents (important for layout)
            parsedTsv.forEach(function (d) {
              nodes[d.Parent] = null
            })

            // Then the children and the edges
            parsedTsv.forEach(function (d) {
              nodes[d.LineName] = null

              let edgeStyle = ''
              let headStyle = ''

              if (d.ParentType === 'F') {
                edgeStyle = 'stroke: #e74c3c;'
                headStyle = 'fill: #e74c3c;'
              } else if (d.ParentType === 'M') {
                edgeStyle = 'stroke: #2980b9;'
                headStyle = 'fill: #2980b9;'
              }

              connections.push({
                from: d.Parent,
                to: d.LineName,
                edgeStyle: edgeStyle,
                headStyle: headStyle
              })
            })

            let data = []

            Object.keys(nodes).forEach(node => {
              if (Object.prototype.hasOwnProperty.call(nodes, node)) {
                data.push({
                  label: node,
                  class: node === this.germplasm.accenumb ? 'node-primary' : null,
                  nodeStyle: node === this.germplasm.accenumb ? `fill: ${this.getColor(0)}` : ''
                })
              }
            })

            d3Select.select(this.$refs.pedigreeChart)
              .datum(data)
              .call(pedigreeChart(dagreD3)
                .margin({ left: 50, right: 50, top: 30, bottom: 30 })
                .width(this.$refs.pedigreeChart.offsetWidth)
                .height(600)
                .darkMode(this.darkMode)
                .nodeStyle('node')
                .connections(connections)
                .nodeShape('circle')
                .onClick(d => {
                  this.navigateToPassportPage(d)
                })
                .interpolate(d3Shape.curveBundle))
          }
          reader.readAsText(this.plotData)
        }
      })
    },
    navigateToPassportPage: function (germplasmName) {
      // Send a query to get the germplasm id
      const request = {
        page: 1,
        limit: 1,
        filter: [{
          column: 'germplasmName',
          comparator: 'equals',
          operator: 'and',
          values: [germplasmName]
        }]
      }
      this.apiPostGermplasmTable(request, result => {
        if (result && result.data && result.data.length > 0) {
          // Then navigate to the passport page
          this.$router.push({ name: 'passport', params: { germplasmId: result.data[0].germplasmId } })
        }
      })
    },
    downloadPedigree: function () {
      EventBus.$emit('show-loading', true)
      const request = {
        individualIds: [this.germplasm.id],
        levelsUp: 3,
        levelsDown: 3
      }
      this.apiPostPedigreeExport(request, result => {
        this.downloadBlob({
          blob: result,
          filename: this.baseFilename,
          extension: 'helium'
        })
        EventBus.$emit('show-loading', false)
      }, {
        codes: [404],
        callback: () => {
          // Do nothing here, it just means there is no data.
        }
      })
    }
  },
  mounted: function () {
    const request = {
      individualIds: [this.germplasm.id]
    }
    this.apiPostPedigreeExport(request, result => {
      this.plotData = result
      this.update()
    }, {
      codes: [404],
      callback: () => {
        // Do nothing here, it just means there is no data.
      }
    })
  }
}
</script>

<style>
.node rect:hover,
.node circle:hover,
.node ellipse:hover,
.node polygon:hover {
  cursor: pointer;
  fill: lightgray !important  ;
}

body.dark-mode .node rect:hover,
body.dark-mode .node circle:hover,
body.dark-mode .node ellipse:hover,
body.dark-mode .node polygon:hover {
  cursor: pointer;
  fill: #2f353a !important  ;
}
</style>
