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
    item-key="pedigreeId"
    table-key="pedigrees"
    header-icon="mdi-family-tree"
    :header-title="$t('pagePedigreeTitle')"
    v-bind="$attrs"
  >
    <template #header.relationshipType="{ column }">
      {{ column.title }} <v-tooltip location="bottom" :text="$t('tableColumnTooltipPedigreeRelationshipType')">
        <template #activator="{ props }">
          <v-icon v-bind="props" size="small" color="muted" icon="mdi-help-circle" />
        </template>
      </v-tooltip>
    </template>

    <template #item.relationshipType="{ item }">
      <v-chip label :text="item.relationshipType" />
    </template>

    <!-- Parent id link -->
    <template #item.parentId="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.parentId)">{{ item.parentId }}</router-link>
    </template>
    <!-- Parent GID link -->
    <template #item.parentGid="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.parentId)">{{ item.parentGid }}</router-link>
    </template>
    <!-- Parent name link -->
    <template #item.parentName="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.parentId)">{{ item.parentName }}</router-link>
    </template>
    <!-- Child id link -->
    <template #item.childId="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.childId)">{{ item.childId }}</router-link>
    </template>
    <!-- Child GID link -->
    <template #item.childGid="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.childId)">{{ item.childGid }}</router-link>
    </template>
    <!-- Child name link -->
    <template #item.childName="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.childId)">{{ item.childName }}</router-link>
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
  import { Pages } from '@/plugins/pages'

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
        title: t('tableColumnPedigreeDatasetId'),
      },
      {
        key: 'datasetName',
        dataType: 'string',
        title: t('tableColumnPedigreeDatasetName'),
      },
      {
        key: 'parentId',
        dataType: 'number',
        title: t('tableColumnPedigreeParentId'),
      }, {
        key: 'parentGid',
        dataType: 'string',
        title: t('tableColumnPedigreeParentGid'),
      }, {
        key: 'parentName',
        dataType: 'string',
        title: t('tableColumnPedigreeParentName'),
      }, {
        key: 'childId',
        dataType: 'number',
        class: 'text-right',
        title: t('tableColumnPedigreeChildId'),
      }, {
        key: 'childGid',
        dataType: 'string',
        title: t('tableColumnPedigreeChildGid'),
      }, {
        key: 'childName',
        dataType: 'string',
        title: t('tableColumnPedigreeChildName'),
      }, {
        key: 'relationshipType',
        dataType: 'string',
        title: t('tableColumnPedigreeRelationshipType'),
      }, {
        key: 'relationshipDescription',
        dataType: 'string',
        title: t('tableColumnPedigreeRelationshipDescription'),
      }, {
        key: 'pedigreeDescription',
        dataType: 'string',
        title: t('tableColumnPedigreeDescription'),
      }, {
        key: 'pedigreeAuthor',
        dataType: 'string',
        title: t('tableColumnPedigreeAuthor'),
      },
    ]

    return headers
  })

  defineExpose({
    refresh: () => baseTable.value?.refresh(),
  })
</script>

<style scoped>
</style>
