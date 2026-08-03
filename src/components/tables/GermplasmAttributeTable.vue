<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableGermplasmAttributes} -->
  <BaseTable
    ref="baseTable"
    v-model:bottom-sheet-visible="bottomVisible"
    :get-data="compProps.getData"
    :headers="headers"
    :filter-on="filterOn"
    :sort-by="compProps.sortBy"
    :selection-type="selectionType"
    item-key="attributeValueId"
    table-key="germplasmAttributes"
    :header-icon="mdiPlaylistPlus"
    :header-title="$t('pageSearchResultSectionGermplasmAttributes')"
  >
    <template #item.germplasmId="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.germplasmId)">{{ item.germplasmId }}</router-link>
    </template>
    <template #item.germplasmName="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.germplasmId)">{{ item.germplasmName }}</router-link>
    </template>
    <template #item.germplasmDisplayName="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.germplasmId)">{{ item.germplasmDisplayName }}</router-link>
    </template>
    <template #item.germplasmGid="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.germplasmId)">{{ item.germplasmGid }}</router-link>
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
  import { Pages } from '@/plugins/pages'
  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTableGermplasmAttributes } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { columns } from '@/plugins/util/table-columns'
  import type { DataTableSortItem } from 'vuetify'
  import { mdiPlaylistPlus } from '@mdi/js'

  interface GermplasmTableProps {
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableGermplasmAttributes[]>>> }
    filterOn?: FilterGroup[]
    sortBy?: DataTableSortItem[]
    selectionType?: TableSelectionType
    tableMode?: 'base' | 'distance'
  }

  const compProps = withDefaults(defineProps<GermplasmTableProps>(), {
    tableMode: 'base',
  })

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()
  const bottomVisible = ref(false)

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    return columns.germplasmAttributes.map(c => {
      c.title = t(c.title || '')
      return c
    })
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
