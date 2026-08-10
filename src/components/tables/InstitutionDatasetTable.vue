<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableInstitutionDatasets} -->
  <BaseTable
    ref="baseTable"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :selection-type="selectionType"
    :show-details="false"
    item-key="institutionId"
    table-key="institutiondatasets"
    :header-icon="mdiOfficeBuildingCog"
    :header-title="$t('pageStatisticsInstitutionDatasetTitle')"
    v-bind="$attrs"
  >
    <template #card-text>
      <v-card-text>{{ $t('pageStatisticsInstitutionDatasetText') }}</v-card-text>
    </template>

    <template #item.institutionName="{ item }">
      <div v-if="item.institutionName">
        <a href="#" @click.prevent="redirectToGermplasmPage(item)">{{ item.institutionName }}</a>
      </div>
    </template>
    <template #item.institutionCode="{ item }">
      <div v-if="item.institutionCode">
        <a target="_blank" rel="noopener noreferrer" :href="`https://www.fao.org/wiews/data/organizations/en/?instcode=${item.institutionCode}`">{{ item.institutionCode }}</a>
      </div>
    </template>
    <template #item.institutionAddress="{ item }">
      <div v-if="item.institutionAddress">
        <a target="_blank" rel="noopener noreferrer" :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.institutionAddress)}`">{{ item.institutionAddress }}</a>
      </div>
    </template>
    <template #item.institutionType="{ item }">
      <v-chip label :color="germplasmInstitutionTypes[item.institutionType].color()" :prepend-icon="germplasmInstitutionTypes[item.institutionType].path" :text="germplasmInstitutionTypes[item.institutionType].text()" v-if="item.institutionType" />
    </template>
    <!-- Country flag -->
    <template #item.countryCode="{ item }">
      <span class="text-no-wrap" v-tooltip:top="item.countryCode" v-if="item.countryCode">
        <i :class="'fi fi-' + item.countryCode.toLowerCase()" /> <span> {{ item.countryCode }}</span>
      </span>
      <span v-else>
        {{ item.countryCode }}
      </span>
    </template>

    <template #item.datasetIds="{ item }">
      <div class="d-flex flex-wrap ga-1 my-1" style="min-width: 200px;">
        <v-chip label @click="redirectToDatasets(item.allDatasetIds)" :color="item.trialsDatasetIds ? getPrimaryColor() : 'grey'" v-tooltip:top="$t('tableTooltipInstitutionDatasetsAll')" :prepend-icon="mdiDatabase" :text="(item.allDatasetIds || []).length" />
        <v-chip label @click="redirectToDatasets(item.trialsDatasetIds)" :color="item.trialsDatasetIds ? datasetTypes.trials.color() : 'grey'" v-tooltip:top="datasetTypes.trials.text()" :prepend-icon="datasetTypes.trials.path" :text="(item.trialsDatasetIds || []).length" />
        <v-chip label @click="redirectToDatasets(item.genotypeDatasetIds)" :color="item.genotypeDatasetIds ? datasetTypes.genotype.color() : 'grey'" v-tooltip:top="datasetTypes.genotype.text()" :prepend-icon="datasetTypes.genotype.path" :text="(item.genotypeDatasetIds || []).length" />
        <v-chip label @click="redirectToDatasets(item.pedigreeDatasetIds)" :color="item.pedigreeDatasetIds ? datasetTypes.pedigree.color() : 'grey'" v-tooltip:top="datasetTypes.pedigree.text()" :prepend-icon="datasetTypes.pedigree.path" :text="(item.pedigreeDatasetIds || []).length" />
        <v-chip label @click="redirectToDatasets(item.climateDatasetIds)" :color="item.climateDatasetIds ? datasetTypes.climate.color() : 'grey'" v-tooltip:top="datasetTypes.climate.text()" :prepend-icon="datasetTypes.climate.path" :text="(item.climateDatasetIds || []).length" />
      </div>
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
  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import type { AxiosResponse } from 'axios'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest, type PaginatedResult, type ViewTableInstitutionDatasets } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { datasetTypes, germplasmInstitutionTypes } from '@/plugins/util/types'
  import { Pages } from '@/plugins/pages'
  import { mdiDatabase, mdiOfficeBuildingCog } from '@mdi/js'
  import { getPrimaryColor } from '@/plugins/util/colors'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableInstitutionDatasets[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
  }>()

  const router = useRouter()
  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'institutionId',
      title: t('tableColumnInstitutionId'),
      dataType: 'integer',
    }, {
      key: 'institutionName',
      title: t('tableColumnInstitutionName'),
      dataType: 'string',
    }, {
      key: 'institutionAcronym',
      dataType: 'string',
      title: t('tableColumnInstitutionAcronym'),
    }, {
      key: 'institutionCode',
      dataType: 'string',
      title: t('tableColumnInstitutionCode'),
    }, {
      key: 'institutionType',
      dataType: 'string',
      title: t('tableColumnInstitutionType'),
    }, {
      key: 'institutionAddress',
      dataType: 'string',
      title: t('tableColumnInstitutionAddress'),
    }, {
      key: 'institutionEmail',
      dataType: 'string',
      title: t('tableColumnInstitutionEmail'),
    }, {
      key: 'institutionPhone',
      dataType: 'string',
      title: t('tableColumnInstitutionPhone'),
    }, {
      key: 'institutionContact',
      dataType: 'string',
      title: t('tableColumnInstitutionContact'),
    }, {
      key: 'countryCode',
      dataType: 'string',
      title: t('tableColumnInstitutionCountry'),
    }, {
      key: 'datasetIds',
      dataType: undefined,
      sortable: false,
      title: '',
    }]

    return headers
  })

  function redirectToDatasets (datasetIds: number[]) {
    const filter: FilterGroup[] = [{
      filters: [{
        column: 'datasetId',
        comparator: FilterComparator.inSet,
        values: datasetIds.map(String),
      }],
      operator: FilterOperator.and,
    }]

    router.push({
      path: Pages.datasets.path,
      query: {
        'datasets-filter': JSON.stringify(filter),
      },
    })
  }

  function redirectToGermplasmPage (institution: ViewTableInstitutionDatasets) {
    const filter: FilterGroup[] = [{
      filters: [],
      operator: FilterOperator.or,
    }]

    if (institution.institutionName) {
      filter[0].filters?.push({
        column: 'institutions',
        comparator: FilterComparator.jsonSearch,
        values: [institution.institutionName],
      })
    }
    if (institution.institutionCode) {
      filter[0].filters?.push({
        column: 'institutions',
        comparator: FilterComparator.jsonSearch,
        values: [institution.institutionCode],
      })
    }
    if (institution.institutionAddress) {
      filter[0].filters?.push({
        column: 'institutions',
        comparator: FilterComparator.jsonSearch,
        values: [institution.institutionAddress],
      })
    }

    if (filter.length > 0) {
      router.push({
        path: Pages.germplasm.path,
        query: {
          'germplasm-filter': JSON.stringify(filter),
        },
      })
    }
  }

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
