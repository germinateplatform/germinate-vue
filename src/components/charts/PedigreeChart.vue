<template>
  <div v-if="datasets && datasets.length > 0">
    <h4>{{ $t('pagePassportPedigreeChartTitle') }}</h4>
    <b-form-group :label="$t('tableColumnDatasetName')" label-for="dataset">
      <b-form-select :options="datasetOptions" v-model="dataset" id="dataset">
        <template #first>
          <b-form-select-option :value="null" disabled>{{ $t('formLabelPedigreeChartDatasetSelect') }}</b-form-select-option>
        </template>
      </b-form-select>
    </b-form-group>

    <div v-if="plotData">
      <BaseChart :id="id" :width="() => 1280" :height="() => 600" :sourceFile="baseSourceFile" :filename="baseFilename" chartType="d3.js" v-on:resize="update" :supportsPngDownload="false"  v-on:force-redraw="update">
        <div id="pedigree-chart" slot="chart" ref="pedigreeChart" />

        <template slot="additionalButtons">
          <b-button v-b-tooltip.hover
                    :title="$t('chartTooltipMatrixTour')"
                    @click="showTour()">
            <MdiIcon :path="mdiHelpCircleOutline" />
          </b-button>
        </template>
      </BaseChart>
      <!-- Tour to explain the chart -->
      <Tour :steps="popoverContent" ref="tour" />

      <!-- Export button -->
      <b-button @click="downloadPedigree"><MdiIcon :path="mdiDownload" /> {{ $t('buttonDownloadForHelium') }}</b-button>
      <!-- Information about the export formats -->
      <p><span class="text-muted" v-html="$t('pageExportFormatsHeliumText')" />&nbsp;<router-link :to="{ name: 'about-export-formats-specific', params: { format: 'pedigree' } }" v-b-tooltip.hover :title="$t('tooltipExportFormatLearnMore')"> <MdiIcon :path="mdiInformationOutline"/></router-link> </p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import BaseChart from '@/components/charts/BaseChart'
import Tour from '@/components/util/Tour'
import { pedigreeChart } from '@/plugins/charts/d3-dagre-chart.js'
import colors from '@/mixins/colors.js'
import germplasmApi from '@/mixins/api/germplasm.js'
import datasetApi from '@/mixins/api/dataset.js'
import utilMixin from '@/mixins/util'

import { mdiHelpCircleOutline, mdiInformationOutline, mdiDownload } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

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
      mdiHelpCircleOutline,
      mdiInformationOutline,
      mdiDownload,
      id: id,
      plotData: null,
      dataset: null,
      datasets: [],
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
    ...mapGetters([
      'storeDarkMode'
    ]),
    datasetOptions: function () {
      if (this.datasets) {
        return this.datasets.map(d => {
          return {
            value: d,
            text: d.datasetName
          }
        })
      } else {
        return []
      }
    },
    baseSourceFile: function () {
      return {
        blob: this.plotData,
        filename: this.baseFilename,
        extension: 'helium'
      }
    },
    baseFilename: function () {
      return `pedigree-${this.germplasm.id}-dataset-${this.dataset ? this.dataset.datasetId : 'null'}`
    }
  },
  watch: {
    dataset: function () {
      this.getPlotData()
    }
  },
  components: {
    BaseChart,
    Tour,
    MdiIcon
  },
  mixins: [colors, germplasmApi, datasetApi, utilMixin],
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

            const nodes = {}
            const connections = []

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

            const data = []
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
                .darkMode(this.storeDarkMode)
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
      emitter.emit('show-loading', true)

      const request = {
        yIds: [this.germplasm.id],
        datasetIds: [this.dataset.datasetId],
        levelsUp: 3,
        levelsDown: 3
      }

      this.apiPostDatasetExport('pedigree', request, result => {
        this.downloadBlob({
          blob: result,
          filename: this.baseFilename,
          extension: 'helium'
        })
        emitter.emit('show-loading', false)
      }, {
        codes: [404],
        callback: () => {
          // Do nothing here, it just means there is no data.
        }
      })
    },
    getPlotData: function () {
      const request = {
        yIds: [this.germplasm.id],
        datasetIds: [this.dataset.datasetId]
      }

      this.apiPostDatasetExport('pedigree', request, result => {
        this.plotData = result
        this.update()
      }, {
        codes: [404],
        callback: () => {
          // Do nothing here, it just means there is no data.
        }
      })
    },
    init: function () {
      this.apiPostGermplasmDatasetTable(this.germplasm.id, {
        filter: [{
          column: 'datasetType',
          comparator: 'equals',
          operator: 'and',
          values: ['pedigree']
        }]
      }, result => {
        if (result && result.data) {
          this.datasets = result.data

          if (result.data.length > 0) {
            this.dataset = result.data.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn))[0]
          } else {
            this.dataset = null
          }
        }
      })
    }
  },
  mounted: function () {
    this.init()

    emitter.on('license-accepted', this.init)
  },
  beforeDestroy: function () {
    emitter.off('license-accepted', this.init)
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
