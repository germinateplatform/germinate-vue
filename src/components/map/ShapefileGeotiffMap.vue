<template>
  <div>
    <b-row>
      <b-col cols=12 md=6 lg=4>
        <b-form-group :label="$t('formLabelTraitTimelineShapefile')" label-for="shapefile">
          <b-form-select id="shapefile" :options="shapefileOptions" v-model="shapefileIndex" />
        </b-form-group>
      </b-col>
      <b-col cols=12 md=6 lg=4 v-if="hasTreatments || hasReps">
        <b-form-group :label="$t('formLabelGeotiffMapHighlight')" label-for="highlight-group">
          <b-button-group id="highlight-group">
            <b-button @click="highlightReps" v-if="hasReps"><MdiIcon :path="mdiNumeric" /> {{ $t('buttonHighlightReps', { count: reps.length }) }}</b-button>
            <b-button @click="highlightTreatments" v-if="hasTreatments"><MdiIcon :path="mdiTagMultiple" /> {{ $t('buttonHighlightTreatments', { count: treatments.length }) }}</b-button>
            <b-button @click="removeHighlight"><MdiIcon :path="mdiCancel" /> {{ $t('buttonHighlightRemove') }}</b-button>
          </b-button-group>
        </b-form-group>

        <div v-if="repColors && repColors.length > 0" class="mb-3">
          <b-badge v-for="rep in repColors" :key="`rep-badge-${rep.rep}`" class="mr-2" :style="{ backgroundColor: rep.color }">{{ rep.rep }}</b-badge>
        </div>
        <div v-if="treatmentColors && treatmentColors.length > 0" class="mb-3">
          <b-badge v-for="treatment in treatmentColors" :key="`treatment-badge-${treatment.treatment}`" class="mr-2" :style="{ backgroundColor: treatment.color }">{{ treatment.treatment }}</b-badge>
        </div>
      </b-col>
      <b-col cols=12 md=6 lg=4>
        <b-form-group :label="$t('formLabelGeotiffMapOpacity')" label-for="opacity">
          <b-form-input type="range" v-model="opacity" :min="0" :max="1" :step="0.1" lazy />
        </b-form-group>
      </b-col>
    </b-row>

    <div :id="id" class="shapefile-map border" />

    <!-- Add color gradient for number coloring -->
    <ColorGradient :min="gradientOptions.min" :max="gradientOptions.max" :formatMinMax="gradientOptions.format" :colors="gradientOptions.colors" v-if="gradientOptions" ref="gradient" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ColorGradient from '@/components/util/ColorGradient'
import MdiIcon from '@/components/icons/MdiIcon'

import L from 'leaflet'
import shp from 'shpjs'
import { getColor, rgbColorToHex } from '@/mixins/colors'
import { uuidv4 } from '@/mixins/util'
import { apiGetDataResource } from '@/mixins/api/dataset'

import { mdiNumeric, mdiTagMultiple, mdiCancel } from '@mdi/js'

let shapefileLayers = {}
let bounds
let imageOverlays = []

export default {
  components: {
    ColorGradient,
    MdiIcon
  },
  props: {
    mapoverlays: {
      type: Array,
      default: () => []
    },
    mapoverlayIndex: {
      type: Number,
      default: 0
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
    },
    shapefiles: {
      type: Array,
      default: () => []
    }
  },
  data: function () {
    const id = `timelinemap-${uuidv4()}`

    return {
      mdiNumeric,
      mdiTagMultiple,
      mdiCancel,
      id: id,
      zoom: 3,
      maxZoom: 25,
      center: [22.5937, 2.1094],
      mapOptions: {
        maxNativeZoom: 19
      },
      shapefileIndex: 0,
      opacity: 0.8,
      repColors: [],
      treatmentColors: []
    }
  },
  watch: {
    shapefileId: function () {
      this.update()
    },
    mapoverlays: function () {
      this.updateMapoverlays()
    },
    mapoverlayIndex: function () {
      this.updateMapoverlayIndex()
    },
    traitData: {
      deep: true,
      handler: function () {
        this.updateColors()
      }
    },
    selectedGermplasm: function () {
      this.updateColors()
    },
    opacity: function () {
      this.updateColors()
    }
  },
  computed: {
    ...mapGetters([
      'storeServerSettings',
      'storeBaseUrl',
      'storeToken',
      'storeDarkMode'
    ]),
    shapefileOptions: function () {
      if (this.shapefiles) {
        return this.shapefiles.map((s, index) => {
          return {
            value: index,
            text: s.fileresourceName
          }
        })
      } else {
        return null
      }
    },
    shapefileId: function () {
      if (this.shapefiles && this.shapefiles.length > 0) {
        return this.shapefiles[this.shapefileIndex].fileresourceId
      } else {
        return null
      }
    },
    hasReps: function () {
      return this.reps && this.reps.length > 1
    },
    reps: function () {
      if (this.traitData) {
        const t = new Set()

        this.traitData.forEach(td => {
          if (td.rep) {
            t.add(`${td.rep}`)
          }
        })

        return [...t].sort((a, b) => a.localeCompare(b))
      } else {
        return []
      }
    },
    hasTreatments: function () {
      return this.treatments && this.treatments.length > 1
    },
    treatments: function () {
      if (this.traitData) {
        const t = new Set()

        this.traitData.forEach(td => {
          if (td.treatment) {
            t.add(`${td.treatment}`)
          }
        })

        return [...t].sort((a, b) => a.localeCompare(b))
      } else {
        return []
      }
    },
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
    removeHighlight: function () {
      this.updateColors()
    },
    updateThemeLayer: function () {
      if (this.themeLayer) {
        this.themeLayer.setUrl(`//services.arcgisonline.com/arcgis/rest/services/Canvas/${this.storeDarkMode ? 'World_Dark_Gray_Base' : 'World_Light_Gray_Base'}/MapServer/tile/{z}/{y}/{x}`)
      }
    },
    highlightReps: function () {
      this.treatmentColors = []
      this.repColors = []

      if (this.traitData && this.reps && this.reps.length > 1) {
        const colorMap = new Map()

        this.traitData.forEach(td => {
          const id = `${td.trialRow}-${td.trialColumn}`
          const layers = shapefileLayers[id]

          if (layers && layers.length > 0) {
            const rep = td.rep

            // Get the corresponding color and save it back
            const color = colorMap.get(rep) || getColor(colorMap.size)
            colorMap.set(rep, color)

            layers.forEach(layer => layer.setStyle({ color: color, weight: 1 }))
          }
        })

        const colorArray = []
        colorMap.forEach((value, key) => colorArray.push({ color: value, rep: key }))
        colorArray.sort((a, b) => a.rep.localeCompare(b.rep))
        this.repColors = colorArray
      }
    },
    highlightTreatments: function () {
      this.treatmentColors = []
      this.repColors = []

      if (this.traitData && this.reps && this.reps.length > 1) {
        const colorMap = new Map()

        this.traitData.forEach(td => {
          const id = `${td.trialRow}-${td.trialColumn}`
          const layers = shapefileLayers[id]

          if (layers && layers.length > 0) {
            const treatment = td.treatment

            // Get the corresponding color and save it back
            const color = colorMap.get(treatment) || getColor(colorMap.size)
            colorMap.set(treatment, color)

            layers.forEach(layer => layer.setStyle({ color: color, weight: 1 }))
          }
        })

        const colorArray = []
        colorMap.forEach((value, key) => colorArray.push({ color: value, treatment: key }))
        colorArray.sort((a, b) => a.treatment.localeCompare(b.treatment))
        this.treatmentColors = colorArray
      }
    },
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
      this.treatmentColors = []
      this.repColors = []

      if (this.traitData && this.traitStats) {
        this.traitData.forEach(td => {
          const id = `${td.trialRow}-${td.trialColumn}`
          const layers = shapefileLayers[id]

          if (layers && layers.length > 0) {
            const fillColor = this.$refs.gradient.getColor(this.traitStats.min, this.traitStats.max, +td.traitValue)

            const index = this.selectedGermplasm.findIndex(sg => sg.row === td.trialRow && sg.column === td.trialColumn && sg.germplasm === td.germplasmName)
            if (index !== -1) {
              layers.forEach(layer => layer.setStyle({ fillColor: rgbColorToHex(fillColor), color: getColor(index), weight: 3, fillOpacity: this.opacity }))
            } else {
              layers.forEach(layer => layer.setStyle({ fillColor: rgbColorToHex(fillColor), weight: 0, fillOpacity: this.opacity }))
            }
          }
        })
      }
    },
    updateMapoverlayIndex: function () {
      if (imageOverlays) {
        imageOverlays.forEach((io, i) => {
          if (i === this.mapoverlayIndex) {
            io.setOpacity(1)
          } else {
            io.setOpacity(0)
          }
        })
      }
    },
    updateMapoverlays: function () {
      if (this.mapoverlays && this.mapoverlays.length > 0) {
        if (imageOverlays) {
          imageOverlays.filter(io => io !== null).forEach(io => io.remove())
        }

        imageOverlays = this.mapoverlays.map((mo, i) => {
          if (mo) {
            const url = `${this.storeBaseUrl}mapoverlay/${mo.mapoverlayId}/src?token=${this.storeToken ? this.storeToken.imageToken : ''}`
            const bounds = [[mo.mapoverlayBottomLeftLat, mo.mapoverlayBottomLeftLng], [mo.mapoverlayTopRightLat, mo.mapoverlayTopRightLng]]

            const overlay = L.imageOverlay(url, bounds, { opacity: i === this.mapoverlayIndex ? 1.0 : 0.0 }).addTo(this.map)

            return overlay
          } else {
            return null
          }
        })
      } else {
        if (imageOverlays) {
          imageOverlays.filter(io => io !== null).forEach(io => io.remove())
          imageOverlays = []
        }
      }
    },
    update: function () {
      if (shapefileLayers) {
        Object.keys(shapefileLayers).forEach(k => shapefileLayers[k].forEach(l => l.remove()))
        shapefileLayers = {}
      }

      bounds = L.latLngBounds()

      if (this.shapefileId) {
        apiGetDataResource(this.shapefileId, result => {
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
      const openstreetmap = L.tileLayer('//tile.openstreetmap.org/{z}/{x}/{y}.png', {
        id: 'OpenStreetMap',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxNativeZoom: 19,
        maxZoom: 25
      })
      this.themeLayer = L.tileLayer(`//services.arcgisonline.com/arcgis/rest/services/Canvas/${this.storeDarkMode ? 'World_Dark_Gray_Base' : 'World_Light_Gray_Base'}/MapServer/tile/{z}/{y}/{x}`, {
        id: this.storeDarkMode ? 'Esri Dark Gray Base' : 'Esri Light Gray Base',
        attribution: 'Esri, HERE, Garmin, FAO, NOAA, USGS, © OpenStreetMap contributors, and the GIS User Community',
        maxZoom: 21,
        maxNativeZoom: 15
      })
      // Add an additional satellite layer
      const satellite = L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        id: 'Esri WorldImagery',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxNativeZoom: 19,
        maxZoom: 25
      })

      switch (this.storeMapLayer) {
        case 'theme':
          this.map.addLayer(this.themeLayer)
          break
        case 'satellite':
          this.map.addLayer(satellite)
          break
        case 'osm':
        default:
          this.map.addLayer(openstreetmap)
          break
      }

      const baseMaps = {
        'Theme-based': this.themeLayer,
        OpenStreetMap: openstreetmap,
        'Esri WorldImagery': satellite
      }

      L.control.layers(baseMaps).addTo(this.map)

      // Listen for layer changes and store the user selection in the store
      this.map.on('baselayerchange', e => {
        switch (e.name) {
          case 'Theme-based':
            this.$store.dispatch('setMapLayer', 'theme')
            break
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
