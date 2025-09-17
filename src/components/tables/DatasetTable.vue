<template>
  <div>
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
      :selection-type="selectionType"
      :disabled="compProps.disabled"
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
        <span class="text-no-wrap">
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
          <v-chip
            v-else-if="store.storeUserIsAdmin"
            label
            prepend-icon="mdi-plus-box"
            @click="editLicense(item)"
            :text="$t('buttonAssignLicense')"
            color="info"
            variant="outlined"
          />
        </span>
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

          <v-icon class="mx-1" color="primary" icon="mdi-square-edit-outline" v-tooltip:top="$t('tableTooltipDatasetEdit')" @click="editDataset(item)" v-if="store.storeUserIsDataCurator" />
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

    <LicenseModal
      :dataset="selectedDataset"
      :license="selectedLicense"
      :is-accepted="selectedDataset?.acceptedBy && selectedDataset?.acceptedBy.length > 0"
      ref="licenseModal"
      @delete-clicked="updateDatasetLicense(undefined)"
      @edit-clicked="editLicense(selectedDataset)"
    />

    <LicenseSelectModal :license-id="selectedDataset?.licenseId" @license-changed="updateDatasetLicense" ref="licenseSelectModal" />

    <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableDatasets} -->
    <GenericAddEditFormModal
      title="modalTitleAddDataset"
      :item="selectedDataset"
      :fields="datasetFields"
      :notify="sendDataset"
      @items-changed="baseTable?.refresh()"
      ref="datasetEditModal"
      v-if="selectedDataset"
    >
      <template #additional-fields="{ item }">
        <v-select
          :items="experiments"
          v-model="item.experimentId"
          :label="$t('tableColumnExperimentName')"
          item-value="experimentId"
          item-title="experimentName"
          append-icon="mdi-square-edit-outline"
          @click:append="editExperiment(item.experimentId)"
          v-if="experiments"
        />

        <v-btn prepend-icon="mdi-plus-box" variant="tonal" @click="editExperiment(undefined)" color="success" :text="$t('buttonLicenseCreateNew')" />
      </template>
    </GenericAddEditFormModal>

    <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableExperiments} -->
    <GenericAddEditFormModal
      title="modalTitleExperimentCreation"
      :item="selectedExperiment"
      :fields="experimentFields"
      :notify="sendExperiment"
      @items-changed="updateExperiments"
      ref="experimentEditModal"
      v-if="selectedExperiment"
    />
  </div>
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import { FilterComparator, FilterOperator, type ViewTableLicenses, type FilterGroup, type PaginatedRequest, type PaginatedResult, type ViewTableDatasets, type ViewTableExperiments } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'

  import emitter from 'tiny-emitter/instance'
  import { isTruncatedAfterWords, truncateAfterWords } from '@/plugins/util/formatting'
  import { Pages } from '@/plugins/pages'
  import { datasetStates, datasetTypes } from '@/plugins/util/types'
  import { coreStore } from '@/stores/app'
  import LicenseModal from '@/components/modals/LicenseModal.vue'
  import { apiPatchDataset, apiPatchExperiment, apiPostDatasetCollaboratorsTable, apiPostExperimentTable, apiPostLicenseTable, apiPutExperiment } from '@/plugins/api/dataset'
  import type { ItemKeySlot } from 'vuetify/lib/components/VDataTable/types.mjs'
  import { isPageAvailable } from '@/plugins/util'
  import AttributeDetails from '@/components/widgets/AttributeDetails.vue'
  import CollaboratorTable from '@/components/tables/CollaboratorTable.vue'
  import { columns } from '@/plugins/util/table-columns'
  import GenericAddEditFormModal from '@/components/modals/GenericAddEditFormModal.vue'
  import LicenseSelectModal from '@/components/modals/LicenseSelectModal.vue'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableDatasets[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
    disabled?: boolean
  }>()

  const router = useRouter()
  const emit = defineEmits(['license-accepted'])

  type DetailsType = 'collaborators' | 'publications' | 'attributes' | undefined

  const store = coreStore()
  const baseTable = useTemplateRef('baseTable')
  const licenseModal = useTemplateRef('licenseModal')
  const datasetEditModal = useTemplateRef('datasetEditModal')
  const experimentEditModal = useTemplateRef('experimentEditModal')
  const licenseSelectModal = useTemplateRef('licenseSelectModal')
  const experiments = ref<ViewTableExperiments[]>([])
  const selectedDataset = ref<ViewTableDatasets | undefined>()
  const selectedExperiment = ref<ViewTableExperiments>()
  const selectedLicense = ref<ViewTableLicenses | undefined>()
  const visibleDetails = ref<DetailsType>()
  const bottomVisible = ref<boolean>(false)
  const { t } = useI18n()

  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    return columns.datasets.map(c => {
      c.title = t(c.title || '')
      return c
    })
  })

  const experimentFields = computed(() => {
    return [{
      key: 'experimentName',
      title: 'tableColumnExperimentName',
      type: 'text' as const,
      required: true,
      width: 1,
      valid: (value: string) => value !== undefined && value !== null && value.trim().length > 0,
    }, {
      key: 'experimentDescription',
      title: 'tableColumnExperimentDescription',
      type: 'textarea' as const,
      required: false,
      width: 1,
    }]
  })

  const datasetFields = computed(() => {
    return [{
      key: 'datasetType',
      title: 'tableColumnDatasetDatasetType',
      hint: selectedDataset.value?.datasetId ? 'formDescriptionDatasetTypeDisabled' : 'formDescriptionDatasetType',
      type: 'select' as const,
      required: true,
      width: 1,
      disabled: selectedDataset.value?.datasetId !== undefined,
      selectOptions: Object.keys(datasetTypes).map(dt => {
        return {
          value: dt,
          title: datasetTypes[dt].text(),
        }
      }),
    }, {
      key: 'datasetState',
      title: 'tableColumnDatasetState',
      type: 'select' as const,
      required: true,
      width: 1,
      selectOptions: Object.keys(datasetStates).map(ds => {
        return {
          value: ds,
          title: datasetStates[ds].text(),
        }
      }),
    }, {
      key: 'datasetName',
      title: 'tableColumnDatasetName',
      type: 'text' as const,
      required: true,
      width: 1,
      valid: (value: string) => value !== undefined && value !== null && value.trim().length > 0,
    }, {
      key: 'datasetDescription',
      title: 'tableColumnDatasetDescription',
      type: 'textarea' as const,
      required: false,
      width: 1,
    }, {
      key: 'startDate',
      title: 'tableColumnDatasetStartDate',
      type: 'dateobject' as const,
      required: false,
      width: 1,
    }, {
      key: 'endDate',
      title: 'tableColumnDatasetEndDate',
      type: 'dateobject' as const,
      required: false,
      width: 1,
    }, {
      key: 'isExternal',
      title: 'tableColumnDatasetExternal',
      type: 'boolean' as const,
      required: true,
      width: 1,
    }, {
      key: 'hyperlink',
      title: 'tableColumnDatasetHyperlink',
      type: 'text' as const,
      inputType: 'url',
      visible: (item: ViewTableDatasets) => item.isExternal === true,
      required: true,
      width: 1,
    }]
  })

  function editDataset (dataset: ViewTableDatasets) {
    selectedDataset.value = dataset

    nextTick(() => datasetEditModal.value?.show())
  }

  function getCollaboratorData (data: PaginatedRequest) {
    return apiPostDatasetCollaboratorsTable(selectedDataset.value?.datasetId || -1, data)
  }

  function editExperiment (id: number | undefined) {
    selectedExperiment.value = experiments.value.find(e => e.experimentId === id) || {}

    nextTick(() => experimentEditModal.value?.show())
  }

  function sendExperiment (experiment: ViewTableExperiments) {
    return new Promise<boolean>(resolve => {
      if (experiment.experimentId) {
        // Update the experiment on the server
        apiPatchExperiment<boolean>(experiment.experimentId, experiment, () => {
          resolve(true)
        })
      } else {
        // Create a new experiment
        apiPutExperiment<number>(experiment, result => {
          resolve(true)
        })
      }
    })
  }

  function sendDataset (dataset: ViewTableDatasets) {
    return new Promise<boolean>(resolve => {
      apiPatchDataset(dataset.datasetId, {
        id: dataset.datasetId,
        name: dataset.datasetName,
        description: dataset.datasetDescription,
        licenseId: dataset.licenseId,
        experimentId: dataset.experimentId,
        dateStart: dataset.startDate,
        dateEnd: dataset.endDate,
        datasetStateId: datasetStates[dataset.datasetState].id,
        hyperlink: dataset.hyperlink,
      }, () => resolve(true))
    })
  }

  function updateDatasetLicense (licenseId?: number, dataset?: ViewTableDatasets) {
    const ds = dataset || selectedDataset.value

    if (!ds) {
      return
    }
    apiPatchDataset(ds.datasetId, {
      id: ds.datasetId,
      name: ds.datasetName,
      description: ds.datasetDescription,
      licenseId: licenseId,
      experimentId: ds.experimentId,
      dateStart: ds.startDate,
      dateEnd: ds.endDate,
      datasetStateId: datasetStates[ds.datasetState].id,
      hyperlink: ds.hyperlink,
    }, () => baseTable.value?.refresh())
  }

  function editLicense (dataset: ViewTableDatasets) {
    selectedDataset.value = dataset

    nextTick(() => licenseSelectModal.value?.show())
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

  function updateExperiments () {
    apiPostExperimentTable<PaginatedResult<ViewTableExperiments[]>>({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      orderBy: 'experimentName',
      ascending: 1,
    }, result => {
      experiments.value = result.data || []
    })
  }

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh(readFilter),
    getSelection: () => baseTable.value?.getSelection(),
  })

  onMounted(() => {
    updateExperiments()
    emitter.on('license-accepted', licenseAccepted)
  })
  onBeforeUnmount(() => {
    emitter.off('license-accepted', licenseAccepted)
  })
</script>

<style scoped>
</style>
