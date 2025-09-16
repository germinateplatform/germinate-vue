<template>
  <v-container fluid v-if="map">
    <h1 class="text-h4 mb-3">{{ $t('pageMapsDetailsTitle') }} <small>{{ map.mapName }}</small></h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageMapsDetailsText')" />

    <MapDefinitionTable :filter-on="filter" :get-data="getData" :get-ids="getIds" ref="mapDefinitionTable" />

    <!-- Map chromosome histogram -->
    <MapChart class="mt-5" :map-id="mapId" ref="mapChart" @points-selected="onPointsSelected" @selection-cleared="onSelectionCleared" />
  </v-container>
</template>

<script setup lang="ts">
  import MapChart from '@/components/charts/MapChart.vue'
  import MapDefinitionTable from '@/components/tables/MapDefinitionTable.vue'
  import { apiPostMapdefinitionTable, apiPostMapdefinitionTableIds, apiPostMapsTable } from '@/plugins/api/genotype'
  import { FilterComparator, FilterOperator, type PaginatedResult, type PaginatedRequest, type ViewTableMaps, type FilterGroup } from '@/plugins/types/germinate'

  const route = useRoute('/data/genotypes/maps/[id]')

  interface MapSelection {
    chromosome: string
    start: number
    end: number
  }

  const mapId = ref()
  const map = ref<ViewTableMaps>()
  const selections = ref<MapSelection[]>([])
  const filter = ref<FilterGroup[]>([])

  const mapDefinitionTable = useTemplateRef('mapDefinitionTable')

  function getData (data: PaginatedRequest) {
    const fs: FilterGroup[] = [{
      filterGroups: [{
        filters: [{
          column: 'mapId',
          comparator: FilterComparator.equals,
          values: [`${mapId.value}`],
        }],
        operator: FilterOperator.and,
      }],
      operator: FilterOperator.and,
    }]

    if (data.filters) {
      data.filters.forEach(fg => {
        fs[0].filterGroups?.push(fg)
      })
    }

    const copy = JSON.parse(JSON.stringify(data))
    copy.filters = fs
    return apiPostMapdefinitionTable(copy)
  }

  function getIds (data: PaginatedRequest) {
    const fs: FilterGroup[] = [{
      filterGroups: [{
        filters: [{
          column: 'mapId',
          comparator: FilterComparator.equals,
          values: [`${mapId.value}`],
        }],
        operator: FilterOperator.and,
      }],
      operator: FilterOperator.and,
    }]

    if (data.filters) {
      data.filters.forEach(fg => {
        fs[0].filterGroups?.push(fg)
      })
    }

    const copy = JSON.parse(JSON.stringify(data))
    copy.filters = fs
    return apiPostMapdefinitionTableIds(copy)
  }

  function onSelectionCleared () {
    selections.value = []
    filter.value = []

    mapDefinitionTable.value?.refresh(true)
  }

  function onPointsSelected (chromosome: string, start: number, end: number) {
    selections.value.push({
      chromosome,
      start,
      end,
    })

    if (selections.value && selections.value.length > 0) {
      mapDefinitionTable.value?.setOverallOperator(FilterOperator.or)
      filter.value = selections.value.map(s => {
        return {
          filters: [{
            column: 'chromosome',
            comparator: FilterComparator.equals,
            values: [s.chromosome],
          }, {
            column: 'position',
            comparator: FilterComparator.between,
            values: [`${s.start}`, `${s.end}`],
          }],
          operator: FilterOperator.and,
        }
      })
    } else {
      filter.value = []
    }

    mapDefinitionTable.value?.refresh(true)
  }

  function updateMap () {
    apiPostMapsTable<PaginatedResult<ViewTableMaps[]>>({
      page: 1,
      limit: 1,
      filters: [{
        filters: [{
          column: 'mapId',
          comparator: FilterComparator.equals,
          values: [`${mapId.value}`],
        }],
        operator: FilterOperator.and,
      }],
    }, result => {
      if (result && result.data && result.data.length > 0) {
        map.value = result.data[0]
      }
    })
  }

  onMounted(() => {
    if (route.params && route.params.id) {
      mapId.value = +route.params.id

      updateMap()
    }
  })
</script>
