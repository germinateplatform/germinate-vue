<template>
  <div v-if="localClimate">
    {{ localClimate }}

    <!-- <VariableDetails :variable-id="localClimate.climateId" /> -->

    <Images class="mt-3" :filter-on="imageFilter" @data-changed="setImageVisibility" v-if="imagesVisible" />

    <ClimateDataTable
      class="mt-5"
      :get-data="getClimateData"
      :get-ids="getClimateIds"
      :download="downloadTable"
      ref="climateDataTable"
    />

    <DatasetTable
      class="mt-5"
      :get-data="getDatasetData"
      @license-accepted="update"
    />

    <v-expansion-panels class="mt-5">
      <v-expansion-panel>
        <template #title>
          <v-icon :icon="mdiChartTimeline" class="me-2" /> {{ $t('pageClimateDetailsStatsTitle') }}
        </template>
        <template #text v-if="localClimate && (climateData || (catChartData && catChartData.size > 0))">
          <p>{{ $t('pageClimateDetailsStatsText') }}</p>

          <ClimateStatsChart
            :datasets="datasets || []"
            :climates="[localClimate]"
            :groups="groups"
            :cat-chart-data="catChartData"
            :climate-data="climateData || []"
            ref="traitStatsChart"
          />
        </template>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostClimateDatasetTable, apiPostClimateDataTable, apiPostClimateDataTableIds, apiPostClimateTable } from '@/plugins/api/climate'
  import { apiPostClimateStatsCategorical, apiPostDatasetTable } from '@/plugins/api/dataset'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import { FilterComparator, FilterOperator, type ViewTableDatasets, type PaginatedRequest, type UnacceptedLicenseRequest, type ViewTableClimates, type ClimateExportDatasetRequest, ViewTableClimatesDataType, type ViewTableClimateDataWithGroups, type FilterGroup, type ViewTableImages, type PaginatedResult, type ViewTableGroups } from '@/plugins/types/germinate'
  import { mdiChartTimeline } from '@mdi/js'

  import emitter from 'tiny-emitter/instance'

  const climateDataTable = useTemplateRef('climateDataTable')
  const traitStatsChart = useTemplateRef('traitStatsChart')

  const compProps = defineProps<{
    climate?: ViewTableClimates
    climateId?: number
  }>()

  const localClimate = ref<ViewTableClimates>()
  const datasets = ref<ViewTableDatasets[]>()
  // TODO: Fetch
  const groups = ref<ViewTableGroups[]>()
  const imagesVisible = ref(true)
  const climateData = shallowRef<ViewTableClimateDataWithGroups[]>()
  const catChartData = shallowRef<Map<number, Blob>>(new Map())

  const imageFilter: ComputedRef<FilterGroup[]> = computed(() => {
    return [{
      filters: [{
        column: 'imageForeignId',
        comparator: FilterComparator.equals,
        values: [`${localClimate.value?.climateId}`],
        canBeChanged: false,
      }, {
        column: 'imageRefTable',
        comparator: FilterComparator.equals,
        values: ['climates'],
        canBeChanged: false,
      }],
      operator: FilterOperator.and,
    }]
  })

  function update () {
    nextTick(() => {
      climateDataTable.value?.refresh()
      plot()
    })
  }

  function setImageVisibility (request: PaginatedRequest, result: PaginatedResult<ViewTableImages[]>) {
    imagesVisible.value = result !== undefined && result.count !== undefined && result.count > 0
  }

  function plot () {
    const v = localClimate.value

    if (!v) {
      return
    }

    emitter.emit('show-loading', true)

    const query: ClimateExportDatasetRequest = {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      prevCount: -1,
      datasetIds: v.datasetIds,
      climateIds: [v.climateId || -1],
      locationIds: undefined,
      locationGroupIds: undefined,
      minimal: true,
    }

    if (v.dataType === ViewTableClimatesDataType.numeric) {
      apiPostClimateDataTable(query, result => {
        climateData.value = result.data
        emitter.emit('show-loading', false)

        nextTick(() => traitStatsChart.value?.update())
      })
    } else {
      const q = Object.assign(query, { climateIds: [v.climateId] })

      apiPostClimateStatsCategorical<Blob>(q, result => {
        catChartData.value.set(v.climateId, result)
      })
    }
  }

  function getDatasetData (data: PaginatedRequest) {
    const request = data as UnacceptedLicenseRequest
    return apiPostClimateDatasetTable(localClimate.value?.climateId || -1, request)
  }

  function getClimateData (data: PaginatedRequest) {
    const request = data as ClimateExportDatasetRequest
    request.climateIds = [localClimate.value?.climateId || -1]
    return apiPostClimateDataTable(request)
  }

  function getClimateIds (data: PaginatedRequest) {
    const request = data as ClimateExportDatasetRequest
    request.climateIds = [localClimate.value?.climateId || -1]
    return apiPostClimateDataTableIds(request)
  }

  function downloadTable (data: PaginatedRequest) {
    return apiPostTableExport({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filters: data.filters,
    }, 'dataset/data/trial')
  }

  function getDatasets () {
    // Set up the dataset request based on the provided ids
    const request: PaginatedRequest = {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filters: [{
        filters: [{
          column: 'datasetId',
          comparator: FilterComparator.inSet,
          values: localClimate.value?.datasetIds.map(String) || [],
        }],
        operator: FilterOperator.and,
      }],
    }

    apiPostDatasetTable(request, result => {
      if (result && result.data) {
        datasets.value = result.data

        plot()
      }
    })
  }

  watch(localClimate, async newValue => {
    if (newValue && newValue.datasetIds && newValue.datasetIds.length > 0) {
      getDatasets()
    }
  })

  onMounted(() => {
    if (compProps.climate) {
      localClimate.value = compProps.climate
    } else if (compProps.climateId) {
      apiPostClimateTable({
        page: 1,
        limit: 1,
        filters: [{
          filters: [{
            column: 'traitId',
            comparator: FilterComparator.equals,
            values: [`${compProps.climateId}`],
          }],
          operator: FilterOperator.and,
        }],
      }, result => {
        if (result && result.data && result.data.length > 0) {
          localClimate.value = result.data[0]
        }
      })
    }
  })
</script>
