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
      <BaseChart :id="id" :width="() => 1280" :height="() => 600" :filename="baseFilename" chartType="d3.js" v-on:resize="update" :supportsPngDownload="false"  v-on:force-redraw="update">
        <div id="pedigree-chart" slot="chart" ref="pedigreeChart" class="pedigree-chart" />

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
import colors from '@/mixins/colors.js'
import germplasmApi from '@/mixins/api/germplasm.js'
import datasetApi from '@/mixins/api/dataset.js'
import utilMixin from '@/mixins/util'

import { mdiHelpCircleOutline, mdiInformationOutline, mdiDownload } from '@mdi/js'

import { DataSet, Network } from 'vis-network/standalone'

const emitter = require('tiny-emitter/instance')

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
          const nodes = {}
          const connections = []

          this.plotData.forEach(r => {
            nodes[r.childId] = {
              id: r.childId,
              name: r.childName,
              number: r.childNumber
            }
            nodes[r.parentId] = {
              id: r.parentId,
              name: r.parentName,
              number: r.parentNumber
            }
          })

          this.plotData.forEach(r => {
            let edgeColor = '#999999'
            if (r.relationshipType === 'F') {
              edgeColor = '#e74c3c'
            } else if (r.relationshipType === 'M') {
              edgeColor = '#2980b9'
            }

            connections.push({
              from: r.parentId,
              to: r.childId,
              arrows: 'to',
              color: edgeColor
            })
          })

          const data = []
          Object.keys(nodes).forEach(n => {
            const node = nodes[n]
            const bg = node.name === this.germplasm.accenumb ? this.getColor(0) : this.storeDarkMode ? '#000000' : '#ffffff'
            const border = this.storeDarkMode ? '#ffffff' : '#000000'
            let label = node.name
            if (node.number) {
              label += '\n' + node.number
            }
            data.push({
              id: node.id,
              label: label,
              shape: 'circle',
              color: {
                background: bg,
                border: border,
                highlight: { background: bg, border: border },
                hover: { background: bg, border: border }
              }
            })
          })

          const nodeDs = new DataSet(data)
          const edgeDs = new DataSet(connections)

          const network = new Network(this.$refs.pedigreeChart, { nodes: nodeDs, edges: edgeDs }, {
            interaction: { hover: true, zoomView: false },
            manipulation: { enabled: false },
            layout: {
              hierarchical: {
                direction: 'UD',
                sortMethod: 'directed'
              }
            },
            edges: {
              smooth: {
                type: 'continuous'
              }
            }
          })

          const networkCanvas = this.$refs.pedigreeChart.getElementsByTagName('canvas')[0]

          network.on('click', params => {
            const id = network.getNodeAt(params.pointer.DOM)

            if (id !== undefined && id !== null && id !== this.germplasm.id) {
              this.navigateToPassportPage(id)
            }
          })
          network.on('hoverNode', params => {
            const id = network.getNodeAt(params.pointer.DOM)
            if (id === this.germplasm.id) {
              // NOTHING
            } else {
              networkCanvas.style.cursor = 'pointer'
            }
          })
          network.on('blurNode', () => {
            networkCanvas.style.cursor = 'default'
          })
        }
      })
    },
    navigateToPassportPage: function (germplasmId) {
      this.$router.push({ name: 'passport', params: { germplasmId: germplasmId } })
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
      const query = {
        page: 1,
        limit: this.MAX_SAFE_INTEGER,
        filter: [{
          column: 'parentName',
          comparator: 'equals',
          operator: 'or',
          values: [this.germplasm.accenumb]
        }, {
          column: 'childName',
          comparator: 'equals',
          operator: 'or',
          values: [this.germplasm.accenumb]
        }]
      }

      this.apiPostPedigreeTable(query, result => {
        if (result && result.data && result.data.length > 0) {
          this.plotData = result.data

          this.update()
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

.pedigree-chart {
  height: 500px;
}
</style>
