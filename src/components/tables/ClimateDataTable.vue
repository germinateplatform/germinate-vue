<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableClimateData} -->
  <BaseTable
    ref="baseTable"
    v-model:bottom-sheet-visible="bottomVisible"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :sort-by="compProps.sortBy"
    :selection-type="selectionType"
    item-key="locationId"
    :item-id="(item: ViewTableClimateData) => `${item.locationId}-${item.climateId}`"
    table-key="trialsData"
    marked-item-type="germplasm"
    :header-icon="mdiWeatherPartlySnowyRainy"
    :show-details="false"
    :header-title="$t('pageDataExportTabDataTable')"
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

    <template #item.climateDataType="{ item }">
      <v-chip label :color="dataTypes[item.climateDataType].color()" :prepend-icon="dataTypes[item.climateDataType].path">{{ dataTypes[item.climateDataType].text() }}</v-chip>
    </template>

    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>

    <template #bottom-sheet-content>
      <ClimateDetails :climate-id="selectedClimateId" v-if="selectedClimateId" />
    </template>
  </BaseTable>
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTableClimateData } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { columns } from '@/plugins/util/table-columns'
  import type { DataTableSortItem } from 'vuetify'
  import { mdiWeatherPartlySnowyRainy } from '@mdi/js'
  import { dataTypes, locationTypes } from '@/plugins/util/types'

  interface ClimateDataTableProps {
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableClimateData[]>>> }
    getIds: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    sortBy?: DataTableSortItem[]
    selectionType?: TableSelectionType
  }

  const compProps = defineProps<ClimateDataTableProps>()
  const selectedClimateId = ref<number>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()
  const bottomVisible = ref(false)

  function showVariableInfo (climateId: number) {
    selectedClimateId.value = climateId

    nextTick(() => {
      bottomVisible.value = true
    })
  }

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const result = columns.climateData.map(c => {
      c.title = t(c.title || '')
      return c
    })

    return result
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })

  watch(bottomVisible, async newValue => {
    if (!newValue) {
      selectedClimateId.value = undefined
    }
  })
</script>

<style scoped>
</style>
