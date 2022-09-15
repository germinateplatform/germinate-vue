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

      <l-control position="bottomleft" class="leaflet-control-layers">
        <!-- Legend -->
        <div class="p-2 legend" v-if="imageOverlays && imageOverlays.length > 0 && getOverlays(true).length > 0">
          <b-img-lazy fluid :src="legend.url" v-for="legend in getOverlays(true)" :key="`map-overlay-${legend.id}`" alt="Image overlay legend" />
        </div>
      </l-control>

      <!-- Add overlays if available -->
      <!-- Overlays -->
      <l-image-overlay v-for="image in getOverlays(false)"
                      :key="`map-overlay-${image.id}`"
                      :url="image.url"
                      :opacity="imageOverlayOpacity"
                      :bounds="image.bounds" />
    </l-map>
    <!-- Add color gradient for heatmapping -->
    <ColorGradient :colors="gradientColors" v-if="mapType === 'heatmap'" ref="gradient" />
    <!-- Popup content -->
    <div v-if="location" ref="popupContent" class="p-3">
      <dl class="row">
        <dt class="col-4 text-right">{{ $t('tableColumnLocationName') }}</dt>
        <dd class="col-8 location-name">
          <template v-if="showLinks">
            <span v-if="location.locationType === 'datasets'">{{ location.locationName }}</span>
            <router-link :to="{ name: 'germplasm' }" v-else-if="location.locationType === 'collectingsites'" @click.native="navigateToGermplasm(location)" event="">{{ location.locationName }}</router-link>
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
import { apiPostClimates, apiPostClimateOverlays } from '@/mixins/api/climate'
import { locationTypes } from '@/mixins/types'
import { getColor } from '@/mixins/colors'
import { toUrlString } from '@/mixins/formatting'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'
import { LMap, LImageOverlay, LControl } from 'vue2-leaflet'
// LEAFLET
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-easybutton/src/easy-button.css'

require('leaflet.heat')
require('leaflet.sync')
require('leaflet.markercluster')
require('leaflet-easybutton')
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
      locationTypes,
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
    climates: function () {
      const map = this.$refs.map.mapObject

      if (this.climates && this.climates.length > 0) {
        L.easyButton('<svg data-v-75edd456="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" class="mdi-icon "><path data-v-75edd456="" d="M18.5,18.67C18.5,19.96 17.5,21 16.25,21C15,21 14,19.96 14,18.67C14,17.12 16.25,14.5 16.25,14.5C16.25,14.5 18.5,17.12 18.5,18.67M4,17.36C3.86,16.82 4.18,16.25 4.73,16.11L7,15.5L5.33,13.86C4.93,13.46 4.93,12.81 5.33,12.4C5.73,12 6.4,12 6.79,12.4L8.45,14.05L9.04,11.8C9.18,11.24 9.75,10.92 10.29,11.07C10.85,11.21 11.17,11.78 11,12.33L10.42,14.58L12.67,14C13.22,13.83 13.79,14.15 13.93,14.71C14.08,15.25 13.76,15.82 13.2,15.96L10.95,16.55L12.6,18.21C13,18.6 13,19.27 12.6,19.67C12.2,20.07 11.54,20.07 11.15,19.67L9.5,18L8.89,20.27C8.75,20.83 8.18,21.14 7.64,21C7.08,20.86 6.77,20.29 6.91,19.74L7.5,17.5L5.26,18.09C4.71,18.23 4.14,17.92 4,17.36M1,11A5,5 0 0,1 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8A4,4 0 0,1 23,12A4,4 0 0,1 19,16A1,1 0 0,1 18,15A1,1 0 0,1 19,14A2,2 0 0,0 21,12A2,2 0 0,0 19,10H17V9A5,5 0 0,0 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8A3,3 0 0,0 3,11C3,11.85 3.35,12.61 3.91,13.16C4.27,13.55 4.26,14.16 3.88,14.54C3.5,14.93 2.85,14.93 2.47,14.54C1.56,13.63 1,12.38 1,11Z"></path></svg>', () => {
          this.$refs.climateOverlayModal.show()
        }, 'Toggle overlays', 'settings-button', { position: 'topright' }).addTo(map)
      }
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
    ])
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
              column: 'climateId',
              comparator: 'equals',
              operator: 'and',
              values: [overlay.climateId]
            }],
            page: 1,
            limit: MAX_JAVA_INTEGER
          }
          apiPostClimateOverlays(queryData, result => {
            const array = []

            if (result && result.data) {
              result.data.forEach(i => {
                let path = ''

                const params = {
                  token: this.storeToken ? this.storeToken.imageToken : null
                }
                const paramString = toUrlString(params)

                path = this.storeBaseUrl + `climate/overlay/${i.climateOverlayId}/src?` + paramString

                array.push({
                  id: i.climateOverlayId,
                  url: path,
                  isLegend: i.isLegend,
                  bounds: [[i.bottomLeftLatitude, i.bottomLeftLongitude], [i.topRightLatitude, i.topRightLongitude]]
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
    getOverlays: function (isLegend) {
      return this.imageOverlays.filter(i => i.isLegend === isLegend)
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
        name: 'germplasm',
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

/* .location-map .location-map-legend {
  position: absolute;
  left: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, .7);
  border: 1px solid #6f7277;
  padding: 5px;
  pointer-events: none;
  z-index: 1000;
} */
.location-map .legend {
  max-height: 300px;
  overflow-y: auto;
}

.leaflet-popup-content-wrapper {
  padding: 0;
  border-radius: 3px;
}

.leaflet-popup-content {
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
