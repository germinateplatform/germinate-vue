<template>
  <div>
    <div :id="`map-${id}`" ref="mapElement" :class="`${props.selectionMode === 'point' ? 'point-search' : ''} ${props.rounded ? 'rounded-lg' : ''} location-map map`">
      <div ref="popupContent" class="popup-content">
        <v-list v-if="currentLocation">
          <v-list-item :title="$t('tableColumnLocationName')">
            <template #subtitle>
              <template v-if="showLinks">
                <span v-if="currentLocation.locationType === 'datasets' || !currentLocation.locationId">{{ currentLocation.locationName }}</span>
                <router-link :to="Pages.germplasm.path" v-else-if="currentLocation.locationType === 'collectingsites'" @click.prevent="navigateToGermplasm(currentLocation)" event="">{{ currentLocation.locationName }}</router-link>
                <span v-else>{{ currentLocation.locationName }}</span>
              </template>
              <span v-else v-html="currentLocation.locationName" />
            </template>
          </v-list-item>
          <v-list-item v-if="currentLocation.locationType" :title="$t('tableColumnLocationType')">
            <template #subtitle>
              <span :style="`color: ${locationTypes[currentLocation.locationType].color()};`"><v-icon :icon="locationTypes[currentLocation.locationType].path" /></span> {{ locationTypes[currentLocation.locationType].text() }}
            </template>
          </v-list-item>
          <v-list-item v-if="currentLocation.countryCode2 || currentLocation.countryCode3" :title="$t('tableColumnCountryName')">
            <template #subtitle>
              <i :class="'fi fi-' + getFlag(currentLocation)" /> {{ getCountry(currentLocation) }}
            </template>
          </v-list-item>
          <v-list-item :title="$t('tableColumnLocationLatitude')" :subtitle="currentLocation.locationLatitude?.toFixed(2)" />
          <v-list-item :title="$t('tableColumnLocationLongitude')" :subtitle="currentLocation.locationLongitude?.toFixed(2)" />
          <v-list-item :title="$t('tableColumnLocationElevation')" :subtitle="currentLocation.locationElevation?.toFixed(2)" v-if="currentLocation.locationElevation" />

          <template v-if="currentLocation.additionalInfo">
            <v-list-item
              v-for="(value, key) in currentLocation.additionalInfo"
              :key="`additional-info-${currentLocation.locationId}-${key}`"
              :title="key"
              :subtitle="value"
            />
          </template>
        </v-list>
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
  </div>
</template>

<script lang="ts" setup>
  import { coreStore } from '@/stores/app'

  import L, { type TileLayer, type Map, type Marker, type FeatureGroup } from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import 'leaflet.markercluster/dist/MarkerCluster.css'
  import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
  import 'leaflet-draw/dist/leaflet.draw.css'

  import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
  import iconUrl from 'leaflet/dist/images/marker-icon.png'
  import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
  import { FilterComparator, FilterOperator, type FilterGroup } from '@/plugins/types/germinate'
  import type { ExtendedViewTableLocations } from '@/plugins/types/ExtendedViewTableLocations'
  import { getColor } from '@/plugins/util/colors'
  import ColorGradient from '@/components/widgets/ColorGradient.vue'

  import 'leaflet.heat'
  import 'leaflet.sync'
  import 'leaflet.markercluster'
  import 'leaflet-draw'
  import { Pages } from '@/plugins/pages'
  import { locationTypes } from '@/plugins/util/types'

  // @ts-ignore
  import * as countries from 'i18n-iso-countries'
  // @ts-ignore
  import countryDataEn from 'i18n-iso-countries/langs/en.json'
  import { uuidv4 } from '@/plugins/util'
  countries.registerLocale(countryDataEn)

  // Set the leaflet marker icon
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
  })

  const store = coreStore()
  const router = useRouter()

  interface MapProps {
    locations: ExtendedViewTableLocations[]
    mapType?: 'cluster' | 'heatmap' | undefined
    selectionMode?: 'point' | 'polygon' | undefined
    showLinks?: boolean
    showClimateOverlays?: boolean
    rounded?: boolean
  }

  const props = withDefaults(defineProps<MapProps>(), {
    showLinks: true,
    rounded: true,
  })

  const emit = defineEmits(['map-loaded'])

  // Refs
  const id = ref(uuidv4())
  const mapElement = useTemplateRef('mapElement')
  const popupContent = ref('')
  const systemTheme = ref('dark')
  const internalLocations = ref<ExtendedViewTableLocations[]>([])
  const currentLocation = ref<ExtendedViewTableLocations>()
  const loading = ref<boolean>(false)
  const loadingProgress = ref<number>(0)

  let themeLayer: TileLayer
  let map: Map
  let markerClusterer: any
  let heat: any
  const markers: Marker[] = []
  let gradientColors: string[] = []
  let editableLayers: FeatureGroup

  function updateThemeLayer () {
    if (themeLayer) {
      const theme = store.storeTheme === 'system' ? systemTheme.value : store.storeTheme
      themeLayer.setUrl(`//services.arcgisonline.com/arcgis/rest/services/Canvas/${theme === 'dark' ? 'World_Dark_Gray_Base' : 'World_Light_Gray_Base'}/MapServer/tile/{z}/{y}/{x}`)
    }
  }

  function initMap () {
    if (!mapElement.value) {
      return
    }
    
    map = L.map(mapElement.value)
    map.setView([22.5937, 2.1094], 3)

    const theme = store.storeTheme === 'system' ? systemTheme.value : store.storeTheme
    themeLayer = L.tileLayer(`//services.arcgisonline.com/arcgis/rest/services/Canvas/${theme === 'dark' ? 'World_Dark_Gray_Base' : 'World_Light_Gray_Base'}/MapServer/tile/{z}/{y}/{x}`, {
      id: theme === 'dark' ? 'Esri Dark Gray Base' : 'Esri Light Gray Base',
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

    switch (store.storeMapLayer) {
      case 'theme': {
        map.addLayer(themeLayer)
        break
      }
      case 'satellite': {
        map.addLayer(satellite)
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

    emit('map-loaded', map)
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

  function navigateToGermplasm (location: ExtendedViewTableLocations) {
    // Navigate to the germplasm overview page and filter on location
    const filter: FilterGroup[] = [{
      filters: [{
        column: 'locationId',
        comparator: FilterComparator.equals,
        values: [`${location.locationId}`],
      }],
      operator: FilterOperator.and,
    }]
    router.push({
      path: Pages.germplasm.path,
      query: {
        'germplasm-filter': JSON.stringify(filter),
      },
    })
  }

  function getFlag (country: ExtendedViewTableLocations) {
    if (country.countryCode2) {
      return country.countryCode2.toLowerCase()
    } else if (country.countryCode3) {
      return countries.alpha3ToAlpha2(country.countryCode3)?.toLowerCase()
    } else {
      return ''
    }
  }

  function getCountry (country: ExtendedViewTableLocations) {
    if (country.countryCode2) {
      return countries.getName(country.countryCode2.toUpperCase(), 'en')
    } else if (country.countryCode3) {
      return countries.getName(country.countryCode3.toUpperCase(), 'en')
    } else {
      return ''
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

  watch(() => store.storeTheme, async () => updateThemeLayer())
  watch(() => props.locations, async newValue => {
    internalLocations.value = newValue.concat()
    updateMarkers()
  }, { immediate: true })

  onMounted(() => {
    if (store.storeServerSettings && store.storeServerSettings.colorsGradient && store.storeServerSettings.colorsGradient.length > 0) {
      gradientColors = store.storeServerSettings.colorsGradient.concat()
    } else {
      gradientColors.push('#ffffff', getColor(0))
    }

    initMap()
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
</style>
