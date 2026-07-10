<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableMapdefinitions} -->
  <BaseTable
    ref="baseTable"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :selection-type="selectionType"
    :show-details="false"
    item-key="markerId"
    table-key="mapDefinitions"
    marked-item-type="markers"
    :header-icon="mdiFormatIndentIncrease"
    :header-title="compProps.headerTitle || $t('pageMarkersTitle')"
    v-bind="$attrs"
  >
    <!-- Marker id link -->
    <template #item.markerId="{ item }">
      <router-link :to="Pages.getPath(Pages.markerDetails, item.markerId)">{{ item.markerId }}</router-link>
    </template>
    <!-- Marker name link -->
    <template #item.markerName="{ item }">
      <router-link :to="Pages.getPath(Pages.markerDetails, item.markerId)">{{ item.markerName }}</router-link>
    </template>
    <!-- Synonyms -->
    <template #item.markerSynonyms="{ item }">
      <span v-if="item.markerSynonyms">{{ item.markerSynonyms.join(', ') }}</span>
    </template>
    <template #item.markerType="{ item }">
      <v-chip label v-if="item.markerType">{{ item.markerType }}</v-chip>
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
  import type { FilterGroup, FilterOperator, PaginatedRequest, PaginatedResult, ViewTableMapdefinitions } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { Pages } from '@/plugins/pages'
  import { mdiFormatIndentIncrease } from '@mdi/js'
  import { columns } from '@/plugins/util/table-columns'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableMapdefinitions[]>>> }
    getIds: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
    headerTitle?: string
  }>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    return columns.mapdefinitions.map(c => {
      c.title = t(c.title || '')
      return c
    })
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
    setOverallOperator: (operator: FilterOperator) => baseTable.value?.setOverallOperator(operator),
  })
</script>

<style scoped>
</style>
