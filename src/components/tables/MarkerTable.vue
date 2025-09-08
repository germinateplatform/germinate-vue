<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableMarkers} -->
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
    table-key="markers"
    marked-item-type="markers"
    header-icon="mdi-format-indent-increase"
    :header-title="$t('pageMarkersTitle')"
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
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTableMarkers } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { Pages } from '@/plugins/pages'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableMarkers[]>>> }
    getIds: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
  }>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'markerId',
      title: t('tableColumnMarkerId'),
      dataType: 'integer',
    }, {
      key: 'markerName',
      title: t('tableColumnMarkerName'),
      dataType: 'string',
    }, {
      key: 'markerType',
      dataType: 'string',
      title: t('tableColumnMarkerType'),
    }, {
      key: 'markerSynonyms',
      dataType: 'json',
      title: t('tableColumnMarkerSynonyms'),
    }]

    return headers
  })

  defineExpose({
    refresh: () => baseTable.value?.refresh(),
  })
</script>

<style scoped>
</style>
