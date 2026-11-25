<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTablePedigrees} -->
  <BaseTable
    ref="baseTable"
    :headers="headers"
    :show-details="false"
    item-key="pedigreeId"
    table-key="pedigrees"
    :header-icon="mdiFamilyTree"
    :header-title="$t('pagePedigreeTitle')"
    :quick-search-comparator="FilterComparator.equals"
    v-bind="{ ...$attrs, ...compProps }"
  >
    <template #header.relationshipType="{ column }">
      {{ column.title }} <v-tooltip location="bottom" :text="$t('tableColumnTooltipPedigreeRelationshipType')">
        <template #activator="{ props }">
          <v-icon v-bind="props" size="small" color="muted" :icon="mdiHelpCircle" />
        </template>
      </v-tooltip>
    </template>

    <template #item.relationshipType="{ item }">
      <v-chip label :text="item.relationshipType" />
    </template>

    <!-- Parent id link -->
    <template #item.parentId="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.parentId)">{{ item.parentId }}</router-link>
    </template>
    <!-- Parent GID link -->
    <template #item.parentGid="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.parentId)">{{ item.parentGid }}</router-link>
    </template>
    <!-- Parent name link -->
    <template #item.parentName="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.parentId)">{{ item.parentName }}</router-link>
    </template>
    <!-- Child id link -->
    <template #item.childId="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.childId)">{{ item.childId }}</router-link>
    </template>
    <!-- Child GID link -->
    <template #item.childGid="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.childId)">{{ item.childGid }}</router-link>
    </template>
    <!-- Child name link -->
    <template #item.childName="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.childId)">{{ item.childName }}</router-link>
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
  import { FilterComparator, type ViewTablePedigrees } from '@/plugins/types/germinate'
  import { Pages } from '@/plugins/pages'
  import { columns } from '@/plugins/util/table-columns'
  import { mdiFamilyTree, mdiHelpCircle } from '@mdi/js'
  import type { BaseTableProps } from '@/plugins/types/BaseTableProps'

  const compProps = defineProps<Pick<BaseTableProps<ViewTablePedigrees>, 'getData' | 'filterOn' | 'headerIconColor'>>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    return columns.pedigrees.map(c => {
      return {
        ...c,
        title: t(c.title || ''),
      }
    })
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
