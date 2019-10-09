<template>
  <div>
    <l-map
      class="point-map"
      ref="map"
      :maxZoom="maxZoom"
      @click="setMarker"
      :zoom="zoom">
    </l-map>
    <div v-if="markerPosition" ref="popupContent">
      <dl class="row">
        <dt class="col-4 text-right">Latitude</dt><dd class="col-8">{{ markerPosition.lat.toFixed(4) }}</dd>
        <dt class="col-4 text-right">Longitude</dt><dd class="col-8">{{ markerPosition.lng.toFixed(4) }}</dd>
      </dl>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'

export default {
  data: function () {
    return {
      zoom: 3,
      maxZoom: 12,
      marker: null,
      markerPosition: null,
      center: L.latLng(22.5937, 2.1094)
    }
  },
  methods: {
    setMarker: function (e) {
      this.markerPosition = e.latlng

      var map = this.$refs.map.mapObject
      if (this.marker) {
        map.removeLayer(this.marker)
      }

      var marker = L.marker([this.markerPosition.lat, this.markerPosition.lng]).bindPopup('')
      marker.on('click', e => {
        var popup = e.target.getPopup()
        this.$nextTick(() => popup.setContent(this.$refs.popupContent))
      })
      marker.addTo(map)
      marker.fire('click')

      map.panTo(this.markerPosition)

      this.marker = marker
    },
    openPopup: function (event) {
      this.$nextTick(() => event.target.openPopup())
    },
    invalidateSize: function () {
      this.$nextTick(() => this.$refs.map.mapObject.invalidateSize())
    },
    markAndGetCenter: function () {
      return this.markerPosition
    }
  },
  mounted: function () {
    this.$nextTick(() => {
      var openstreetmap = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        id: 'OpenStreetMap',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c']
      })

      var map = this.$refs.map.mapObject

      map.addLayer(openstreetmap)

      var satellite = L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        id: 'Esri WorldImagery',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })

      var baseMaps = {
        'OpenStreetMap': openstreetmap,
        'Esri WorldImagery': satellite
      }

      L.control.layers(baseMaps).addTo(map)

      // Disable zoom until focus gained, disable when blur
      map.scrollWheelZoom.disable()
      map.on('focus', function () {
        map.scrollWheelZoom.enable()
      })
      map.on('blur', function () {
        map.scrollWheelZoom.disable()
      })

      this.$refs.map.setCenter(this.center)

      this.$emit('map-loaded', map)
    })
  }
}
</script>

<style>
.point-map {
  height: 600px !important;
  cursor: crosshair;
}
</style>
