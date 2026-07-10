<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageGenotypesExportTitle') }}</h1>
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
            <template #title>{{ $t('pageGenotypesExportSelectGermplasmGroupTitle') }}</template>
            <template #text>
              <p>{{ $t('pageGenotypesExportSelectGermplasmGroupText') }}</p>
            </template>
          </GroupSelection>
        </v-col>
        <v-col cols="12" md="6">
          <GroupSelection
            v-model="selectedMarkerGroups"
            v-model:group-selection="markerGroupSelection"
            :groups="markerGroups || []"
            marked-item-type="markers"
          >
            <template #title>{{ $t('pageGenotypesExportSelectMarkerGroupTitle') }}</template>
            <template #text>
              <p>{{ $t('pageGenotypesExportSelectMarkerGroupText') }}</p>
            </template>
          </GroupSelection>
        </v-col>
      </v-row>

      <v-card
        class="mt-5"
        :title="$t('pageGenotypesExportMultipleSubselectTitle')"
        :prepend-icon="mdiInformation"
        v-if="datasetIds.length > 1"
      >
        <template #text>
          <p>{{ $t('pageGenotypesExportMultipleSubselectText') }}</p>

          <!-- Dataset subset size preview table -->
          <GenotypeDatasetSummaryTable :query-params="queryParams" :dataset-ids="datasetIds" v-model="selectedDatasets" />
        </template>
      </v-card>

      <div v-show="datasetsSelected">
        <h3>{{ $t('pageGenotypesExportSelectMapTitle') }}</h3>
        <p>{{ $t('pageGenotypesExportSelectMapText') }}</p>

        <v-select
          v-model="selectedMap"
          :label="$t('pageGenotypesExportSelectMapTitle')"
          :items="maps"
          return-object
          item-title="mapName"
          item-value="mapId"
        >
          <template #selection="{ item }">
            <div class="d-flex align-center justify-space-between w-100">
              <span>{{ item.mapName }}</span>
              <v-chip size="small" label>
                {{ item.mapCoverageCount }}/{{ item.markerCount }}
              </v-chip>
            </div>
          </template>
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps">
              <template #append>
                <v-chip label size="small" :text="`${item.mapCoverageCount}/${item.markerCount}`" />
              </template>
            </v-list-item>
          </template>
        </v-select>

        <h3>{{ $t('pageGenotypesExportFormatTitle') }}</h3>
        <p>{{ $t('pageGenotypesExportFormatText') }}</p>

        <v-alert class="mb-3 clickable-alert" :text="$t('tooltipExportFormatLearnMore')" density="comfortable" color="info" variant="tonal" :icon="mdiInformation" @click="router.push('/about/export-formats?tag=genotype')" />
        <v-row>
          <v-col>
            <v-card
              :title="$t('pageGenotypesExportEnableFlatFileTitle')"
              :text="$t('pageGenotypesExportEnableFlatFileText')"
              :prepend-icon="mdiFileDocument"
              variant="tonal"
              :color="genotypeFormats.txt ? 'primary' : undefined"
              @click="genotypeFormats.txt = !genotypeFormats.txt"
            >
              <template #append>
                <v-switch hide-details readonly v-model="genotypeFormats.txt" color="primary" />
              </template>
            </v-card>
          </v-col>
          <v-col>
            <v-card
              :title="$t('pageGenotypesExportEnableFlapjackTitle')"
              prepend-icon="$flapjack"
              variant="tonal"
              :color="genotypeFormats.flapjack ? 'primary' : undefined"
              @click="genotypeFormats.flapjack = !genotypeFormats.flapjack"
            >
              <template #text>
                <span v-html="$t('pageGenotypesExportEnableFlapjackText')" />
              </template>
              <template #append>
                <v-switch hide-details readonly v-model="genotypeFormats.flapjack" color="primary" />
              </template>
            </v-card>
          </v-col>
          <v-col>
            <v-card
              :title="$t('pageGenotypesExportEnableHapmapTitle')"
              :text="$t('pageGenotypesExportEnableHapmapText')"
              variant="tonal"
              :color="genotypeFormats.hapmap ? 'primary' : undefined"
              :prepend-icon="mdiFileTable"
              @click="genotypeFormats.hapmap = !genotypeFormats.hapmap"
            >
              <template #append>
                <v-switch hide-details readonly v-model="genotypeFormats.hapmap" color="primary" />
              </template>
            </v-card>
          </v-col>
        </v-row>

        <v-btn class="mt-5" color="primary" :disabled="!canContinue" @click="exportData" :prepend-icon="mdiArrowRightBox" :text="$t('buttonExport')" />
      </div>
    </div>
  </v-container>
</template>

<route lang="yaml">
meta:
  navGroup: genotype
name: exportGenotypes
</route>

<script setup lang="ts">
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostDatasetTable } from '@/plugins/api/dataset'
  import { apiPostDatasetMapTable, apiPostGenotypeDatasetExport } from '@/plugins/api/genotype'
  import { apiPostDatasetGroups } from '@/plugins/api/group'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type ViewTableDatasetMaps, type PaginatedRequest, type PaginatedResult, type ViewTableDatasets, type ViewTableGroups, type GenotypeSubsetDatasetRequest } from '@/plugins/types/germinate'
  import { isAccepted } from '@/plugins/util'
  import { coreStore } from '@/stores/app'
  import { mdiArrowRightBox, mdiDatabase, mdiFileDocument, mdiFileTable, mdiInformation } from '@mdi/js'
  import type { AxiosResponse } from 'axios'

  import emitter from 'tiny-emitter/instance'

  const store = coreStore()
  const router = useRouter()
  const route = useRoute('exportGenotypes')

  const datasetIds = ref<number[]>([])
  const datasets = shallowRef<ViewTableDatasets[]>()
  const selectedDatasets = ref<ViewTableDatasets[]>([])

  const maps = shallowRef<ViewTableDatasetMaps[]>()
  const selectedMap = shallowRef<ViewTableDatasetMaps>()

  const germplasmGroups = shallowRef<ViewTableGroups[]>([])
  const selectedGermplasmGroups = shallowRef<ViewTableGroups[]>([])
  const germplasmGroupSelection = ref<GroupSelectionType>('all')
  const markerGroups = shallowRef<ViewTableGroups[]>([])
  const selectedMarkerGroups = shallowRef<ViewTableGroups[]>([])
  const markerGroupSelection = ref<GroupSelectionType>('all')

  const genotypeFormats = ref<GenotypeFormats>({
    txt: true,
    flapjack: false,
    hapmap: false,
  })

  interface GenotypeFormats {
    txt: boolean
    flapjack: boolean
    hapmap: boolean
  }

  const datasetsSelected = computed(() => selectedDatasets.value.length > 0)

  const canContinue = computed(() => {
    if (!datasetsSelected.value) {
      return false
    }
    if (germplasmGroupSelection.value === 'groups' && selectedGermplasmGroups.value.length === 0) {
      return false
    }
    if (markerGroupSelection.value === 'groups' && selectedMarkerGroups.value.length === 0) {
      return false
    }
    if (!selectedMap.value) {
      return false
    }
    if (Object.values(genotypeFormats.value).every(v => v === false)) {
      return false
    }

    return true
  })

  const queryParams = computed(() => {
    const request: GenotypeSubsetDatasetRequest = {
      filters: [],
      limit: MAX_JAVA_INTEGER,
      page: 1,
      mapId: selectedMap.value?.mapId || -1,
      markerIds: undefined,
      markerGroupIds: undefined,
      germplasmIds: undefined,
      germplasmGroupIds: undefined,
      datasetIds: datasetIds.value || [],
      generateFlapjackProject: genotypeFormats.value.flapjack || false,
      generateFlatFile: genotypeFormats.value.txt || false,
      generateHapMap: genotypeFormats.value.hapmap || false,
    }

    if (markerGroupSelection.value === 'groups') {
      const gs = selectedMarkerGroups.value || []
      request.markerGroupIds = gs.filter(g => g.groupId !== -1).map(g => g.groupId || -1)
      request.markerIds = gs.some(g => g.groupId === -1) ? store.storeMarkedMarkers : undefined
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

    const params = JSON.parse(JSON.stringify(queryParams.value))
    params.datasetIds = selectedDatasets.value.map(ds => ds.datasetId)

    apiPostGenotypeDatasetExport(params, result => {
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
          values: ['genotype'],
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

  function getMarkerGroups () {
    const request = {
      datasetIds: datasetIds.value || [],
      groupType: 'markers',
      datasetType: 'genotype',
    }
    apiPostDatasetGroups(request, result => {
      markerGroups.value = result
    })
  }

  function getGermplasmGroups () {
    const request = {
      datasetIds: datasetIds.value || [],
      groupType: 'germinatebase',
      datasetType: 'genotype',
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

  function getMaps () {
    const request = {
      datasetIds: datasetIds.value || [],
      page: 1,
      limit: MAX_JAVA_INTEGER,
    }

    apiPostDatasetMapTable(request, result => {
      maps.value = result || []

      if (result.length > 0) {
        selectedMap.value = result.reduce((prev, current) => (prev && prev.mapCoverageCount > current.mapCoverageCount) ? prev : current)
      }
    })
  }

  function redirectBack () {
    // Navigate to the germplasm page
    router.push({
      path: Pages.getPath(Pages.export, 'genotype'),
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
    getMarkerGroups()
    getGermplasmGroups()
    getMaps()
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
