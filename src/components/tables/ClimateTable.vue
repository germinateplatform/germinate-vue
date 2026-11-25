<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableClimates} -->
  <BaseTable
    ref="baseTable"
    :headers="headers"
    :show-details="false"
    item-key="climateId"
    table-key="climates"
    :header-icon="mdiWeatherSnowyRainy"
    :header-title="$t('pageClimatesTitle')"
    v-bind="{ ...$attrs, ...compProps }"
  >
    <!-- climate id link -->
    <template #item.climateId="{ item }">
      <router-link :to="Pages.getPath(Pages.climateDetails, item.climateId)">{{ item.climateId }}</router-link>
    </template>
    <!-- climate name link -->
    <template #item.climateName="{ item }">
      <router-link :to="Pages.getPath(Pages.climateDetails, item.climateId)">{{ item.climateName }}</router-link>
    </template>
    <!-- climate short name link -->
    <template #item.climateNameShort="{ item }">
      <router-link :to="Pages.getPath(Pages.climateDetails, item.climateId)">{{ item.climateNameShort }}</router-link>
    </template>
    <!-- climate description link -->
    <template #item.climateDescription="{ item }">
      <router-link :to="Pages.getPath(Pages.climateDetails, item.climateId)">{{ item.climateDescription }}</router-link>
    </template>

    <template #item.dataType="{ item }">
      <v-chip label :color="dataTypes[item.dataType].color()" :prepend-icon="dataTypes[item.dataType].path">{{ $t(dataTypes[item.dataType].text) }}</v-chip>
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
  import type { ViewTableClimates } from '@/plugins/types/germinate'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { dataTypes } from '@/plugins/util/types'
  import { Pages } from '@/plugins/pages'
  import { mdiWeatherSnowyRainy } from '@mdi/js'
  import type { BaseTableProps } from '@/plugins/types/BaseTableProps'

  const compProps = defineProps<Pick<BaseTableProps<ViewTableClimates>, 'getData' | 'filterOn'>>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'climateId',
      dataType: 'integer',
      title: t('tableColumnClimateId'),
    }, {
      key: 'climateName',
      dataType: 'string',
      title: t('tableColumnClimateName'),
    }, {
      key: 'climateNameShort',
      dataType: 'string',
      title: t('tableColumnClimateNameShort'),
    }, {
      key: 'climateDescription',
      dataType: 'string',
      title: t('tableColumnClimateDescription'),
    }, {
      key: 'dataType',
      dataType: 'dataType',
      title: t('tableColumnClimateDataType'),
    }, {
      key: 'unitName',
      dataType: 'string',
      title: t('tableColumnClimateUnitName'),
    }, {
      key: 'unitDescription',
      dataType: 'string',
      title: t('tableColumnClimateUnitDescription'),
    }, {
      key: 'unitAbbreviation',
      dataType: 'string',
      title: t('tableColumnClimateUnitAbbreviation'),
    }, {
      key: 'count',
      dataType: 'integer',
      title: t('tableColumnClimateDataPoints'),
      value: (item: ViewTableClimates) => item.count !== undefined ? getNumberWithSuffix(item.count, 2) : undefined,
    }]

    return headers
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
