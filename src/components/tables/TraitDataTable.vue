<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableTrialsData} -->
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
    item-key="germplasmId"
    :item-id="(item: ViewTableTrialsData) => `${item.germplasmId}-${item.traitId}`"
    table-key="trialsData"
    marked-item-type="germplasm"
    :header-icon="mdiShovel"
    :show-details="false"
    :header-title="$t('pageDataExportTabDataTable')"
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
    <template #item.germplasmNumber="{ item }">
      <router-link :to="Pages.getPath(Pages.passport, item.germplasmId)">{{ item.germplasmNumber }}</router-link>
    </template>
    <template #item.entityType="{ item }">
      <v-chip label :color="entityTypes[item.entityType].color()" :prepend-icon="entityTypes[item.entityType].path">{{ entityTypes[item.entityType].text() }}</v-chip>
    </template>
    <template #item.scaleDatatype="{ item }">
      <v-chip label :color="dataTypes[item.scaleDatatype].color()" :prepend-icon="dataTypes[item.scaleDatatype].path">{{ dataTypes[item.scaleDatatype].text() }}</v-chip>
    </template>

    <template #item.variableName="{ item }">
      <span class="text-no-wrap">
        {{ item.variableName }}
        &nbsp;<a href="#" @click.prevent="showVariableInfo(item.variableId)"><v-icon :icon="mdiInformationOutline" /></a>
      </span>
    </template>

    <!-- Country flag -->
    <template #item.countryName="{ item }">
      <span class="text-no-wrap" v-tooltip:top="item.countryName" v-if="item.countryCode2">
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

    <template #bottom-sheet-content>
      <VariableDetails :variable-id="selectedVariableId" v-if="selectedVariableId" />
    </template>
  </BaseTable>
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import { Pages } from '@/plugins/pages'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import { dataTypes, entityTypes } from '@/plugins/util/types'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTableTrialsData } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { columns } from '@/plugins/util/table-columns'
  import type { DataTableSortItem } from 'vuetify'
  import { mdiInformationOutline, mdiShovel } from '@mdi/js'

  interface GermplasmTableProps {
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableTrialsData[]>>> }
    getIds: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    sortBy?: DataTableSortItem[]
    selectionType?: TableSelectionType
  }

  const compProps = defineProps<GermplasmTableProps>()
  const selectedVariableId = ref<number>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()
  const bottomVisible = ref(false)

  function showVariableInfo (variableId: number) {
    selectedVariableId.value = variableId

    nextTick(() => {
      bottomVisible.value = true
    })
  }

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const result = columns.traitData.map(c => {
      c.title = t(c.title || '')
      return c
    })

    return result
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh(readFilter),
    getSelection: () => baseTable.value?.getSelection(),
  })

  watch(bottomVisible, async newValue => {
    if (!newValue) {
      selectedVariableId.value = undefined
    }
  })
</script>

<style scoped>
</style>
