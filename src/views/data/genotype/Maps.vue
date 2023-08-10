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
      <MapDefinitionTable :filterOn="filter" :getData="getMapDefinitionData" :getIds="getMapDefinitionIds" ref="mapDefinitionTable" />

      <h2>{{ $t('pageMapsHistogramTitle') }}</h2>
      <p>{{ $t('pageMapsHistogramText') }}</p>
      <p class="text-info">{{ $t('pageMapsHistogramInfo') }}</p>
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
        <b-list-group-item button @click="exportMap('flapjack')"><b-img-lazy :src="`./img/${exportFormats.flapjack.logo}`" class="mime-icon" alt="Flapjack logo" /> {{ $t('pageMapExportDownloadFlapjackFormat') }}</b-list-group-item>
        <b-list-group-item button @click="exportMap('strudel')"><b-img-lazy :src="`./img/${exportFormats.strudel.logo}`" class="mime-icon" alt="Strudel logo" /> {{ $t('pageMapExportDownloadStrudelFormat') }}</b-list-group-item>
      </b-list-group>

      <!-- Export format information -->
      <p><span class="text-muted" v-html="$t('pageExportFormatsGenotypeText')" />&nbsp;<router-link :to="{ name: Pages.aboutExportFormatsType, params: { format: 'genotype' } }" v-b-tooltip.hover :title="$t('tooltipExportFormatLearnMore')"> <MdiIcon :path="mdiInformationOutline" /></router-link> </p>
    </div>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import MapChart from '@/components/charts/MapChart'
import MapTable from '@/components/tables/MapTable'
import MapDefinitionTable from '@/components/tables/MapDefinitionTable'
import MapExportSelection from '@/components/export/MapExportSelection'
import { apiPostMapsTable, apiPostMapdefinitionTable, apiPostMapdefinitionTableIds, apiGetMap, apiPostMapExport } from '@/mixins/api/genotype.js'
import { exportFormats } from '@/mixins/types.js'
import { downloadBlob } from '@/mixins/util'

import { mdiInformationOutline } from '@mdi/js'
import { Pages } from '@/mixins/pages'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      Pages,
      exportFormats,
      mdiInformationOutline,
      mapId: null,
      map: null,
      useAdvancedExportOptions: false
    }
  },
  computed: {
    filter: function () {
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
    }
  },
  components: {
    MapChart,
    MapTable,
    MapDefinitionTable,
    MapExportSelection,
    MdiIcon
  },
  methods: {
    exportMap: function (format) {
      let options = {
        format: format
      }
      if (this.useAdvancedExportOptions) {
        const customOptions = this.$refs.exportOptions.getExportOptions()

        if (!customOptions || !customOptions.method) {
          // TODO: Notification
          return
        } else {
          options = Object.assign({}, options, customOptions)
        }
      }

      emitter.emit('show-loading', true)
      apiPostMapExport(this.mapId, options, result => {
        downloadBlob({
          blob: result,
          filename: 'map-' + this.mapId,
          extension: format === 'flapjack' ? 'map' : 'strudel'
        })
        emitter.emit('show-loading', false)
      })
    },
    getMapData: function (data, callback) {
      return apiPostMapsTable(data, callback)
    },
    getMapDefinitionData: function (data, callback) {
      return apiPostMapdefinitionTable(data, callback)
    },
    getMapDefinitionIds: function (data, callback) {
      return apiPostMapdefinitionTableIds(data, callback)
    },
    onMapSelected: function (mapId) {
      this.$router.push({ name: Pages.mapDetails, params: { mapId: mapId } })
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
    },
    onMapUpdated: function () {
      if (this.mapId) {
        apiGetMap(this.mapId, result => {
          if (result && result.data && result.data.length > 0) {
            // Update the window URL to reflect map change
            this.$router.push({ name: Pages.mapDetails, params: { mapId: this.mapId }, query: this.$router.currentRoute.query })
            this.map = result.data[0]
            this.$nextTick(() => {
              // Update table and chart
              this.$refs.mapChart.redraw()
              this.$refs.mapDefinitionTable.refresh()
            })
          }
        })
      }
    }
  },
  mounted: function () {
    if (this.$route.params && this.$route.params.mapId) {
      this.mapId = parseInt(this.$route.params.mapId)

      this.onMapUpdated()
    }
  }
}
</script>

<style>
#map-container {
  position: relative;
}
</style>
