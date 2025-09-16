<template>
  <v-container fluid v-if="marker">
    <h1 class="text-h4 my-3 d-flex justify-space-between align-center">
      <span>{{ $t('pageMarkerDetailsTitle') }} - <small>{{ marker.markerName }}</small> - <v-chip label prepend-icon="mdi-label-variant" :text="marker.markerType" /></span>
      <v-chip label v-tooltip:top="$t('tooltipMarkerMarkedItem')" @click="markItem" :color="isMarked ? 'primary' : undefined">
        <v-icon :icon="isMarked ? 'mdi-bookmark-check' : 'mdi-bookmark-outline'" />
      </v-chip>
    </h1>
    <v-divider class="mb-3" />
    <p>{{ $t('pageMarkerDetailsText') }}</p>

    <template v-if="marker.markerSynonyms && marker.markerSynonyms.length > 0">
      <h3>{{ $t('pageMarkerDetailsSynonymsTitle') }}</h3>
      <v-chip
        label
        v-for="(synonym, index) in marker.markerSynonyms"
        :key="`marker-synonym-${index}`"
        prepend-icon="mdi-label"
        :text="synonym"
        class="me-2"
      />
    </template>

    <!-- Datasets this marker is part of -->
    <DatasetTable class="mt-5" :get-data="getDatasetData">
      <template #card-text>
        <v-card-text>
          {{ $t('pageMarkerDetailsDatasetsText') }}
        </v-card-text>
      </template>
    </DatasetTable>

    <!-- Maps this marker is on -->
    <MapDefinitionTable class="mt-5" :get-data="getMapdefinitionData" :filter-on="mapdefinitionFilter" :get-ids="getMapdefinitionIds" :header-title="$t('pageMarkerDetailsMapsTitle')">
      <template #card-text>
        <v-card-text>
          {{ $t('pageMarkerDetailsMapsText') }}
        </v-card-text>
      </template>
    </MapDefinitionTable>

    <!-- Groups this marker is in -->
    <GroupTable class="mt-5" :get-data="getGroupData">
      <template #card-text>
        <v-card-text>
          {{ $t('pageMarkerDetailsGroupsText') }}
        </v-card-text>
      </template>
    </GroupTable>
  </v-container>
</template>

<script setup lang="ts">
  import DatasetTable from '@/components/tables/DatasetTable.vue'
  import GroupTable from '@/components/tables/GroupTable.vue'
  import MapDefinitionTable from '@/components/tables/MapDefinitionTable.vue'
  import { apiPostMapdefinitionTable, apiPostMapdefinitionTableIds, apiPostMarkerDatasetTable, apiPostMarkerGroupTable, apiPostMarkerTable } from '@/plugins/api/genotype'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest, type PaginatedResult, type ViewTableMarkers } from '@/plugins/types/germinate'
  import { coreStore } from '@/stores/app'

  const route = useRoute('/data/genotypes/markers/[id]')
  const store = coreStore()

  const marker = ref<ViewTableMarkers>()
  const markerId = ref<number>()

  const isMarked = computed(() => markerId.value ? store.storeMarkedMarkers.includes(markerId.value) : false)

  const mapdefinitionFilter: ComputedRef<FilterGroup[]> = computed(() => {
    return [{
      filters: [{
        column: 'markerId',
        comparator: FilterComparator.equals,
        values: [`${markerId.value}`],
        canBeChanged: false,
      }],
      operator: FilterOperator.and,
    }]
  })

  function markItem () {
    if (markerId.value) {
      if (isMarked.value) {
        store.removeMarkedIds('markers', [markerId.value])
      } else {
        store.addMarkedIds('markers', [markerId.value])
      }
    }
  }

  function getDatasetData (data: PaginatedRequest) {
    return apiPostMarkerDatasetTable(markerId.value || -1, data)
  }
  function getMapdefinitionData (data: PaginatedRequest) {
    return apiPostMapdefinitionTable(data)
  }
  function getMapdefinitionIds (data: PaginatedRequest) {
    return apiPostMapdefinitionTableIds(data)
  }
  function getGroupData (data: PaginatedRequest) {
    return apiPostMarkerGroupTable(markerId.value || -1, data)
  }

  onMounted(() => {
    if (route.params && route.params.id) {
      markerId.value = +route.params.id

      apiPostMarkerTable<PaginatedResult<ViewTableMarkers[]>>({
        limit: 1,
        page: 1,
        filters: [{
          filters: [{
            column: 'markerId',
            comparator: FilterComparator.equals,
            values: [`${markerId.value}`],
          }],
          operator: FilterOperator.and,
        }],
      }, result => {
        if (result && result.data && result.data.length > 0) {
          marker.value = result.data[0]
        }
      })
    }
  })
</script>
