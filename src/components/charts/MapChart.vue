<template>
  <div>
    <BaseChart :width="() => 1280"
               :height="getHeight"
               :id="id"
               :sourceFile="baseSourceFile"
               :filename="baseFilename"
               v-on:force-redraw="redraw">
      <div slot="chart" id="map-chart" ref="mapChart" />
      <template slot="additionalMenuItems">
        <b-dropdown-divider />
        <b-dropdown-item :disabled="!chartSelection || chartSelection.length < 1"
                         @click="toggleItems(true)">
          <i class="mdi mdi-18px mdi-checkbox-marked" /> <span> {{ $t('widgetChartMarkSelectedItems') }}</span>
        </b-dropdown-item>
        <b-dropdown-item :disabled="!chartSelection || chartSelection.length < 1"
                         @click="toggleItems(false)">
          <i class="mdi mdi-18px mdi-checkbox-blank-outline" /> <span> {{ $t('widgetChartUnmarkSelectedItems') }}</span>
        </b-dropdown-item>
      </template>

      <template slot="additionalButtons">
        <b-button v-b-tooltip.hover
                  :title="$t('chartTooltipMatrixTour')"
                  @click="showTour()">
          <i class="mdi mdi-18px mdi-help-circle-outline" />
        </b-button>
        <MarkedItems itemType="markers" />
      </template>
    </BaseChart>

    <Tour :steps="popoverContent" ref="tour" />
  </div>
</template>

<script>
import MarkedItems from '@/components/tables/MarkedItems'
import BaseChart from '@/components/charts/BaseChart'
import Tour from '@/components/util/Tour'
import genotypeApi from '@/mixins/api/genotype.js'
import colorMixin from '@/mixins/colors.js'
import { EventBus } from '@/plugins/event-bus.js'
import { plotlyMapChart } from '@/plugins/charts/plotly-map-chart.js'
const d3Select = require('d3-selection')
const d3Dsv = require('d3-dsv')

export default {
  props: {
    mapId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    const id = 'chart-' + this.uuidv4()

    return {
      id: id,
      chartSelection: [],
      distinctChromosomes: null,
      sourceFile: null,
      popoverContent: [{
        title: () => this.$t('popoverChartTourGenericOptionsTitle'),
        text: () => this.$t('popoverChartTourGenericOptionsText'),
        target: () => `#${id} #additional-options`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourGenericModebarTitle'),
        text: () => this.$t('popoverChartTourGenericModebarText'),
        target: () => `#${id} .modebar`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourMapSelectionTitle'),
        text: () => this.$t('popoverChartTourMapSelectionText'),
        target: () => `#${id}`,
        position: 'top'
      }, {
        title: () => this.$t('popoverChartTourMarkableCountTitle'),
        text: () => this.$t('popoverChartTourMarkableCountText'),
        target: () => `#${id} #marked-items-count`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourMarkableClearTitle'),
        text: () => this.$t('popoverChartTourMarkableClearText'),
        target: () => `#${id} #marked-items-clear`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourMarkableSelectionToggleTitle'),
        text: () => this.$t('popoverChartTourMarkableSelectionToggleText'),
        target: () => `#${id} #additional-options`,
        position: 'bottom'
      }]
    }
  },
  computed: {
    baseSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: this.baseFilename
      }
    },
    baseFilename: function () {
      return 'map-' + this.mapId
    }
  },
  components: {
    BaseChart,
    MarkedItems,
    Tour
  },
  mixins: [ genotypeApi, colorMixin ],
  methods: {
    getHeight: function () {
      if (this.distinctChromosomes === null || this.distinctChromosomes < 1) {
        return 1280
      } else {
        return this.distinctChromosomes * 100
      }
    },
    showTour: function () {
      this.$refs.tour.start()
    },
    clearMarkedList: function () {
      this.$store.dispatch('ON_MARKED_IDS_CLEAR', 'markers')
      this.$nextTick(() => this.$root.$emit('bv::hide::tooltip', 'marked-items-clear'))
    },
    redirectToList: function () {
      this.$router.push({ name: 'marked-items-type', params: { itemType: 'markers' } })
    },
    toggleItems: function (add) {
      if (this.chartSelection && this.chartSelection.length > 0) {
        let counter = 0

        // For each selection, i.e. for each selected area per chromosome, do this individually.
        // The boolean logic the filter uses isn't powerful enough to run the complex query in one go.
        this.chartSelection.forEach(s => {
          const query = {
            page: 1,
            limit: this.MAX_JAVA_INTEGER,
            filter: [{
              column: 'mapId',
              comparator: 'equals',
              operator: 'and',
              values: [this.mapId]
            }, {
              column: 'chromosome',
              comparator: 'equals',
              operator: 'and',
              values: [s.chromosome]
            }, {
              column: 'position',
              comparator: 'between',
              operator: 'and',
              values: s.range
            }]
          }

          counter = counter + 1
          // Show loading indicator
          EventBus.$emit('show-loading', true)
          // Get the ids of the markers in the requested regions
          this.apiPostMapdefinitionTableIds(query, result => {
            if (result && result.data && result.data.length > 0) {
              if (add) {
                this.$store.dispatch('ON_MARKED_IDS_ADD', { type: 'markers', ids: result.data })
              } else {
                this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: 'markers', ids: result.data })
              }
            }

            counter = counter - 1
            // If this is the last one to finish, hide the loading indicator
            if (counter < 1) {
              EventBus.$emit('show-loading', false)
            }
          })
        })
      }
    },
    redraw: function () {
      this.$plotly.purge(this.$refs.mapChart)

      const request = {
        format: 'flapjack'
      }
      this.apiPostMapExport(this.mapId, request, result => {
        this.sourceFile = result
        let reader = new FileReader()
        reader.onload = () => {
          // Remove the first row (Flapjack header)
          const dirtyTsv = reader.result
          const firstEOL = dirtyTsv.indexOf('\r\n')
          const tsv = 'markerName\tchromosome\tposition\r\n' + dirtyTsv.substring(firstEOL + 2)
          const data = d3Dsv.tsvParse(tsv)

          d3Select.select(this.$refs.mapChart)
            .datum(data)
            .call(plotlyMapChart()
              .darkMode(this.darkMode)
              .colors(this.getColors())
              .onPointsSelected((chromosome, start, end) => {
                this.chartSelection.push({
                  chromosome: chromosome,
                  range: [Math.floor(start), Math.ceil(end)]
                })
                this.$emit('points-selected', chromosome, start, end)
              })
              .onDistinctChromosomes(d => {
                if (d && d.length > 0) {
                  this.distinctChromosomes = d.length
                }
              })
              .onSelectionCleared(() => {
                this.chartSelection = []
              }))
        }
        reader.readAsText(result)
      })
    }
  }
}
</script>

<style>

</style>
