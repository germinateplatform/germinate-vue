<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableEntities} -->
  <BaseTable
    ref="baseTable"
    v-model:bottom-sheet-visible="bottomVisible"
    :get-data="compProps.getData"
    :disabled="compProps.disabled"
    :headers="headers"
    :filter-on="filterOn"
    :sort-by="compProps.sortBy"
    :item-id="(item: ViewTableEntities) => `${item.entityParentId}|${item.entityChildId}`"
    item-key="entityParentId"
    table-key="entities"
    :header-icon="mdiFileTree"
    :header-title="$t('pagePassportEntityTitle')"
    @filter-cleared="emit('filter-cleared')"
  >
    <!-- Override the default header rendering -->
    <template #headers="{ columns, isSorted, getSortIcon, toggleSort }">
      <tr>
        <!-- Top Group Header 1 -->
        <th colspan="5" class="text-center">
          {{ $t('tableColumnEntityParentHeader') }}
        </th>

        <!-- Top Group Header 2 -->
        <th colspan="5" class="text-center">
          {{ $t('tableColumnEntityChildHeader') }}
        </th>
      </tr>
      <tr>
        <!-- Individual Column Headers -->
        <th
          v-for="column in columns"
          :key="column.key"
          @click="toggleSort(column)"
        >
          <span>{{ column.title }}</span>
          <v-icon v-if="isSorted(column)">
            {{ getSortIcon(column) }}
          </v-icon>
        </th>
      </tr>
    </template>

    <template #item.entityParentType="{ item }">
      <v-chip label :color="entityTypes[item.entityParentType].color()" :prepend-icon="entityTypes[item.entityParentType].path">{{ entityTypes[item.entityParentType].text() }}</v-chip>
    </template>

    <template #item.entityChildType="{ item }">
      <v-chip label :color="entityTypes[item.entityChildType].color()" :prepend-icon="entityTypes[item.entityChildType].path">{{ entityTypes[item.entityChildType].text() }}</v-chip>
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
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTableEntities } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import type { DataTableSortItem } from 'vuetify'
  import { mdiFileTree } from '@mdi/js'
  import { entityTypes } from '@/plugins/util/types'

  interface EntityTableProps {
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableEntities[]>>> }
    filterOn?: FilterGroup[]
    sortBy?: DataTableSortItem[]
    disabled?: boolean
  }

  const compProps = defineProps<EntityTableProps>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()
  const bottomVisible = ref(false)

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'entityParentId',
      title: t('tableColumnEntityParentId'),
      dataType: 'integer',
      searchable: true,
    }, {
      key: 'entityParentGid',
      dataType: 'string',
      title: t('tableColumnEntityParentGid'),
      searchable: true,
      quickSearchable: true,
    }, {
      key: 'entityParentName',
      title: t('tableColumnEntityParentName'),
      dataType: 'string',
      preferredSearchColumn: true,
      searchable: true,
      quickSearchable: true,
    }, {
      key: 'entityParentDisplayName',
      title: t('tableColumnEntityParentDisplayName'),
      dataType: 'string',
      searchable: true,
      quickSearchable: true,
    }, {
      key: 'entityParentType',
      dataType: 'entityType',
      sortable: true,
      title: t('tableColumnEntityParentType'),
      cellProps: { class: 'border-e' },
    }, {
      key: 'entityChildId',
      title: t('tableColumnEntityChildId'),
      dataType: 'integer',
      searchable: true,
    }, {
      key: 'entityChildGid',
      dataType: 'string',
      title: t('tableColumnEntityChildGid'),
      searchable: true,
      quickSearchable: true,
    }, {
      key: 'entityChildName',
      title: t('tableColumnEntityChildName'),
      dataType: 'string',
      preferredSearchColumn: true,
      searchable: true,
      quickSearchable: true,
    }, {
      key: 'entityChildDisplayName',
      title: t('tableColumnEntityChildDisplayName'),
      dataType: 'string',
      searchable: true,
      quickSearchable: true,
    }, {
      key: 'entityChildType',
      dataType: 'entityType',
      sortable: true,
      title: t('tableColumnEntityChildType'),
    }]

    return headers
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
    forceFilter: (filters: FilterGroup[]) => baseTable.value?.forceFilters(filters),
  })

  const emit = defineEmits(['filter-cleared'])
</script>
