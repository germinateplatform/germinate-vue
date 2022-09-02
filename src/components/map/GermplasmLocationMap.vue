<template>
  <div>
    <b-form-group label-for="color-by" :label="$t('pageTrialsExportColorByTitle')">
      <b-form-select id="color-by" :options="colorOptions" v-model="colorBy" />
    </b-form-group>
    <l-map
      class="location-map border"
      :center="center"
      ref="map"
      :options="mapOptions"
      :maxZoom="maxZoom"
      :zoom="zoom">

      <l-control position="bottomleft" class="leaflet-control-layers">
        <div class="p-2 legend" v-if="colorBy && colorBy.type === 'text'">
          <div v-for="legendItem in colorLegend" :key="`color-mapping-${legendItem.name}`" :style="{ color: legendItem.color }" :class="colorBy.legendClass || ''">
            <MdiIcon :path="mdiCircle"/> {{ legendItem.name }}
          </div>
        </div>
      </l-control>

      <!-- Map loading indicator -->
      <div class="location-map-loading-indicator d-flex justify-content-center h-100 align-items-center" v-if="loading === true">
        <b-spinner type="grow" variant="primary" />
      </div>
    </l-map>

    <!-- Add color gradient for number coloring -->
    <ColorGradient :min="gradientMinMax.min" :max="gradientMinMax.max" :formatMinMax="gradientMinMax.format" :colors="gradientColors" v-if="colorBy && colorBy.type !== 'text'" ref="gradient" />

    <!-- Popup content -->
    <div v-if="selectedLocation" ref="popupContent" class="p-3">
      <dl class="row">
        <template v-if="selectedGermplasm">
          <dt class="col-4 text-right">{{ $t('tableColumnGermplasmName') }}</dt><dd class="col-8">{{ selectedGermplasm.germplasmName }}</dd>
        </template>
        <dt class="col-4 text-right">{{ $t('tableColumnLocationName') }}</dt>
        <dd class="col-8 location-name">
          <span v-if="selectedLocation.locationType === 'datasets'">{{ selectedLocation.locationName }}</span>
          <span>{{ selectedLocation.locationName }}</span>
        </dd>
        <template v-if="selectedLocation.locationType"><dt class="col-4 text-right">{{ $t('tableColumnLocationType') }}</dt><dd class="col-8"><span :style="`color: ${locationTypes[selectedLocation.locationType].color()};`"><MdiIcon :path="locationTypes[selectedLocation.locationType].path" /></span> {{ this.locationTypes[selectedLocation.locationType].text() }}</dd></template>
        <template v-if="selectedLocation.countryCode2 || selectedLocation.countryCode3"><dt class="col-4 text-right">{{ $t('tableColumnCountryName') }}</dt><dd class="col-8"><i :class="'fi fi-' + getFlag(selectedLocation)" /> {{ getCountry(selectedLocation) }}</dd></template>
        <dt class="col-4 text-right">{{ $t('tableColumnLocationLatitude') }}</dt><dd class="col-8">{{ selectedLocation.locationLatitude.toFixed(2) }}</dd>
        <dt class="col-4 text-right">{{ $t('tableColumnLocationLongitude') }}</dt><dd class="col-8">{{ selectedLocation.locationLongitude.toFixed(2) }}</dd>
        <template v-if="selectedLocation.locationElevation"><dt class="col-4 text-right">{{ $t('tableColumnLocationElevation') }}</dt><dd class="col-8">{{ selectedLocation.locationElevation.toFixed(2) }}</dd></template>

        <template v-if="selectedGermplasm && colorBy">
          <dt class="col-4 text-right">{{ $t('widgetGermplasmMapSelectedOption') }}</dt><dd class="col-8">{{ colorBy.format(colorBy.fields.map(part => selectedGermplasm[part]).join(' ')) }}</dd>
        </template>
      </dl>

      <div class="mt-2" v-if="selectedGermplasm">
        <!-- Marked item checkbox -->
        <MdiIcon :path="markedStyle" @click="onToggleMarked()" /> {{ $t('tooltipGermplasmMarkedItem') }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import ColorGradient from '@/components/util/ColorGradient'

import L from 'leaflet'
import { LMap, LControl } from 'vue2-leaflet'

import germplasmApi from '@/mixins/api/germplasm'
import locationApi from '@/mixins/api/location'
import colorsMixin from '@/mixins/colors'
import typesMixin from '@/mixins/types'

import { mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiCircle } from '@mdi/js'

const countries = require('i18n-iso-countries')
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

const radEarth = 6378.16
const oneDegree = (2 * Math.PI * radEarth) / 360
const oneKm = 1 / oneDegree

// Define these here instead of `data` to improve performance
let locationMap = new Map()
let germplasmData = null
let germplasmLocations = null
let markers

export default {
  components: {
    ColorGradient,
    LControl,
    LMap,
    MdiIcon
  },
  data: function () {
    return {
      mdiCircle,
      mapOptions: {
        preferCanvas: true
      },
      loading: false,
      zoom: 3,
      maxZoom: 18,
      center: [22.5937, 2.1094],
      selectedLocation: null,
      selectedGermplasm: null,
      colorBy: null,
      colorLegend: [],
      gradientColors: [],
      gradientMinMax: { min: 0, max: 100, format: (x) => x },
      bounds: null
    }
  },
  watch: {
    colorBy: function () {
      this.update()
    }
  },
  computed: {
    ...mapGetters([
      'storeServerSettings',
      'storeMapLayer',
      'storeMarkedGermplasm'
    ]),
    markedStyle: function () {
      const isMarked = this.selectedGermplasm && this.storeMarkedGermplasm.indexOf(this.selectedGermplasm.germplasmId) !== -1
      return isMarked ? mdiCheckboxMarked : mdiCheckboxBlankOutline
    },
    colorOptions: function () {
      return [{
        text: this.$t('widgetGermplasmMapSelectOption'),
        value: null
      }, {
        text: this.$t('tableColumnColldate'),
        value: { fields: ['collDate'], type: 'date', extractValue: (germplasm) => germplasm.collDate ? (new Date(germplasm.collDate).getTime()) : null, format: (value) => (value !== null) ? new Date(value).toLocaleDateString() : '' }
      }, {
        text: this.$t('tableColumnElevation'),
        value: { fields: ['elevation'], type: 'number', extractValue: (germplasm) => germplasm.elevation, format: (value) => (value !== null) ? Number(value).toFixed(2) : '' }
      }, {
        text: this.$t('widgetGermplasmMapOptionTaxonomy'),
        value: { fields: ['genus', 'species', 'subtaxa'], type: 'text', format: (value) => value, legendClass: 'italic' }
      }, {
        text: this.$t('tableColumnPdci'),
        value: { fields: ['pdci'], type: 'number', extractValue: (germplasm) => germplasm.pdci, format: (value) => (value !== null) ? Number(value).toFixed(2) : '' }
      }, {
        text: this.$t('tableColumnBiologicalStatus'),
        value: { fields: ['biologicalStatusName'], type: 'text', format: (value) => value }
      }, {
        text: this.$t('tableColumnCountryName'),
        value: { fields: ['countryName'], type: 'text', format: (value) => value }
      }]
    }
  },
  mixins: [colorsMixin, typesMixin, germplasmApi, locationApi],
  methods: {
    invalidateSize: function () {
      if (this.$refs.map && this.$refs.map.mapObject) {
        this.$nextTick(() => {
          this.$refs.map.mapObject.invalidateSize()

          if (this.bounds && this.bounds.isValid()) {
            this.$nextTick(() => this.$refs.map.mapObject.fitBounds(this.bounds))
          }
        })
      }
    },
    onToggleMarked: function () {
      if (this.selectedGermplasm) {
        const isMarked = this.storeMarkedGermplasm.indexOf(this.selectedGermplasm.germplasmId) !== -1
        if (isMarked) {
          this.$store.dispatch('removeMarkedIds', { type: 'germplasm', ids: [this.selectedGermplasm.germplasmId] })
        } else {
          this.$store.dispatch('addMarkedIds', { type: 'germplasm', ids: [this.selectedGermplasm.germplasmId] })
        }
      }
    },
    getFlag: function (location) {
      if (location.countryCode2) {
        return location.countryCode2.toLowerCase()
      } else if (location.countryCode3) {
        return countries.alpha3ToAlpha2(location.countryCode3).toLowerCase()
      } else {
        return ''
      }
    },
    getCountry: function (location) {
      if (location.countryCode2) {
        return countries.getName(location.countryCode2.toUpperCase(), 'en')
      } else if (location.countryCode3) {
        return countries.getName(location.countryCode3.toUpperCase(), 'en')
      } else {
        return ''
      }
    },
    randomInRange: function (from, to, fixed) {
      fixed = fixed || 10
      return (Math.random() * (to - from) + from).toFixed(fixed) * 1
    },
    jitter: function (lat, lng, kms, fixed) {
      return {
        lat: this.randomInRange(
          lat - (kms * oneKm),
          lat + (kms * oneKm),
          fixed
        ),
        lng: this.randomInRange(
          lng - (kms * oneKm),
          lng + (kms * oneKm),
          fixed
        )
      }
    },
    update: function () {
      if (!germplasmData || !locationMap || locationMap.size < 1) {
        return
      }

      this.loading = true

      setTimeout(() => this.updateAsync(), 10)
    },
    updateAsync: function () {
      const map = this.$refs.map.mapObject

      // Remove existing markers
      if (markers && markers.length > 0) {
        markers.forEach(m => map.removeLayer(m))
      }

      const tempMarkers = []
      const categoricalColorMapping = {}
      this.gradientMinMax = {
        min: Number.MAX_VALUE,
        max: -Number.MAX_VALUE
      }

      if (this.colorBy && this.colorBy.type !== 'text') {
        this.gradientMinMax.format = this.colorBy.format
        germplasmData.forEach(g => {
          const value = this.colorBy.extractValue(g)

          if (value < this.gradientMinMax.min) {
            this.gradientMinMax.min = value
          }
          if (value > this.gradientMinMax.max) {
            this.gradientMinMax.max = value
          }
        })
      }

      this.bounds = L.latLngBounds()

      germplasmData.forEach(g => {
        const l = locationMap.get(g.locationId)

        if (l) {
          let colorByValue = null
          let color = this.storeServerSettings.colorPrimary || '#20a8d8'

          if (this.colorBy) {
            let potentialColor
            let rgb

            switch (this.colorBy.type) {
              case 'text':
                colorByValue = this.colorBy.fields.map(part => g[part]).join(' ')
                potentialColor = categoricalColorMapping[colorByValue]
                if (potentialColor) {
                  color = potentialColor
                } else {
                  color = this.getColor(Object.keys(categoricalColorMapping).length)
                  categoricalColorMapping[colorByValue] = color
                }
                // TODO: Generate legend

                break
              case 'date':
              case 'number':
                colorByValue = this.colorBy.extractValue(g)
                rgb = this.$refs.gradient ? this.$refs.gradient.getColor(this.gradientMinMax.min, this.gradientMinMax.max, colorByValue) : { r: 128, g: 128, b: 128 }
                if (rgb) {
                  color = this.rgbToHex(rgb.r, rgb.g, rgb.b)
                } else {
                  color = '#20a8d8'
                }
                break
            }
          }

          const latLng = this.jitter(l.locationLatitude, l.locationLongitude, 1, 6)

          this.bounds.extend([latLng.lat, latLng.lng])

          const marker = L.circleMarker([latLng.lat, latLng.lng], {
            fillColor: color,
            radius: 3,
            stroke: false,
            weight: 1,
            color: 'white',
            fillOpacity: 0.66
          })
          marker.bindPopup('')
          marker.on('click', e => {
            const popup = e.target.getPopup()
            this.selectedLocation = l
            this.selectedGermplasm = g
            // Set the popup content on click
            this.$nextTick(() => popup.setContent(this.$refs.popupContent))
          })
          tempMarkers.push(marker)
          marker.addTo(map)
        }
      })

      this.colorLegend = Object.keys(categoricalColorMapping).map(k => {
        return {
          name: k,
          color: categoricalColorMapping[k]
        }
      })

      if (this.bounds.isValid()) {
        this.$nextTick(() => map.fitBounds(this.bounds))
      }

      markers = tempMarkers
      this.loading = false
    },
    updateLocationMap: function () {
      locationMap = new Map()
      germplasmLocations.forEach(l => {
        locationMap.set(l.locationId, l)
      })
    },
    getGermplasmMapData: function () {
      this.loading = true
      this.apiPostLocationTable({
        page: 1,
        limit: this.MAX_JAVA_INTEGER,
        filter: [{
          column: 'locationType',
          comparator: 'equals',
          operator: 'and',
          values: ['collectingsites']
        }, {
          column: 'locationLatitude',
          comparator: 'isNotNull',
          operator: 'and',
          values: null
        }, {
          column: 'locationLongitude',
          comparator: 'isNotNull',
          operator: 'and',
          values: null
        }]
      }, result => {
        if (result && result.data && result.data.length > 0) {
          const locations = result.data
          Object.freeze(locations)
          germplasmLocations = locations
        } else {
          germplasmLocations = []
        }

        this.updateLocationMap()

        this.update()
      })

      this.apiPostGermplasmTable({
        page: 1,
        limit: this.MAX_JAVA_INTEGER,
        filter: [{
          column: 'locationId',
          comparator: 'isNotNull',
          operator: 'and',
          values: null
        }]
      }, result => {
        if (result && result.data && result.data.length > 0) {
          const data = result.data
          Object.freeze(data)
          germplasmData = data
        } else {
          germplasmData = []
        }

        this.update()
      })
    }
  },
  mounted: function () {
    if (this.storeServerSettings && this.storeServerSettings.colorsGradient && this.storeServerSettings.colorsGradient.length > 0) {
      this.gradientColors = this.storeServerSettings.colorsGradient.concat()
    } else {
      this.gradientColors.push('#ffffff')
      this.gradientColors.push(this.getColor(0))
    }

    this.$nextTick(() => {
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
          case 'OpenStreetMap':
            this.$store.dispatch('setMapLayer', 'osm')
            break
          case 'Esri WorldImagery':
            this.$store.dispatch('setMapLayer', 'satellite')
            break
        }
      })

      // Disable zoom until focus gained, disable when blur
      map.scrollWheelZoom.disable()
      map.on('focus', function () {
        map.scrollWheelZoom.enable()
      })
      map.on('blur', function () {
        map.scrollWheelZoom.disable()
      })

      this.getGermplasmMapData()
    })
  }
}
</script>

<style>
.location-map {
  position: relative;
  height: 600px !important;
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
.location-map .location-map-loading-indicator > .spinner-grow {
  width: 3rem;
  height: 3rem;
}
.location-map .legend {
  max-height: 300px;
  overflow-y: auto;
}
.location-map .legend .italic {
  font-style: italic;
}
</style>
