<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableGermplasmAttributes} -->
  <BaseTable
    ref="baseTable"
    v-model:bottom-sheet-visible="bottomVisible"
    :headers="headers"
    item-key="attributeValueId"
    table-key="germplasmAttributes"
    :header-icon="mdiPlaylistPlus"
    :header-title="$t('pageSearchResultSectionGermplasmAttributes')"
    v-bind="{ ...$attrs, ...compProps }"
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

  import { Pages } from '@/plugins/pages'
  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import type { ViewTableGermplasmAttributes } from '@/plugins/types/germinate'
  import { columns } from '@/plugins/util/table-columns'
  import { mdiPlaylistPlus } from '@mdi/js'
  import type { BaseTableProps } from '@/plugins/types/BaseTableProps'

  const compProps = defineProps<Pick<BaseTableProps<ViewTableGermplasmAttributes>, 'getData' | 'filterOn' | 'headerIconColor'>>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()
  const bottomVisible = ref(false)

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    return columns.germplasmAttributes.map(c => {
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
