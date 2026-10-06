<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageClimateExportTitle') }}</h1>
    <DatasetList :datasets="cdStore.storeDatasets" v-if="cdStore.storeDatasets" />
    <v-divider class="mb-3" />

    <div v-if="cdStore.storeDatasets && cdStore.storeDatasets.length > 0">
      <v-expansion-panels>
        <v-expansion-panel eager>
          <template #title>
            <v-icon :icon="mdiDatabase" class="me-2" /> {{ $t('widgetSelectedDatasetsTitle') }}
          </template>
          <template #text>
            <DatasetTable :get-data="getDatasetTableData" disabled />
          </template>
        </v-expansion-panel>
        <v-expansion-panel eager v-if="hasFileResources">
          <template #title>
            <v-icon :icon="mdiFileDownload" class="me-2" /> {{ $t('widgetAvailableFileresourcesTitle') }}
          </template>
          <template #text>
            <FileResourceTable :get-data="getFileresourceTableData" :filter-on="fileresourceFilter" disabled />
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
        <ClimateBoxplots />
      </RevealOnShowPanel>

      <RevealOnShowPanel
        v-show="selectedTab === 'matrix'"
        :showing="selectedTab === 'matrix'"
      >
        <ClimateMatrix />
      </RevealOnShowPanel>

      <RevealOnShowPanel
        v-show="selectedTab === 'table'"
        :showing="selectedTab === 'table'"
      >
        <ClimateDataTable
          :get-data="getTableData"
          :get-ids="getTableIds"
          :download="downloadTable"
        />
      </RevealOnShowPanel>

      <RevealOnShowPanel
        v-show="selectedTab === 'locations'"
        :showing="selectedTab === 'locations'"
      >
        <ClimateLocationMap
          ref="climateLocationMap"
        />
      </RevealOnShowPanel>

      <RevealOnShowPanel
        v-show="selectedTab === 'export'"
        :showing="selectedTab === 'export'"
      >
        <ClimateDataDownload />
      </RevealOnShowPanel>
    </div>
  </v-container>
</template>

<route lang="yaml">
meta:
  navGroup: climate
name: exportClimates
</route>

<script setup lang="ts">
  import DatasetTable from '@/components/tables/DatasetTable.vue'
  import RevealOnShowPanel from '@/components/widgets/RevealOnShowPanel.vue'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostDatasetTable, apiPostFileResourceTable } from '@/plugins/api/dataset'
  import { apiPostDatasetGroups } from '@/plugins/api/group'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type PaginatedResult, type ViewTableDatasets, type PaginatedRequest, type ViewTableGroups, type TrialsExportDatasetRequest, type ViewTableClimates } from '@/plugins/types/germinate'
  import { isAccepted } from '@/plugins/util'
  import { getTemplateColor } from '@/plugins/util/colors'

  import { mdiDatabase, mdiEye, mdiFileDownload, mdiFileDownloadOutline, mdiGrid, mdiHelpCircle, mdiMapMarkerPath, mdiTableSearch } from '@mdi/js'
  import type { AxiosResponse } from 'axios'

  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'
  import { apiPostClimateDataTable, apiPostDatasetClimates, apiPostClimateDataTableIds } from '@/plugins/api/climate'

  interface Tab {
    key: string
    text: string
    path: string
    help: string
  }

  const { t } = useI18n()

  const cdStore = climateDataStore()
  const router = useRouter()
  const route = useRoute('exportClimates')

  const climateLocationMap = useTemplateRef('climateLocationMap')

  const selectedTab = ref<string>('overview')
  const datasetIds = ref<number[]>([])
  // const datasets = ref<ViewTableDatasets[]>()
  // const climates = ref<ViewTableClimates[]>([])
  // const groups = ref<ViewTableGroups[]>([])

  const hasFileResources = computed(() => cdStore.storeDatasets.some(ds => ds.fileresourceIds && ds.fileresourceIds.length > 0))

  const fileresourceFilter = computed(() => {
    return cdStore.storeDatasets
      ? [{
        filters: [{
          column: 'datasetIds',
          comparator: FilterComparator.arrayContains,
          values: cdStore.storeDatasetIds.map(ds => `${ds}`),
        }],
        operator: FilterOperator.and,
      }]
      : []
  })

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
      key: 'table',
      text: t('pageDataExportTabDataTable'),
      path: mdiTableSearch,
      help: t('pageDataExportTabHelpDataTable'),
    }, {
      key: 'locations',
      text: t('pageDataExportTabLocations'),
      path: mdiMapMarkerPath,
      help: t('pageDataExportTabHelpLocations'),
    }, {
      key: 'export',
      text: t('pageDataExportTabDataExport'),
      path: mdiFileDownloadOutline,
      help: t('pageDataExportTabHelpDataExport'),
    }]

    return result
  })

  watch(datasetIds, async newValue => {
    emitter.emit('show-loading', true)

    apiPostDatasetClimates(newValue || [], result => {
      cdStore.setClimates(result)

      getDatasets()
      updateGroups()
      emitter.emit('show-loading', false)
    })
  })

  function getTableData (data: PaginatedRequest) {
    const request = data as TrialsExportDatasetRequest
    request.datasetIds = datasetIds.value
    return apiPostClimateDataTable(request)
  }

  function getTableIds (data: PaginatedRequest) {
    const request = data as TrialsExportDatasetRequest
    request.datasetIds = datasetIds.value
    return apiPostClimateDataTableIds(request)
  }

  function downloadTable (data: PaginatedRequest) {
    return apiPostTableExport({
      page: 1,
      datasetIds: datasetIds.value,
      limit: MAX_JAVA_INTEGER,
      filters: data.filters,
    }, 'dataset/data/climate')
  }

  function getFileresourceTableData (query: PaginatedRequest) {
    return apiPostFileResourceTable(query)
  }

  function getDatasetTableData () {
    return new Promise<AxiosResponse<PaginatedResult<ViewTableDatasets[]>>>(resolve => {
      // @ts-ignore
      resolve({
        data: {
          data: cdStore.storeDatasets,
          count: cdStore.storeDatasets.length || 0,
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
          values: ['climate'],
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
      const datasets = result.data.filter(d => {
        // Exclude the ones where a license exists, but hasn't been accepted
        return (!d.licenseName || isAccepted(d))
      })

      if (datasets.length === 0) {
        redirectBack()
      }

      cdStore.setDatasets(datasets)
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
      path: Pages.getPath(Pages.export, 'climate'),
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
      groupType: 'locations',
      datasetType: 'climate',
    }
    // Get groups
    apiPostDatasetGroups(request, result => {
      cdStore.setGroups(result)
    })
  }

  watch(selectedTab, async newValue => {
    const query = Object.assign({}, route.query)
    query.tab = newValue

    await router.replace({ query })

    if (newValue === 'locations') {
      nextTick(() => {
        climateLocationMap.value?.invalidateSize()
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
      try {
        datasetIds.value = (route.params.datasetIds as string).split(',').map(Number)
      } catch {
        datasetIds.value = []
      }
    }
  })
</script>

<style scoped>
.g-expansion-panels :deep(.v-expansion-panel-text__wrapper) {
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 0;
}
</style>
