<template>
  <div :class="`${selectionMode === 'point' ? 'point-search' : ''}`">
    <!-- The map itself -->
    <l-map
      :class="`location-map ${border}`"
      :center="center"
      ref="map"
      @click="onClick"
      :maxZoom="maxZoom"
      :zoom="zoom">

      <!-- Map loading indicator -->
      <div class="location-map-loading-indicator d-flex justify-content-center h-100 align-items-center" v-if="loading === true">
        <b-progress class="mt-2" max="100">
          <b-progress-bar :value="loadingProgress" animated variant="primary"></b-progress-bar>
        </b-progress>
      </div>

      <l-control position="topright" class="leaflet-control-layers" v-if="climates && climates.length > 0">
        <b-button @click="$refs.climateOverlayModal.show()" variant="link" class="text-dark">
          <MdiIcon :path="mdiWeatherSnowyRainy" />
        </b-button>
      </l-control>

      <l-control position="bottomleft" class="leaflet-control-layers leaflet-legend" v-if="overlayLegends && overlayLegends.length > 0">
        <b-button @click.prevent variant="link" class="leaflet-legend-button text-dark">
          <MdiIcon :path="mdiMapLegend" />
        </b-button>
        <!-- Legend -->
        <div class="leaflet-legend-items">
          <b-img-lazy fluid :src="legend.url" v-for="legend in overlayLegends" :key="`map-overlay-${legend.id}`" alt="Image overlay legend" />
        </div>
      </l-control>

      <!-- Add overlays if available -->
      <!-- Overlays -->
      <template v-if="overlayImages && overlayImages.length > 0">
        <l-image-overlay v-for="image in overlayImages"
                        :key="`map-overlay-${image.id}`"
                        :url="image.url"
                        :opacity="imageOverlayOpacity"
                        :bounds="image.bounds" />
      </template>
    </l-map>
    <!-- Add color gradient for heatmapping -->
    <ColorGradient v-if="mapType === 'heatmap'" ref="gradient" />
    <!-- Popup content -->
    <div v-if="location" ref="popupContent" class="p-3">
      <dl class="row">
        <dt class="col-4 text-right">{{ $t('tableColumnLocationName') }}</dt>
        <dd class="col-8 location-name">
          <template v-if="showLinks">
            <span v-if="location.locationType === 'datasets'">{{ location.locationName }}</span>
            <router-link :to="{ name: Pages.germplasm }" v-else-if="location.locationType === 'collectingsites'" @click.native="navigateToGermplasm(location)" event="">{{ location.locationName }}</router-link>
            <span v-else>{{ location.locationName }}</span>
          </template>
          <span v-else v-html="location.locationName" />
        </dd>
        <template v-if="location.locationType"><dt class="col-4 text-right">{{ $t('tableColumnLocationType') }}</dt><dd class="col-8">
          <MdiIcon :path="locationTypes[location.locationType].path" :style="`color: ${locationTypes[location.locationType].color()};`" /> {{ this.locationTypes[location.locationType].text() }}</dd></template>
        <template v-if="location.countryCode2 || location.countryCode3"><dt class="col-4 text-right">{{ $t('tableColumnCountryName') }}</dt><dd class="col-8"><i :class="'fi fi-' + getFlag(location)" /> {{ getCountry(location) }}</dd></template>
        <dt class="col-4 text-right">{{ $t('tableColumnLocationLatitude') }}</dt><dd class="col-8">{{ location.locationLatitude.toFixed(2) }}</dd>
        <dt class="col-4 text-right">{{ $t('tableColumnLocationLongitude') }}</dt><dd class="col-8">{{ location.locationLongitude.toFixed(2) }}</dd>
        <template v-if="location.locationElevation"><dt class="col-4 text-right">{{ $t('tableColumnLocationElevation') }}</dt><dd class="col-8">{{ location.locationElevation.toFixed(2) }}</dd></template>

        <div v-if="isEditMode && location.locationId === -1" class="px-3">
          <b-button-group>
            <b-button variant="success" @click="$emit('selection-changed', location)">{{ $t('buttonUpdate') }}</b-button>
            <b-button @click="$emit('cancel-selection')">{{ $t('buttonCancel') }}</b-button>
          </b-button-group>
        </div>
      </dl>
    </div>
    <ClimateOverlayModal v-if="(climateOverlaysDisabled === false) && climates" :climates="climates" ref="climateOverlayModal" v-on:overlay-changed="updateOverlays" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import ClimateOverlayModal from '@/components/modals/ClimateOverlayModal'
import ColorGradient from '@/components/util/ColorGradient'
import L from 'leaflet'
import { apiPostClimates } from '@/mixins/api/climate'
import { apiPostMapOverlayTable } from '@/mixins/api/misc'
import { locationTypes } from '@/mixins/types'
import { getColor } from '@/mixins/colors'
import { toUrlString } from '@/mixins/formatting'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'
import { mdiWeatherSnowyRainy, mdiMapLegend } from '@mdi/js'
import { LMap, LImageOverlay, LControl } from 'vue2-leaflet'
// LEAFLET
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import { Pages } from '@/mixins/pages'

require('leaflet.heat')
require('leaflet.sync')
require('leaflet.markercluster')
const countries = require('i18n-iso-countries')
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

// Set the leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  data: function () {
    return {
      Pages,
      locationTypes,
      mdiWeatherSnowyRainy,
      mdiMapLegend,
      loading: false,
      loadingProgress: 0,
      zoom: 3,
      maxZoom: 18,
      center: [22.5937, 2.1094],
      heat: null,
      location: null,
      markerClusterer: null,
      editableLayers: null,
      gradientColors: [],
      markers: [],
      climates: [],
      imageOverlayClimateId: null,
      imageOverlays: [],
      imageOverlayOpacity: 1,
      internalLocations: []
    }
  },
  props: {
    locations: {
      type: Array,
      default: () => []
    },
    mapType: {
      type: String,
      default: 'cluster'
    },
    selectionMode: {
      type: String,
      default: 'none'
    },
    isEditMode: {
      type: Boolean,
      default: false
    },
    showLinks: {
      type: Boolean,
      default: true
    },
    climateOverlaysDisabled: {
      type: Boolean,
      default: false
    },
    border: {
      type: String,
      default: 'border'
    }
  },
  watch: {
    locations: function (newValue) {
      if (newValue) {
        this.internalLocations = newValue.concat()
      } else {
        this.internalLocations = []
      }
      this.updateMap()
    },
    selectionMode: function () {
      this.updateMap(false)
    }
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl',
      'storeMapLayer',
      'storeToken',
      'storeServerSettings'
    ]),
    overlayLegends: function () {
      if (this.imageOverlays) {
        return this.imageOverlays.filter(i => i.isLegend === true)
      } else {
        return []
      }
    },
    overlayImages: function () {
      if (this.imageOverlays) {
        return this.imageOverlays.filter(i => i.isLegend === false)
      } else {
        return []
      }
    }
  },
  components: {
    MdiIcon,
    ClimateOverlayModal,
    ColorGradient,
    LControl,
    LMap,
    LImageOverlay
  },
  methods: {
    getLatLngs: function () {
      return this.internalLocations.map(l => {
        return L.latLng(l.locationLatitude, l.locationLongitude)
      })
    },
    onClick: function (e) {
      if (this.selectionMode === 'point') {
        const map = this.$refs.map.mapObject
        const markerPosition = e.latlng

        this.internalLocations = [{
          locationId: -1,
          locationName: 'Query',
          locationLatitude: markerPosition.lat,
          locationLongitude: markerPosition.lng
        }]

        map.panTo(markerPosition)

        this.updateMap()
      }
    },
    setPolygons: function (polygons) {
      if (this.selectionMode === 'polygon' && this.editableLayers) {
        polygons.forEach(p => L.polygon(p).addTo(this.editableLayers))
      }
    },
    updateOverlays: function (overlay) {
      // If a climate was selected
      if (overlay.climateId !== null) {
        // If it's a different climate, go get the overlays
        if (this.imageOverlayClimateId !== overlay.climateId) {
          const queryData = {
            filter: [{
              column: 'referenceTable',
              comparator: 'equals',
              operator: 'and',
              values: ['climates']
            }, {
              column: 'foreignId',
              comparator: 'equals',
              operator: 'and',
              values: [overlay.climateId]
            }],
            page: 1,
            limit: MAX_JAVA_INTEGER
          }
          apiPostMapOverlayTable(queryData, result => {
            const array = []

            if (result && result.data) {
              result.data.forEach(i => {
                let path = ''

                const params = {
                  token: this.storeToken ? this.storeToken.imageToken : null
                }
                const paramString = toUrlString(params)

                path = this.storeBaseUrl + `mapoverlay/${i.mapoverlayId}/src?` + paramString

                array.push({
                  id: i.mapoverlayId,
                  url: path,
                  isLegend: i.mapoverlaysIsLegend,
                  bounds: [[i.mapoverlayBottomLeftLat, i.mapoverlayBottomLeftLng], [i.mapoverlayTopRightLat, i.mapoverlayTopRightLng]]
                })
              })
            }

            this.imageOverlayOpacity = overlay.opacity / 100.0
            this.imageOverlays = array
          })
        } else {
          // Else, just change the opacity
          this.imageOverlayOpacity = overlay.opacity / 100.0
        }
      } else {
        // Otherwise, just set everything to their default values
        this.imageOverlayOpacity = 1
        this.imageOverlays = []
      }
    },
    invalidateSize: function () {
      this.$nextTick(() => this.$refs.map.mapObject.invalidateSize())
    },
    getPolygons: function () {
      if (this.selectionMode === 'polygon' && this.editableLayers) {
        const polygons = []

        this.editableLayers.eachLayer(layer => {
          const polygon = []
          const latLngs = layer.getLatLngs()[0]
          for (let i = 0; i < latLngs.length; i++) {
            polygon.push(latLngs[i])
          }
          polygons.push(polygon)
        })

        return polygons
      } else {
        return null
      }
    },
    navigateToGermplasm: function (location) {
      // Navigate to the germplasm overview page and filter on location
      const filter = [{
        column: 'location',
        comparator: 'equals',
        operator: 'and',
        values: [location.locationName]
      }]
      this.$router.push({
        name: Pages.germplasm,
        query: {
          'germplasm-filter': JSON.stringify(filter)
        }
      })
    },
    getFlag: function (country) {
      if (country.countryCode2) {
        return country.countryCode2.toLowerCase()
      } else if (country.countryCode3) {
        return countries.alpha3ToAlpha2(country.countryCode3).toLowerCase()
      } else {
        return ''
      }
    },
    getCountry: function (country) {
      if (country.countryCode2) {
        return countries.getName(country.countryCode2.toUpperCase(), 'en')
      } else if (country.countryCode3) {
        return countries.getName(country.countryCode3.toUpperCase(), 'en')
      } else {
        return ''
      }
    },
    updateMap: function (invalidate = true) {
      const map = this.$refs.map.mapObject

      // Remove existing markers
      if (this.markers && this.markers.length > 0) {
        this.markers.forEach(m => map.removeLayer(m))
      }

      if (this.internalLocations && this.internalLocations.length > 0) {
        if (this.internalLocations.length === 1) {
          // If there's just one location, center it and open the popup
          this.location = this.internalLocations[0]
          this.$nextTick(() => {
            this.center = [this.location.locationLatitude, this.location.locationLongitude]
            map.panTo(new L.LatLng(this.location.locationLatitude, this.location.locationLongitude))
          })

          const marker = L.marker([this.location.locationLatitude, this.location.locationLongitude]).bindPopup('')
          marker.on('click', e => {
            const popup = e.target.getPopup()
            // Set the popup content on click
            this.$nextTick(() => popup.setContent(this.$refs.popupContent))
          })
          marker.addTo(map)
          marker.fire('click')

          this.markers.push(marker)
        } else if (this.internalLocations.length > 1) {
          // If there are multiple locations, fit them into view
          const latLngBounds = L.latLngBounds()

          this.internalLocations.filter(l => l.locationLatitude && l.locationLongitude)
            .forEach(l => latLngBounds.extend([l.locationLatitude, l.locationLongitude]))

          this.$refs.map.fitBounds(latLngBounds.pad(0.1))
        }

        if (this.mapType === 'cluster') {
          this.loading = true
          this.loadingProgress = 0
          if (this.markerClusterer) {
            // If it exists, clear all layers
            this.markerClusterer.clearLayers()
          } else {
            // If it doesn't create it
            this.markerClusterer = L.markerClusterGroup({
              chunkedLoading: true,
              chunkProgress: (processed, total) => {
                this.loading = processed !== total
                this.loadingProgress = Math.round(processed / total * 100)
              }
            })
            map.addLayer(this.markerClusterer)
          }
          const clusterMarker = this.internalLocations.filter(l => l.locationLatitude && l.locationLongitude)
            .map(l => {
              const marker = L.marker([l.locationLatitude, l.locationLongitude]).bindPopup('')
              marker.on('click', e => {
                const popup = e.target.getPopup()
                this.location = l
                this.$nextTick(() => popup.setContent(this.$refs.popupContent))
              })
              return marker
            })
          this.markerClusterer.addLayers(clusterMarker)
        } else if (this.mapType === 'heatmap') {
          const ls = this.internalLocations.filter(l => l.locationLatitude && l.locationLongitude)
            .map(l => [l.locationLatitude, l.locationLongitude, 1])
          if (this.heat) {
            // If it exists, just set it
            this.heat.setLatLngs(ls)
          } else {
            // Otherwise, create it
            const gradient = {}

            this.gradientColors.forEach((c, i) => {
              const position = i * (1 / (this.gradientColors.length - 1))
              gradient[position] = c
            })

            this.heat = L.heatLayer(ls, {
              minOpacity: 0.7,
              max: 1,
              radius: 10,
              blur: 7,
              gradient: gradient
            }).addTo(this.$refs.map.mapObject)

            // this.$refs.gradient.refresh()
          }
        }
      }

      if (invalidate) {
        this.$nextTick(() => map.invalidateSize())
      }
    }
  },
  mounted: function () {
    this.internalLocations = this.locations

    if (this.selectionMode === 'polygon') {
      require('leaflet-draw')
    }

    if (this.storeServerSettings && this.storeServerSettings.colorsGradient && this.storeServerSettings.colorsGradient.length > 0) {
      this.gradientColors = this.storeServerSettings.colorsGradient.concat()
    } else {
      this.gradientColors.push('#ffffff')
      this.gradientColors.push(getColor(0))
    }

    this.$nextTick(() => {
      // Add stadia dark as the default
      // const stadia = L.tileLayer('//tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      //   id: 'Stadia Dark',
      //   attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      //   subdomains: ['a', 'b', 'c']
      // })
      // Add the OSM default layer
      const openstreetmap = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        id: 'OpenStreetMap',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c']
      })
      // Add an additional satellite layer
      const satellite = L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        id: 'Esri WorldImagery',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })

      const map = this.$refs.map.mapObject

      switch (this.storeMapLayer) {
        // case 'osm':
        //   map.addLayer(openstreetmap)
        //   break
        case 'satellite':
          map.addLayer(satellite)
          break
        case 'osm':
        default:
          map.addLayer(openstreetmap)
          break
      }

      const baseMaps = {
        // 'Stadia Dark': stadia,
        OpenStreetMap: openstreetmap,
        'Esri WorldImagery': satellite
      }

      L.control.layers(baseMaps).addTo(map)

      // Listen for layer changes and store the user selection in the store
      map.on('baselayerchange', e => {
        switch (e.name) {
          // case 'Stadia Dark':
          //   this.$store.dispatch('setMapLayer', 'stadia')
          //   break
          case 'OpenStreetMap':
            this.$store.dispatch('setMapLayer', 'osm')
            break
          case 'Esri WorldImagery':
            this.$store.dispatch('setMapLayer', 'satellite')
            break
        }
      })

      this.updateMap()

      if (this.selectionMode === 'polygon') {
        this.editableLayers = new L.FeatureGroup()
        map.addLayer(this.editableLayers)

        const options = {
          position: 'topright',
          draw: {
            polyline: false,
            circle: false,
            rectangle: false,
            marker: false,
            circlemarker: false,
            polygon: {
              allowIntersection: false,
              drawError: {
                color: '#c0392b'
              }
            }
          },
          edit: {
            featureGroup: this.editableLayers,
            remove: true
          }
        }

        const result = new L.Control.Draw(options)
        map.addControl(result)

        map.on(L.Draw.Event.CREATED, e => this.editableLayers.addLayer(e.layer))

        this.$nextTick(() => {
          // Enable the polygon draw feature by default
          this.$refs.map.$el.querySelector('.leaflet-draw-draw-polygon').click()
        })
      }

      // Disable zoom until focus gained, disable when blur
      map.scrollWheelZoom.disable()
      map.on('focus', () => map.scrollWheelZoom.enable())
      map.on('blur', () => map.scrollWheelZoom.disable())
      this.$emit('map-loaded', map)

      if (this.climateOverlaysDisabled === false) {
        const queryData = {
          filter: [{
            column: 'overlays',
            comparator: 'greaterThan',
            operator: 'and',
            values: [0]
          }]
        }

        apiPostClimates(queryData, result => {
          if (result && result.data) {
            this.climates = result.data
          }
        })
      }
    })
  }
}
</script>

<style>
.location-map {
  position: relative;
  height: 600px !important;
}

.location-map .leaflet-legend:hover .leaflet-legend-items {
  height: auto;
  padding: 0.5rem;
}
.location-map .leaflet-legend:hover .leaflet-legend-items img {
  height: auto;
}
.location-map .leaflet-legend:hover .leaflet-legend-button {
  display: none;
}

.location-map .leaflet-legend .leaflet-legend-button {
  display: block;
}
.location-map .leaflet-legend-items {
  height: 0;
  max-height: 300px;
  overflow-y: auto;
}
.location-map .leaflet-legend-items img {
  height: 0;
}

.location-map .leaflet-popup-content-wrapper {
  padding: 0;
  border-radius: 3px;
}

.location-map .leaflet-popup-content {
  margin: 0;
  width: 300px!important;
}

.location-map dl.row {
  margin-bottom: 0;
}
.location-map #settings-button {
  width: 28px;
  height: 28px;
}
.point-search > .location-map {
  cursor: crosshair;
}
.location-map .location-map-loading-indicator {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,.6);
  pointer-events: none;
  z-index: 1000;
}
.location-map .location-map-loading-indicator > .progress {
  width: 50%;
}
.location-name * {
  overflow-wrap: break-word;
}

.marker-cluster, .prunecluster {
  color: white;
}

.marker-cluster-small, .prunecluster-small {
  background-color: rgba(124, 179, 218, 0.6);
}
.marker-cluster-small div, .prunecluster-small div {
  background-color: rgba(124, 179, 218, 0.8);
}

.marker-cluster-medium, .prunecluster-medium {
  background-color: rgba(62, 139, 193, 0.6);
}
.marker-cluster-medium div, .prunecluster-medium div {
  background-color: rgba(62, 139, 193, 0.8);
}

.marker-cluster-large, .prunecluster-large {
  background-color: rgba(15, 112, 182, 0.6);
}
.marker-cluster-large div, .prunecluster-large div {
  background-color: rgba(15, 112, 182, 0.8);
}
</style>
