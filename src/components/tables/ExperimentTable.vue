<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableExperiments} -->
  <BaseTable
    ref="baseTable"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :show-details="false"
    item-key="experimentId"
    table-key="experiments"
    header-icon="mdi-folder-table"
    :header-title="$t('pageExperimentsTitle')"
    v-bind="$attrs"
  >
    <template #item.experimentId="{ item }">
      <router-link :to="Pages.datasets.path" @click.prevent="redirectToDatasets(item)">{{ item.experimentId }}</router-link>
    </template>
    <template #item.experimentName="{ item }">
      <router-link :to="Pages.datasets.path" @click.prevent="redirectToDatasets(item)">{{ item.experimentName }}</router-link>
    </template>

    <template #item.experimentDescription="{ item, value }">
      <template v-if="item.experimentDescription && item.experimentDescription.length > 0">
        <span :title="value" v-if="value">{{ truncateAfterWords(value, 10) }}</span>
        <a href="#" class="ms-2 table-icon-link" @click.prevent="showExperimentModal(item)" v-if="isTruncatedAfterWords(value, 10)">
          <v-icon icon="mdi-page-next" />
        </a>
      </template>
    </template>

    <!-- Experiment dataset types -->
    <template #item.dataTypes="{ item }">
      <!-- Trials datasets -->
      <v-chip label :to="Pages.datasets.path" class="me-2" :color="datasetTypes.trials.color()" @click.prevent="redirectToExport(item, 'trials')" v-if="item.trialsCount" v-tooltip:top="datasetTypes.trials.text()">
        <v-icon :icon="datasetTypes.trials.path" /> {{ item.trialsCount }}
      </v-chip>
      <!-- Genotype datasets -->
      <v-chip label :to="Pages.datasets.path" class="me-2" :color="datasetTypes.genotype.color()" @click.prevent="redirectToExport(item, 'genotype')" v-if="item.genotypeCount" v-tooltip:top="datasetTypes.genotype.text()">
        <v-icon :icon="datasetTypes.genotype.path" /> {{ item.genotypeCount }}
      </v-chip>
      <!-- Allelefreq datasets -->
      <v-chip label :to="Pages.datasets.path" class="me-2" :color="datasetTypes.allelefreq.color()" @click.prevent="redirectToExport(item, 'allelefreq')" v-if="item.alleleFreqCount" v-tooltip:top="datasetTypes.allelefreq.text()">
        <v-icon :icon="datasetTypes.allelefreq.path" /> {{ item.alleleFreqCount }}
      </v-chip>
      <!-- Climate datasets -->
      <v-chip label :to="Pages.datasets.path" class="me-2" :color="datasetTypes.climate.color()" @click.prevent="redirectToExport(item, 'climate')" v-if="item.climateCount" v-tooltip:top="datasetTypes.climate.text()">
        <v-icon :icon="datasetTypes.climate.path" /> {{ item.climateCount }}
      </v-chip>
      <!-- Pedigree datasets -->
      <v-chip label class="me-2" :color="datasetTypes.pedigree.color()" v-if="item.pedigreeCount" v-tooltip:top="datasetTypes.pedigree.text()">
        <v-icon :icon="datasetTypes.pedigree.path" /> {{ item.pedigreeCount }}
      </v-chip>
    </template>

    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>
  </BaseTable>
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest, type PaginatedResult, type ViewTableExperiments } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { Pages } from '@/plugins/pages'
  import { isTruncatedAfterWords, truncateAfterWords } from '@/plugins/util/formatting'
  import { datasetTypes } from '@/plugins/util/types'

  import emitter from 'tiny-emitter/instance'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableExperiments[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
  }>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()
  const router = useRouter()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
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
    }]

    return headers
  })

  function redirectToExport (experiment: ViewTableExperiments, datasetType: string) {
    // Set up the filter
    const filter: FilterGroup[] = [{
      filters: [{
        column: 'experimentId',
        comparator: FilterComparator.equals,
        values: [`${experiment.experimentId}`]
      }],
      operator: FilterOperator.and,
    }]
    // Then redirect to the export page
    router.push({
      path: Pages.getPath(Pages.export, datasetType),
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

  function showExperimentModal (experiment: ViewTableExperiments) {
    emitter.emit('show-confirm', {
      title: t('tableColumnExperimentDescription'),
      message: experiment.experimentDescription,
      okTitle: t('genericOk'),
      cancelTitle: undefined,
      okOnly: true,
      okVariant: 'primary',
    })
  }

  defineExpose({
    refresh: () => baseTable.value?.refresh(),
  })
</script>

<style scoped>
</style>
