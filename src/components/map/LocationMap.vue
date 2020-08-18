<template>
  <div>
    <!-- The map itself -->
    <l-map
      :class="`location-map ${selectionMode === 'point' ? 'point-search' : ''}`"
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
      <!-- Add overlays if available -->
      <template v-if="imageOverlays && imageOverlays.length > 0">
        <!-- Legend -->
        <div class="location-map-legend" v-if="getOverlays(true).length > 0">
          <b-img-lazy :src="legend.url" v-for="legend in getOverlays(true)" :key="`map-overlay-${legend.id}`" alt="Image overlay legend" />
        </div>
        <!-- Overlays -->
        <l-image-overlay v-for="image in getOverlays(false)"
                        :key="`map-overlay-${image.id}`"
                        :url="image.url"
                        :opacity="imageOverlayOpacity"
                        :bounds="image.bounds" />
      </template>
    </l-map>
    <!-- Add color gradient for heatmapping -->
    <ColorGradient :colors="gradientColors" v-if="mapType === 'heatmap'" ref="gradient" />
    <!-- Popup content -->
    <div v-if="location" ref="popupContent" class="p-3">
      <dl class="row">
        <dt class="col-4 text-right">{{ $t('tableColumnLocationName') }}</dt>
        <dd class="col-8">
          <template v-if="showLinks">
            <router-link :to="{ name: 'datasets' }" v-if="location.locationType === 'datasets' && $route.name !== 'datasets'" @click.native="navigateToDatasets(location)" event="">{{ location.locationName }}</router-link>
            <router-link :to="{ name: 'germplasm' }" v-else-if="location.locationType === 'collectingsites'" @click.native="navigateToGermplasm(location)" event="">{{ location.locationName }}</router-link>
            <span v-else>{{ location.locationName }}</span>
          </template>
          <span v-else v-html="location.locationName" />
        </dd>
        <template v-if="location.locationType"><dt class="col-4 text-right">{{ $t('tableColumnLocationType') }}</dt><dd class="col-8"><i :class="`mdi mdi-18px ${locationTypes[location.locationType].icon} fix-alignment`" :style="`color: ${locationTypes[location.locationType].color()};`" /> {{ this.locationTypes[location.locationType].text() }}</dd></template>
        <template v-if="location.countryCode2 || location.countryCode3"><dt class="col-4 text-right">{{ $t('tableColumnCountryName') }}</dt><dd class="col-8"><i :class="'flag-icon flag-icon-' + getFlag(location)" /> {{ getCountry(location) }}</dd></template>
        <dt class="col-4 text-right">{{ $t('tableColumnLocationLatitude') }}</dt><dd class="col-8">{{ location.locationLatitude.toFixed(2) }}</dd>
        <dt class="col-4 text-right">{{ $t('tableColumnLocationLongitude') }}</dt><dd class="col-8">{{ location.locationLongitude.toFixed(2) }}</dd>
        <template v-if="location.locationElevation"><dt class="col-4 text-right">{{ $t('tableColumnLocationElevation') }}</dt><dd class="col-8">{{ location.locationElevation.toFixed(2) }}</dd></template>
      </dl>
    </div>
    <ClimateOverlayModal v-if="(climateOverlaysDisabled === false) && climates" :climates="climates" ref="climateOverlayModal" v-on:overlay-changed="updateOverlays" />
  </div>
</template>

<script>
import ClimateOverlayModal from '@/components/modals/ClimateOverlayModal'
import ColorGradient from '@/components/util/ColorGradient'
import L from 'leaflet'
import climateApi from '@/mixins/api/climate.js'
import typesMixin from '@/mixins/types.js'
import colorMixin from '@/mixins/colors.js'
import { LMap, LImageOverlay } from 'vue2-leaflet'
require('leaflet.heat')
require('leaflet.sync')
require('leaflet.markercluster')
require('leaflet-easybutton')
var countries = require('i18n-iso-countries')
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
    showLinks: {
      type: Boolean,
      default: true
    },
    climateOverlaysDisabled: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    locations: function (newValue, oldValue) {
      this.internalLocations = newValue
      this.updateMap()
    },
    climates: function (newValue, oldValue) {
      var map = this.$refs.map.mapObject

      if (this.climates && this.climates.length > 0) {
        L.easyButton('<i class="mdi mdi-weather-snowy-rainy mdi-18px"/>', (button, map) => {
          this.$refs.climateOverlayModal.show()
        }, 'Toggle overlays', 'settings-button', { position: 'topright' }).addTo(map)
      }
    }
  },
  components: {
    ClimateOverlayModal,
    ColorGradient,
    'l-map': LMap,
    'l-image-overlay': LImageOverlay
  },
  mixins: [ climateApi, typesMixin, colorMixin ],
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
            limit: this.MAX_JAVA_INTEGER
          }
          this.apiPostClimateOverlays(queryData, result => {
            var array = []

            if (result && result.data) {
              result.data.forEach(i => {
                var path = ''

                var params = {
                  token: this.token ? this.token.imageToken : null
                }
                var paramString = this.toUrlString(params)

                path = this.baseUrl + `climate/overlay/${i.climateOverlayId}/src?` + paramString

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
        var polygons = []

        this.editableLayers.eachLayer(layer => {
          var polygon = []
          var latLngs = layer.getLatLngs()[0]
          for (var i = 0; i < latLngs.length; i++) {
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
      this.$store.commit('ON_TABLE_FILTERING_CHANGED_MUTATION', [{
        column: {
          name: 'location',
          type: String
        },
        comparator: 'equals',
        operator: 'and',
        values: [location.locationName]
      }])
      this.$router.push({ name: 'germplasm' })
    },
    navigateToDatasets: function (location) {
      // Navigate to the datasets page and filter on location
      this.$store.commit('ON_TABLE_FILTERING_CHANGED_MUTATION', [{
        column: {
          name: 'locationIds',
          type: 'json'
        },
        comparator: 'contains',
        operator: 'and',
        values: [location.locationId]
      }])
      this.$router.push({ name: 'datasets' })
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
    updateMap: function () {
      var map = this.$refs.map.mapObject

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
          })

          var marker = L.marker([this.location.locationLatitude, this.location.locationLongitude]).bindPopup('')
          marker.on('click', e => {
            var popup = e.target.getPopup()
            this.location = this.location
            // Set the popup content on click
            this.$nextTick(() => popup.setContent(this.$refs.popupContent))
          })
          marker.addTo(map)
          marker.fire('click')

          this.markers.push(marker)
        } else if (this.internalLocations.length > 1) {
          // If there are multiple locations, fit them into view
          var latLngBounds = L.latLngBounds()

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
              chunkProgress: (processed, total, elapsed, layersArray) => {
                this.loading = processed !== total
                this.loadingProgress = Math.round(processed / total * 100)
              }
            })
            map.addLayer(this.markerClusterer)
          }
          const clusterMarker = this.internalLocations.filter(l => l.locationLatitude && l.locationLongitude)
            .map(l => {
              var marker = L.marker([l.locationLatitude, l.locationLongitude]).bindPopup('')
              marker.on('click', e => {
                var popup = e.target.getPopup()
                this.location = l
                this.$nextTick(() => popup.setContent(this.$refs.popupContent))
              })
              return marker
            })
          this.markerClusterer.addLayers(clusterMarker)
        } else if (this.mapType === 'heatmap') {
          var ls = this.internalLocations.filter(l => l.locationLatitude && l.locationLongitude)
            .map(l => [l.locationLatitude, l.locationLongitude, 1])
          if (this.heat) {
            // If it exists, just set it
            this.heat.setLatLngs(ls)
          } else {
            // Otherwise, create it
            var gradient = {}

            this.gradientColors.forEach((c, i) => {
              var position = i * (1 / (this.gradientColors.length - 1))
              gradient[position] = c
            })

            this.heat = L.heatLayer(ls, {
              minOpacity: 0.7,
              max: 1,
              radius: 10,
              blur: 7,
              gradient: gradient
            }).addTo(this.$refs.map.mapObject)

            this.$refs.gradient.refresh()
          }
        }
      }

      this.$nextTick(() => map.invalidateSize())
    }
  },
  mounted: function () {
    this.internalLocations = this.locations

    if (this.selectionMode === 'polygon') {
      require('leaflet-draw')
    }

    this.gradientColors.push('#ffffff')
    this.gradientColors.push(this.getColor(0))

    this.$nextTick(() => {
      // Add OSM as the default
      var openstreetmap = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        id: 'OpenStreetMap',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c']
      })

      var map = this.$refs.map.mapObject
      map.addLayer(openstreetmap)

      // Add an additional satellite layer
      var satellite = L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        id: 'Esri WorldImagery',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })

      var baseMaps = {
        'OpenStreetMap': openstreetmap,
        'Esri WorldImagery': satellite
      }

      L.control.layers(baseMaps).addTo(map)

      this.updateMap()

      if (this.selectionMode === 'polygon') {
        this.editableLayers = new L.FeatureGroup()
        map.addLayer(this.editableLayers)

        var options = {
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

        var result = new L.Control.Draw(options)
        map.addControl(result)

        map.on(L.Draw.Event.CREATED, e => {
          var layer = e.layer

          this.editableLayers.addLayer(layer)
        })

        this.$nextTick(() => {
          // Enable the polygon draw feature by default
          this.$refs.map.$el.querySelector('.leaflet-draw-draw-polygon').click()
        })
      }

      // Disable zoom until focus gained, disable when blur
      map.scrollWheelZoom.disable()
      map.on('focus', function () {
        map.scrollWheelZoom.enable()
      })
      map.on('blur', function () {
        map.scrollWheelZoom.disable()
      })

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

        this.apiPostClimates(queryData, result => {
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

.location-map .location-map-legend {
  position: absolute;
  left: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, .7);
  border: 1px solid #6f7277;
  padding: 5px;
  pointer-events: none;
  z-index: 1000;
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
.location-map.point-search {
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
</style>
