<template>
  <div>
    <div :id="`map-${id}`" ref="mapElement" class="location-map map">
      <div ref="popupContent" class="popup-content">
        <LocationPopup
          :location="selectedLocation"
          show-links
          v-if="selectedLocation"
        >
          <template #prepend v-if="selectedGermplasm">
            <v-list-item
              base-color="primary"
              :title="$t('tableColumnGermplasmName')"
              :subtitle="selectedGermplasm.germplasm.germplasmDisplayName"
            >
              <template #append>
                <v-checkbox-btn v-model="selectedGermplasm.marked" />
              </template>
            </v-list-item>
          </template>
        </LocationPopup>
      </div>

      <v-overlay
        v-model="loading"
        class="align-center justify-center"
        contained
      >
        <v-progress-linear :value="loadingProgress" color="primary" />
      </v-overlay>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { coreStore } from '@/stores/app'

  import L, { type TileLayer, type Map, type Marker } from 'leaflet'
  import 'leaflet/dist/leaflet.css'

  import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
  import iconUrl from 'leaflet/dist/images/marker-icon.png'
  import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

  import { uuidv4 } from '@/plugins/util'
  import { apiPostLocationTable } from '@/plugins/api/location'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { FilterComparator, FilterOperator, type ViewTableLocations, type ViewTableGermplasm } from '@/plugins/types/germinate'
  import { apiPostGermplasmTable } from '@/plugins/api/germplasm'
  import { getPrimaryColor } from '@/plugins/util/colors'
  import { jitter } from '@/plugins/util/geo'

  interface SelectedGermplasm {
    germplasm: ViewTableGermplasm
    marked: boolean
  }

  // Set the leaflet marker icon
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
  })

  const store = coreStore()

  // Refs
  const id = ref(uuidv4())
  const mapElement = useTemplateRef('mapElement')
  const popupContent = useTemplateRef('popupContent')
  const loading = ref<boolean>(false)
  const loadingProgress = ref<number>(0)
  const germplasmData = ref<ViewTableGermplasm[]>()
  const locationData = ref<ViewTableLocations[]>()

  const selectedLocation = ref<ViewTableLocations>()
  const selectedGermplasm = ref<SelectedGermplasm>()

  let themeLayer: TileLayer
  let map: Map
  const markers: Marker[] = []
  let locationMap: { [index: number]: ViewTableLocations } = {}

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
      // TODO?
    })

    L.control.layers(baseMaps).addTo(map)

    // Disable zoom until focus gained, disable when blur
    map.scrollWheelZoom.disable()
    map.on('focus', () => map.scrollWheelZoom.enable())
    map.on('blur', () => map.scrollWheelZoom.disable())
  }

  function updateMarkers () {
    if (!map) {
      return
    }

    // Remove existing markers
    if (markers) {
      markers.forEach(m => map.removeLayer(m))
    }
  }

  function getData () {
    loading.value = true
    apiPostLocationTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filters: [{
        operator: FilterOperator.and,
        filters: [{
          column: 'locationType',
          comparator: FilterComparator.equals,
          values: ['collectingsites'],
        }, {
          column: 'locationLatitude',
          comparator: FilterComparator.isNotNull,
          values: [],
        }, {
          column: 'locationLongitude',
          comparator: FilterComparator.isNotNull,
          values: [],
        }],
      }],
    }, result => {
      if (result && result.data && result.data.length > 0) {
        locationData.value = result.data
      } else {
        locationData.value = []
      }

      update()
    }).finally(() => {
      loading.value = false
    })

    apiPostGermplasmTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filters: [{
        operator: FilterOperator.and,
        filters: [{
          column: 'locationId',
          comparator: FilterComparator.isNotNull,
          values: [],
        }],
      }],
    }, result => {
      if (result && result.data && result.data.length > 0) {
        germplasmData.value = result.data
      } else {
        germplasmData.value = []
      }

      update()
    }).finally(() => {
      loading.value = false
    })
  }

  function invalidateSize () {
    nextTick(() => map.invalidateSize())
  }

  function update () {
    const gd = germplasmData.value
    const ld = locationData.value
    if (!gd || !ld) {
      return
    }

    locationMap = {}

    ld.forEach(l => {
      locationMap[l.locationId] = l
    })

    loading.value = true

    nextTick(() => {
      // Remove existing markers
      if (markers && markers.length > 0) {
        markers.forEach(m => map.removeLayer(m))
      }

      const tempMarkers = []
      const categoricalColorMapping = {}

      const bounds = L.latLngBounds([])

      gd.forEach(g => {
        const l = locationMap[g.locationId]

        if (l) {
          const color = getPrimaryColor()

          const latLng = jitter(l.locationLatitude || 0, l.locationLongitude || 0, 1, 6)

          bounds.extend([latLng.lat, latLng.lng])

          const marker = L.circleMarker([latLng.lat, latLng.lng], {
            fillColor: color,
            radius: 3,
            stroke: false,
            weight: 1,
            color: 'white',
            fillOpacity: 0.66,
          })
          // marker.bindPopup(l.locationName)
          // marker.on('mouseover', () => marker.openPopup())
          // marker.on('mouseout', () => marker.closePopup())
          marker.bindPopup('')
          marker.on('click', e => {
            const popup = e.target.getPopup()
            selectedLocation.value = l
            selectedGermplasm.value = {
              germplasm: g,
              marked: store.storeMarkedGermplasm.includes(g.germplasmId),
            }
            // Set the popup content on click
            nextTick(() => popup.setContent(popupContent.value))
          })
          tempMarkers.push(marker)
          marker.addTo(map)
        }
      })
    })
  }

  watch(() => selectedGermplasm.value?.marked, async newValue => {
    if (selectedGermplasm.value) {
      if (newValue) {
        store.addMarkedIds('germplasm', [selectedGermplasm.value.germplasm.germplasmId])
      } else {
        store.removeMarkedIds('germplasm', [selectedGermplasm.value.germplasm.germplasmId])
      }
    }
  })

  watch(() => store.storeIsDarkMode, async () => updateThemeLayer())

  onMounted(() => {
    initMap()

    getData()
  })

  defineExpose({
    invalidateSize,
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
</style>
