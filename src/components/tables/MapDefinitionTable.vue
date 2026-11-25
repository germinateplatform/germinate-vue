<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableMapdefinitions} -->
  <BaseTable
    ref="baseTable"
    :headers="headers"
    :show-details="false"
    item-key="markerId"
    table-key="mapDefinitions"
    marked-item-type="markers"
    :header-icon="mdiFormatIndentIncrease"
    v-bind="{ ...$attrs, ...compProps }"
    :header-title="compProps.headerTitle || $t('pageMarkersTitle')"
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
    <template #item.mapFeatureType="{ item }">
      <v-chip label :prepend-icon="mdiLabelVariant" v-if="item.mapFeatureType">{{ item.mapFeatureType }}</v-chip>
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
  import type { FilterOperator, ViewTableMapdefinitions } from '@/plugins/types/germinate'
  import { Pages } from '@/plugins/pages'
  import { mdiFormatIndentIncrease, mdiLabelVariant } from '@mdi/js'
  import { columns } from '@/plugins/util/table-columns'
  import type { BaseTableProps } from '@/plugins/types/BaseTableProps'

  const compProps = defineProps<Partial<Pick<BaseTableProps<ViewTableMapdefinitions>, 'headerTitle'>> & Pick<BaseTableProps<ViewTableMapdefinitions>, 'getData' | 'getIds' | 'download' | 'filterOn' | 'headerIconColor'>>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    return columns.mapdefinitions.map(c => {
      return {
        ...c,
        title: t(c.title || ''),
      }
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
