<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableLocations} -->
  <BaseTable
    ref="baseTable"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :selection-type="selectionType"
    :show-details="false"
    item-key="locationId"
    table-key="locations"
    marked-item-type="locations"
    header-icon="mdi-map-marker"
    :header-title="$t('pageLocationsTitle')"
    v-bind="$attrs"
  >
    <template #item.locationType="{ item }">
      <v-chip label :color="locationTypes[item.locationType].color()" :prepend-icon="locationTypes[item.locationType].path">{{ locationTypes[item.locationType].text() }}</v-chip>
    </template>

    <!-- Country flag -->
    <template #item.countryName="{ item }">
      <span class="text-no-wrap" v-tooltip="item.countryName" v-if="item.countryCode2">
        <i :class="'fi fi-' + item.countryCode2.toLowerCase()" /> <span> {{ item.countryCode2 }}</span>
      </span>
      <span v-else>
        {{ item.countryName }}
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
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTableLocations } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { locationTypes } from '@/plugins/util/types'
  import { columns } from '@/plugins/util/table-columns'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableLocations[]>>> }
    getIds: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
  }>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    return columns.locations.map(c => {
      c.title = t(c.title || '')
      return c
    })
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh(readFilter),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
