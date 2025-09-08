<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageDatasetsTitle') }}</h1>
    <v-divider class="mb-3" />
    <h2>{{ $t('pageDatasetsInternalTitle') }}</h2>
    <p>{{ $t('pageDatasetsInternalText') }}</p>
    <DatasetTable :get-data="getData" :filter-on="filterOnInternal" />

    <h2>{{ $t('pageDatasetsExternalTitle') }}</h2>
    <p>{{ $t('pageDatasetsExternalText') }}</p>
    <DatasetTable :get-data="getData" :filter-on="filterOnExternal" />
  </v-container>
</template>

<script setup lang="ts">
  import DatasetTable from '@/components/tables/DatasetTable.vue'
  import { apiPostDatasetTable } from '@/plugins/api/dataset'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest } from '@/plugins/types/germinate'
  import { coreStore } from '@/stores/app'

  const props = defineProps<{
    datasetId?: number
  }>()

  const store = coreStore()

  const filterOnInternal: ComputedRef<FilterGroup[]> = computed(() => getFilter(false))
  const filterOnExternal: ComputedRef<FilterGroup[]> = computed(() => getFilter(true))

  function getFilter (isExternal: boolean) {
    const result: FilterGroup[] = [{
      filters: [{
        column: 'isExternal',
        comparator: FilterComparator.equals,
        values: [isExternal === true ? '1' : '0'],
        canBeChanged: false,
      }],
      operator: FilterOperator.and,
    }]

    if (props.datasetId) {
      result.push({
        filters: [{
          column: 'datasetId',
          comparator: FilterComparator.equals,
          values: [`${props.datasetId}`],
        }],
        operator: FilterOperator.and,
      })
    }

    if (store.storeSelectedProjects && store.storeSelectedProjects.length > 0) {
      result[0].filters?.push({
        column: 'projectId',
        comparator: FilterComparator.inSet,
        values: store.storeSelectedProjects.map(id => `${id}`),
        canBeChanged: false,
      })
    }

    return result
  }

  function getData (data: PaginatedRequest) {
    return apiPostDatasetTable(data)
  }
</script>
