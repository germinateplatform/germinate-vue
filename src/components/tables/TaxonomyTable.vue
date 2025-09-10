<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableTaxonomies} -->
  <BaseTable
    ref="baseTable"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :selection-type="selectionType"
    :show-details="false"
    item-key="taxonomyId"
    table-key="taxonomies"
    header-icon="mdi-graph"
    :header-title="$t('pageTaxonomiesTitle')"
    v-bind="$attrs"
  >
    <template #item.taxonomyId="{ item }">
      <a href="#" @click.prevent="redirectToGermplasm(item)" v-if="!store.serverSettings?.hiddenPages?.includes(Pages.germplasm.name)">{{ item.taxonomyId }}</a>
      <span v-else>{{ item.taxonomyId }}</span>
    </template>

    <template #item.taxonomyGenus="{ item }">
      <a href="#" @click.prevent="redirectToGermplasm(item)" v-if="!store.serverSettings?.hiddenPages?.includes(Pages.germplasm.name)">{{ item.taxonomyGenus }}</a>
      <span v-else>{{ item.taxonomyGenus }}</span>
    </template>

    <template #item.taxonomySpecies="{ item }">
      <a href="#" @click.prevent="redirectToGermplasm(item)" v-if="!store.serverSettings?.hiddenPages?.includes(Pages.germplasm.name)">{{ item.taxonomySpecies }}</a>
      <span v-else>{{ item.taxonomySpecies }}</span>
    </template>

    <template #item.taxonomySubtaxa="{ item }">
      <a href="#" @click.prevent="redirectToGermplasm(item)" v-if="!store.serverSettings?.hiddenPages?.includes(Pages.germplasm.name)">{{ item.taxonomySubtaxa }}</a>
      <span v-else>{{ item.taxonomySubtaxa }}</span>
    </template>

    <template #item.taxonomyProviders="{ item }">
      <v-btn @click="showProviders(item)" prepend-icon="mdi-identifier" :text="$t('buttonShow')" v-if="item.taxonomyProviders" />
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
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest, type PaginatedResult, type ViewTableTaxonomies } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { Pages } from '@/plugins/pages'
  import { coreStore } from '@/stores/app'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableTaxonomies[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
  }>()

  const store = coreStore()
  const router = useRouter()
  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'taxonomyId',
      title: t('tableColumnTaxonomyId'),
      dataType: 'integer',
    }, {
      key: 'taxonomyGenus',
      title: t('tableColumnTaxonomyGenus'),
      dataType: 'string',
      cellProps: { class: 'font-italic' },
    }, {
      key: 'taxonomySpecies',
      dataType: 'string',
      cellProps: { class: 'font-italic' },
      title: t('tableColumnTaxonomySpecies'),
    }, {
      key: 'taxonomySubtaxa',
      dataType: 'string',
      cellProps: { class: 'font-italic' },
      title: t('tableColumnTaxonomySubtaxa'),
    }, {
      key: 'taxonomyCropname',
      dataType: 'string',
      title: t('tableColumnTaxonomyCropname'),
    }, {
      key: 'taxonomyProviders',
      dataType: 'json',
      title: t('tableColumnTaxonomyProviders'),
    }, {
      key: 'count',
      dataType: 'integer',
      title: t('tableColumnTaxonomyCount'),
      value: (value: ViewTableTaxonomies) => value.count ? getNumberWithSuffix(value.count, 2) : undefined,
    }]

    return headers
  })

  function redirectToGermplasm (item: ViewTableTaxonomies) {
    // Then store a filter using genus, species and subtaxa
    const query: FilterGroup[] = [{
      filters: [],
      operator: FilterOperator.and,
    }]

    query[0].filters?.push({
      column: 'genus',
      comparator: FilterComparator.equals,
      values: [item.taxonomyGenus],
    })

    if (item.taxonomySpecies) {
      query[0].filters?.push({
        column: 'species',
        comparator: FilterComparator.equals,
        values: [item.taxonomySpecies],
      })
    }
    if (item.taxonomySubtaxa) {
      query[0].filters?.push({
        column: 'subtaxa',
        comparator: FilterComparator.equals,
        values: [item.taxonomySubtaxa],
      })
    }

    // Navigate to the germplasm page
    router.push({
      path: Pages.germplasm.path,
      query: {
        'germplasm-filter': JSON.stringify(query),
      },
    })
  }

  function showProviders (item: ViewTableTaxonomies) {
    router.push(Pages.getPath(Pages.taxonomyProviderDetails, `${item.taxonomyId}`))
  }

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh(readFilter),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
