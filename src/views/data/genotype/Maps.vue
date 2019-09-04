<template>
  <div ref="container" id="map-container">
    <h1>{{ $t('pageMapsTitle') }}</h1>
    <hr />
    <p>{{ $t('pageMapsText') }}</p>
    <MapsTable v-on:map-selected="onMapSelected" />

    <div v-if="map">
      <h2>{{ $t('pageMapsDetailsTitle') }} <small>{{ map.name }}</small></h2>
      <p>{{ $t('pageMapsDetailsText') }}</p>
      <MapDefinitionTable :getData="getMapDefinitionData" ref="mapDefinitionTable" />

      <h2>{{ $t('pageMapsHistogramTitle') }}</h2>
      <p>{{ $t('pageMapsHistogramText') }}</p>
      <div id="map-chart" ref="mapChart" />
      <ResizeObserver v-on:notify-width="handleResize" />
    </div>
  </div>
</template>

<script>
import MapsTable from '@/components/tables/MapsTable'
import MapDefinitionTable from '@/components/tables/MapDefinitionTable'
import ResizeObserver from '@/components/ResizeObserver'
import { plotlyMapChart } from '@/plugins/charts/plotly-map-chart.js'

export default {
  data: function () {
    return {
      mapId: null,
      map: null
    }
  },
  components: {
    MapsTable,
    MapDefinitionTable,
    ResizeObserver
  },
  methods: {
    getMapDefinitionData: function (data, callback) {
      return this.apiPostMapdefinitionTable(this.mapId, data, callback)
    },
    onMapSelected: function (mapId) {
      this.mapId = mapId

      if (this.mapId) {
        this.apiGetMap(mapId, result => {
          if (result && result.data && result.data.length > 0) {
            window.history.replaceState({}, null, `#/data/genotypes/maps/${this.mapId}`)
            this.map = result.data[0]
            this.drawChart()
            this.$refs.mapDefinitionTable.refresh()
          }
        })
      }
    },
    drawChart: function () {
      this.apiGetMapExport(this.mapId, result => {
        var reader = new FileReader()
        reader.onload = () => {
          var dirtyTsv = reader.result
          var firstEOL = dirtyTsv.indexOf('\n')
          var tsv = 'markerName\tchromosome\tposition\n' + dirtyTsv.substring(firstEOL + 1)
          var data = this.$plotly.d3.tsv.parse(tsv) // Remove the first row (Flapjack header)

          this.$plotly.d3.select(this.$refs.mapChart)
            .datum(data)
            .call(plotlyMapChart()
              .colors(this.serverSettings.colorsCharts))
        }
        reader.readAsText(result)
      })
    },
    handleResize: function () {
      this.$plotly.relayout(this.$refs.mapChart, {
        'xaxis.autorange': true,
        'yaxis.autorange': true
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
