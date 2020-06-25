<template>
  <div>
    <BaseChart :width="() => 1280"
               :height="getHeight"
               :id="id"
               :sourceFile="getSourceFile"
               :filename="getFilename"
               :additionalMenuItems="additionalMenuItems"
               :additionalButtons="additionalButtons"
               v-on:force-redraw="redraw">
      <div slot="chart" id="map-chart" ref="mapChart" />
    </BaseChart>

    <Tour :steps="popoverContent" ref="tour" />
  </div>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import Tour from '@/components/util/Tour'
import genotypeApi from '@/mixins/api/genotype.js'
import colorMixin from '@/mixins/colors.js'
import { EventBus } from '@/plugins/event-bus.js'
import { plotlyMapChart } from '@/plugins/charts/plotly-map-chart.js'

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
      additionalMenuItems: [{
        icon: 'mdi-checkbox-marked',
        disabled: () => !this.chartSelection || this.chartSelection.length < 1,
        text: () => this.$t('widgetChartMarkSelectedItems'),
        callback: () => this.toggleItems(true)
      }, {
        icon: 'mdi-checkbox-blank-outline',
        disabled: () => !this.chartSelection || this.chartSelection.length < 1,
        text: () => this.$t('widgetChartUnmarkSelectedItems'),
        callback: () => this.toggleItems(false)
      }],
      additionalButtons: [{
        html: () => '<i class="mdi mdi-18px mdi-help-circle-outline" />',
        title: () => this.$t('chartTooltipMatrixTour'),
        callback: () => this.showTour()
      }, {
        html: () => '<i class="mdi mdi-18px mdi-delete" />',
        disabled: () => this.markedIds['markers'].length < 1,
        title: () => this.$t('chartTooltipMarkedItemsClear'),
        id: 'marked-items-delete',
        callback: () => this.clearMarkedList()
      }, {
        html: () => `<span class="badge badge-pill badge-info">${this.markedIds['markers'].length}</span>`,
        callback: () => this.redirectToList(),
        title: () => this.$t('chartTooltipMarkedItemsCount'),
        id: 'marked-items-count'
      }],
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
        target: () => `#${id} #marked-items-delete`,
        position: 'bottom'
      }, {
        title: () => this.$t('popoverChartTourMarkableSelectionToggleTitle'),
        text: () => this.$t('popoverChartTourMarkableSelectionToggleText'),
        target: () => `#${id} #additional-options`,
        position: 'bottom'
      }]
    }
  },
  components: {
    BaseChart,
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
    getSourceFile: function () {
      return {
        blob: this.sourceFile,
        filename: this.getFilename()
      }
    },
    getFilename: function () {
      return 'map-' + this.mapId
    },
    showTour: function () {
      this.$refs.tour.start()
    },
    clearMarkedList: function () {
      this.$store.dispatch('ON_MARKED_IDS_CLEAR', 'markers')
      this.$nextTick(() => this.$root.$emit('bv::hide::tooltip', 'marked-items-delete'))
    },
    redirectToList: function () {
      this.$router.push({ name: 'marked-items-type', params: { itemType: 'markers' } })
    },
    toggleItems: function (add) {
      if (this.chartSelection && this.chartSelection.length > 0) {
        var counter = 0

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

      var request = {
        format: 'flapjack'
      }
      this.apiPostMapExport(this.mapId, request, result => {
        this.sourceFile = result
        var reader = new FileReader()
        reader.onload = () => {
          // Remove the first row (Flapjack header)
          var dirtyTsv = reader.result
          var firstEOL = dirtyTsv.indexOf('\r\n')
          var tsv = 'markerName\tchromosome\tposition\r\n' + dirtyTsv.substring(firstEOL + 2)
          var data = this.$plotly.d3.tsv.parse(tsv)

          this.$plotly.d3.select(this.$refs.mapChart)
            .datum(data)
            .call(plotlyMapChart()
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
