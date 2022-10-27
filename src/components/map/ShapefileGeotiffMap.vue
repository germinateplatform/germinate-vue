<template>
  <div>
    <div :id="id" class="shapefile-map border" />

    <!-- Add color gradient for number coloring -->
    <ColorGradient :min="gradientOptions.min" :max="gradientOptions.max" :formatMinMax="gradientOptions.format" :colors="gradientOptions.colors" v-if="gradientOptions" ref="gradient" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ColorGradient from '@/components/util/ColorGradient'

import L from 'leaflet'
import shp from 'shpjs'
import { getColor, rgbColorToHex } from '@/mixins/colors'
import { uuidv4 } from '@/mixins/util'
import { apiGetDataResource } from '@/mixins/api/dataset'

let shapefileLayers = {}
let bounds
let imageOverlay = null

export default {
  components: {
    ColorGradient
  },
  props: {
    fileresourceId: {
      type: Number,
      default: () => null
    },
    mapoverlay: {
      type: Object,
      default: () => null
    },
    traitData: {
      type: Array,
      default: () => null
    },
    traitStats: {
      type: Object,
      default: () => null
    },
    selectedGermplasm: {
      type: Array,
      default: () => []
    }
  },
  data: function () {
    const id = `timelinemap-${uuidv4()}`

    return {
      id: id,
      zoom: 3,
      maxZoom: 25,
      center: [22.5937, 2.1094],
      mapOptions: {
        maxNativeZoom: 19
      }
    }
  },
  watch: {
    fileresourceId: function () {
      this.update()
    },
    mapoverlay: function () {
      this.updateMapoverlay()
    },
    traitData: {
      deep: true,
      handler: function () {
        this.updateColors()
      }
    },
    selectedGermplasm: function () {
      this.updateColors()
    }
  },
  computed: {
    ...mapGetters([
      'storeServerSettings',
      'storeBaseUrl',
      'storeToken'
    ]),
    gradientOptions: function () {
      if (this.traitStats) {
        return {
          min: this.traitStats.min,
          max: this.traitStats.max,
          format: v => v.toFixed(4),
          colors: this.storeServerSettings.colorsGradient
        }
      } else {
        return null
      }
    }
  },
  methods: {
    invalidateSize: function () {
      if (this.map) {
        this.$nextTick(() => {
          this.map.invalidateSize()
          if (bounds.isValid()) {
            this.$nextTick(() => this.map.fitBounds(bounds))
          }
        })
      }
    },
    updateColors: function () {
      if (this.traitData && this.traitStats) {
        this.traitData.forEach(td => {
          const id = `${td.trialRow}-${td.trialColumn}`
          const layers = shapefileLayers[id]

          if (layers && layers.length > 0) {
            const fillColor = this.$refs.gradient.getColor(this.traitStats.min, this.traitStats.max, +td.traitValue)

            const index = this.selectedGermplasm.findIndex(sg => sg.row === td.trialRow && sg.column === td.trialColumn && sg.germplasm === td.germplasmName)
            if (index !== -1) {
              layers.forEach(layer => layer.setStyle({ fillColor: rgbColorToHex(fillColor), color: getColor(index), weight: 3 }))
            } else {
              layers.forEach(layer => layer.setStyle({ fillColor: rgbColorToHex(fillColor), weight: 0 }))
            }
          }
        })
      }
    },
    updateMapoverlay: function () {
      if (this.mapoverlay) {
        const url = `${this.storeBaseUrl}mapoverlay/${this.mapoverlay.mapoverlayId}/src?token=${this.storeToken ? this.storeToken.imageToken : ''}`
        const bounds = [[this.mapoverlay.mapoverlayBottomLeftLat, this.mapoverlay.mapoverlayBottomLeftLng], [this.mapoverlay.mapoverlayTopRightLat, this.mapoverlay.mapoverlayTopRightLng]]

        const tempOverlay = L.imageOverlay(url, bounds, { opacity: 0.8 }).addTo(this.map)

        if (imageOverlay) {
          imageOverlay.remove()
        }

        imageOverlay = tempOverlay

        // if (imageOverlay) {
        //   imageOverlay.setUrl(url)
        //   imageOverlay.setBounds(bounds)
        // } else {
        //   imageOverlay = L.imageOverlay(url, bounds, { opacity: 0.8 }).addTo(this.map)
        // }
      } else {
        if (imageOverlay) {
          imageOverlay.remove()
          imageOverlay = null
        }
      }
    },
    update: function () {
      if (shapefileLayers) {
        Object.keys(shapefileLayers).forEach(k => shapefileLayers[k].forEach(l => l.remove()))
        shapefileLayers = {}
      }

      bounds = L.latLngBounds()

      if (this.fileresourceId) {
        apiGetDataResource(this.fileresourceId, result => {
          const reader = new FileReader()
          reader.onload = async () => {
            const shape = await shp(reader.result)

            shape.features.forEach(f => {
              if (f.properties.germplasm) {
                const layer = L.geoJSON(f, {
                  onEachFeature: (feature, layer) => {
                    if (feature.geometry && feature.geometry.type === 'Polygon' && feature.geometry.coordinates) {
                      feature.geometry.coordinates.forEach(c => c.forEach(cd => bounds.extend([cd[1], cd[0]])))
                    }
                    if (feature.properties) {
                      layer.bindPopup(Object.keys(feature.properties).map(function (k) {
                        if (k === '__color__') {
                          return null
                        }
                        return k + ': ' + feature.properties[k]
                      }).join('<br />'), {
                        maxHeight: 200
                      })
                    }

                    layer.on({
                      click: e => {
                        if (e && e.target && e.target.feature && e.target.feature.properties && this.traitData) {
                          const row = e.target.feature.properties.row
                          const column = e.target.feature.properties.column
                          const germplasm = e.target.feature.properties.germplasm
                          const rep = `${e.target.feature.properties.rep}`

                          this.$emit('germplasm-selected', {
                            germplasm: germplasm,
                            rep: rep,
                            row: row,
                            column: column
                          })
                        }
                      }
                    })
                  },
                  style: function (feature) {
                    return {
                      opacity: 1,
                      fillOpacity: 1,
                      radius: 1,
                      fillColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'rgba(255, 255, 255, 0.6)',
                      weight: 1
                    }
                  }
                })

                layer.addTo(this.map)

                if (shapefileLayers[`${f.properties.row}-${f.properties.column}`]) {
                  shapefileLayers[`${f.properties.row}-${f.properties.column}`].push(layer)
                } else {
                  shapefileLayers[`${f.properties.row}-${f.properties.column}`] = [layer]
                }
              }
            })

            if (bounds.isValid()) {
              this.$nextTick(() => this.map.fitBounds(bounds))
            }
          }
          reader.readAsArrayBuffer(result)
        })
      }
    },
    loadMap: function () {
      if (this.shapefile || this.geotiff) {
        this.update()
      }
    }
  },
  mounted: function () {
    this.$nextTick(() => {
      this.map = L.map(this.id)

      this.map.on('load', () => this.update())

      this.map.setView([56.486059, -3.136428], 16)

      // Add the OSM default layer
      const openstreetmap = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        id: 'OpenStreetMap',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c'],
        maxNativeZoom: 19,
        maxZoom: 25
      })
      // Add an additional satellite layer
      const satellite = L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        id: 'Esri WorldImagery',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxNativeZoom: 19,
        maxZoom: 25
      })

      switch (this.storeMapLayer) {
        case 'satellite':
          this.map.addLayer(satellite)
          break
        case 'osm':
        default:
          this.map.addLayer(openstreetmap)
          break
      }

      const baseMaps = {
        // 'Stadia Dark': stadia,
        OpenStreetMap: openstreetmap,
        'Esri WorldImagery': satellite
      }

      L.control.layers(baseMaps).addTo(this.map)

      // Listen for layer changes and store the user selection in the store
      this.map.on('baselayerchange', e => {
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
      this.map.scrollWheelZoom.disable()
      this.map.on('focus', () => this.map.scrollWheelZoom.enable())
      this.map.on('blur', () => this.map.scrollWheelZoom.disable())
    })
  }
}
</script>

<style>
.shapefile-map {
  position: relative;
  height: 600px !important;
}
.shapefile-map .shapefile-map-loading-indicator {
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,.6);
  pointer-events: none;
  z-index: 1000;
}
.shapefile-map .shapefile-map-loading-indicator > .spinner-grow {
  width: 3rem;
  height: 3rem;
}
.shapefile-map .legend {
  max-height: 300px;
  overflow-y: auto;
}
.shapefile-map .legend .italic {
  font-style: italic;
}
</style>
