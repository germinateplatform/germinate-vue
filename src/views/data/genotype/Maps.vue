<template>
  <div ref="container" id="map-container">
    <h1>{{ $t('pageMapsTitle') }}</h1>
    <hr />
    <p>{{ $t('pageMapsText') }}</p>
    <!-- Table showing all maps -->
    <MapTable :getData="getMapData" v-on:map-selected="onMapSelected" />

    <div v-if="map">
      <h2>{{ $t('pageMapsDetailsTitle') }} <small>{{ map.name }}</small></h2>
      <p>{{ $t('pageMapsDetailsText') }}</p>
      <!-- Markers and their positions on the map -->
      <MapDefinitionTable :filterOn="getFilter()" :getData="getMapDefinitionData" :getIds="getMapDefinitionIds" ref="mapDefinitionTable" />

      <h2>{{ $t('pageMapsHistogramTitle') }}</h2>
      <p>{{ $t('pageMapsHistogramText') }}</p>
      <!-- Map chromosome histogram -->
      <MapChart :mapId="mapId" ref="mapChart" v-on:points-selected="onPointsSelected" />

      <h2>{{ $t('pageMapExportDownloadTitle') }}</h2>
      <b-form-group
        :label="$t('formLabelMapExportDownloadText')"
        label-for="export-options-enabled">
        <b-form-checkbox id="export-options-enabled" v-model="useAdvancedExportOptions" switch >
          {{ useAdvancedExportOptions ? $t('genericYes') : $t('genericNo') }}
        </b-form-checkbox>
      </b-form-group>
      <!-- Advanced export options -->
      <MapExportSelection :mapId="mapId" v-show="useAdvancedExportOptions" ref="exportOptions" />

      <!-- Download -->
      <h4>{{ $t('pageMapExportDownloadFormatTitle') }}</h4>
      <b-list-group class="d-inline-block">
        <b-list-group-item button @click="exportMap('flapjack')"><b-img-lazy :src="`./img/${exportFormats.flapjack.logo}`" class="mime-icon" /> {{ $t('pageMapExportDownloadFlapjackFormat') }}</b-list-group-item>
        <b-list-group-item button @click="exportMap('strudel')"><b-img-lazy :src="`./img/${exportFormats.strudel.logo}`" class="mime-icon" /> {{ $t('pageMapExportDownloadStrudelFormat') }}</b-list-group-item>
      </b-list-group>

      <!-- Export format information -->
      <p><span class="text-muted" v-html="$t('pageExportFormatsGenotypeText')" />&nbsp;<router-link :to="{ name: 'about-export-formats-specific', params: { format: 'genotype' } }" v-b-tooltip.hover :title="$t('tooltipExportFormatLearnMore')"> <i class="mdi mdi-18px fix-alignment mdi-information-outline"/></router-link> </p>
    </div>
  </div>
</template>

<script>
import MapChart from '@/components/charts/MapChart'
import MapTable from '@/components/tables/MapTable'
import MapDefinitionTable from '@/components/tables/MapDefinitionTable'
import MapExportSelection from '@/components/export/MapExportSelection'
import { EventBus } from '@/plugins/event-bus.js'
import genotypeApi from '@/mixins/api/genotype.js'

export default {
  data: function () {
    return {
      mapId: null,
      map: null,
      useAdvancedExportOptions: false
    }
  },
  components: {
    MapChart,
    MapTable,
    MapDefinitionTable,
    MapExportSelection
  },
  mixins: [ genotypeApi ],
  methods: {
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
            // Update the window URL to reflect map change
            window.history.replaceState({}, null, this.$router.resolve({ name: 'map-details', params: { mapId: this.mapId } }).href)
            this.map = result.data[0]
            this.$nextTick(() => {
              // Update table and chart
              this.$refs.mapChart.redraw()
              this.$refs.mapDefinitionTable.refresh()
            })
          }
        })
      }
    },
    onPointsSelected: function (chromosome, start, end) {
      this.useAdvancedExportOptions = true

      this.$nextTick(() => {
        // Add the region to the export options.
        this.$refs.exportOptions.addRegion({
          chromosome: chromosome,
          start: Math.floor(start),
          end: Math.ceil(end)
        })
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
