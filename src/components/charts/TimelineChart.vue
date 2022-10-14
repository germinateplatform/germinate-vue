<template>
  <div>
    <BaseChart :id="id" :width="() => 1280" :height="() => 450" :filename="baseFilename" :loading="loading" >
      <div slot="chart">
        <ColorGradient :min="traitStats.min" :max="traitStats.max" v-if="traitStats" />

        <b-row v-if="timepoints && timepoints.length > 0">
          <b-col cols=12 md=9>
            <b-form-group :label="$t('formLabelTraitTimelineTimepoint')" label-for="timepoint" :description="$t('formDescriptionTraitTimelineTimepoint', { timepoint: timepoints[currentTimepoint] })">
              <b-form-input id="timepoint" v-model.number="currentTimepoint" type="range" :min="0" :max="timepoints.length - 1" :disabled="playbackRunning" />
            </b-form-group>

            <b-button @click="togglePlayback(false)" v-if="playbackRunning"><MdiIcon :path="mdiStop" /> {{ $t('buttonStop') }}</b-button>
            <b-button @click="togglePlayback(true)" v-else><MdiIcon :path="mdiPlay" /> {{ $t('buttonPlay') }}</b-button>
          </b-col>
          <b-col cols=12 md=3>
            <b-calendar v-if="timepoints && timepoints.length > 0"
                        block
                        no-highlight-today
                        no-key-nav
                        hide-header
                        :min="timepoints[0]"
                        :max="timepoints[timepoints.length - 1]"
                        :date-info-fn="highlightTimepoints"
                        :date-disabled-fn="dateDisabled"
                        selected-variant="info"
                        :start-weekday="1"
                        :value="timepoints[currentTimepoint]"
                        @selected="onSelectDate"/>
          </b-col>
        </b-row>

        <div ref="timelinePlot" />
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
import ColorGradient from '@/components/util/ColorGradient'
import { uuidv4 } from '@/mixins/util'

import { mdiHelpCircleOutline, mdiStop, mdiPlay } from '@mdi/js'
import { apiPostTrialsDataTable } from '@/mixins/api/trait'
import { apiPostTraitStats } from '@/mixins/api/dataset'
import { getDateString } from '@/mixins/formatting'

const emitter = require('tiny-emitter/instance')

const Plotly = require('plotly.js-dist-min')

export default {
  components: {
    BaseChart,
    ColorGradient,
    MdiIcon,
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
    }
  },
  data: function () {
    const id = 'chart-' + uuidv4()

    return {
      mdiStop,
      mdiPlay,
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
      playbackRunning: false
    }
  },
  computed: {
    ...mapGetters([
      'storeDarkMode'
    ]),
    baseFilename: function () {
      if (this.trait) {
        return `timeseries-${this.trait.traitName.replace(' ', '-')}-datasets-${this.datasetIds.join('-')}`
      } else {
        return null
      }
    },
    plotData: function () {
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

        // if (this.selectedGermplasm.length > 0) {
        //   this.selectedGermplasm.forEach((gp, i) => {
        //     const germplasmData = this.traitData.filter(td => td.trialRow === gp.row && td.trialColumn === gp.column)
        //     const trace = {
        //       x: [],
        //       y: [],
        //       type: 'scatter',
        //       name: `${gp.germplasm}-${gp.rep}`,
        //       marker: {
        //         color: this.colors[i % this.colors.length],
        //         line: { color: this.colors[i % this.colors.length] }
        //       }
        //     }
        //     germplasmData.concat().sort((a, b) => new Date(a.recordingDate) - new Date(b.recordingDate)).forEach(gd => {
        //       trace.x.push(gd.recordingDate)
        //       trace.y.push(+gd.traitValue)
        //     })
        //     traces.push(trace)
        //   })
        // }

        return traces
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
    },
    plotData: function () {
      this.redraw()
    },
    storeDarkMode: function () {
      this.redraw(true)
    }
  },
  methods: {
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
      if (!this.plotData) {
        Plotly.purge(this.$refs.timelinePlot)
      } else {
        if (forceRedraw) {
          Plotly.purge(this.$refs.timelinePlot)
        }

        Plotly.react(this.$refs.timelinePlot, this.plotData, {
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
            range: [this.traitStats.min - (this.traitStats.max - this.traitStats.min) * 0.05, this.traitStats.max + (this.traitStats.max - this.traitStats.min) * 0.05]
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
    togglePlayback: function (start) {
      if (start) {
        this.playbackRunning = true
        this.interval = setInterval(() => {
          if (this.playbackRunning) {
            this.currentTimepoint = (this.currentTimepoint + 1) % this.timepoints.length
          }
        }, 1000)
      } else {
        this.playbackRunning = false
        if (this.interval) {
          clearInterval(this.interval)
        }
      }
    },
    showTour: function () {
      this.$refs.tour.start()
    },
    getTraitData: function () {
      emitter.emit('show-loading', true)

      this.currentTimepoint = 0

      if (this.interval) {
        clearInterval(this.interval)
      }

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
          this.traitData = result.data
          emitter.emit('show-loading', false)
        })
      }
    }
  },
  mounted: function () {
    apiPostTraitStats('trial', {
      datasetIds: this.datasetIds
    }, result => {
      this.traitDefinitions = result
    })
  }
}
</script>

<style>

</style>
