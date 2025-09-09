<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTablePedigreedefinitions} -->
  <BaseTable
    ref="baseTable"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :show-details="false"
    item-key="pedigreedefinitionId"
    table-key="pedigreedefinitions"
    header-icon="mdi-family-tree"
    :header-title="$t('pagePedigreeDefinitionsTitle')"
    v-bind="$attrs"
  >
    <template #item.pedigreeNotationUrl="{ item }">
      <a target="_blank" :href="toUrl(item)" rel="noopener noreferrer" v-if="toUrl(item)">{{ item.pedigreeNotationUrl }}</a>
      <span v-else>{{ item.pedigreeNotationUrl }}</span>
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
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTablePedigreedefinitions } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTablePedigreedefinitions[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
  }>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [
      {
        key: 'datasetId',
        dataType: 'integer',
        class: 'text-right',
        title: t('tableColumnPedigreeDatasetId'),
      },
      {
        key: 'datasetName',
        dataType: 'string',
        class: 'text-right',
        title: t('tableColumnPedigreeDatasetName'),
      },
      {
        key: 'germplasmId',
        dataType: 'integer',
        class: 'text-right',
        title: t('tableColumnGermplasmId'),
      }, {
        key: 'germplasmName',
        dataType: 'string',
        title: t('tableColumnGermplasmName'),
      }, {
        key: 'pedigreeNotationName',
        dataType: 'string',
        title: t('tableColumnPedigreeNotationName'),
      }, {
        key: 'pedigreeNotationDescription',
        dataType: 'string',
        title: t('tableColumnPedigreeNotationDescription'),
      }, {
        key: 'pedigreeNotationUrl',
        dataType: 'string',
        title: t('tableColumnPedigreeNotationUrl'),
      }, {
        key: 'definition',
        dataType: 'string',
        title: t('tableColumnPedigreeDefinition'),
      }, {
        key: 'pedigreeDescriptionName',
        dataType: 'string',
        title: t('tableColumnPedigreeDescriptionName'),
      }, {
        key: 'pedigreeDescriptionDescription',
        dataType: 'string',
        title: t('tableColumnPedigreeDescriptionDescription'),
      }, {
        key: 'pedigreeDescriptionAuthor',
        dataType: 'string',
        title: t('tableColumnPedigreeDescriptionAuthor'),
      }, {
        key: 'createdOn',
        dataType: 'date',
        title: t('tableColumnPedigreeDefinitionCreatedOn'),
        value: (value: ViewTablePedigreedefinitions) => value.createdOn ? new Date(value.createdOn).toLocaleDateString() : undefined,
      },
    ]

    return headers
  })

  function toUrl (item: ViewTablePedigreedefinitions): string | undefined {
    let url

    try {
      url = new URL(item.pedigreeNotationUrl)
    } catch {
      return undefined
    }

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return item.pedigreeNotationUrl
    } else {
      return undefined
    }
  }

  defineExpose({
    refresh: () => baseTable.value?.refresh(),
  })
</script>

<style scoped>
</style>
