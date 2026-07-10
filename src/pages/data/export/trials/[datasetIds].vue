<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageTrialsExportTitle') }}</h1>
    <DatasetList :datasets="datasets" v-if="datasets" />
    <v-divider class="mb-3" />

    <div v-if="datasets && datasets.length > 0">
      <v-expansion-panels>
        <v-expansion-panel eager>
          <template #title>
            <v-icon :icon="mdiDatabase" class="me-2" /> {{ $t('widgetSelectedDatasetsTitle') }}
          </template>
          <template #text>
            <DatasetTable :get-data="getDatasetTableData" disabled />
          </template>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-tabs
        center-active
        scroll-to-active
        grow
        class="my-5"
      >
        <v-tab
          v-for="(tab, index) in tabs" :key="`trait-tab-${tab.key}`"
          :text="tab.text"
          :prepend-icon="tab.path"
          :base-color="selectedTab === tab.key ? getTemplateColor(index) : 'muted'"
          variant="tonal"
          @click="selectedTab = tab.key"
        >
          <template #append>
            <v-icon :icon="mdiHelpCircle" v-tooltip:bottom="tab.help" color="muted" />
          </template>
        </v-tab>
      </v-tabs>

      <RevealOnShowPanel
        v-show="selectedTab === 'overview'"
        :showing="selectedTab === 'overview'"
      >
        <TraitBoxplots
          :traits="traits"
          :datasets="datasets || []"
          :groups="groups || []"
          :dataset-ids="datasetIds"
        />
      </RevealOnShowPanel>

      <RevealOnShowPanel
        v-show="selectedTab === 'matrix'"
        :showing="selectedTab === 'matrix'"
      >
        <TraitMatrix
          :traits="traits"
          :groups="groups || []"
          :dataset-ids="datasetIds"
        />
      </RevealOnShowPanel>

      <RevealOnShowPanel
        v-show="selectedTab === 'comparison'"
        :showing="selectedTab === 'comparison'"
      >
        <TraitComparison
          :traits="traits"
          :groups="groups || []"
          :dataset-ids="datasetIds"
        />
      </RevealOnShowPanel>

      <RevealOnShowPanel
        v-show="selectedTab === 'table'"
        :showing="selectedTab === 'table'"
      >
        <TraitDataTable
          :get-data="getTableData"
          :get-ids="getTableIds"
          :download="downloadTable"
        />
      </RevealOnShowPanel>

      <RevealOnShowPanel
        v-show="selectedTab === 'locations'"
        :showing="selectedTab === 'locations'"
      >
        <TrialLocationMap
          :datasets="datasets"
          ref="trialLocationMap"
          :traits="traits"
          :has-layout="trialLayoutAvailable"
        />
      </RevealOnShowPanel>

      <RevealOnShowPanel
        v-show="selectedTab === 'export'"
        :showing="selectedTab === 'export'"
      >
        <TraitDataDownload
          :traits="traits"
          :groups="groups || []"
          :dataset-ids="datasetIds"
        />
      </RevealOnShowPanel>
    </div>
  </v-container>
</template>

<route lang="yaml">
meta:
  navGroup: trials
name: exporTrials
</route>

<script setup lang="ts">
  import TrialLocationMap from '@/components/map/TrialLocationMap.vue'
  import DatasetTable from '@/components/tables/DatasetTable.vue'
  import TraitDataTable from '@/components/tables/TraitDataTable.vue'
  import TraitBoxplots from '@/components/trials/TraitBoxplots.vue'
  import TraitDataDownload from '@/components/trials/TraitDataDownload.vue'
  import RevealOnShowPanel from '@/components/widgets/RevealOnShowPanel.vue'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostDatasetTable } from '@/plugins/api/dataset'
  import { apiPostDatasetGroups } from '@/plugins/api/group'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import { apiPostDatasetTraits, apiPostTrialLayoutCount, apiPostTrialLocationCount, apiPostTrialsDataTable, apiPostTrialsDataTableIds, apiPostTrialsDataTimepoints } from '@/plugins/api/trait'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type PaginatedResult, type ViewTableDatasets, type ViewTableTraits, type PaginatedRequest, type ViewTableGroups, type TrialsExportDatasetRequest, ScalesDatatype, ViewTableTraitsScaleDatatype } from '@/plugins/types/germinate'
  import { isAccepted } from '@/plugins/util'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { coreStore } from '@/stores/app'
  import { mdiChartBellCurve, mdiCompare, mdiDatabase, mdiEye, mdiFileDownloadOutline, mdiGrid, mdiHelpCircle, mdiMapMarkerPath, mdiTableSearch } from '@mdi/js'
  import type { AxiosResponse } from 'axios'

  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  interface Tab {
    key: string
    text: string
    path: string
    help: string
  }

  const { t } = useI18n()

  const router = useRouter()
  const route = useRoute('exporTrials')
  const store = coreStore()

  const trialLocationMap = useTemplateRef('trialLocationMap')

  const selectedTab = ref<string>('overview')
  const datasetIds = ref<number[]>([])
  const datasets = ref<ViewTableDatasets[]>()
  const traits = ref<ViewTableTraits[]>([])
  const groups = ref<ViewTableGroups[]>([])

  const trialLocationsAvailable = ref(false)
  const trialLayoutAvailable = ref<boolean[]>()
  const trialTimepointsAvailable = ref(false)

  const tabs: ComputedRef<Tab[]> = computed(() => {
    const result = [{
      key: 'overview',
      text: t('pageDataExportTabDataStatistics'),
      path: mdiEye,
      help: t('pageDataExportTabHelpDataStatistics'),
    }, {
      key: 'matrix',
      text: t('pageDataExportTabDataMatrix'),
      path: mdiGrid,
      help: t('pageDataExportTabHelpDataMatrix'),
    }, {
      key: 'comparison',
      text: t('pageDataExportTabComparison'),
      path: mdiCompare,
      help: t('pageDataExportTabHelpComparison'),
    // }, {
    //   key: 'comparison',
    //   text: t('pageDataExportTabComparison'),
    //   path: mdiDistributeHorizontalCenter,
    //   help: t('pageDataExportTabHelpComparison'),
    }, {
      key: 'table',
      text: t('pageDataExportTabDataTable'),
      path: mdiTableSearch,
      help: t('pageDataExportTabHelpDataTable'),
    }]

    if (trialLocationsAvailable.value || (trialLayoutAvailable.value && trialLayoutAvailable.value.some(v => v))) {
      result.push({
        key: 'locations',
        text: t('pageDataExportTabLocations'),
        path: mdiMapMarkerPath,
        help: t('pageDataExportTabHelpLocations'),
      })
    }

    if (trialTimepointsAvailable.value) {
      result.push({
        key: 'timeseries',
        text: t('pageDataExportTabTimeseries'),
        path: mdiChartBellCurve,
        help: t('pageDataExportTabHelpTimeseries'),
      })
    }

    result.push({
      key: 'export',
      text: t('pageDataExportTabDataExport'),
      path: mdiFileDownloadOutline,
      help: t('pageDataExportTabHelpDataExport'),
    })

    return result
  })

  watch(datasetIds, async newValue => {
    emitter.emit('show-loading', true)

    apiPostDatasetTraits(newValue || [], result => {
      traits.value = result

      getDatasets()
      updateGroups()
      emitter.emit('show-loading', false)
    })
  })

  function getTableData (data: PaginatedRequest) {
    const request = data as TrialsExportDatasetRequest
    request.datasetIds = datasetIds.value
    return apiPostTrialsDataTable(request)
  }

  function getTableIds (data: PaginatedRequest) {
    const request = data as TrialsExportDatasetRequest
    request.datasetIds = datasetIds.value
    return apiPostTrialsDataTableIds(request)
  }

  function downloadTable (data: PaginatedRequest) {
    return apiPostTableExport({
      page: 1,
      datasetIds: datasetIds.value,
      limit: MAX_JAVA_INTEGER,
      filters: data.filters,
    }, 'dataset/data/trial')
  }

  function getDatasetTableData () {
    return new Promise<AxiosResponse<PaginatedResult<ViewTableDatasets[]>>>(resolve => {
      // @ts-ignore
      resolve({
        data: {
          data: datasets.value || [],
          count: datasets.value?.length || 0,
        },
      })
    })
  }

  function getDatasets () {
    // Set up the dataset request based on the provided ids
    const request: PaginatedRequest = {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filters: [{
        filters: [{
          column: 'datasetType',
          comparator: FilterComparator.equals,
          values: ['trials'],
        }, {
          column: 'isExternal',
          comparator: FilterComparator.equals,
          values: ['0'],
        }, {
          column: 'datasetId',
          comparator: FilterComparator.inSet,
          values: datasetIds.value?.map(String) || [],
        }],
        operator: FilterOperator.and,
      }],
    }

    apiPostDatasetTable(request, result => {
      datasets.value = result.data.filter(d => {
        // Exclude the ones where a license exists, but hasn't been accepted
        return (!d.licenseName || isAccepted(d))
      })

      if (datasets.value.length === 0) {
        redirectBack()
      }
    }, {
      codes: [404],
      callback: () => {
        redirectBack()
      },
    })
  }

  function redirectBack () {
    // Navigate to the germplasm page
    router.push({
      path: Pages.getPath(Pages.export, 'trials'),
      query: {
        'datasets-filter': JSON.stringify([{
          filters: [{
            column: 'datasetId',
            comparator: FilterComparator.inSet,
            values: datasetIds.value || [],
          }],
        }]),
      },
    })
  }

  function updateGroups () {
    const request = {
      datasetIds: datasetIds.value || [],
      groupType: 'germinatebase',
      datasetType: 'trials',
    }
    // Get groups
    apiPostDatasetGroups(request, result => {
      groups.value = result
    })
  }

  watch(selectedTab, async newValue => {
    const query = Object.assign({}, route.query)
    query.tab = newValue

    await router.replace({ query })

    if (newValue === 'locations') {
      nextTick(() => {
        trialLocationMap.value?.invalidateSize()
      })
    }
  })

  onBeforeMount(() => {
    if (route.query && route.query.tab) {
      selectedTab.value = route.query.tab as string
    }
  })

  onMounted(() => {
    if (route && route.params && route.params.datasetIds) {
      console.log(route)
      try {
        datasetIds.value = (route.params.datasetIds as string).split(',').map(Number)

        apiPostTrialLocationCount({
          datasetIds: datasetIds.value,
        }, result => {
          if (result) {
            trialLocationsAvailable.value = result > 0
          }
        })

        apiPostTrialLayoutCount({
          datasetIds: datasetIds.value,
        }, result => {
          if (result) {
            trialLayoutAvailable.value = datasetIds.value.map(ds => result[ds] !== undefined && result[ds] > 0)
          }
        })

        apiPostTrialsDataTimepoints<string[]>({
          datasetIds: datasetIds.value,
        }, result => {
          if (result && result.length > 1) {
            trialTimepointsAvailable.value = true
          }
        })
      } catch {
        datasetIds.value = []
      }
    }
  })
</script>
