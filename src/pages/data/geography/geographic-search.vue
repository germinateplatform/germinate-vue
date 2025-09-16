<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageGeographicSearchTitle') }}</h1>
    <v-divider class="mb-3" />

    <v-card>
      <v-tabs
        v-model="tab"
        bg-color="primary"
        class="position-relative"
        fixed-tabs
        grow
      >
        <v-tab :value="1" prepend-icon="mdi-crosshairs-gps">{{ $t('pageGeographicSearchPointSearchTitle') }}</v-tab>
        <v-tab :value="2" prepend-icon="mdi-vector-polygon">{{ $t('pageGeographicSearchPolygonSearchTitle') }}</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item eager :transition="false" :reverse-transition="false" :value="1">
          <!-- Point search map -->
          <LocationMap :locations="[]" :rounded="false" selection-mode="point" ref="pointMap" />
        </v-tabs-window-item>

        <v-tabs-window-item eager :transition="false" :reverse-transition="false" :value="2">
          <!-- Point search map -->
          <LocationMap :locations="polygonLocations || []" map-type="cluster" :rounded="false" selection-mode="polygon" ref="polygonMap" />
        </v-tabs-window-item>
      </v-tabs-window>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="tonal" @click="run" prepend-icon="mdi-arrow-right-box" :text="$t('pageGeographicSearchButtonRun')" />
      </v-card-actions>
    </v-card>

    <v-card class="mt-5">
      <v-tabs-window v-model="tab">
        <v-tabs-window-item :transition="false" :reverse-transition="false" :value="1">
          <GermplasmTable :get-data="getGermplasmData" :get-ids="getGermplasmIds" v-if="point" :sort-by="[{ key: 'distance', order: 'asc' }]" table-mode="distance">
            <template #card-text>
              <v-card-text>{{ $t('pageGeographicSearchPointGermplasmResultTitle') }}</v-card-text>
            </template>
          </GermplasmTable>
          <LocationTable class="mt-5" :get-data="getLocationData" :get-ids="getLocationIds" v-if="point" :sort-by="[{ key: 'distance', order: 'asc' }]" table-mode="distance">
            <template #card-text>
              <v-card-text>{{ $t('pageGeographicSearchPointLocationResultTitle') }}</v-card-text>
            </template>
          </LocationTable>
        </v-tabs-window-item>
        <v-tabs-window-item eager :transition="false" :reverse-transition="false" :value="2">
          <GermplasmTable :get-data="getGermplasmData" :get-ids="getGermplasmIds" v-if="polygons && polygons.length > 0">
            <template #card-text>
              <v-card-text>{{ $t('pageGeographicSearchPolygonGermplasmResultTitle') }}</v-card-text>
            </template>
          </GermplasmTable>
          <LocationTable class="mt-5" :get-data="getLocationData" :get-ids="getLocationIds" v-if="polygons && polygons.length > 0">
            <template #card-text>
              <v-card-text>{{ $t('pageGeographicSearchPolygonLocationResultTitle') }}</v-card-text>
            </template>
          </LocationTable>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import LocationMap from '@/components/map/LocationMap.vue'
  import LocationTable from '@/components/tables/LocationTable.vue'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostGermplasmDistanceTable, apiPostGermplasmDistanceTableIds, apiPostGermplasmPolygonTable, apiPostGermplasmPolygonTableIds } from '@/plugins/api/germplasm'
  import { apiPostLocationDistanceTable, apiPostLocationDistanceTableIds, apiPostLocationPolygonTable, apiPostLocationPolygonTableIds } from '@/plugins/api/location'
  import type { PaginatedResult, ViewTableLocations, LatLng, PaginatedLocationRequest, PaginatedPolygonRequest, PaginatedRequest } from '@/plugins/types/germinate'

  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const tab = ref(1)
  const pointMap = useTemplateRef('pointMap')
  const polygonMap = useTemplateRef('polygonMap')
  const point = ref<LatLng>()
  const polygons = ref<LatLng[][]>()
  const polygonLocations = ref<ViewTableLocations[]>([])

  watch(tab, async (newValue: number) => {
    if (newValue === 1) {
      nextTick(() => pointMap.value?.invalidateSize())
    } else if (newValue === 2) {
      nextTick(() => polygonMap.value?.invalidateSize())
    }
  })

  function getGermplasmData (data: PaginatedRequest) {
    if (tab.value === 1) {
      const request = data as PaginatedLocationRequest
      if (point.value) {
        request.latitude = point.value.lat
        request.longitude = point.value.lng
      }

      return apiPostGermplasmDistanceTable(request)
    } else {
      const request = data as PaginatedPolygonRequest
      if (polygons.value && polygons.value.length > 0) {
        request.polygons = polygons.value
      }

      return apiPostGermplasmPolygonTable(request)
    }
  }

  function getGermplasmIds (data: PaginatedRequest) {
    if (tab.value === 1) {
      const request = data as PaginatedLocationRequest
      if (point.value) {
        request.latitude = point.value.lat
        request.longitude = point.value.lng
      }

      return apiPostGermplasmDistanceTableIds(request)
    } else {
      const request = data as PaginatedPolygonRequest
      if (polygons.value && polygons.value.length > 0) {
        request.polygons = polygons.value
      }

      return apiPostGermplasmPolygonTableIds(request)
    }
  }

  function getLocationData (data: PaginatedRequest) {
    if (tab.value === 1) {
      const request = data as PaginatedLocationRequest
      if (point.value) {
        request.latitude = point.value.lat
        request.longitude = point.value.lng
      }

      return apiPostLocationDistanceTable(request)
    } else {
      const request = data as PaginatedPolygonRequest
      if (polygons.value && polygons.value.length > 0) {
        request.polygons = polygons.value
      }

      // Get all locations within the polygon to draw them on the map
      const allData = JSON.parse(JSON.stringify(data))
      allData.page = 1
      allData.limit = MAX_JAVA_INTEGER
      apiPostLocationPolygonTable<PaginatedResult<ViewTableLocations[]>>(allData, result => {
        polygonLocations.value = result.data
      })

      return apiPostLocationPolygonTable(request)
    }
  }

  function getLocationIds (data: PaginatedRequest) {
    if (tab.value === 1) {
      const request = data as PaginatedLocationRequest
      if (point.value) {
        request.latitude = point.value.lat
        request.longitude = point.value.lng
      }

      return apiPostLocationDistanceTableIds(request)
    } else {
      const request = data as PaginatedPolygonRequest
      if (polygons.value && polygons.value.length > 0) {
        request.polygons = polygons.value
      }

      return apiPostLocationPolygonTableIds(request)
    }
  }

  function run () {
    if (tab.value === 1) {
      const latlngs = pointMap.value?.getLatLngs()

      if (latlngs && latlngs.length > 0) {
        point.value = {
          lat: latlngs[0].lat,
          lng: latlngs[0].lng,
        }
      } else {
        point.value = undefined

        // Show toast
        emitter.emit('show-snackbar', {
          text: t('toastGeographicSearchSelectPointText'),
          color: 'warning',
        })
      }
    } else if (tab.value === 2) {
      const ps = polygonMap.value?.getPolygons()

      if (ps && ps.length > 0) {
        polygons.value = ps
      } else {
        polygons.value = undefined
        polygonLocations.value = []

        // Show toast
        emitter.emit('show-snackbar', {
          text: t('toastGeographicSearchSelectPolygonText'),
          color: 'warning',
        })
      }
    }
  }
</script>
