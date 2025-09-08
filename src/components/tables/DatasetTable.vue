<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableDatasets} -->
  <BaseTable
    ref="baseTable"
    v-model:bottom-sheet-visible="bottomVisible"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :show-details="true"
    item-key="datasetId"
    table-key="datasets"
    header-icon="mdi-database"
    :get-row-props="getRowProps"
    :header-title="$t('pageDatasetsTitle')"
    v-bind="$attrs"
  >
    <template #header.dataObjectCount="{ column }">
      {{ column.title }} <v-tooltip location="bottom" :text="$t('tableColumnTooltipDatasetDataObjects')">
        <template #activator="{ props }">
          <v-icon v-bind="props" size="small" color="muted" icon="mdi-help-circle" />
        </template>
      </v-tooltip>
    </template>

    <template #header.dataPointCount="{ column }">
      {{ column.title }} <v-tooltip location="bottom" :text="$t('tableColumnTooltipDatasetDataPoints')">
        <template #activator="{ props }">
          <v-icon v-bind="props" size="small" color="muted" icon="mdi-help-circle" />
        </template>
      </v-tooltip>
    </template>

    <template #item.datasetDescription="{ item, value }">
      <template v-if="item.datasetDescription && item.datasetDescription.length > 0">
        <span :title="value" v-if="value">{{ truncateAfterWords(value, 10) }}</span>
        <a href="#" class="ms-2 table-icon-link" @click.prevent="showDatasetModal(item)" v-if="isTruncatedAfterWords(value, 10)">
          <v-icon icon="mdi-page-next" />
        </a>
      </template>
    </template>

    <!-- Experiment name -->
    <template #item.experimentName="{ item }">
      <span :title="item.experimentName" v-if="item.experimentName">{{ truncateAfterWords(item.experimentName, 10) }}</span>
      <!-- Append a link that takes the user to the experiment details page -->
      &nbsp;<router-link :to="{ path: Pages.getPath(Pages.experimentDetails, `${item.experimentId}`) }" v-tooltip:top="$t('tableTooltipExperimentDetailsLink')">
        <v-icon icon="mdi-information-outline" />
      </router-link>
    </template>

    <!-- Dataset type icon -->
    <template #item.datasetType="{ item }">
      <v-chip label :color="datasetTypes[item.datasetType].color()" :prepend-icon="datasetTypes[item.datasetType].path">{{ datasetTypes[item.datasetType].text() }}</v-chip>
    </template>

    <template #item.data-table-expand="{ item, internalItem, toggleExpand }">
      <template v-if="item.locations !== undefined && item.locations !== null && item.locations.length > 0">
        <template v-if="item.locations[0].locationLatitude && item.locations[0].locationLongitude">
          <v-chip label @click="toggleExpand(internalItem)" prepend-icon="mdi-map-marker">{{ item.locations.length }}</v-chip>
        </template>
        <v-chip label v-else prepend-icon="mdi-map-marker">{{ item.locations.length }}</v-chip>
      </template>
    </template>

    <!-- Dataset license -->
    <template #item.licenseName="{ item }">
      <!-- Show the license modal -->
      <v-chip
        v-if="item.licenseName"
        href="#"
        label
        @click.prevent="onLicenseClicked(item)"
        :color="isAccepted(item) ? 'success' : 'error'"
        :prepend-icon="isAccepted(item) ? 'mdi-check' : 'mdi-new-box'"
      >
        {{ item.licenseName }}
      </v-chip>
    </template>

    <!-- Show file resources -->
    <template #item.fileresourceIds="{ item }">
      <v-btn @click="redirectToFileresources(item)" v-if="item.fileresourceIds && (item.fileresourceIds.length > 0) && isPageAvailable(Pages.dataResources.name) && (!item.licenseName || isAccepted(item))" prepend-icon="mdi-attachment">{{ $t('buttonShow') }}</v-btn>
    </template>

    <template #item.datasetDetails="{ item }">
      <div class="text-no-wrap">
        <v-icon class="mx-1" color="primary" :icon="item.isExternal ? 'mdi-link-variant' : 'mdi-database-arrow-right'" v-tooltip:top="item.isExternal ? $t('datasetExternal') : $t('datasetInternal')" />
        <v-icon class="mx-1" color="primary" :icon="datasetStates[item.datasetState].path" v-tooltip:top="datasetStates[item.datasetState].text()" />
        <v-icon class="mx-1" color="primary" icon="mdi-account-multiple" v-tooltip:top="$t('tableTooltipDatasetCollaborators')" @click="showDetails('collaborators', item)" v-if="item.collaborators !== 0" />
        <v-icon class="mx-1" icon="mdi-account-multiple" color="muted" v-else />
        <v-icon class="mx-1" color="primary" icon="mdi-file-plus" v-tooltip:top="$t('tableTooltipDatasetAttributes')" @click="showDetails('attributes', item)" v-if="item.attributes !== 0" />
        <v-icon class="mx-1" icon="mdi-file-plus" color="muted" v-else />
      </div>
    </template>

    <template #expanded-row="{ columns, item }">
      <tr>
        <td :colspan="columns.length" class="pa-0">
          <v-sheet>
            <LocationMap
              :rounded="false"
              :locations="item.locations"
            />
          </v-sheet>
        </td>
      </tr>
    </template>

    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>

    <template #bottom-sheet-content>
      <CollaboratorTable :get-data="getCollaboratorData" v-if="selectedDataset && visibleDetails === 'collaborators'" />
      <AttributeDetails v-if="selectedDataset && visibleDetails === 'attributes'" :dataset="selectedDataset" />
    </template>
  </BaseTable>

  <LicenseModal :dataset="selectedDataset" :license="selectedLicense" :is-accepted="selectedDataset?.acceptedBy && selectedDataset?.acceptedBy.length > 0" ref="licenseModal" />
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import { FilterComparator, FilterOperator, type ViewTableLicenses, type FilterGroup, type PaginatedRequest, type PaginatedResult, type ViewTableDatasets } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'

  import emitter from 'tiny-emitter/instance'
  import { getNumberWithSuffix, isTruncatedAfterWords, truncateAfterWords } from '@/plugins/util/formatting'
  import { Pages } from '@/plugins/pages'
  import { datasetStates, datasetTypes } from '@/plugins/util/types'
  import { coreStore } from '@/stores/app'
  import LicenseModal from '@/components/modals/LicenseModal.vue'
  import { apiPostDatasetCollaboratorsTable, apiPostLicenseTable } from '@/plugins/api/dataset'
  import type { ItemKeySlot } from 'vuetify/lib/components/VDataTable/types.mjs'
  import { isPageAvailable } from '@/plugins/util'
  import AttributeDetails from '@/components/widgets/AttributeDetails.vue'
  import CollaboratorTable from '@/components/tables/CollaboratorTable.vue'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableDatasets[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
  }>()

  const router = useRouter()
  const emit = defineEmits(['license-accepted'])

  type DetailsType = 'collaborators' | 'publications' | 'attributes' | undefined

  const store = coreStore()
  const baseTable = useTemplateRef('baseTable')
  const licenseModal = useTemplateRef('licenseModal')
  const selectedDataset = ref<ViewTableDatasets | undefined>()
  const selectedLicense = ref<ViewTableLicenses | undefined>()
  const visibleDetails = ref<DetailsType>()
  const bottomVisible = ref<boolean>(false)
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'projectId',
      dataType: 'number',
      sortable: false,
      visibleInTable: false,
      title: t('tableColumnProjectId'),
    }, {
      key: 'datasetId',
      title: t('tableColumnDatasetId'),
      dataType: 'integer',
    }, {
      key: 'datasetName',
      title: t('tableColumnDatasetName'),
      dataType: 'string',
    }, {
      key: 'datasetDescription',
      title: t('tableColumnDatasetDescription'),
      dataType: 'string',
    }, {
      key: 'experimentId',
      dataType: 'number',
      title: t('tableColumnExperimentId'),
    }, {
      key: 'experimentName',
      dataType: 'string',
      title: t('tableColumnExperimentName'),
    }, {
      key: 'datasetType',
      dataType: 'string',
      title: t('tableColumnDatasetDatasetType'),
    }, {
      key: 'datatype',
      dataType: 'string',
      title: t('tableColumnDatasetDataType'),
    }, {
      key: 'licenseName',
      dataType: 'string',
      title: t('tableColumnDatasetLicenseName'),
    }, {
      key: 'contact',
      dataType: 'string',
      title: t('tableColumnDatasetContact'),
    }, {
      key: 'countries',
      dataType: undefined,
      sortable: false,
      title: t('tableColumnDatasetCountryName'),
    }, {
      key: 'data-table-expand',
      visibleInFilter: false,
      title: t('tableColumnDatasetLocations'),
      dataType: 'string',
    }, {
      key: 'locations',
      dataType: 'json',
      visibleInTable: false,
      title: t('tableColumnDatasetLocations'),
    }, {
      key: 'startDate',
      dataType: 'date',
      title: t('tableColumnDatasetStartDate'),
      value: (value: ViewTableDatasets) => value.startDate ? new Date(value.startDate).toLocaleDateString() : undefined,
    }, {
      key: 'endDate',
      dataType: 'date',
      title: t('tableColumnDatasetEndDate'),
      value: (value: ViewTableDatasets) => value.endDate ? new Date(value.endDate).toLocaleDateString() : undefined,
    }, {
      key: 'dataObjectCount',
      dataType: 'number',
      align: 'end' as 'end' | 'start' | 'center',
      title: t('tableColumnDatasetObjectCount'),
      value: (value: ViewTableDatasets) => value.dataObjectCount ? getNumberWithSuffix(value.dataObjectCount.value, 2) : undefined,
    }, {
      key: 'dataPointCount',
      dataType: 'number',
      align: 'end' as 'end' | 'start' | 'center',
      title: t('tableColumnDatasetPointCount'),
      value: (value: ViewTableDatasets) => value.dataPointCount ? `${(value.datasetType === 'genotype' || value.datasetType === 'allelefreq') ? '≤' : ''}${getNumberWithSuffix(value.dataPointCount.value, 2)}` : undefined,
    }, {
      key: 'fileresourceIds',
      dataType: 'json',
      sortable: false,
      title: t('tableColumnDatasetFileresources'),
    }, {
      key: 'datasetDetails',
      dataType: undefined,
      sortable: false,
      title: '',
    }, {
      key: 'isExternal',
      dataType: 'boolean',
      sortable: false,
      visibleInTable: false,
      title: t('tableColumnDatasetExternal'),
    }]
    // }, {
    //   key: 'datasetState',
    //   dataType: undefined,
    //   sortable: false,
    //   title: '',
    // }, {
    //   key: 'collaborators',
    //   dataType: undefined,
    //   sortable: false,
    //   title: '',
    // }, {
    //   key: 'attributes',
    //   dataType: undefined,
    //   sortable: false,
    //   title: '',
    // }]

    return headers
  })

  function getCollaboratorData (data: PaginatedRequest) {
    return apiPostDatasetCollaboratorsTable(selectedDataset.value?.datasetId || -1, data)
  }

  function showDatasetModal (dataset: ViewTableDatasets) {
    emitter.emit('show-confirm', {
      title: t('tableColumnDatasetDescription'),
      message: dataset.datasetDescription,
      okTitle: t('genericOk'),
      cancelTitle: undefined,
      okOnly: true,
      okVariant: 'primary',
    })
  }

  function redirectToFileresources (dataset: ViewTableDatasets) {
    // Set up the filter
    const filter: FilterGroup[] = [{
      filters: [{
        column: 'datasetIds',
        comparator: FilterComparator.contains,
        values: [`${dataset.datasetId}`],
      }],
      operator: FilterOperator.and,
    }]
    // Then redirect to the datasets page
    router.push({
      path: Pages.dataResources.path,
      query: {
        'fileresources-filter': JSON.stringify(filter),
      },
    })
  }

  function getRowProps (item: ItemKeySlot<ViewTableDatasets>) {
    if (item.item.licenseId && !isAccepted(item.item)) {
      return {
        class: 'bg-red-lighten-4',
      }
    }
  }

  function isAccepted (dataset: ViewTableDatasets) {
    if (store.storeToken) {
      return dataset.acceptedBy && dataset.acceptedBy.includes(store.storeToken.id)
    } else {
      return dataset.acceptedBy && dataset.acceptedBy.includes(-1000)
    }
  }

  function showDetails (type: DetailsType, item: ViewTableDatasets) {
    visibleDetails.value = type
    selectedDataset.value = item

    nextTick(() => {
      bottomVisible.value = true
    })
  }

  function onLicenseClicked (dataset: ViewTableDatasets) {
    selectedDataset.value = dataset

    if (selectedLicense.value && selectedLicense.value.licenseId === selectedDataset.value.licenseId) {
      // If we already have the correct license, just show it
      licenseModal.value?.show()
    } else {
      // Otherwise, go get it
      const query: PaginatedRequest = {
        page: 1,
        prevCount: -1,
        limit: 1,
        filters: [{
          filters: [{
            column: 'licenseId',
            comparator: FilterComparator.equals,
            values: [`${dataset.licenseId}`],
          }, {
            column: 'datasetId',
            comparator: FilterComparator.equals,
            values: [`${dataset.datasetId}`],
          }],
          operator: FilterOperator.and,
        }],
      }
      apiPostLicenseTable<PaginatedResult<ViewTableLicenses[]>>(query, (result: PaginatedResult<ViewTableLicenses[]>) => {
        if (result && result.data && result.data.length > 0) {
          selectedLicense.value = result.data[0]
          licenseModal.value?.show()
        }
      })
    }
  }

  function licenseAccepted () {
    emit('license-accepted')
    baseTable.value?.refresh()
  }

  defineExpose({
    refresh: () => baseTable.value?.refresh(),
  })

  onMounted(() => {
    emitter.on('license-accepted', licenseAccepted)
  })
  onBeforeUnmount(() => {
    emitter.off('license-accepted', licenseAccepted)
  })
</script>

<style scoped>
</style>
