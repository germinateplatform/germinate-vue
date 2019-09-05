<template>
  <div>
    <l-map
      class="location-map"
      :center="center"
      v-if="locations && locations.length > 0"
      ref="map"
      :maxZoom="maxZoom"
      :zoom="zoom">
      <l-marker-cluster v-if="mapType === 'cluster'">
        <l-marker v-for="location in locations" :key="'location-map-' + location.locationId" :lat-lng="[location.locationLatitude, location.locationLongitude]" :ref="`marker-${location.locationId}`">
          <l-popup>
            <dl class="row">
              <dt class="col-3 text-right">Location</dt><dd class="col-9">{{ location.locationName }}</dd>
              <dt class="col-3 text-right">Country</dt><dd class="col-9"><i :class="'flag-icon flag-icon-' + getFlag(location)" /> {{ getCountry(location) }}</dd>
            </dl>
          </l-popup>
        </l-marker>
      </l-marker-cluster>
    </l-map>
  </div>
</template>

<script>
import L from 'leaflet'
require('leaflet.heat')
require('leaflet.sync')
var countries = require('i18n-iso-countries')
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

export default {
  data: function () {
    return {
      zoom: 3,
      maxZoom: 12,
      center: [22.5937, 2.1094],
      heat: null
    }
  },
  props: {
    locations: {
      type: Array,
      default: null
    },
    mapType: {
      type: String,
      default: 'cluster'
    }
  },
  watch: {
    locations: function (newValue, oldValue) {
      this.updateCenter()
    }
  },
  methods: {
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
    updateCenter: function () {
      if (this.locations.length === 1) {
        // If there's just one location, center it and open the popup
        this.center = [this.locations[0].locationLatitude, this.locations[0].locationLongitude]
        var ref = 'marker-' + this.locations[0].locationId
        this.$refs[ref][0].mapObject.openPopup()
      } else {
        // If there are multiple locations, fit them into view
        var latLngBounds = L.latLngBounds()

        this.locations.forEach(l => latLngBounds.extend([l.locationLatitude, l.locationLongitude]))

        this.$refs.map.fitBounds(latLngBounds.pad(0.1))
      }

      if (this.mapType === 'heatmap') {
        var ls
        if (this.heat) {
          ls = this.locations.map(l => [l.locationLatitude, l.locationLongitude, 1])
          this.heat.setLatLngs(ls)
        } else {
          ls = this.locations.map(l => [l.locationLatitude, l.locationLongitude, 1])
          this.heat = L.heatLayer(ls, {
            minOpacity: 0.4,
            max: 1,
            radius: 10,
            blur: 10,
            gradient: {
              0.3: '#000000',
              0.44: '#570000',
              0.58: '#ff0000',
              0.72: '#ffc800',
              0.86: '#ffff00',
              1.0: '#ffffff'
            }
          }).addTo(this.$refs.map.mapObject)
        }
      }
    }
  },
  mounted: function () {
    this.$nextTick(() => {
      var openstreetmap = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        id: 'OpenStreetMap',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c']
      })

      this.$refs.map.mapObject.addLayer(openstreetmap)

      var satellite = L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        id: 'Esri WorldImagery',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })

      var baseMaps = {
        'OpenStreetMap': openstreetmap,
        'Esri WorldImagery': satellite
      }

      L.control.layers(baseMaps).addTo(this.$refs.map.mapObject)

      this.updateCenter()
      this.$emit('map-loaded', this.$refs.map.mapObject)
    })
  }
}
</script>

<style>
.location-map {
  height: 500px !important;
}
.leaflet-popup-content-wrapper {
    border-radius: 0;
    border-radius: 4px;
  }
.leaflet-popup-content {
  width: 300px !important;
}
</style>
