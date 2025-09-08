<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageLocationsTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageLocationsText')" />

    <!-- All locations in a table -->
    <LocationTable :get-data="getData" :get-ids="getIds" :download="downloadTable" @data-changed="onDataChanged" />

    <h2 class="text-h5 my-3">{{ $t('pageLocationsMapsTitle') }}</h2>
    <p class="text-info">{{ $t('pageLocationsMapsText') }}</p>

    <v-row v-if="locationsWithLatLng && locationsWithLatLng.length > 0">
      <v-col cols="12" xl="6">
        <h3>{{ $t('pageLocationsMapsClusteredTitle') }}</h3>
        <p>{{ $t('pageLocationsMapsClusteredText') }}</p>
        <!-- Clustered location map -->
        <LocationMap :locations="locationsWithLatLng" map-type="cluster" class="mb-3" @map-loaded="map => { clusteredMap = map }" />
      </v-col>
      <v-col cols="12" xl="6">
        <h3>{{ $t('pageLocationsMapsHeatmappedTitle') }}</h3>
        <p>{{ $t('pageLocationsMapsHeatmappedText') }}</p>
        <!-- Heatmapped location map -->
        <LocationMap :locations="locationsWithLatLng" map-type="heatmap" class="mb-3" @map-loaded="map => { heatmappedMap = map }" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import LocationMap from '@/components/map/LocationMap.vue'
  import LocationTable from '@/components/tables/LocationTable.vue'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostLocationTable, apiPostLocationTableIds } from '@/plugins/api/location'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import type { ViewTableLocations, PaginatedResult, PaginatedRequest } from '@/plugins/types/germinate'

  const clusteredMap = ref()
  const heatmappedMap = ref()
  const locations = ref<ViewTableLocations[]>([])
  let synced = false

  const locationsWithLatLng = computed(() => {
    if (locations.value) {
      return locations.value.filter(l => l.locationLatitude !== undefined && l.locationLatitude !== null && l.locationLongitude !== undefined && l.locationLongitude !== null)
    } else {
      return []
    }
  })

  function getData (data: PaginatedRequest) {
    return apiPostLocationTable(data)
  }
  function getIds (data: PaginatedRequest) {
    return apiPostLocationTableIds(data)
  }
  function downloadTable(data: PaginatedRequest) {
    return apiPostTableExport({ filters: data.filters }, 'location')
  }

  function onDataChanged (request: PaginatedRequest) {
    // If something changed, we're going to only show the locations in the table on the map
    // Create a custom request based on the one from the table, but change limit and page to get all the locations
    const customRequest = Object.assign({}, request)
    customRequest.limit = MAX_JAVA_INTEGER
    customRequest.page = 1
    apiPostLocationTable(customRequest, (result: PaginatedResult<ViewTableLocations[]>) => {
      locations.value = result.data
    })
  }

  watchEffect(() => {
    // Synchronize the maps
    if (synced === false && clusteredMap.value && heatmappedMap.value) {
      synced = true
      clusteredMap.value.sync(heatmappedMap.value)
      heatmappedMap.value.sync(clusteredMap.value)
    }
  })
</script>
