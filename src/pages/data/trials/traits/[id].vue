<template>
  <v-container fluid v-if="variable">
    <h1 class="text-h4 my-3 ">{{ variable.variableName }}</h1>
    <v-divider class="mb-3" />

    <VariableDetails :variable-id="variable.variableId" />

    <Images class="mt-3" :filter-on="imageFilter" @data-changed="setImageVisibility" v-if="imagesVisible" />

    <TraitDataTable
      class="mt-5"
      :get-data="getTrialsData"
      :get-ids="getTrialsIds"
      :download="downloadTable"
      ref="traitDataTable"
    />

    <DatasetTable
      class="mt-5"
      :get-data="getDatasetData"
      @license-accepted="update"
    />

    <v-expansion-panels class="mt-5">
      <v-expansion-panel>
        <template #title>
          <v-icon icon="mdi-chart-timeline" class="me-2" /> {{ $t('pageTraitDetailsStatsTitle') }}
        </template>
        <template #text v-if="variable && (traitData || (catChartData && catChartData.size > 0))">
          <p>{{ $t('pageTraitDetailsStatsText') }}</p>

          <TraitStatsChart
            :datasets="datasets || []"
            :variables="[variable]"
            :cat-chart-data="catChartData"
            :trait-data="traitData || []"
            ref="traitStatsChart"
          />
        </template>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script setup lang="ts">
  import Images from '@/components/widgets/Images.vue'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostDatasetTable, apiPostTraitStatsCategorical } from '@/plugins/api/dataset'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import { apiPostTraitDatasetTable, apiPostTraitTable, apiPostTrialsDataTable, apiPostTrialsDataTableIds } from '@/plugins/api/trait'
  import { FilterComparator, FilterOperator, type ViewTableDatasets, ViewTableTraitsScaleDatatype, type FilterGroup, type PaginatedRequest, type PaginatedResult, type TrialsExportDatasetRequest, type UnacceptedLicenseRequest, type ViewTableImages, type ViewTableTraits, type ViewTableTrialsData } from '@/plugins/types/germinate'

  import emitter from 'tiny-emitter/instance'

  const route = useRoute('/data/trials/traits/[id]')

  const traitDataTable = useTemplateRef('traitDataTable')
  const traitStatsChart = useTemplateRef('traitStatsChart')

  const variable = ref<ViewTableTraits>()
  const datasets = ref<ViewTableDatasets[]>()
  const traitId = ref<number>()
  const imagesVisible = ref(true)
  const traitData = ref<ViewTableTrialsData[]>()
  const catChartData = ref<Map<number, Blob>>(new Map())

  const imageFilter: ComputedRef<FilterGroup[]> = computed(() => {
    return [{
      filters: [{
        column: 'imageForeignId',
        comparator: FilterComparator.equals,
        values: [`${traitId.value}`],
        canBeChanged: false,
      }, {
        column: 'imageRefTable',
        comparator: FilterComparator.equals,
        values: ['phenotypes'],
        canBeChanged: false,
      }],
      operator: FilterOperator.and,
    }]
  })

  function update () {
    nextTick(() => {
      traitDataTable.value?.refresh()
      traitStatsChart.value?.forceRedraw()
    })
  }

  function setImageVisibility (request: PaginatedRequest, result: PaginatedResult<ViewTableImages[]>) {
    imagesVisible.value = result !== undefined && result.count !== undefined && result.count > 0
  }

  function plot () {
    const v = variable.value

    if (!v) {
      return
    }

    emitter.emit('show-loading', true)

    const query: TrialsExportDatasetRequest = {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      prevCount: -1,
      datasetIds: v.datasetIds,
      traitIds: [v.variableId || -1],
      germplasmIds: undefined,
      germplasmGroupIds: undefined,
      minimal: true,
    }

    if (v.scaleDatatype === ViewTableTraitsScaleDatatype.numeric) {
      apiPostTrialsDataTable(query, result => {
        traitData.value = result.data
        emitter.emit('show-loading', false)
      })
    } else {
      const q = Object.assign(query, { traitIds: [v.variableId] })

      apiPostTraitStatsCategorical<Blob>(q, result => {
        catChartData.value.set(v.variableId, result)
      })
    }
  }

  function getDatasetData (data: PaginatedRequest) {
    const request = data as UnacceptedLicenseRequest
    return apiPostTraitDatasetTable(variable.value?.variableId || -1, request)
  }

  function getTrialsData (data: PaginatedRequest) {
    const request = data as TrialsExportDatasetRequest
    request.traitIds = [variable.value?.variableId || -1]
    return apiPostTrialsDataTable(request)
  }

  function getTrialsIds (data: PaginatedRequest) {
    const request = data as TrialsExportDatasetRequest
    request.traitIds = [variable.value?.variableId || -1]
    return apiPostTrialsDataTableIds(request)
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
          values: variable.value?.datasetIds.map(String) || [],
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

  onMounted(() => {
    if (route && route.params && route.params.id) {
      traitId.value = +route.params.id

      apiPostTraitTable({
        page: 1,
        limit: 1,
        filters: [{
          filters: [{
            column: 'traitId',
            comparator: FilterComparator.equals,
            values: [`${traitId.value}`],
          }],
          operator: FilterOperator.and,
        }],
      }, result => {
        if (result && result.data && result.data.length > 0) {
          variable.value = result.data[0]

          if (variable.value.datasetIds && variable.value.datasetIds.length > 0) {
            getDatasets()
          }
        }
      })
    }
  })
</script>
