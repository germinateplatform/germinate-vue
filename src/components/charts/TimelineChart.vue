<template>
  <div>
    <BaseChart :id="id" :width="() => 1280" :height="() => 450" :filename="baseFilename" :loading="loading" >
      <div slot="chart">
        <template v-if="hasPlotData">
          <h2>{{ $t('pageTraitTimelinePlotTitle') }}</h2>
          <p>{{ $t('pageTraitTimelinePlotText') }}</p>
        </template>

        <div v-if="selectedGermplasm && selectedGermplasm.length > 0">
          <b-badge class="mr-2" v-for="(germplasm, index) in selectedGermplasm" :key="`germplasm-badge-${germplasm.germplasm}-${germplasm.row}-${germplasm.column}`" :style="{ backgroundColor: getColor(index).bg, color: getColor(index).text }">
            {{ `${germplasm.germplasm}-${germplasm.rep}` }} <button type="button" class="close badge-close" @click="removeGermplasm(index)">×</button>
          </b-badge>
        </div>

        <div ref="timelinePlot" />

        <div v-if="timepoints && timepoints.length > 0">
          <h2>{{ $t('pageTraitTimelineTimesliderTitle') }}</h2>
          <p>{{ $t('pageTraitTimelineTimesliderText') }}</p>

          <b-row>
            <b-col cols=12 md=6 lg=4 class="d-flex flex-column justify-content-end">
              <b-form-group :label="$t('formLabelTraitTimelineTimepoint')" label-for="timepoint" :description="$t('formDescriptionTraitTimelineTimepoint', { timepoint: timepoints[currentTimepoint] })">
                <b-form-input id="timepoint" v-model.number="currentTimepoint" type="range" :min="0" :max="timepoints.length - 1" />
              </b-form-group>
            </b-col>
            <b-col cols=12 md=6 lg=4>
              <b-form-group :label="$t('formLabelTraitTimelineCalendar')" label-for="calendar">
                <b-form-datepicker v-if="timepoints && timepoints.length > 0"
                                  id="calendar"
                                  no-highlight-today
                                  hide-header
                                  :min="timepoints[0]"
                                  :max="timepoints[timepoints.length - 1]"
                                  :date-info-fn="highlightTimepoints"
                                  :date-disabled-fn="dateDisabled"
                                  selected-variant="info"
                                  :start-weekday="1"
                                  :value="timepoints[currentTimepoint]"
                                  @input="onSelectDate" />
              </b-form-group>
            </b-col>
            <b-col cols=12 md=6 lg=4>
              <b-form-group :label="$t('formLabelTraitTimelineGermplasm')" label-for="germplasm-search">
                <TrialGermplasmLookup id="germplasm-search" :datasetIds="datasetIds" @germplasm-selected="onGermplasmSelected" />
              </b-form-group>
            </b-col>
          </b-row>
        </div>

        <template v-if="shapefiles && shapefiles.length > 0">
          <h2>{{ $t('pageTraitTimelineMapTitle') }}</h2>
          <p>{{ $t('pageTraitTimelineMapText') }}</p>

          <ShapefileGeotiffMap :shapefiles="shapefiles"
                               :mapoverlays="mapoverlays"
                               :mapoverlayIndex="currentTimepoint"
                               :traitData="mapTraitData"
                               :traitStats="traitStats"
                               :selectedGermplasm="selectedGermplasm"
                               @germplasm-selected="onGermplasmSelected"
                               ref="map"/>
        </template>
      </div>

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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import BaseChart from '@/components/charts/BaseChart'
import Tour from '@/components/util/Tour'
import ShapefileGeotiffMap from '@/components/map/ShapefileGeotiffMap'
import TrialGermplasmLookup from '@/components/util/TrialGermplasmLookup'
import { uuidv4 } from '@/mixins/util'

import { mdiHelpCircleOutline } from '@mdi/js'
import { apiPostTrialsDataTable } from '@/mixins/api/trait'
import { apiPostTraitStats } from '@/mixins/api/dataset'
import { getDateString } from '@/mixins/formatting'
import { getColors, getHighContrastTextColor } from '@/mixins/colors'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'
import { apiPostMapOverlayTable } from '@/mixins/api/misc'

global.Buffer = global.Buffer || require('buffer').Buffer

const emitter = require('tiny-emitter/instance')

const Plotly = require('plotly.js/lib/core')
// Only register the chart types we're actually using to reduce the final bundle size
Plotly.register([
  require('plotly.js/lib/scatter')
])

let plotData = null

export default {
  components: {
    BaseChart,
    MdiIcon,
    ShapefileGeotiffMap,
    TrialGermplasmLookup,
    Tour
  },
  props: {
    datasetIds: {
      type: Array,
      default: () => []
    },
    timepoints: {
      type: Array,
      default: () => []
    },
    trait: {
      type: Object,
      default: () => null
    },
    groupIds: {
      type: Array,
      default: () => null
    },
    markedIds: {
      type: Array,
      default: () => null
    },
    shapefiles: {
      type: Array,
      default: () => []
    },
    queryId: {
      type: String,
      default: null
    }
  },
  data: function () {
    const id = 'chart-' + uuidv4()

    return {
      id: id,
      mdiHelpCircleOutline,
      loading: false,
      popoverContent: [{
        title: () => this.$t('popoverChartTourGenericOptionsTitle'),
        text: () => this.$t('popoverChartTourGenericOptionsText'),
        target: () => `#${id} #additional-options`,
        position: 'bottom'
      }],
      traitDefinitions: null,
      traitData: null,
      currentTimepoint: 0,
      preselectCurrentTimepoint: null,
      selectedGermplasm: [],
      geotiffs: null,
      hasPlotData: false
    }
  },
  computed: {
    ...mapGetters([
      'storeDarkMode',
      'storeBaseUrl'
    ]),
    colors: function () {
      const c = getColors()
      return c.map(c => {
        return {
          bg: c,
          text: getHighContrastTextColor(c)
        }
      })
    },
    selectedGermplasmSet: function () {
      if (this.selectedGermplasm) {
        return this.selectedGermplasm.map(sg => `${sg.row}-${sg.column}`)
      } else {
        return []
      }
    },
    mapTraitData: function () {
      if (this.traitData) {
        return this.traitData.filter(td => td.recordingDate.includes(this.timepoints[this.currentTimepoint]))
      } else {
        return null
      }
    },
    mapoverlays: function () {
      if (this.geotiffs && this.geotiffs.length > 0) {
        return this.timepoints.map(tp => this.geotiffs.find(m => m.recordingDate.includes(tp)))
      } else {
        return null
      }
    },
    baseFilename: function () {
      if (this.trait) {
        return `timeseries-${this.trait.traitName.replace(' ', '-')}-datasets-${this.datasetIds.join('-')}`
      } else {
        return null
      }
    },
    traitStats: function () {
      if (this.trait && this.trait.traitId && this.traitDefinitions) {
        const index = this.traitDefinitions.traits.findIndex(t => t.traitId === this.trait.traitId)
        return this.traitDefinitions.stats[index]
      } else {
        return null
      }
    }
  },
  watch: {
    currentTimepoint: function (newValue) {
      Plotly.relayout(this.$refs.timelinePlot, {
        shapes: [{
          layer: 'below',
          type: 'line',
          y0: 0,
          y1: 1,
          yref: 'paper',
          x0: this.timepoints[newValue],
          x1: this.timepoints[newValue],
          xref: 'x',
          line: { color: 'red' }
        }]
      })

      this.updateTimepointQuery(newValue)
    },
    storeDarkMode: function () {
      this.redraw(true)
    },
    traitData: function () {
      this.updatePlotData()
    },
    selectedGermplasm: function () {
      this.updatePlotData()
    }
  },
  methods: {
    updateTimepointQuery: async function (newValue) {
      const params = {}
      params[`${this.queryId}-tp`] = newValue
      const routeQuery = Object.assign({}, this.$router.currentRoute.query, params)

      await this.$router.replace({ query: routeQuery })
    },
    updatePlotData: function () {
      if (this.traitData) {
        const traces = []

        const trace = {
          x: [],
          y: [],
          fill: 'tozerox',
          fillcolor: 'rgba(200, 200, 200, .3)',
          line: { color: 'transparent' },
          name: this.$t('chartLegendValueRange'),
          hoverinfo: 'skip',
          type: 'scatter'
        }

        const mins = this.timepoints.map(tp => Number.MAX_SAFE_INTEGER)
        const sum = this.timepoints.map(tp => 0)
        const counts = this.timepoints.map(tp => 0)
        const maxs = this.timepoints.map(tp => -Number.MAX_SAFE_INTEGER)

        this.traitData.forEach((od, i) => {
          const date = getDateString(new Date(od.recordingDate))
          const index = this.timepoints.indexOf(date)
          const value = +od.traitValue
          mins[index] = Math.min(mins[index], value)
          maxs[index] = Math.max(maxs[index], value)
          sum[index] += value
          counts[index]++
        })

        for (let i = 0; i < this.timepoints.length; i++) {
          trace.x.push(this.timepoints[i])
          trace.y.push(maxs[i])
        }
        for (let i = this.timepoints.length - 1; i >= 0; i--) {
          trace.x.push(this.timepoints[i])
          trace.y.push(mins[i])
        }

        traces.push(trace)

        traces.push({
          x: this.timepoints,
          y: sum.map((s, i) => s * 1.0 / counts[i]),
          type: 'scatter',
          mode: 'lines',
          name: this.$t('chartLegendAverage'),
          line: { color: '#7f8c8d' }
        })

        if (this.selectedGermplasm.length > 0) {
          this.selectedGermplasm.forEach((gp, i) => {
            const germplasmData = this.traitData.filter(td => td.trialRow === gp.row && td.trialColumn === gp.column && td.germplasmName === gp.germplasm)
            const treatments = [...new Set(germplasmData.map(td => td.treatment))]

            treatments.forEach(t => {
              const trace = {
                x: [],
                y: [],
                type: 'scatter',
                name: `${t ? (t + '-') : ''}${gp.germplasm}-${gp.rep}`,
                marker: {
                  color: this.getColor(i).bg,
                  line: { color: this.getColor(i).bg }
                }
              }
              germplasmData.concat().filter(d => d.treatment === t).sort((a, b) => new Date(a.recordingDate) - new Date(b.recordingDate)).forEach(gd => {
                trace.x.push(gd.recordingDate)
                trace.y.push(+gd.traitValue)
              })
              traces.push(trace)
            })
          })
        }

        plotData = traces
        this.hasPlotData = true
      } else {
        plotData = null
        this.hasPlotData = false
      }

      this.redraw()
    },
    getColor: function (index) {
      return this.colors[index % this.colors.length]
    },
    removeGermplasm: function (index) {
      this.selectedGermplasm.splice(index, 1)
    },
    onGermplasmSelected: function (newGermplasm) {
      const index = this.selectedGermplasm.findIndex(sg => sg.row === newGermplasm.row && sg.column === newGermplasm.column && sg.germplasm === newGermplasm.germplasm)

      if (index === -1) {
        this.selectedGermplasm.push(newGermplasm)
      } else {
        this.selectedGermplasm.splice(index, 1)
      }
    },
    onSelectDate: function (ymd) {
      this.currentTimepoint = this.timepoints.indexOf(ymd)
    },
    dateDisabled: function (ymd) {
      return !this.timepoints.includes(ymd)
    },
    highlightTimepoints: function (ymd) {
      return this.timepoints.includes(ymd) ? 'table-info' : null
    },
    redraw: function (forceRedraw = false) {
      if (!plotData) {
        Plotly.purge(this.$refs.timelinePlot)
      } else {
        if (forceRedraw) {
          Plotly.purge(this.$refs.timelinePlot)
        }

        Plotly.react(this.$refs.timelinePlot, plotData, {
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          xaxis: {
            gridcolor: this.storeDarkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)',
            title: { text: this.$t('chartAxisTitleTime'), font: { color: this.storeDarkMode ? 'white' : 'black' } },
            tickfont: { color: this.storeDarkMode ? 'white' : 'black' }
          },
          height: 400,
          yaxis: {
            gridcolor: this.storeDarkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)',
            title: { text: this.$t('chartAxisTitleValue'), font: { color: this.storeDarkMode ? 'white' : 'black' } },
            tickfont: { color: this.storeDarkMode ? 'white' : 'black' },
            range: this.traitStats ? [this.traitStats.min - (this.traitStats.max - this.traitStats.min) * 0.05, this.traitStats.max + (this.traitStats.max - this.traitStats.min) * 0.05] : null
          },
          hovermode: 'x',
          shapes: [{
            layer: 'below',
            type: 'line',
            y0: 0,
            y1: 1,
            yref: 'paper',
            x0: this.timepoints[this.currentTimepoint],
            x1: this.timepoints[this.currentTimepoint],
            xref: 'x',
            line: { color: 'red' }
          }],
          legend: {
            bgcolor: 'rgba(0,0,0,0)',
            font: { color: this.storeDarkMode ? 'white' : 'black' }
          }
        }, {
          responsive: true,
          displaylogo: false
        })
      }
    },
    showTour: function () {
      this.$refs.tour.start()
    },
    getTraitData: function () {
      emitter.emit('show-loading', true)

      this.currentTimepoint = 0

      if (this.trait) {
        apiPostTrialsDataTable({
          datasetIds: this.datasetIds,
          yGroupIds: this.groupIds,
          yIds: this.markedIds,
          filter: [{
            column: 'traitId',
            comparator: 'equals',
            operator: 'and',
            values: [this.trait.traitId]
          }]
        }, result => {
          if (this.preselectCurrentTimepoint !== undefined && this.preselectCurrentTimepoint !== null && this.preselectCurrentTimepoint >= 0 && this.preselectCurrentTimepoint < this.timepoints.length) {
            this.currentTimepoint = this.preselectCurrentTimepoint
          }
          this.preselectCurrentTimepoint = null
          this.traitData = result.data
          emitter.emit('show-loading', false)
        })
      }
    }
  },
  mounted: function () {
    const q = this.$router.currentRoute.query[`${this.queryId}-tp`]

    if (q) {
      this.preselectCurrentTimepoint = +q
    }

    apiPostTraitStats('trial', {
      datasetIds: this.datasetIds
    }, result => {
      this.traitDefinitions = result
    })

    apiPostMapOverlayTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filter: [{
        column: 'datasetId',
        operator: 'inSet',
        comparator: 'and',
        values: this.datasetIds
      }]
    }, result => {
      this.geotiffs = result.data
    })
  }
}
</script>

<style scoped>
.badge-close {
  color: inherit;
  font-size: 125%;
  line-height: 1;
  float: none;
  margin-left: 0.25rem;
}
</style>
