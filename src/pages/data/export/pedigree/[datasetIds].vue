<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pagePedigreeExportTitle') }}</h1>
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

      <v-row>
        <v-col cols="12" md="6">
          <GroupSelection
            v-model="selectedGermplasmGroups"
            v-model:group-selection="germplasmGroupSelection"
            :groups="germplasmGroups || []"
            marked-item-type="germplasm"
          >
            <template #title>{{ $t('pagePedigreeExportSelectGermplasmGroupTitle') }}</template>
            <template #text>
              <p>{{ $t('pagePedigreeExportSelectGermplasmGroupText') }}</p>
            </template>
          </GroupSelection>
        </v-col>
      </v-row>

      <v-switch :label="$t('pageGermplasmDownloadTabIncludeAttributes')" v-model="includeAttributes" color="primary" hide-details />

      <div v-show="datasetsSelected">
        <v-btn class="mt-5" color="primary" :disabled="!canContinue" @click="exportData" :prepend-icon="mdiArrowRightBox" :text="$t('buttonExport')" />
      </div>
    </div>
  </v-container>
</template>

<route lang="yaml">
meta:
  navGroup: pedigree
name: exportPedigrees
</route>

<script setup lang="ts">
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostDatasetTable } from '@/plugins/api/dataset'
  import { apiPostPedigreeDatasetExport } from '@/plugins/api/germplasm'
  import { apiPostDatasetGroups } from '@/plugins/api/group'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type PaginatedRequest, type PaginatedResult, type ViewTableDatasets, type ViewTableGroups, type PedigreeRequest, type AsyncExportResult } from '@/plugins/types/germinate'
  import { isAccepted } from '@/plugins/util'
  import { coreStore } from '@/stores/app'
  import { mdiArrowRightBox, mdiDatabase } from '@mdi/js'
  import type { AxiosResponse } from 'axios'

  import emitter from 'tiny-emitter/instance'

  const store = coreStore()
  const router = useRouter()
  const route = useRoute('exportPedigrees')

  const includeAttributes = ref(false)

  const datasetIds = ref<number[]>([])
  const datasets = shallowRef<ViewTableDatasets[]>()
  const selectedDatasets = ref<ViewTableDatasets[]>([])

  const germplasmGroups = shallowRef<ViewTableGroups[]>([])
  const selectedGermplasmGroups = shallowRef<ViewTableGroups[]>([])
  const germplasmGroupSelection = ref<GroupSelectionType>('all')

  const datasetsSelected = computed(() => selectedDatasets.value.length > 0)

  const canContinue = computed(() => {
    if (!datasetsSelected.value) {
      return false
    }
    if (germplasmGroupSelection.value === 'groups' && selectedGermplasmGroups.value.length === 0) {
      return false
    }

    return true
  })

  const queryParams = computed(() => {
    const request: PedigreeRequest = {
      filters: [],
      page: 1,
      limit: MAX_JAVA_INTEGER,
      germplasmIds: undefined,
      germplasmGroupIds: undefined,
      includeAttributes: includeAttributes.value,
      datasetIds: datasetIds.value || [],
    }

    if (germplasmGroupSelection.value === 'groups') {
      const gs = selectedGermplasmGroups.value || []
      request.germplasmGroupIds = gs.filter(g => g.groupId !== -1).map(g => g.groupId || -1)
      request.germplasmIds = gs.some(g => g.groupId === -1) ? store.storeMarkedGermplasm : undefined
    }

    return request
  })

  function exportData () {
    emitter.emit('show-loading', true)

    emitter.emit('show-loading', true)

    const params = JSON.parse(JSON.stringify(queryParams.value))
    params.datasetIds = selectedDatasets.value.map(ds => ds.datasetId)

    apiPostPedigreeDatasetExport<AsyncExportResult[]>(params, result => {
      store.addAsyncJobUuids(result.map(r => r.uuid))

      // Show the sidebar
      emitter.emit('toggle-aside', 'download')
      emitter.emit('show-loading', false)
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
          values: ['pedigree'],
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

      selectedDatasets.value = datasets.value.concat()

      if (datasets.value.length === 0) {
        redirectBack()
      }
    }, {
      codes: [404],
      callback: () => {
        redirectBack()
      },
    }).then(() => {
      emitter.emit('show-loading', false)
    })
  }

  function getGermplasmGroups () {
    const request = {
      datasetIds: datasetIds.value || [],
      groupType: 'germinatebase',
      datasetType: 'pedigree',
    }
    apiPostDatasetGroups(request, result => {
      germplasmGroups.value = result
    })
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

  function redirectBack () {
    // Navigate to the germplasm page
    router.push({
      path: Pages.getPath(Pages.export, 'pedigree'),
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

  watch(datasetIds, async () => {
    emitter.emit('show-loading', true)

    getDatasets()
    getGermplasmGroups()
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
/* 2. Fix the width: Ensure the item container fills the menu */
:deep(.v-select__selection) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.clickable-alert:hover {
  cursor: pointer;
}
</style>
