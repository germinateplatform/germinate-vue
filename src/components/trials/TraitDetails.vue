<template>
  <div v-if="localVariable">
    <VariableDetails :variable-id="localVariable.variableId" />

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
          <v-icon :icon="mdiChartTimeline" class="me-2" /> {{ $t('pageTraitDetailsStatsTitle') }}
        </template>
        <template #text v-if="localVariable && (traitData || (catChartData && catChartData.size > 0))">
          <p>{{ $t('pageTraitDetailsStatsText') }}</p>

          <TraitStatsChart
            :datasets="datasets || []"
            :groups="groups || []"
            :variables="[localVariable]"
            :cat-chart-data="catChartData"
            :trait-data="traitData || []"
            ref="traitStatsChart"
          />
        </template>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
  import Images from '@/components/widgets/Images.vue'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostDatasetTable, apiPostTraitStatsCategorical } from '@/plugins/api/dataset'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import { apiPostTraitDatasetTable, apiPostTraitTable, apiPostTrialsDataTable, apiPostTrialsDataTableIds } from '@/plugins/api/trait'
  import { FilterComparator, FilterOperator, type ViewTableDatasets, ViewTableTraitsScaleDatatype, type FilterGroup, type PaginatedRequest, type PaginatedResult, type TrialsExportDatasetRequest, type UnacceptedLicenseRequest, type ViewTableImages, type ViewTableTraits, type ViewTableTrialsData, type ViewTableGroups } from '@/plugins/types/germinate'
  import { mdiChartTimeline } from '@mdi/js'

  import emitter from 'tiny-emitter/instance'

  const traitDataTable = useTemplateRef('traitDataTable')
  const traitStatsChart = useTemplateRef('traitStatsChart')

  const compProps = defineProps<{
    variable?: ViewTableTraits
    variableId?: number
  }>()

  const localVariable = ref<ViewTableTraits>()
  const datasets = ref<ViewTableDatasets[]>()
  // TODO: Fetch
  const groups = ref<ViewTableGroups[]>()
  const imagesVisible = ref(true)
  const traitData = shallowRef<ViewTableTrialsData[]>()
  const catChartData = shallowRef<Map<number, Blob>>(new Map())

  const imageFilter: ComputedRef<FilterGroup[]> = computed(() => {
    return [{
      filters: [{
        column: 'imageForeignId',
        comparator: FilterComparator.equals,
        values: [`${localVariable.value?.variableId}`],
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
      // traitStatsChart.value?.forceRedraw()
      plot()
    })
  }

  function setImageVisibility (request: PaginatedRequest, result: PaginatedResult<ViewTableImages[]>) {
    imagesVisible.value = result !== undefined && result.count !== undefined && result.count > 0
  }

  function plot () {
    const v = localVariable.value

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

        nextTick(() => traitStatsChart.value?.update())
      })
    } else {
      const q = Object.assign(query, { traitIds: [v.variableId] })

      apiPostTraitStatsCategorical(q, result => {
        catChartData.value.set(v.variableId, result)
      })
    }
  }

  function getDatasetData (data: PaginatedRequest) {
    const request = data as UnacceptedLicenseRequest
    return apiPostTraitDatasetTable(localVariable.value?.variableId || -1, request)
  }

  function getTrialsData (data: PaginatedRequest) {
    const request = data as TrialsExportDatasetRequest
    request.traitIds = [localVariable.value?.variableId || -1]
    return apiPostTrialsDataTable(request)
  }

  function getTrialsIds (data: PaginatedRequest) {
    const request = data as TrialsExportDatasetRequest
    request.traitIds = [localVariable.value?.variableId || -1]
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
          values: localVariable.value?.datasetIds.map(String) || [],
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

  watch(localVariable, async newValue => {
    if (newValue && newValue.datasetIds && newValue.datasetIds.length > 0) {
      getDatasets()
    }
  })

  onMounted(() => {
    if (compProps.variable) {
      localVariable.value = compProps.variable
    } else if (compProps.variableId) {
      apiPostTraitTable({
        page: 1,
        limit: 1,
        filters: [{
          filters: [{
            column: 'traitId',
            comparator: FilterComparator.equals,
            values: [`${compProps.variableId}`],
          }],
          operator: FilterOperator.and,
        }],
      }, result => {
        if (result && result.data && result.data.length > 0) {
          localVariable.value = result.data[0]
        }
      })
    }
  })
</script>
