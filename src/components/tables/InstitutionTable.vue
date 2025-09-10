<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableInstitutions} -->
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
    table-key="institutions"
    header-icon="mdi-office-building-cog"
    :header-title="$t('modalTitleInstitutions')"
    v-bind="$attrs"
  >
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
      <v-chip label :color="germplasmInstitutionTypes[item.institutionType].color()" :prepend-icon="germplasmInstitutionTypes[item.institutionType].path" :text="germplasmInstitutionTypes[item.institutionType].text()" />
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
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest, type PaginatedResult, type ViewTableInstitutions } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { germplasmInstitutionTypes } from '@/plugins/util/types'
  import { Pages } from '@/plugins/pages'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableInstitutions[]>>> }
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
    }]

    return headers
  })

  function redirectToGermplasmPage (institution: ViewTableInstitutions) {
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
    refresh: (readFilter?: boolean) => baseTable.value?.refresh(readFilter),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
