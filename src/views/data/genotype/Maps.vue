<template>
  <div ref="container" id="map-container">
    <h1>{{ $t('pageMapsTitle') }}</h1>
    <hr />
    <p>{{ $t('pageMapsText') }}</p>
    <MapTable :getData="getMapData" v-on:map-selected="onMapSelected" />

    <div v-if="map">
      <h2>{{ $t('pageMapsDetailsTitle') }} <small>{{ map.name }}</small></h2>
      <p>{{ $t('pageMapsDetailsText') }}</p>
      <MapDefinitionTable :filterOn="getFilter()" :getData="getMapDefinitionData" :getIds="getMapDefinitionIds" ref="mapDefinitionTable" />

      <h2>{{ $t('pageMapsHistogramTitle') }}</h2>
      <p>{{ $t('pageMapsHistogramText') }}</p>
      <BaseChart :width="() => 1280" :height="() => 1280" :sourceFile="getSourceFile" :filename="getFilename" :additionalMenuItems="additionalMenuItems" >
        <div slot="chart" id="map-chart" ref="mapChart" />
      </BaseChart>

      <h2>{{ $t('pageMapExportDownloadTitle') }}</h2>
      <b-form-group
        :label="$t('formLabelMapExportDownloadText')"
        label-for="export-options-enabled">
        <b-form-checkbox id="export-options-enabled" v-model="useAdvancedExportOptions" switch >
          {{ useAdvancedExportOptions ? $t('genericYes') : $t('genericNo') }}
        </b-form-checkbox>
      </b-form-group>
      <MapExportSelection :mapId="mapId" v-show="useAdvancedExportOptions" ref="exportOptions" />

      <h4>{{ $t('pageMapExportDownloadFormatTitle') }}</h4>
      <b-list-group class="d-inline-block">
        <b-list-group-item button @click="exportMap('flapjack')"><img :src="`./img/${exportFormats.flapjack.logo}`" class="mime-icon" /> {{ $t('pageMapExportDownloadFlapjackFormat') }}</b-list-group-item>
        <b-list-group-item button @click="exportMap('strudel')"><img :src="`./img/${exportFormats.strudel.logo}`" class="mime-icon" /> {{ $t('pageMapExportDownloadStrudelFormat') }}</b-list-group-item>
      </b-list-group>

      <p><span class="text-muted" v-html="$t('pageExportFormatsGenotypeText')" />&nbsp;<router-link :to="{ name: 'about-export-formats-specific', params: { format: 'genotype' } }" v-b-tooltip.hover :title="$t('tooltipExportFormatLearnMore')"> <i class="mdi mdi-18px fix-alignment mdi-information-outline"/></router-link> </p>
    </div>
  </div>
</template>

<script>
import BaseChart from '@/components/charts/BaseChart'
import MapTable from '@/components/tables/MapTable'
import MapDefinitionTable from '@/components/tables/MapDefinitionTable'
import MapExportSelection from '@/components/export/MapExportSelection'
import { plotlyMapChart } from '@/plugins/charts/plotly-map-chart.js'
import { EventBus } from '@/plugins/event-bus.js'
import genotypeApi from '@/mixins/api/genotype.js'

export default {
  data: function () {
    return {
      mapId: null,
      map: null,
      sourceFile: null,
      chartSelection: [],
      useAdvancedExportOptions: false,
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
      }]
    }
  },
  components: {
    BaseChart,
    MapTable,
    MapDefinitionTable,
    MapExportSelection
  },
  mixins: [ genotypeApi ],
  methods: {
    toggleItems: function (add) {
      if (this.chartSelection && this.chartSelection.length > 0) {
        var counter = 0

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

            if (counter < 1) {
              EventBus.$emit('show-loading', false)
            }
          })
        })
      }
    },
    exportMap: function (format) {
      var options = {
        format: format
      }
      if (this.useAdvancedExportOptions) {
        var customOptions = this.$refs.exportOptions.getExportOptions()

        if (!customOptions || !customOptions.method) {
          // TODO: Notification
          return
        } else {
          options = Object.assign({}, options, customOptions)
        }
      }

      EventBus.$emit('show-loading', true)
      this.apiPostMapExport(this.mapId, options, result => {
        this.downloadBlob({
          blob: result,
          filename: 'map-' + this.mapId,
          extension: format === 'flapjack' ? 'map' : 'strudel'
        })
        EventBus.$emit('show-loading', false)
      })
    },
    getFilter: function () {
      return [{
        column: {
          name: 'mapId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
        canBeChanged: false,
        values: [this.mapId]
      }]
    },
    getMapData: function (data, callback) {
      return this.apiPostMapsTable(data, callback)
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
    getMapDefinitionData: function (data, callback) {
      return this.apiPostMapdefinitionTable(data, callback)
    },
    getMapDefinitionIds: function (data, callback) {
      return this.apiPostMapdefinitionTableIds(data, callback)
    },
    onMapSelected: function (mapId) {
      this.mapId = mapId

      if (this.mapId) {
        this.apiGetMap(mapId, result => {
          if (result && result.data && result.data.length > 0) {
            window.history.replaceState({}, null, this.$router.resolve({ name: 'map-details', params: { mapId: this.mapId } }).href)
            this.map = result.data[0]
            this.drawChart()
            this.$nextTick(() => this.$refs.mapDefinitionTable.refresh())
          }
        })
      }
    },
    drawChart: function () {
      var request = {
        format: 'flapjack'
      }
      this.apiPostMapExport(this.mapId, request, result => {
        this.sourceFile = result
        var reader = new FileReader()
        reader.onload = () => {
          var dirtyTsv = reader.result
          var firstEOL = dirtyTsv.indexOf('\r\n')
          var tsv = 'markerName\tchromosome\tposition\r\n' + dirtyTsv.substring(firstEOL + 2)
          var data = this.$plotly.d3.tsv.parse(tsv) // Remove the first row (Flapjack header)

          this.$plotly.d3.select(this.$refs.mapChart)
            .datum(data)
            .call(plotlyMapChart()
              .colors(this.serverSettings.colorsCharts)
              .onPointsSelected((chromosome, start, end) => {
                this.useAdvancedExportOptions = true

                this.$nextTick(() => {
                  this.$refs.exportOptions.addRegion({
                    chromosome: chromosome,
                    start: Math.floor(start),
                    end: Math.ceil(end)
                  })

                  this.chartSelection.push({
                    chromosome: chromosome,
                    range: [Math.floor(start), Math.ceil(end)]
                  })
                })
              })
              .onSelectionCleared(() => {
                this.chartSelection = []
              }))
        }
        reader.readAsText(result)
      })
    }
  },
  mounted: function () {
    this.onMapSelected(parseInt(this.$route.params.mapId))
  }
}
</script>

<style>
#map-container {
  position: relative;
}
</style>
