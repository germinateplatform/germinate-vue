<template>
  <div>
    <div :id="`map-${id}`" ref="mapElement" :class="`${props.selectionMode === 'point' ? 'point-search' : ''} ${props.rounded ? 'rounded-lg' : ''} location-map map`">
      <div ref="popupContent" class="popup-content">
        <LocationPopup
          :location="currentLocation"
          :show-links="showLinks"
          v-if="currentLocation"
        />
      </div>

      <v-overlay
        v-model="loading"
        class="align-center justify-center"
        contained
      >
        <v-progress-linear :value="loadingProgress" color="primary" />
      </v-overlay>
    </div>

    <!-- Add color gradient for heatmapping -->
    <ColorGradient v-if="props.mapType === 'heatmap'" ref="gradient" />

    <ClimateOverlaySelectModal
      v-model="selectedClimate"
      v-model:opacity="climateOverlayOpacity"
      :climates="climates"
      v-if="climates && climates.length > 0"
      @select="updateOverlays"
      ref="climateOverlaySelectModal"
    />

    <v-bottom-sheet
      v-model="bottomSheetVisible"
      inset
      persistent
      :scrim="false"
      scroll-strategy="none"
      :capture-focus="false"
      :close-on-back="false"
      :close-on-content-click="false"
      disabled
      no-click-animation
      max-height="50vh"
      width="auto"
    >
      <v-card class="pb-10">
        <v-card-title class="d-flex justify-space-between align-center">
          <div>{{ $t('modalTitleClimateOverlayLegend') }}</div>
          <v-btn :icon="mdiClose" variant="text" @click="bottomSheetVisible = false" />
        </v-card-title>
        <v-img class="pa-5" :src="legendUrl" contain width="fit-content" />
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts" setup>
  import { coreStore } from '@/stores/app'

  import shp from 'shpjs'
  import L, { type TileLayer, type Map, type Marker, type FeatureGroup, type Layer, type ImageOverlay, type Control } from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import 'leaflet.markercluster/dist/MarkerCluster.css'
  import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
  import 'leaflet-draw/dist/leaflet.draw.css'
  import 'leaflet-easybutton/src/easy-button.css'

  import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
  import iconUrl from 'leaflet/dist/images/marker-icon.png'
  import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
  import type { ExtendedViewTableLocations } from '@/plugins/types/client'
  import { getColor } from '@/plugins/util/colors'
  import { apiPostMapOverlayTable } from '@/plugins/api/misc'
  import ColorGradient from '@/components/widgets/ColorGradient.vue'

  import 'leaflet.heat'
  import 'leaflet.sync'
  import 'leaflet.markercluster'
  import 'leaflet-draw'
  import 'leaflet-easybutton'

  import { uuidv4 } from '@/plugins/util'
  import { addShapefileToMap } from '@/plugins/util/geo'
  import { apiGetDataResource } from '@/plugins/api/dataset'
  import { FilterComparator, FilterOperator, type ViewTableClimates, type PaginatedRequest } from '@/plugins/types/germinate'
  import { apiPostClimateTable } from '@/plugins/api/climate'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { toUrlString } from '@/plugins/util/formatting'
  import { mdiClose, mdiMapLegend, mdiWeatherPartlySnowyRainy } from '@mdi/js'

  // Set the leaflet marker icon
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
  })

  const store = coreStore()

  interface MapProps {
    locations: ExtendedViewTableLocations[]
    mapType?: 'cluster' | 'heatmap' | undefined
    selectionMode?: 'point' | 'polygon' | undefined
    showLinks?: boolean
    showClimateOverlays?: boolean
    rounded?: boolean
    shapefileId?: number
    climateOverlaysDisabled?: boolean
  }

  const props = withDefaults(defineProps<MapProps>(), {
    showLinks: true,
    rounded: true,
    climateOverlaysDisabled: false,
  })

  const emit = defineEmits(['map-loaded'])

  // Refs
  const id = ref(uuidv4())
  const mapElement = useTemplateRef('mapElement')
  const climateOverlaySelectModal = useTemplateRef('climateOverlaySelectModal')
  const popupContent = ref('')
  const internalLocations = ref<ExtendedViewTableLocations[]>([])
  const currentLocation = ref<ExtendedViewTableLocations>()
  const loading = ref<boolean>(false)
  const loadingProgress = ref<number>(0)
  const bottomSheetVisible = ref(false)
  const legendUrl = ref<string>()

  const climates = ref<ViewTableClimates[]>([])
  const selectedClimate = ref<ViewTableClimates>()
  const climateOverlayOpacity = ref(1)

  let themeLayer: TileLayer
  let map: Map
  let markerClusterer: any
  let heat: any
  const markers: Marker[] = []
  const imageOverlays: ImageOverlay[] = []
  let legendButton: Control | undefined = undefined
  let overlayButton: Control | undefined = undefined
  let gradientColors: string[] = []
  let editableLayers: FeatureGroup
  let shapefileLayers: { [key: string]: Layer[] } = {}

  function updateThemeLayer () {
    if (themeLayer) {
      themeLayer.setUrl(`//services.arcgisonline.com/arcgis/rest/services/Canvas/${store.storeIsDarkMode ? 'World_Dark_Gray_Base' : 'World_Light_Gray_Base'}/MapServer/tile/{z}/{y}/{x}`)
    }
  }

  function initMap () {
    if (!mapElement.value) {
      return
    }

    map = L.map(mapElement.value)
    map.setView([22.5937, 2.1094], 3)

    themeLayer = L.tileLayer(`//services.arcgisonline.com/arcgis/rest/services/Canvas/${store.storeIsDarkMode ? 'World_Dark_Gray_Base' : 'World_Light_Gray_Base'}/MapServer/tile/{z}/{y}/{x}`, {
      id: store.storeIsDarkMode ? 'Esri Dark Gray Base' : 'Esri Light Gray Base',
      attribution: 'Esri, HERE, Garmin, FAO, NOAA, USGS, © OpenStreetMap contributors, and the GIS User Community',
      maxZoom: 21,
      maxNativeZoom: 15,
    })

    const openstreetmap = L.tileLayer('//tile.openstreetmap.org/{z}/{x}/{y}.png', {
      id: 'OpenStreetMap',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 21,
      maxNativeZoom: 19,
    })

    // Add an additional satellite layer
    const satellite = L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      id: 'Esri WorldImagery',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 21,
      maxNativeZoom: 19,
    })

    const topo = L.tileLayer('//{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      id: 'OpenTopoMap',
      attribution: 'Kartendaten: &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, SRTM | Kartendarstellung: &copy; <a href="http://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)</code>',
      maxZoom: 19,
      maxNativeZoom: 17,
    })

    switch (store.storeMapLayer) {
      case 'theme': {
        map.addLayer(themeLayer)
        break
      }
      case 'satellite': {
        map.addLayer(satellite)
        break
      }
      case 'topo': {
        map.addLayer(topo)
        break
      }
      default: {
        map.addLayer(openstreetmap)
        break
      }
    }

    const baseMaps = {
      'Theme-based': themeLayer,
      OpenStreetMap: openstreetmap,
      'Esri WorldImagery': satellite,
      OpenTopoMap: topo,
    }

    map.on('baselayerchange', e => {
      switch (e.name) {
        case 'Theme-based': {
          store.setMapLayer('theme')
          break
        }
        case 'OpenStreetMap': {
          store.setMapLayer('osm')
          break
        }
        case 'Esri WorldImagery': {
          store.setMapLayer('satellite')
          break
        }
        case 'OpenTopoMap': {
          store.setMapLayer('topo')
          break
        }
      }
    })

    map.on('click', e => {
      if (props.selectionMode === 'point') {
        const l: ExtendedViewTableLocations = {
          locationId: -1,
          locationName: 'Query',
          locationLatitude: e.latlng.lat,
          locationLongitude: e.latlng.lng,
        }

        internalLocations.value = [l]

        map.panTo(e.latlng)

        updateMarkers()
      }
    })

    L.control.layers(baseMaps).addTo(map)

    // Disable zoom until focus gained, disable when blur
    map.scrollWheelZoom.disable()
    map.on('focus', () => map.scrollWheelZoom.enable())
    map.on('blur', () => map.scrollWheelZoom.disable())

    if (internalLocations.value) {
      updateMarkers()
    }

    if (props.selectionMode === 'polygon') {
      editableLayers = new L.FeatureGroup()
      map.addLayer(editableLayers)

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
              color: '#c0392b',
            },
          },
        },
        edit: {
          featureGroup: editableLayers,
          remove: true,
        },
      }

      // @ts-ignore
      const result = new L.Control.Draw(options)
      map.addControl(result)

      // @ts-ignore
      map.on(L.Draw.Event.CREATED, e => editableLayers.addLayer(e.layer))

      nextTick(() => {
        // Enable the polygon draw feature by default
        // @ts-ignore
        document.querySelector(`#map-${id.value}`)?.querySelector('.leaflet-draw-draw-polygon')?.click()
      })
    }

    if (props.shapefileId) {
      updateShapefile()
    }

    emit('map-loaded', map)
  }

  function updateOverlays () {
    if (!map) {
      return
    }

    legendUrl.value = undefined
    if (imageOverlays) {
      imageOverlays.forEach(io => map.removeLayer(io))
    }

    if (legendButton) {
      map.removeControl(legendButton)
    }

    if (selectedClimate.value) {
      const queryData: PaginatedRequest = {
        filters: [{
          filters: [{
            column: 'referenceTable',
            comparator: FilterComparator.equals,
            values: ['climates'],
          }, {
            column: 'foreignId',
            comparator: FilterComparator.equals,
            values: [`${selectedClimate.value.climateId}`],
          }],
          operator: FilterOperator.and,
        }],
        page: 1,
        limit: MAX_JAVA_INTEGER,
      }
      apiPostMapOverlayTable(queryData, result => {
        if (result && result.data && result.data.length > 0) {
          result.data.forEach(mo => {
            let path = ''

            const params = {
              token: store.storeToken ? store.storeToken.imageToken : undefined,
            }
            const paramString = toUrlString(params)

            path = store.storeBaseUrl + `mapoverlay/${mo.mapoverlayId}/src?` + paramString

            if (mo.mapoverlaysIsLegend) {
              legendUrl.value = path
            } else {
              const overlay = L.imageOverlay(path, [[mo.mapoverlayBottomLeftLat, mo.mapoverlayBottomLeftLng], [mo.mapoverlayTopRightLat, mo.mapoverlayTopRightLng]], {
                opacity: climateOverlayOpacity.value || 1,
              })

              overlay.addTo(map)
              imageOverlays.push(overlay)
            }
          })

          if (legendUrl.value) {
            legendButton = L.easyButton(`
              <svg viewBox="0 0 24 24" width="18" height="18" class="legend-control__icon">
                <path d="${mdiMapLegend}" fill="currentColor" />
              </svg>
            `, function () {
              bottomSheetVisible.value = !bottomSheetVisible.value
            // @ts-expect-error
            }, '', { position: 'bottomleft' })
            legendButton.addTo(map)
          }
        }
      })
    }
  }

  function updateMarkers () {
    if (!map) {
      return
    }

    // Remove existing markers
    if (markers) {
      markers.forEach(m => map.removeLayer(m))
    }

    if (internalLocations.value && internalLocations.value.length > 0) {
      if (internalLocations.value.length === 1) {
        currentLocation.value = internalLocations.value[0]

        if (currentLocation.value.locationLatitude && currentLocation.value.locationLongitude) {
          map.panTo(new L.LatLng(currentLocation.value.locationLatitude, currentLocation.value.locationLongitude))

          const marker = L.marker([currentLocation.value.locationLatitude, currentLocation.value.locationLongitude]).bindPopup('')
          marker.on('click', e => {
            const popup = e.target.getPopup()
            // Set the popup content on click
            nextTick(() => popup.setContent(popupContent.value))
          })
          marker.addTo(map)
          marker.fire('click')

          markers.push(marker)
        }
      } else if (internalLocations.value.length > 1) {
        // If there are multiple locations, fit them into view
        // @ts-ignore
        const latLngBounds = L.latLngBounds(internalLocations.value.filter(l => l.locationLatitude && l.locationLongitude).map(l => new L.LatLng(l.locationLatitude, l.locationLongitude)))

        map.fitBounds(latLngBounds.pad(0.1))
      }

      if (props.mapType === 'cluster') {
        loading.value = true
        loadingProgress.value = 0

        if (markerClusterer) {
          // If it exists, clear all layers
          markerClusterer.clearLayers()
        } else {
          // If it doesn't create it
          // @ts-ignore
          markerClusterer = L.markerClusterGroup({
            chunkedLoading: true,
            disableClusteringAtZoom: 16,
            chunkProgress: (processed: number, total: number) => {
              loading.value = processed !== total
              loadingProgress.value = Math.round(processed / total * 100)
            },
          })
          map.addLayer(markerClusterer)
        }
        const clusterMarker = internalLocations.value.filter(l => l.locationLatitude && l.locationLongitude)
          .map(l => {
            // @ts-ignore
            const marker = L.marker([l.locationLatitude, l.locationLongitude]).bindPopup('')
            marker.on('click', e => {
              const popup = e.target.getPopup()
              currentLocation.value = l
              nextTick(() => popup.setContent(popupContent.value))
            })
            return marker
          })
        markerClusterer.addLayers(clusterMarker)
      } else if (props.mapType === 'heatmap') {
        const ls = internalLocations.value.filter(l => l.locationLatitude && l.locationLongitude)
          .map(l => [l.locationLatitude, l.locationLongitude, 1])
        if (heat) {
          // If it exists, just set it
          heat.setLatLngs(ls)
        } else {
          // Otherwise, create it
          const gradient: { [key: number]: string } = {}

          gradientColors.forEach((c, i) => {
            const position = i * (1 / (gradientColors.length - 1))
            gradient[position] = c
          })

          // @ts-ignore
          heat = L.heatLayer(ls, {
            minOpacity: 0.7,
            max: 1,
            radius: 10,
            blur: 7,
            gradient: gradient,
          }).addTo(map)

          // this.$refs.gradient.refresh()
        }
      } else {
        internalLocations.value.filter(l => l.locationLatitude && l.locationLongitude)
          .forEach(l => {
            // @ts-ignore
            const marker = L.marker([l.locationLatitude, l.locationLongitude]).bindPopup('')
            marker.on('click', e => {
              const popup = e.target.getPopup()
              currentLocation.value = l
              // Set the popup content on click
              nextTick(() => popup.setContent(popupContent.value))
            })
            marker.addTo(map)
            markers.push(marker)
          })
      }
    } else {
      if (markerClusterer) {
        // If it exists, clear all layers
        markerClusterer.clearLayers()
      }
      if (heat) {
        // If it exists, just set it
        heat.setLatLngs([])
      }
    }
  }

  function invalidateSize () {
    nextTick(() => map.invalidateSize())
  }

  function setPolygons (polygons: any[]) {
    if (props.selectionMode === 'polygon' && editableLayers) {
      polygons.forEach(p => L.polygon(p).addTo(editableLayers))
    }
  }

  function getPolygons () {
    if (props.selectionMode === 'polygon' && editableLayers) {
      const polygons: any[] = []

      editableLayers.eachLayer(layer => {
        const polygon = []
        // @ts-ignore
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
  }

  function getLatLngs () {
    return internalLocations.value.map(l => {
      return L.latLng(l.locationLatitude || 0, l.locationLongitude || 0)
    })
  }

  function updateShapefile () {
    if (shapefileLayers) {
      Object.keys(shapefileLayers).forEach(k => shapefileLayers[k].forEach(l => l.remove()))
      shapefileLayers = {}
    }

    if (props.shapefileId) {
      apiGetDataResource<Blob>(props.shapefileId, async result => {
        const content = await result.arrayBuffer()
        const shape = await shp(content)

        // @ts-ignore
        shapefileLayers = addShapefileToMap(map, shape)
      })
    }
  }

  watch(() => store.storeIsDarkMode, async () => updateThemeLayer())
  watch(() => props.locations, async newValue => {
    internalLocations.value = newValue.concat()
    updateMarkers()
  }, { immediate: true })
  watch(() => props.shapefileId, async () => updateShapefile())

  onMounted(() => {
    if (store.storeServerSettings && store.storeServerSettings.colorsGradient && store.storeServerSettings.colorsGradient.length > 0) {
      gradientColors = store.storeServerSettings.colorsGradient.concat()
    } else {
      gradientColors.push('#ffffff', getColor(0))
    }

    initMap()

    if (props.climateOverlaysDisabled === false) {
      const queryData: PaginatedRequest = {
        page: 1,
        limit: MAX_JAVA_INTEGER,
        filters: [{
          filters: [{
            column: 'overlays',
            comparator: FilterComparator.greaterThan,
            values: ['0'],
          }],
          operator: FilterOperator.and,
        }],
      }

      apiPostClimateTable(queryData, result => {
        if (result && result.data) {
          climates.value = result.data

          if (climates.value.length > 1) {
            overlayButton = L.easyButton(`
              <svg viewBox="0 0 24 24" width="18" height="18" class="legend-control__icon">
                <path d="${mdiWeatherPartlySnowyRainy}" fill="currentColor" />
              </svg>
            `, function () {
              climateOverlaySelectModal.value?.show()
            // @ts-expect-error
            }, '', { position: 'topright' })
            overlayButton.addTo(map)
          }
        }
      })
    }
  })

  defineExpose({
    invalidateSize,
    getPolygons,
    setPolygons,
    getLatLngs,
  })
</script>

<style scoped>
.map {
  height: 50vh;
}
</style>

<style>
.popup-with-no-events {
  pointer-events: none;
}
.leaflet-popup-content-wrapper {
  border-radius: 8px;
}

.marker-cluster, .prunecluster {
  color: white;
}

.location-map .leaflet-popup-content-wrapper {
  padding: 0;
  border-radius: 3px;
}

.location-map .leaflet-popup-content {
  margin: 0;
  width: 300px!important;
}

.location-map .leaflet-popup-content .v-list-item-subtitle {
  text-wrap: wrap;
  line-clamp: unset;
  -webkit-line-clamp: unset;
}

.location-map.point-search {
  cursor: crosshair;
}

.marker-cluster-small, .prunecluster-small {
  background-color: rgba(var(--v-theme-primary), 0.6);
}
.marker-cluster-small div, .prunecluster-small div {
  background-color: rgba(var(--v-theme-primary), 0.8);
}

.marker-cluster-medium, .prunecluster-medium {
  background-color: rgba(var(--v-theme-primary), 0.6);
  filter: saturate(0.8);
}
.marker-cluster-medium div, .prunecluster-medium div {
  background-color: rgba(var(--v-theme-primary), 0.8);
}

.marker-cluster-large, .prunecluster-large {
  background-color: rgba(var(--v-theme-primary), 0.6);
  filter: saturate(0.6)
}
.marker-cluster-large div, .prunecluster-large div {
  background-color: rgba(var(--v-theme-primary), 0.8);
}

.location-map .legend-control {
  position: relative;
  background: white;
}

.location-map .legend-control__button {
  display: block;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
}

.location-map .legend-control__image {
  display: none;
  position: absolute;
  bottom: 0;
  left: 100%;
  max-width: 260px;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
  background: white;
}

.location-map .legend-control:hover .legend-control__image {
  display: block;
}

.location-map .legend-control__icon {
  vertical-align: middle;
  pointer-events: none;
}

.location-map .legend-control__image {
  display: none;
  position: absolute;
  bottom: 0;
  left: 100%;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
  background: white;

  max-width: 50vw;
  max-height: 50vh;
  width: auto;
  height: auto;
  object-fit: contain;
}

.location-map .legend-control:hover .legend-control__image {
  display: block;
}
</style>
