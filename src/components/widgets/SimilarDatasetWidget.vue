<template>
  <div>
    <v-alert
      color="info"
      class="actionable-alert"
      :icon="mdiDatabasePlus"
      variant="tonal"
      density="compact"
      v-ripple
      border="start"
      :text="$t('widgetSimilarDatasetBannerText')"
      @click="showDatasetTable()"
      closable
      @click:close="e => { e.preventDefault(); e.stopPropagation(); }"
      v-if="similarDatasetIds.length > 0"
    >
      <template #title>
        <h2 class="text-title-medium py-0 my-0">{{ $t('widgetSimilarDatasetBannerTitle', similarDatasetIds.length) }}</h2>
      </template>
    </v-alert>

    <v-bottom-sheet
      v-model="bottomSheetVisible"
      inset
      max-height="90vh"
      v-if="similarDatasets"
    >
      <v-card
        class="pb-10"
      >
        <v-card-title class="d-flex justify-space-between align-center">
          <div>{{ $t('widgetSimilarDatasetBannerTableTitle') }}</div>
          <v-btn :prepend-icon="mdiDatabasePlus" color="primary" @click="addDatasets" :disabled="selectedDatasetIds.length === 0" :text="$t('buttonAddDataset')" />
        </v-card-title>
        <v-card-text>{{ $t('widgetSimilarDatasetBannerTableText') }}</v-card-text>
        <DatasetTable :get-data="getDatasets" :get-ids="getDatasetIds" :filter-on="tableFilter" disabled :selection-type="TableSelectionType.all" @selection-changed="selectionChanged">
          <template #item.datasetName="{ item }">
            <div>{{ truncateAfterWords(item.datasetName, 10) }}</div>
            <v-chip
              class="my-1"
              label
              :text="`${Math.floor((idToSimilarity[item.datasetId] || 0) * 100)}%`"
              :color="idToSimilarity[item.datasetId] > 0.8 ? 'success' : 'warning'"
              :prepend-icon="idToSimilarity[item.datasetId] > 0.8 ? mdiChevronTripleUp : mdiChevronDoubleUp"
            />
          </template>
        </DatasetTable>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script setup lang="ts">
  import { apiPostDatasetTable, apiPostDatasetTableIds, apiPostSimilarDatasets } from '@/plugins/api/dataset'
  import { type ViewTableDatasets, type SimilarityResult, type FilterGroup, FilterComparator, FilterOperator, type PaginatedRequest } from '@/plugins/types/germinate'
  import { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import { truncateAfterWords } from '@/plugins/util/formatting'
  import { mdiChevronDoubleUp, mdiChevronTripleUp, mdiDatabasePlus } from '@mdi/js'

  const compProps = defineProps<{
    datasetIds: number[]
    datasetType?: string
  }>()

  const similarDatasetIds = ref<SimilarityResult[]>([])
  const similarDatasets = ref<ViewTableDatasets[]>()
  const selectedDatasetIds = ref<number[]>([])
  const bottomSheetVisible = ref(false)

  const idToSimilarity = computed(() => {
    const result: Record<number, number> = {}

    if (similarDatasetIds.value) {
      similarDatasetIds.value.forEach(sim => {
        result[sim.datasetId] = sim.similarityScore
      })
    }

    return result
  })

  const tableFilter: ComputedRef<FilterGroup[]> = computed(() => {
    return [{
      operator: FilterOperator.and,
      filters: [{
        column: 'datasetId',
        comparator: FilterComparator.inSet,
        values: similarDatasetIds.value.map(sim => `${sim.datasetId}`),
        canBeChanged: false,
      }],
    }]
  })

  function addDatasets () {
    emit('datasets-added', selectedDatasetIds.value)
  }

  function selectionChanged (ids: number[]) {
    selectedDatasetIds.value = ids
  }

  function showDatasetTable () {
    similarDatasets.value = []

    nextTick(() => {
      bottomSheetVisible.value = true
    })
  }

  function getDatasets (query: PaginatedRequest) {
    return apiPostDatasetTable(query)
  }
  function getDatasetIds (query: PaginatedRequest) {
    return apiPostDatasetTableIds(query)
  }

  watch(() => compProps.datasetIds, () => {
    apiPostSimilarDatasets({
      datasetIds: compProps.datasetIds,
      datasetType: compProps.datasetType,
      threshold: 0.5,
    }, result => {
      similarDatasetIds.value = result
    })
  }, { immediate: true })

  const emit = defineEmits(['datasets-added'])
</script>

<style scoped>
.actionable-alert:hover {
  cursor: pointer;
}
</style>
