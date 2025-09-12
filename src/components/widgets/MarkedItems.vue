<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageMarkedItemsTitle') }}</h1>
    <v-divider class="mb-3" />

    <p>{{ $t('pageMarkedItemsText') }}</p>

    <v-chip-group
      v-model="localType"
      mandatory
      filter
    >
      <v-chip
        v-for="(value, key) in markedItemTypes"
        :key="`marked-item-type-chip-${key}`"
        label
        :text="`${value.text()}: ${(store.storeMarkedIds[key] || []).length}`"
        :color="value.color()"
        :prepend-icon="value.path"
        :value="key"
      />
    </v-chip-group>

    <GermplasmTable :get-data="getGermplasmData" :get-ids="getGermplasmIds" :download="downloadGermplasm" :filter-on="germplasmFilters" v-if="localType === 'germplasm'" />
    <LocationTable :get-data="getLocationData" :get-ids="getLocationIds" :download="downloadLocations" :filter-on="locationFilters" v-else-if="localType === 'locations'" />
    <MarkerTable :get-data="getMarkerData" :get-ids="getMarkerIds" :download="downloadMarkers" :filter-on="markerFilters" v-else-if="localType === 'markers'" />

    <template v-if="localType === 'germplasm' && store.serverSettings?.genesysAvailable">
      <v-btn class="my-5" color="info" :to="Pages.genesysRequest.path" prepend-icon="$genesys" :text="$t('buttonGoToGenesysOrdering')" />
    </template>
  </v-container>
</template>

<script setup lang="ts">
  import { apiPostMarkerTable, apiPostMarkerTableIds } from '@/plugins/api/genotype'
  import { apiPostGermplasmTable, apiPostGermplasmTableIds } from '@/plugins/api/germplasm'
  import { apiPostLocationTable, apiPostLocationTableIds } from '@/plugins/api/location'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest } from '@/plugins/types/germinate'
  import type { MarkedItemType } from '@/plugins/types/MarkedItemType'
  import { markedItemTypes } from '@/plugins/util/types'
  import { coreStore } from '@/stores/app'

  const compProps = defineProps<{
    type?: MarkedItemType
  }>()

  const store = coreStore()
  const localType = ref<MarkedItemType>('germplasm')

  const germplasmFilters: ComputedRef<FilterGroup[]> = computed(() => {
    return [{
      filters: [{
        column: 'germplasmId',
        comparator: FilterComparator.inSet,
        values: store.storeMarkedGermplasm.map(String),
        canBeChanged: false,
      }],
      operator: FilterOperator.and,
    }]
  })

  const markerFilters: ComputedRef<FilterGroup[]> = computed(() => {
    return [{
      filters: [{
        column: 'markerId',
        comparator: FilterComparator.inSet,
        values: store.storeMarkedMarkers.map(String),
        canBeChanged: false,
      }],
      operator: FilterOperator.and,
    }]
  })

  const locationFilters: ComputedRef<FilterGroup[]> = computed(() => {
    return [{
      filters: [{
        column: 'locationId',
        comparator: FilterComparator.inSet,
        values: store.storeMarkedLocations.map(String),
        canBeChanged: false,
      }],
      operator: FilterOperator.and,
    }]
  })

  function getGermplasmData (data: PaginatedRequest) {
    return apiPostGermplasmTable(data)
  }
  function getGermplasmIds (data: PaginatedRequest) {
    return apiPostGermplasmTableIds(data)
  }
  function downloadGermplasm (data: PaginatedRequest) {
    return apiPostTableExport({ filters: data.filters }, 'germplasm')
  }
  function getMarkerData (data: PaginatedRequest) {
    return apiPostMarkerTable(data)
  }
  function getMarkerIds (data: PaginatedRequest) {
    return apiPostMarkerTableIds(data)
  }
  function downloadMarkers (data: PaginatedRequest) {
    return apiPostTableExport({ filters: data.filters }, 'marker')
  }
  function getLocationData (data: PaginatedRequest) {
    return apiPostLocationTable(data)
  }
  function getLocationIds (data: PaginatedRequest) {
    return apiPostLocationTableIds(data)
  }
  function downloadLocations (data: PaginatedRequest) {
    return apiPostTableExport({ filters: data.filters }, 'location')
  }

  watch(() => compProps.type, async (newValue: MarkedItemType | undefined) => {
    if (newValue) {
      localType.value = newValue
    }
  })

  onMounted(() => {
    if (compProps.type) {
      localType.value = compProps.type
    }
  })
</script>
