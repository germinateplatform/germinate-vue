<template>
  <div>
    <l-map
      class="location-map"
      :center="center"
      v-if="locations && locations.length > 0"
      ref="map"
      :zoom="zoom">
      <l-tile-layer
        url="//{s}.tile.osm.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors" />
      <l-marker-cluster>
        <l-marker v-for="location in locations" :key="'location-map-' + location.locationid" :lat-lng="[location.latitude, location.longitude]" :ref="`marker-${location.locationid}`">
          <l-popup>
            <dl class="row">
              <dt class="col-3 text-right">Location</dt><dd class="col-9">{{ location.collsite }}</dd>
              <dt class="col-3 text-right">Country</dt><dd class="col-9"><i :class="'flag-icon flag-icon-' + getFlag(location.country.code3.toUpperCase())" />{{ getCountry(location.country.code3) }}</dd>
            </dl>
          </l-popup>
        </l-marker>
      </l-marker-cluster>
    </l-map>
  </div>
</template>

<script>
import L from 'leaflet'
var countries = require('i18n-iso-countries')
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

export default {
  data: function () {
    return {
      zoom: 3,
      center: [22.5937, 2.1094]
    }
  },
  props: {
    locations: {
      type: Array,
      default: null
    }
  },
  watch: {
    locations: (newValue, oldValue) => {
      this.updateCenter()
    }
  },
  methods: {
    getFlag: function (code3) {
      return countries.alpha3ToAlpha2(code3).toLowerCase()
    },
    getCountry: function (code3) {
      return countries.getName(code3, 'en')
    },
    updateCenter: function () {
      if (this.locations.length === 1) {
        // If there's just one location, center it and open the popup
        this.center = [this.locations[0].latitude, this.locations[0].longitude]
        var ref = 'marker-' + this.locations[0].locationid
        this.$refs[ref][0].mapObject.openPopup()
      } else {
        // If there are multiple locations, fit them into view
        var latLngBounds = L.latLngBounds()

        this.locations.forEach(l => {
          var location = L.latLng(l.latitude, l.longitude)
          latLngBounds.extend(location)
        })

        this.$refs.map.fitBounds(latLngBounds.pad(0.1))
      }
    }
  },
  mounted: function () {
    this.$nextTick(() => this.updateCenter())
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
