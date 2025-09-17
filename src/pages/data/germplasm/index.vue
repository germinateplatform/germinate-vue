<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageGermplasmTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageGermplasmText')" />

    <!-- <GermplasmTable :get-data="getData" :get-ids="getIds" :download="downloadTable" :selection-type="TableSelectionType.all" /> -->
    <GermplasmTable :get-data="getData" :get-ids="getIds" :download="downloadTable" />

    <h2 class="text-h5 my-3">{{ $t('pageGermplasmDownloadTitle') }}</h2>
    <v-divider class="mb-3" />

    <v-row>
      <v-col class="d-flex">
        <v-card
          :title="$t('pageGermplasmDownloadTabGermplasmTitle')"
          :subtitle="$t('pageGermplasmDownloadTabGermplasmSubtitle')"
          class="d-flex flex-column justify-space-between"
        >
          <template #prepend>
            <v-icon color="primary" icon="mdi-passport" />
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
              <v-btn value="all" prepend-icon="mdi-playlist-check">{{ $t('pageGermplasmDownloadSelectAll') }}</v-btn>
              <v-btn value="marked" :disabled="store.storeMarkedGermplasm.length === 0" prepend-icon="mdi-list-status">{{ $t('pageGermplasmDownloadSelectMarked', { count: store.storeMarkedGermplasm.length }) }}</v-btn>
              <v-btn value="group" prepend-icon="mdi-group">{{ $t('pageGermplasmDownloadSelectGroup') }}</v-btn>
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
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-download" @click="downloadGermplasm">{{ $t('buttonDownload') }}</v-btn>
          </template>
        </v-card>
      </v-col>

      <v-col class="d-flex" v-if="hasPedigreeData">
        <v-card
          :title="$t('pageGermplasmDownloadTabPedigreeTitle')"
          :subtitle="$t('pageGermplasmDownloadTabPedigreeSubtitle')"
        >
          <template #prepend>
            <v-icon color="primary" icon="mdi-family-tree" />
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
              <v-btn value="all" prepend-icon="mdi-playlist-check">{{ $t('pageGermplasmDownloadSelectAll') }}</v-btn>
              <v-btn value="marked" :disabled="store.storeMarkedGermplasm.length === 0" prepend-icon="mdi-list-status">{{ $t('pageGermplasmDownloadSelectMarked', { count: store.storeMarkedGermplasm.length }) }}</v-btn>
              <v-btn value="group" prepend-icon="mdi-group">{{ $t('pageGermplasmDownloadSelectGroup') }}</v-btn>
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
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-download" @click="downloadPedigree" :disabled="!selectedPedigreeDataset">{{ $t('buttonDownload') }}</v-btn>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import GermplasmTable from '@/components/tables/GermplasmTable.vue'
  import { apiExportPassport, apiPostGermplasmTable, apiPostGermplasmTableIds, apiPostPedigreeDatasetExport, apiPostPedigreeTable } from '@/plugins/api/germplasm'
  import { apiPostGroupTable } from '@/plugins/api/group'
  import { FilterComparator, FilterOperator, type AsyncExportResult, type GermplasmExportRequest, type PaginatedRequest, type PaginatedResult, type PedigreeRequest, type ViewTableDatasets, type ViewTableGroups, type ViewTablePedigrees } from '@/plugins/types/germinate'
  import { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import { downloadBlob } from '@/plugins/util'
  import { coreStore } from '@/stores/app'
  import { getDateTimeString, getNumberWithSuffix } from '@/plugins/util/formatting'
  import { apiPostDatasetTable } from '@/plugins/api/dataset'

  import emitter from 'tiny-emitter/instance'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

  const store = coreStore()

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
    return apiPostTableExport({ filters: data.filters }, 'germplasm')
  }

  function downloadPedigree () {
    emitter.emit('show-loading', true)
    const request: PedigreeRequest = {
      filters: [],
      page: 1,
      limit: MAX_JAVA_INTEGER,
      yIds: pedigreeSelection.value === 'marked' ? store.storeMarkedGermplasm : undefined,
      yGroupIds: (pedigreeSelection.value === 'group' && selectedPedigreeGroup.value) ? [selectedPedigreeGroup.value.groupId || -1] : undefined,
      includeAttributes: pedigreeIncludeAttributes.value,
      datasetIds: selectedPedigreeDataset.value ? [selectedPedigreeDataset.value.datasetId] : [],
    }

    emitter.emit('show-loading', true)
    // this.$gtag.event('export', 'async', 'pedigree', request.datasetIds.join('-'))
    apiPostPedigreeDatasetExport<AsyncExportResult[]>(request, result => {
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
    apiPostGroupTable<PaginatedResult<ViewTableGroups[]>>(query, result => {
      groups.value = result.data
    })

    // Check if there's pedigree data. Only get one row to keep load on server low.
    const pedigreeQuery = {
      page: 1,
      limit: 1,
    }
    apiPostPedigreeTable<PaginatedResult<ViewTablePedigrees>>(pedigreeQuery, result => {
      if (result && result.count) {
        hasPedigreeData.value = result.count > 0
      }
    })

    apiPostDatasetTable<PaginatedResult<ViewTableDatasets[]>>({
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
