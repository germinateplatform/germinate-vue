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
    const headers = [{
      key: 'locationId',
      title: t('tableColumnLocationId'),
      dataType: 'integer',
    }, {
      key: 'locationName',
      title: t('tableColumnLocationName'),
      dataType: 'string',
    }, {
      key: 'locationRegion',
      title: t('tableColumnLocationRegion'),
      dataType: 'string',
    }, {
      key: 'locationState',
      title: t('tableColumnLocationState'),
      dataType: 'string',
    }, {
      key: 'locationType',
      title: t('tableColumnLocationType'),
      dataType: 'locationType',
    }, {
      key: 'locationElevation',
      dataType: 'float',
      align: 'end' as 'start' | 'end' | 'center',
      title: t('tableColumnLocationElevation'),
      value: (value: ViewTableLocations) => value.locationElevation ? value.locationElevation.toFixed(2) : undefined,
    }, {
      key: 'locationLatitude',
      dataType: 'float',
      align: 'end' as 'start' | 'end' | 'center',
      title: t('tableColumnLocationLatitude'),
      value: (value: ViewTableLocations) => value.locationLatitude ? value.locationLatitude.toFixed(2) : undefined,
    }, {
      key: 'locationLongitude',
      dataType: 'float',
      align: 'end' as 'start' | 'end' | 'center',
      title: t('tableColumnLocationLongitude'),
      value: (value: ViewTableLocations) => value.locationLongitude ? value.locationLongitude.toFixed(2) : undefined,
    }, {
      key: 'countryName',
      dataType: 'string',
      title: t('tableColumnLocationCountryName'),
    }]

    return headers
  })

  defineExpose({
    refresh: () => baseTable.value?.refresh(),
  })
</script>

<style scoped>
</style>
