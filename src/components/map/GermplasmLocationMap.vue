<template>
  <div>
    <GermplasmMapHighlightSelection v-model="userSelection" />

    <v-toolbar density="comfortable" color="surface" v-if="polygonSelectedGermplasm.length > 0">
      <v-spacer />
      <v-menu>
        <template #activator="{ props }">
          <v-badge location="bottom left" color="info" :content="getNumberWithSuffix(polygonSelectedGermplasm.length, 1)" :offset-x="10" :offset-y="10">
            <v-btn v-bind="props" :icon="mdiDotsVertical" />
          </v-badge>
        </template>

        <v-list>
          <v-list-item :prepend-icon="mdiCheckboxMarked" @click="toggleItems(true)">{{ $t('widgetChartMarkSelectedItems') }}</v-list-item>
          <v-list-item :prepend-icon="mdiCheckboxBlankOutline" @click="toggleItems(false)">{{ $t('widgetChartUnmarkSelectedItems') }}</v-list-item>
        </v-list>
      </v-menu>
      <slot name="toolbar-append" />
    </v-toolbar>

    <div :id="`map-${id}`" ref="mapElement" class="location-map map">
      <div ref="legend" :class="`legend leaflet-control-layers leaflet-control pa-2 d-flex flex-column ga-2 ${hasLegendItems ? '' : 'd-none'}`">
        <div
          v-for="legendItem in legendItems"
          :key="`legend-item-${legendItem.text}`"
        >
          <v-icon :icon="mdiCircle" :color="legendItem.color" /> <span :class="legendItem.clazz">{{ legendItem.text }}</span>
        </div>
      </div>

      <div ref="popupContent" class="popup-content">
        <LocationPopup
          :location="selectedLocation"
          show-links
          v-if="selectedLocation"
        >
          <template #prepend v-if="selectedGermplasm">
            <v-list-item
              class="text-wrap"
              base-color="primary"
              :title="$t('tableColumnGermplasmName')"
              :subtitle="selectedGermplasm.germplasm.germplasmDisplayName"
            >
              <template #append>
                <v-checkbox-btn v-model="selectedGermplasm.marked" v-tooltip:top="$t('tooltipGermplasmMarkedItem')" />
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

    <ColorGradient v-bind="gradientProps" v-if="gradientProps" />
  </div>
</template>

<script lang="ts" setup>
  import { coreStore } from '@/stores/app'

  import L, { type TileLayer, type Map, type CircleMarker, type FeatureGroup, type Polygon, type LatLng } from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import 'leaflet-draw'
  import 'leaflet-draw/dist/leaflet.draw.css'

  import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon'
  import { polygon } from '@turf/helpers'

  import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
  import iconUrl from 'leaflet/dist/images/marker-icon.png'
  import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

  import { mcpdDateToJsDate, uuidv4 } from '@/plugins/util'
  import { apiPostLocationTable } from '@/plugins/api/location'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { FilterComparator, FilterOperator, type ViewTableLocations, type ViewTableGermplasm } from '@/plugins/types/germinate'
  import { apiPostGermplasmTable } from '@/plugins/api/germplasm'
  import { createMultiColorGradient, getColor, getGradientColor, getPrimaryColor, GRADIENT_VIRIDIS } from '@/plugins/util/colors'
  import { jitter } from '@/plugins/util/geo'
  import { useI18n } from 'vue-i18n'
  import type { UserSelection } from '@/components/widgets/selections/GermplasmMapHighlightSelection.vue'
  import { concat, getNumberWithSuffix } from '@/plugins/util/formatting'
  import ColorGradient, { type ColorGradientProps } from '@/components/widgets/ColorGradient.vue'
  import { mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiCircle, mdiDotsVertical } from '@mdi/js'

  interface HighlightConfig {
    format: (g: number | string | undefined) => string
    value: (g: ViewTableGermplasm) => string | number | undefined
    type: 'text' | 'number' | 'date'
    title: string
    clazz?: string
  }

  interface SelectedGermplasm {
    germplasm: ViewTableGermplasm
    marked: boolean
  }

  interface LegendItem {
    color: string
    text: string
    clazz?: string
  }
  type ColorMap = { [index: string]: LegendItem }

  const hasLegendItems = computed(() => legendItems.value && legendItems.value.length > 0)

  const highlightConfigMap: ComputedRef<{ [index: string]: HighlightConfig }> = computed(() => {
    return {
      colldate: {
        format: (g: number | string | undefined) => g !== undefined ? new Date(g).toLocaleDateString() : '',
        value: (g: ViewTableGermplasm) => (g.collDate !== undefined && g.collDate !== null) ? (mcpdDateToJsDate(g.collDate)?.getTime() || undefined) : undefined,
        type: 'date',
        title: t('tableColumnColldate'),
      },
      elevation: {
        format: (g: number | string | undefined) => g !== undefined ? getNumberWithSuffix(+g, 1) : '',
        value: (g: ViewTableGermplasm) => (g.elevation !== undefined && g.elevation !== null) ? g.elevation : undefined,
        type: 'number',
        title: t('tableColumnElevation'),
      },
      pdci: {
        format: (g: number | string | undefined) => g !== undefined ? getNumberWithSuffix(+g, 1) : '',
        value: (g: ViewTableGermplasm) => (g.pdci !== undefined && g.pdci !== null) ? g.pdci : undefined,
        type: 'number',
        title: t('tableColumnPdci'),
      },
      taxonomy: {
        format: (g: number | string | undefined) => g !== undefined ? `${g}` : '',
        value: (g: ViewTableGermplasm) => concat(' ', [g.genus, g.species, g.subtaxa]),
        type: 'text',
        title: t('tableColumnTaxonomy'),
        clazz: 'font-italic',
      },
      biologicalstatus: {
        format: (g: number | string | undefined) => g !== undefined ? `${g}` : '',
        value: (g: ViewTableGermplasm) => g.biologicalStatusName,
        type: 'text',
        title: t('tableColumnBiologicalStatus'),
      },
      country: {
        format: (g: number | string | undefined) => g !== undefined ? `${g}` : '',
        value: (g: ViewTableGermplasm) => g.countryName,
        type: 'text',
        title: t('tableColumnCountryName'),
      },
    }
  })

  // Set the leaflet marker icon
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
  })

  const store = coreStore()
  const { t } = useI18n()

  // Refs
  const id = ref(uuidv4())
  const mapElement = useTemplateRef('mapElement')
  const popupContent = useTemplateRef('popupContent')
  const legend = useTemplateRef('legend')
  const loading = ref<boolean>(false)
  const loadingProgress = ref<number>(0)
  const germplasmData = ref<ViewTableGermplasm[]>()
  const locationData = ref<ViewTableLocations[]>()

  const selectedLocation = ref<ViewTableLocations>()
  const selectedGermplasm = ref<SelectedGermplasm>()
  const userSelection = ref<UserSelection>()

  const gradientProps = ref<ColorGradientProps>()
  const legendItems = ref<LegendItem[]>([])

  const editableLayers = ref<FeatureGroup>()

  let themeLayer: TileLayer
  let map: Map
  const markers: CircleMarker[] = []
  let locationMap: { [index: number]: ViewTableLocations } = {}

  const polygonSelectedGermplasm = computed(() => {
    const layers = editableLayers.value?.getLayers()

    if (layers) {
      const ids = new Set<number>()
      layers.forEach(layer => {
        const layerAsPoly = layer as Polygon
        const individualPoly: LatLng[] = layerAsPoly.getLatLngs()[0] as LatLng[]
        const points: number[][] = individualPoly.map(ll => [ll.lat, ll.lng])
        points.push(points[0])
        const poly = polygon([points], { name: 'test' })

        germplasmData.value?.filter(g => booleanPointInPolygon([g.latitude, g.longitude], poly)).forEach(g => ids.add(g.germplasmId))
      })

      return [...ids]
    } else {
      return []
    }
  })

  function updateThemeLayer () {
    if (themeLayer) {
      themeLayer.setUrl(`//services.arcgisonline.com/arcgis/rest/services/Canvas/${store.storeIsDarkMode ? 'World_Dark_Gray_Base' : 'World_Light_Gray_Base'}/MapServer/tile/{z}/{y}/{x}`)
    }
  }

  function toggleItems (add: boolean) {
    if (add === true) {
      store.addMarkedIds('germplasm', polygonSelectedGermplasm.value)
    } else {
      store.removeMarkedIds('germplasm', polygonSelectedGermplasm.value)
    }

    // Delete polygons once items have been marked or unmarked
    editableLayers.value?.clearLayers()
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

    editableLayers.value = new L.FeatureGroup()
    map.addLayer(editableLayers.value)

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
        featureGroup: editableLayers.value,
        remove: true,
      },
    }

    // @ts-ignore
    const result = new L.Control.Draw(options)
    map.addControl(result)

    // @ts-ignore
    map.on(L.Draw.Event.CREATED, e => editableLayers.value.addLayer(e.layer))

    map.on('click', e => {
      // TODO?
    })

    const LegendElement = L.Control.extend({
      options: { position: 'bottomleft' },
      onAdd: () => {
        if (legend.value) {
          L.DomEvent.disableClickPropagation(legend.value)
          L.DomEvent.disableScrollPropagation(legend.value)

          return legend.value
        }
      },
    })
    map.addControl(new LegendElement())

    L.control.layers(baseMaps).addTo(map)

    // Disable zoom until focus gained, disable when blur
    map.scrollWheelZoom.disable()
    map.on('focus', () => map.scrollWheelZoom.enable())
    map.on('blur', () => map.scrollWheelZoom.disable())
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

    legendItems.value = []

    nextTick(() => {
      // Remove existing markers
      if (markers && markers.length > 0) {
        markers.forEach(m => map.removeLayer(m))
      }

      // const tempMarkers = []
      // const categoricalColorMapping = {}
      let min = Number.MAX_VALUE
      let max = -Number.MAX_VALUE

      const hm = userSelection.value && userSelection.value.type ? highlightConfigMap.value[userSelection.value.type] : undefined
      const gradient = hm ? createMultiColorGradient(store.storeServerSettings?.colorsGradient || GRADIENT_VIRIDIS, 100) : undefined

      if (userSelection.value?.type === 'pdci') {
        min = 0
        max = 10
      } else if (hm && hm.type !== 'text') {
        gd.forEach(g => {
          const value = hm.value(g) as number | undefined

          if (value !== undefined) {
            min = Math.min(min, value)
            max = Math.max(max, value)
          }
        })
      }

      gradientProps.value = hm && hm.type !== 'text'
        ? {
          min,
          max,
          formatMinMax: hm?.format,
        }
        : undefined

      const bounds = L.latLngBounds([])

      const tempMap: ColorMap = {}

      userSelection.value?.selectedItems.forEach((si, i) => {
        tempMap[si] = {
          color: getColor(i),
          text: si,
          clazz: hm?.clazz,
        }
      })

      gd.forEach(g => {
        const l = locationMap[g.locationId]

        if (l) {
          let color = (hm && gradient) ? 'grey' : getPrimaryColor()
          let formattedValue = undefined

          if (hm) {
            switch (hm.type) {
              case 'text':
                const value = hm.value(g) as string | undefined
                if (value !== undefined) {
                  formattedValue = hm.format(value)

                  const selected = userSelection.value?.selectedItems.includes(formattedValue)

                  if (selected && tempMap) {
                    const legendItem = tempMap[formattedValue]

                    if (!legendItem) {
                      color = getColor(Object.keys(tempMap).length)
                      tempMap[formattedValue] = {
                        color: color,
                        text: formattedValue,
                        clazz: hm.clazz,
                      }
                    } else {
                      color = legendItem.color
                    }
                  }
                }

                break
              case 'number':
              case 'date':
                if (gradient) {
                  const value = hm.value(g) as number | undefined
                  if (value !== undefined) {
                    formattedValue = hm.format(value)
                    color = getGradientColor(gradient, min, max, value)
                  }
                }
                break
            }
          }

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
          let tooltip = g.germplasmDisplayName
          if (hm && formattedValue !== undefined) {
            tooltip += `<br />${hm.title}: ${formattedValue}`
          }
          tooltip += `<br /><span class="text-medium-emphasis">${t('widgetMapClickForDetails')}</span>`
          marker.bindTooltip(tooltip)
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
          // tempMarkers.push(marker)
          markers.push(marker)
          marker.addTo(map)
        }
      })

      userSelection.value?.selectedItems.forEach(si => {
        if (tempMap[si]) {
          legendItems.value.push(tempMap[si])
        }
      })
    })

    loading.value = false
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
  watch(userSelection, async () => update(), { deep: true })

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

.map .legend {
  max-height: 25vh;
  overflow-y: auto;
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

.location-map .legend.d-none {
  display: none !important;
}
</style>
