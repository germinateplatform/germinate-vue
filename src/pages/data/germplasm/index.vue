<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageGermplasmTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageGermplasmText')" />

    <v-expansion-panels class="my-5">
      <v-expansion-panel>
        <v-expansion-panel-title class="px-4">
          <v-icon size="small" :icon="mdiFilter" color="medium-emphasis" class="me-2" /> {{ $t('widgetGermplasmTableFilterToggle') }}
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <GermplasmTableFilter
            v-model="customFilter"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <GermplasmTable
      :get-data="getData"
      :get-ids="getIds"
      :download="downloadTable"
      :filter-on="tableFilter"
      @filter-cleared="resetFilter"
      ref="germplasmTable"
    />

    <v-expansion-panels class="my-5">
      <v-expansion-panel
        @group:selected="showMap"
      >
        <v-expansion-panel-title class="px-4">
          <v-icon size="small" :icon="mdiMapMarkerMultiple" color="medium-emphasis" class="me-2" /> {{ $t('widgetGermplasmMapTitle') }}
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <p>{{ $t('widgetGermplasmMapText') }}</p>

          <GermplasmLocationMap ref="germplasmLocationMap" />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <h2 class="text-headline-small my-3">{{ $t('pageGermplasmDownloadTitle') }}</h2>
    <v-divider class="mb-3" />

    <v-row>
      <v-col class="d-flex">
        <v-card
          :title="$t('pageGermplasmDownloadTabGermplasmTitle')"
          :subtitle="$t('pageGermplasmDownloadTabGermplasmSubtitle')"
          class="d-flex flex-column justify-space-between w-100"
        >
          <template #prepend>
            <v-icon color="primary" :icon="mdiPassport" />
          </template>
          <v-card-text class="flex-grow-0">{{ $t('pageGermplasmDownloadTabGermplasmText') }}</v-card-text>
          <v-card-text class="flex-grow-1">
            <v-btn-toggle
              color="primary"
              border
              divided
              mandatory
              v-model="passportSelection"
            >
              <v-btn value="all" :prepend-icon="mdiPlaylistCheck">{{ $t('pageGermplasmDownloadSelectAll') }}</v-btn>
              <v-btn value="marked" :disabled="store.storeMarkedGermplasm.length === 0" :prepend-icon="mdiListStatus">
                {{ $t('pageGermplasmDownloadSelectMarked') }}
                <template #append>
                  <v-chip size="small" :text="getNumberWithSuffix(store.storeMarkedGermplasm.length, 1)" />
                </template>
              </v-btn>
              <v-btn value="group" :prepend-icon="mdiGroup">{{ $t('pageGermplasmDownloadSelectGroup') }}</v-btn>
            </v-btn-toggle>

            <v-select
              v-if="passportSelection === 'group'"
              v-model="selectedPassportGroup"
              class="mt-3"
              :items="groups"
              return-object
              hide-details
              :item-title="g => `${g.groupName} (${getNumberWithSuffix(g.count || 0, 1)})`"
              item-value="groupId"
              :label="$t('pageGermplasmDownloadSelectGroup')"
            />

            <v-switch :label="$t('pageGermplasmDownloadTabIncludeAttributes')" v-model="passportIncludeAttributes" color="primary" hide-details />
          </v-card-text>

          <template #actions>
            <v-spacer />
            <v-btn color="primary" variant="tonal" :prepend-icon="mdiDownload" @click="downloadGermplasm">{{ $t('buttonDownload') }}</v-btn>
          </template>
        </v-card>
      </v-col>

      <v-col class="d-flex" v-if="hasPedigreeData">
        <v-card
          :title="$t('pageGermplasmDownloadTabPedigreeTitle')"
          :subtitle="$t('pageGermplasmDownloadTabPedigreeSubtitle')"
          class="w-100"
        >
          <template #prepend>
            <v-icon color="primary" :icon="mdiFamilyTree" />
          </template>
          <v-card-text>{{ $t('pageGermplasmDownloadTabPedigreeText') }}</v-card-text>
          <v-card-text>
            <v-btn-toggle
              color="primary"
              border
              divided
              mandatory
              v-model="pedigreeSelection"
            >
              <v-btn value="all" :prepend-icon="mdiPlaylistCheck">{{ $t('pageGermplasmDownloadSelectAll') }}</v-btn>
              <v-btn value="marked" :disabled="store.storeMarkedGermplasm.length === 0" :prepend-icon="mdiListStatus">{{ $t('pageGermplasmDownloadSelectMarked') }}
                <template #append>
                  <v-chip size="small" :text="getNumberWithSuffix(store.storeMarkedGermplasm.length, 1)" />
                </template>
              </v-btn>
              <v-btn value="group" :prepend-icon="mdiGroup">{{ $t('pageGermplasmDownloadSelectGroup') }}</v-btn>
            </v-btn-toggle>

            <v-select
              v-if="pedigreeSelection === 'group'"
              v-model="selectedPedigreeGroup"
              class="mt-3"
              :items="groups"
              return-object
              hide-details
              :item-title="g => `${g.groupName} (${getNumberWithSuffix(g.count || 0, 1)})`"
              item-value="groupId"
              :label="$t('pageGermplasmDownloadSelectGroup')"
            />

            <v-switch :label="$t('pageGermplasmDownloadTabIncludeAttributes')" v-model="pedigreeIncludeAttributes" color="primary" hide-details />

            <v-select
              v-model="selectedPedigreeDataset"
              class="mt-3"
              :items="pedigreeDatasets"
              return-object
              hide-details
              item-title="datasetName"
              item-value="datasetId"
              :label="$t('tableColumnDatasetName')"
            />
          </v-card-text>

          <template #actions>
            <v-spacer />
            <v-btn color="primary" variant="tonal" :prepend-icon="mdiDownload" @click="downloadPedigree" :disabled="!selectedPedigreeDataset">{{ $t('buttonDownload') }}</v-btn>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<route lang="yaml">
name: germplasm
</route>

<script setup lang="ts">
  import GermplasmTable from '@/components/tables/GermplasmTable.vue'
  import { apiExportPassport, apiPostGermplasmTable, apiPostGermplasmTableIds, apiPostPedigreeDatasetExport, apiPostPedigreeTable } from '@/plugins/api/germplasm'
  import { apiPostGroupTable } from '@/plugins/api/group'
  import { FilterComparator, type FilterGroup, FilterOperator, type GermplasmExportRequest, type PaginatedRequest, type PedigreeRequest, type ViewTableDatasets, type ViewTableGroups } from '@/plugins/types/germinate'
  import { downloadBlob } from '@/plugins/util'
  import { coreStore } from '@/stores/app'
  import { getDateTimeString, getNumberWithSuffix } from '@/plugins/util/formatting'
  import { apiPostDatasetTable } from '@/plugins/api/dataset'

  import emitter from 'tiny-emitter/instance'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { mdiDownload, mdiFamilyTree, mdiFilter, mdiGroup, mdiListStatus, mdiMapMarkerMultiple, mdiPassport, mdiPlaylistCheck } from '@mdi/js'
  import { watchIgnorable } from '@vueuse/core'

  const store = coreStore()

  const germplasmLocationMap = useTemplateRef('germplasmLocationMap')
  const germplasmTable = useTemplateRef('germplasmTable')

  const customFilter = ref<FilterGroup[]>([])
  const tableFilter = ref<FilterGroup[]>([])

  const passportIncludeAttributes = ref(false)
  const pedigreeIncludeAttributes = ref(false)
  const groups = ref<ViewTableGroups[]>([])
  const pedigreeDatasets = ref<ViewTableDatasets[]>([])
  const selectedPedigreeDataset = ref<ViewTableDatasets>()
  const hasPedigreeData = ref(false)
  const passportSelection = ref('all')
  const pedigreeSelection = ref('all')
  const selectedPassportGroup = ref<ViewTableGroups>()
  const selectedPedigreeGroup = ref<ViewTableGroups>()

  function getData (data: PaginatedRequest) {
    return apiPostGermplasmTable(data)
  }
  function getIds (data: PaginatedRequest) {
    return apiPostGermplasmTableIds(data)
  }
  function downloadTable (data: PaginatedRequest) {
    const filter = { filters: data.filters } as PaginatedRequest
    return apiPostTableExport(filter, 'germplasm')
  }
  function showMap () {
    setTimeout(() => germplasmLocationMap.value?.invalidateSize(), 500)
  }

  function resetFilter () {
    customFilter.value = []
  }

  function downloadPedigree () {
    emitter.emit('show-loading', true)
    const request: PedigreeRequest = {
      filters: [],
      page: 1,
      limit: MAX_JAVA_INTEGER,
      germplasmIds: pedigreeSelection.value === 'marked' ? store.storeMarkedGermplasm : undefined,
      germplasmGroupIds: (pedigreeSelection.value === 'group' && selectedPedigreeGroup.value) ? [selectedPedigreeGroup.value.groupId || -1] : undefined,
      includeAttributes: pedigreeIncludeAttributes.value,
      datasetIds: selectedPedigreeDataset.value ? [selectedPedigreeDataset.value.datasetId || -1] : [],
    }

    emitter.emit('show-loading', true)
    // this.$gtag.event('export', 'async', 'pedigree', request.datasetIds.join('-'))
    apiPostPedigreeDatasetExport(request, result => {
      store.addAsyncJobUuids(result.map(r => r.uuid))

      // Show the sidebar
      emitter.emit('toggle-aside', 'download')
      emitter.emit('show-loading', false)
    })
  }

  function downloadGermplasm () {
    emitter.emit('show-loading', true)
    const request: GermplasmExportRequest = {
      individualIds: passportSelection.value === 'marked' ? store.storeMarkedGermplasm : undefined,
      groupIds: (passportSelection.value === 'group' && selectedPassportGroup.value) ? [selectedPassportGroup.value.groupId || -1] : undefined,
      includeAttributes: passportIncludeAttributes.value,
    }

    apiExportPassport(request, (result: Blob) => {
      downloadBlob({
        blob: result,
        filename: `germplasm-${getDateTimeString()}`,
        extension: 'zip',
      })
      emitter.emit('show-loading', false)
    })
  }

  const { ignoreUpdates: ignoreCustomFilter } = watchIgnorable(customFilter, async newValue => {
    if (!newValue || newValue.length === 0) {
      tableFilter.value = []
      nextTick(() => germplasmTable.value?.refresh(true))
      return
    }

    const copy = JSON.parse(JSON.stringify(newValue)) as FilterGroup[]

    tableFilter.value.push(...copy)

    nextTick(() => germplasmTable.value?.refresh(true))

    ignoreCustomFilter(() => {
      customFilter.value = []
    })
  })

  onMounted(() => {
    // Get germplasm groups
    const query: PaginatedRequest = {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filters: [{
        operator: FilterOperator.and,
        filters: [{
          column: 'groupType',
          comparator: FilterComparator.equals,
          values: ['germinatebase'],
        }],
      }],
    }
    apiPostGroupTable(query, result => {
      groups.value = result.data
    })

    // Check if there's pedigree data. Only get one row to keep load on server low.
    const pedigreeQuery = {
      page: 1,
      limit: 1,
    }
    apiPostPedigreeTable(pedigreeQuery, result => {
      if (result && result.count) {
        hasPedigreeData.value = result.count > 0
      }
    })

    apiPostDatasetTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filters: [{
        filters: [{
          column: 'datasetType',
          comparator: FilterComparator.equals,
          values: ['pedigree'],
        }],
        operator: FilterOperator.and,
      }],
    }, result => {
      if (result && result.data) {
        pedigreeDatasets.value = result.data

        if (result.data.length > 0) {
          selectedPedigreeDataset.value = result.data.sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime())[0]
        } else {
          selectedPedigreeDataset.value = undefined
        }
      }
    })
  })
</script>
