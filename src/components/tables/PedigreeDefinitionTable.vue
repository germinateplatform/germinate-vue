<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTablePedigreedefinitions} -->
  <BaseTable
    ref="baseTable"
    :headers="headers"
    :show-details="false"
    item-key="pedigreedefinitionId"
    table-key="pedigreedefinitions"
    :header-icon="mdiFamilyTree"
    :header-title="$t('pagePedigreeDefinitionsTitle')"
    :quick-search-comparator="FilterComparator.equals"
    v-bind="{ ...$attrs, ...compProps }"
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

  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import { FilterComparator, type ViewTablePedigreedefinitions } from '@/plugins/types/germinate'
  import { mdiFamilyTree } from '@mdi/js'
  import type { BaseTableProps } from '@/plugins/types/BaseTableProps'

  const compProps = defineProps<Pick<BaseTableProps<ViewTablePedigreedefinitions>, 'getData' | 'filterOn' | 'headerIconColor'>>()

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
        quickSearchable: true,
      }, {
        key: 'pedigreeNotationName',
        dataType: 'string',
        title: t('tableColumnPedigreeNotationName'),
        quickSearchable: true,
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
        quickSearchable: true,
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
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
