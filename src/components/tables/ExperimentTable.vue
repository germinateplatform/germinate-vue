<template>
  <div>
    <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableExperiments} -->
    <BaseTable
      ref="baseTable"
      :headers="headers"
      :forced-filters="forcedFilters"
      :show-details="false"
      item-key="experimentId"
      table-key="experiments"
      :header-icon="mdiFolderTable"
      :header-title="$t('pageExperimentsTitle')"
      v-bind="{ ...$attrs, ...compProps }"
    >
      <template #header v-if="canCreateNew && store.storeUserIsDataCurator && disabled !== true">
        <v-btn v-if="store.storeUserIsDataCurator" variant="outlined" :prepend-icon="mdiFilePlus" @click="addItem">{{ $t('tableButtonAddExperiment') }}</v-btn>
      </template>

      <template #item.experimentId="{ item }">
        <router-link :to="Pages.datasets.path" @click.prevent="redirectToDatasets(item)">{{ item.experimentId }}</router-link>
      </template>
      <template #item.experimentName="{ item }">
        <router-link :to="Pages.datasets.path" @click.prevent="redirectToDatasets(item)">{{ item.experimentName }}</router-link>
      </template>

      <template #item.experimentDescription="{ item }">
        <ShowFullCell :content="item.experimentDescription" title="tableColumnExperimentDescription" v-if="item.experimentDescription && item.experimentDescription.length > 0" />
      </template>

      <!-- Experiment dataset types -->
      <template #item.dataTypes="{ item }">
        <!-- Trials datasets -->
        <v-chip :prepend-icon="datasetTypes.trials.path" label :to="Pages.datasets.path" class="me-2" :color="datasetTypes.trials.color()" @click.prevent="redirectToExport(item, 'trials')" v-if="item.trialsCount" v-tooltip:top="$t(datasetTypes.trials.text)" :text="item.trialsCount" />
        <v-chip :prepend-icon="datasetTypes.genotype.path" label :to="Pages.datasets.path" class="me-2" :color="datasetTypes.genotype.color()" @click.prevent="redirectToExport(item, 'genotype')" v-if="item.genotypeCount" v-tooltip:top="$t(datasetTypes.genotype.text)" :text="item.genotypeCount" />
        <v-chip :prepend-icon="datasetTypes.allelefreq.path" label :to="Pages.datasets.path" class="me-2" :color="datasetTypes.allelefreq.color()" @click.prevent="redirectToExport(item, 'allelefreq')" v-if="item.alleleFreqCount" v-tooltip:top="$t(datasetTypes.allelefreq.text)" :text="item.alleleFreqCount" />
        <v-chip :prepend-icon="datasetTypes.climate.path" label :to="Pages.datasets.path" class="me-2" :color="datasetTypes.climate.color()" @click.prevent="redirectToExport(item, 'climate')" v-if="item.climateCount" v-tooltip:top="$t(datasetTypes.climate.text)" :text="item.climateCount" />
        <v-chip :prepend-icon="datasetTypes.pedigree.path" label class="me-2" :color="datasetTypes.pedigree.color()" v-if="item.pedigreeCount" v-tooltip:top="$t(datasetTypes.pedigree.text)" :text="item.pedigreeCount" />
      </template>
      <!-- Pass on all named slots -->
      <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
        <slot :name="slot" v-bind="slotProps" />
      </template>
    </BaseTable>
    <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableExperiments} -->
    <GenericAddEditFormModal
      title="modalTitleExperimentCreation"
      v-model="selectedExperiment"
      :fields="experimentFields"
      :notify="sendExperiment"
      @items-changed="baseTable?.refresh()"
      ref="experimentEditModal"
      v-if="selectedExperiment"
    />
  </div>
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import { FilterComparator, FilterOperator, type FilterGroup, type ViewTableExperiments } from '@/plugins/types/germinate'
  import { Pages } from '@/plugins/pages'
  import { datasetTypes } from '@/plugins/util/types'

  import ShowFullCell from '@/components/tables/ShowFullCell.vue'
  import { mdiFilePlus, mdiFolderTable } from '@mdi/js'
  import { apiPatchExperiment, apiPutExperiment } from '@/plugins/api/dataset'
  import type { BaseTableProps } from '@/plugins/types/BaseTableProps'

  const experimentEditModal = useTemplateRef('experimentEditModal')
  const selectedExperiment = ref<ViewTableExperiments>()

  type SharedProps = Pick<BaseTableProps<ViewTableExperiments>, 'ignoreUrlFilter' | 'disabled' | 'getData' | 'getIds' | 'download' | 'filterOn' | 'selectionType' | 'showCustomActions' | 'headerIconColor'>

  interface Props extends SharedProps {
    disableForcedProjectFilter?: boolean
    canCreateNew?: boolean
  }

  const compProps = withDefaults(defineProps<Props>(), {
    canCreateNew: true,
    disableForcedProjectFilter: false,
  })

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()
  const router = useRouter()
  const store = useCoreStore()

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

  function addItem (experiment: ViewTableExperiments) {
    selectedExperiment.value = experiment

    nextTick(() => experimentEditModal.value?.show())
  }

  function sendExperiment () {
    return new Promise<boolean>(resolve => {
      if (selectedExperiment.value) {
        if (selectedExperiment.value.experimentId) {
          // Update the experiment on the server
          apiPatchExperiment(selectedExperiment.value.experimentId, selectedExperiment.value, () => {
            resolve(true)
          })
        } else {
          // Create a new experiment
          apiPutExperiment(selectedExperiment.value, () => resolve(true))
        }
      } else {
        resolve(false)
      }
    })
  }

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'projectId',
      dataType: 'integer',
      sortable: false,
      visibleInTable: false,
      title: t('tableColumnProjectId'),
    }, {
      key: 'experimentId',
      title: t('tableColumnExperimentId'),
      dataType: 'integer',
    }, {
      key: 'experimentName',
      title: t('tableColumnExperimentName'),
      dataType: 'string',
    }, {
      key: 'experimentDescription',
      title: t('tableColumnExperimentDescription'),
      dataType: 'string',
    }, {
      key: 'experimentDate',
      dataType: 'date',
      title: t('tableColumnExperimentDate'),
      value: (value: ViewTableExperiments) => value.experimentDate ? new Date(value.experimentDate).toLocaleDateString() : undefined,
    }, {
      key: 'dataTypes',
      type: undefined,
      sortable: false,
      title: t('tableColumnExperimentDataTypes'),
    }, {
      key: 'actions',
      type: undefined,
      align: 'end' as 'start' | 'end' | 'center',
      sortable: false,
      visibleInFilter: false,
      title: '',
    }]

    return headers
  })

  const forcedFilters = computed(() => {
    if (store.storeSelectedProjects && store.storeSelectedProjects.length > 0 && compProps.disableForcedProjectFilter !== true) {
      return [{
        operator: FilterOperator.and,
        filters: [{
          column: 'projectId',
          comparator: FilterComparator.inSet,
          values: store.storeSelectedProjects.map(id => `${id}`),
          canBeChanged: false,
        }],
      }]
    } else {
      return []
    }
  })

  function redirectToExport (experiment: ViewTableExperiments, datasetType: string) {
    // Set up the filter
    const filter: FilterGroup[] = [{
      filters: [{
        column: 'experimentId',
        comparator: FilterComparator.equals,
        values: [`${experiment.experimentId}`],
      }],
      operator: FilterOperator.and,
    }]
    // Then redirect to the export page
    router.push({
      path: Pages.getPath(Pages.exportType, datasetType),
      query: {
        'datasets-filter': JSON.stringify(filter),
      },
    })
  }

  function redirectToDatasets (experiment: ViewTableExperiments) {
    // Set up the filter
    const filter: FilterGroup[] = [{
      filters: [{
        column: 'experimentId',
        comparator: FilterComparator.equals,
        values: [`${experiment.experimentId}`],
      }],
      operator: FilterOperator.and,
    }]
    // Then redirect to the datasets page
    router.push({
      path: Pages.datasets.path,
      query: {
        'datasets-filter': JSON.stringify(filter),
      },
    })
  }

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
