<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableMaps} -->
  <BaseTable
    ref="baseTable"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :selection-type="selectionType"
    :show-details="false"
    item-key="mapId"
    table-key="maps"
    header-icon="mdi-reorder-horizontal"
    :header-title="$t('pageMapsTitle')"
    v-bind="$attrs"
  >
    <!-- Map id link -->
    <template #item.mapId="{ item }">
      <router-link :to="Pages.getPath(Pages.mapDetails, item.mapId)">{{ item.mapId }}</router-link>
    </template>
    <!-- Map name link -->
    <template #item.mapName="{ item }">
      <router-link :to="Pages.getPath(Pages.mapDetails, item.mapId)">{{ item.mapName }}</router-link>
    </template>
    <!-- Map description -->
    <template #item.mapDescription="{ item }">
      <span v-html="item.mapDescription" />
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
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTableMaps } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { Pages } from '@/plugins/pages'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableMaps[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
  }>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'mapId',
      title: t('tableColumnMapId'),
      dataType: 'integer',
    }, {
      key: 'mapName',
      title: t('tableColumnMapName'),
      dataType: 'string',
    }, {
      key: 'mapDescription',
      dataType: 'string',
      title: t('tableColumnMapDescription'),
    }, {
      key: 'markerCount',
      dataType: 'integer',
      title: t('tableColumnMapMarkerCount'),
      value: (item: ViewTableMaps) => item.markerCount ? getNumberWithSuffix(item.markerCount, 1) : undefined,
    }]

    return headers
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh(readFilter),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
