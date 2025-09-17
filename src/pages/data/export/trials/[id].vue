<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageTrialsExportTitle') }}</h1>
    <v-divider class="mb-3" />

    <div v-if="datasets && datasets.length > 0">
      <v-expansion-panels>
        <v-expansion-panel eager>
          <template #title>
            <v-icon icon="mdi-database" class="me-2" /> {{ $t('widgetSelectedDatasetsTitle') }}
          </template>
          <template #text>
            <DatasetTable :get-data="getDatasetTableData" disabled />
          </template>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-row class="my-5">
        <v-col v-for="(tab, index) in tabs" :key="`trait-tab-${tab.key}`">
          <v-card :color="selectedTab === tab.key ? getTemplateColor(index) : 'muted'" @click="selectedTab = tab.key">
            <div class="d-flex flex-no-wrap justify-space-between">
              <div>
                <v-card-title class="text-h5">
                  {{ tab.text }}
                </v-card-title>

                <v-card-subtitle><v-icon icon="mdi-help-circle" v-tooltip:bottom="tab.help" /></v-card-subtitle>
              </div>

              <v-avatar
                class="ma-3"
                rounded="0"
                size="64"
              >
                <v-icon size="64">{{ tab.path }}</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <RevealOnShowPanel
        v-show="selectedTab === 'overview'"
        :showing="selectedTab === 'overview'"
      >
        <TraitBoxplots
          :traits="traits"
          :groups="groups || []"
          :dataset-ids="datasetIds || []"
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
        v-show="selectedTab === 'export'"
        :showing="selectedTab === 'export'"
      >
        <TraitDataExport
          :traits="traits"
          :groups="groups || []"
          :dataset-ids="datasetIds || []"
        />
      </RevealOnShowPanel>
    </div>
  </v-container>
</template>

<script setup lang="ts">
  import DatasetTable from '@/components/tables/DatasetTable.vue'
  import TraitDataTable from '@/components/tables/TraitDataTable.vue'
  import TraitBoxplots from '@/components/trials/TraitBoxplots.vue'
  import RevealOnShowPanel from '@/components/widgets/RevealOnShowPanel.vue'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostDatasetTable } from '@/plugins/api/dataset'
  import { apiPostDatasetGroups } from '@/plugins/api/group'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import { apiPostDatasetTraits, apiPostTrialsDataTable, apiPostTrialsDataTableIds } from '@/plugins/api/trait'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type PaginatedResult, type ViewTableDatasets, type ViewTableTraits, type PaginatedRequest, type ViewTableGroups, type TrialsExportDatasetRequest } from '@/plugins/types/germinate'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { coreStore } from '@/stores/app'
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
  const route = useRoute('/data/export/trials/[id]')
  const store = coreStore()

  const selectedTab = ref<string>('overview')
  const datasetIds = ref<number[]>()
  const datasets = ref<ViewTableDatasets[]>()
  const traits = ref<ViewTableTraits[]>([])
  const groups = ref<ViewTableGroups[]>([])

  const tabs: ComputedRef<Tab[]> = computed(() => {
    return [{
      key: 'overview',
      text: t('pageDataExportTabDataStatistics'),
      path: 'mdi-eye',
      help: t('pageDataExportTabHelpDataStatistics'),
    }, {
      key: 'matrix',
      text: t('pageDataExportTabDataMatrix'),
      path: 'mdi-grid',
      help: t('pageDataExportTabHelpDataMatrix'),
    }, {
      key: 'radar',
      text: t('pageDataExportTabDataRadar'),
      path: 'mdi-spider-web',
      help: t('pageDataExportTabHelpDataRadar'),
    }, {
      key: 'comparison',
      text: t('pageDataExportTabComparison'),
      path: 'mdi-distribute-horizontal-center',
      help: t('pageDataExportTabHelpComparison'),
    }, {
      key: 'table',
      text: t('pageDataExportTabDataTable'),
      path: 'mdi-table-search',
      help: t('pageDataExportTabHelpDataTable'),
    }, {
      key: 'export',
      text: t('pageDataExportTabDataExport'),
      path: 'mdi-file-download-outline',
      help: t('pageDataExportTabHelpDataExport'),
    }]
  })

  watch(datasetIds, async newValue => {
    emitter.emit('show-loading', true)

    apiPostDatasetTraits<ViewTableTraits[]>(newValue || [], result => {
      traits.value = result

      getDatasets()
      updateGroups()
      emitter.emit('show-loading', false)
    })
  })

  function getTableData (data: PaginatedRequest) {
    const request = data as TrialsExportDatasetRequest
    request.datasetIds = datasetIds.value || []
    return apiPostTrialsDataTable(request)
  }

  function getTableIds (data: PaginatedRequest) {
    const request = data as TrialsExportDatasetRequest
    request.datasetIds = datasetIds.value || []
    return apiPostTrialsDataTableIds(request)
  }

  function downloadTable (data: PaginatedRequest) {
    return apiPostTableExport({ filters: data.filters }, 'dataset/data/trial')
  }

  function getDatasetTableData (data: PaginatedRequest) {
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

    apiPostDatasetTable<PaginatedResult<ViewTableDatasets[]>>(request, result => {
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
    apiPostDatasetGroups<ViewTableGroups[]>(request, result => {
      groups.value = result
    })
  }

  function isAccepted (dataset: ViewTableDatasets) {
    if (store.storeToken) {
      return dataset.acceptedBy && dataset.acceptedBy.includes(store.storeToken.id)
    } else {
      return dataset.acceptedBy && dataset.acceptedBy.includes(-1000)
    }
  }

  onMounted(() => {
    if (route && route.params && route.params.id) {
      try {
        datasetIds.value = route.params.id.split(',').map(Number)
      } catch {
        datasetIds.value = []
      }
    }
  })
</script>
