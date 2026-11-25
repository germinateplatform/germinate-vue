<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableLocations} -->
  <BaseTable
    ref="baseTable"
    :headers="headers"
    :show-details="false"
    item-key="locationId"
    table-key="locations"
    marked-item-type="locations"
    :header-icon="mdiMapMarker"
    :header-title="$t('pageLocationsTitle')"
    v-bind="{ ...$attrs, ...compProps }"
  >
    <template #item.locationType="{ item }">
      <v-chip label :color="locationTypes[item.locationType].color()" :prepend-icon="locationTypes[item.locationType].path">{{ $t(locationTypes[item.locationType].text) }}</v-chip>
    </template>

    <!-- Country flag -->
    <template #item.countryName="{ item }">
      <v-chip :text="item.countryCode2" label v-tooltip:top="item.countryName" v-if="item.countryCode2">
        <template #prepend>
          <v-icon start><i :class="'fi fi-' + item.countryCode2.toLowerCase()" /></v-icon>
        </template>
      </v-chip>
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

  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import type { ViewTableLocations } from '@/plugins/types/germinate'
  import { locationTypes } from '@/plugins/util/types'
  import { columns } from '@/plugins/util/table-columns'
  import { mdiMapMarker } from '@mdi/js'
  import type { BaseTableProps } from '@/plugins/types/BaseTableProps'

  type SharedProps = Pick<BaseTableProps<ViewTableLocations>, 'getData' | 'getIds' | 'download' | 'filterOn' | 'selectionType' | 'headerIconColor' | 'sortBy'>

  interface Props extends SharedProps {
    tableMode?: 'base' | 'distance'
  }

  const compProps = withDefaults(defineProps<Props>(), {
    tableMode: 'base',
  })

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const result = columns.locations.map(c => {
      return {
        ...c,
        title: t(c.title || ''),
      }
    })

    if (compProps.tableMode === 'distance') {
      result.unshift({
        key: 'distance',
        title: t('tableColumnLocationDistance'),
        dataType: 'float',
      })
    }

    return result
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
