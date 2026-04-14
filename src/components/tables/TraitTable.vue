<template>
  <div>
    <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableTraits} -->
    <BaseTable
      ref="baseTable"
      :get-data="compProps.getData"
      :get-ids="compProps.getIds"
      :download="compProps.download"
      :headers="headers"
      :filter-on="filterOn"
      :show-details="false"
      item-key="traitId"
      table-key="traits"
      :header-icon="mdiTagMultiple"
      :header-title="$t('pageTraitsTitle')"
      v-bind="$attrs"
    >
      <template #header.methodSetSize="{ column }">
        {{ column.title }} <v-tooltip location="bottom" :text="$t('tableColumnTooltipTraitSet')">
          <template #activator="{ props }">
            <v-icon v-bind="props" size="small" color="muted" :icon="mdiHelpCircle" />
          </template>
        </v-tooltip>
      </template>

      <!-- Variable id link -->
      <template #item.variableId="{ item }">
        <router-link :to="Pages.getPath(Pages.traitDetails, item.variableId)">{{ item.variableId }}</router-link>
      </template>
      <!-- Variable name link -->
      <template #item.variableName="{ item }">
        <router-link :to="Pages.getPath(Pages.traitDetails, item.variableId)">{{ item.variableName }}</router-link>
      </template>
      <!-- Variable description link -->
      <template #item.variableDescription="{ item }">
        <router-link :to="Pages.getPath(Pages.traitDetails, item.variableId)" v-if="item.variableDescription && item.variableDescription.length > 0">
          <ShowFullCell :content="item.variableDescription" title="tableColumnVariableDescription" />
        </router-link>
      </template>

      <template #item.traitDescription="{ item }">
        <ShowFullCell :content="item.traitDescription" title="tableColumnTraitDescription" v-if="item.traitDescription && item.traitDescription.length > 0" />
      </template>
      <template #item.traitClass="{ item }">
        <v-chip label :color="traitClasses[item.traitClass].color()" :prepend-icon="traitClasses[item.traitClass].path">{{ traitClasses[item.traitClass].text() }}</v-chip>
      </template>
      <template #item.methodClass="{ item }">
        <v-chip label :color="methodClasses[item.methodClass].color()" :prepend-icon="methodClasses[item.methodClass].path">{{ methodClasses[item.methodClass].text() }}</v-chip>
      </template>
      <template #item.methodDescription="{ item }">
        <ShowFullCell :content="item.methodDescription" title="tableColumnMethodDescription" v-if="item.methodDescription && item.methodDescription.length > 0" />
      </template>
      <template #item.scaleDatatype="{ item }">
        <v-chip label :color="dataTypes[item.scaleDatatype].color()" :prepend-icon="dataTypes[item.scaleDatatype].path">{{ dataTypes[item.scaleDatatype].text() }}</v-chip>
      </template>
      <template #item.scaleDescription="{ item }">
        <ShowFullCell :content="item.scaleDescription" title="tableColumnScaleDescription" v-if="item.scaleDescription && item.scaleDescription.length > 0" />
      </template>
      <template #item.traitSynonyms="{ item }">
        <span v-if="item.traitSynonyms">{{ item.traitSynonyms.join(', ') }}</span>
      </template>

      <template #item.scaleRestrictions="{ item }">
        <v-tooltip v-if="item.scaleRestrictions">
          <template #activator="{ props: activatorProps }">
            <v-icon color="primary" v-bind="activatorProps" :icon="mdiCodeBrackets" />
          </template>
          <div v-if="item.scaleRestrictions.min !== undefined && item.scaleRestrictions.min !== null"><v-icon size="small" :icon="mdiGreaterThanOrEqual" /> {{ item.scaleRestrictions.min }}</div>
          <div v-if="item.scaleRestrictions.max !== undefined && item.scaleRestrictions.max !== null"><v-icon size="small" :icon="mdiLessThanOrEqual" /> {{ item.scaleRestrictions.max }}</div>
          <div v-if="item.scaleRestrictions.categories"><v-icon size="small" :icon="mdiCodeBrackets" /> {{ item.scaleRestrictions.categories.map((c: string[]) => c.join(', ')).join(', ') }}</div>
        </v-tooltip>
      </template>

      <!-- Dataset ids -->
      <template #item.datasetIds="{ item }">
        <span v-if="item.datasetIds">{{ item.datasetIds.length }}</span>
      </template>

      <!-- Category -->
      <!-- <template #item.categoryName="{ item }">
        <div v-if="item.categoryName">
          <v-chip label variant="flat" size="small" href="#" @click.prevent="emit('category-clicked', { id: item.categoryId, name: item.categoryName })" :color="getTagColor(item.categoryId)" :text="item.categoryName" />
        </div>
      </template> -->

      <!-- Pass on all named slots -->
      <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
        <slot :name="slot" v-bind="slotProps" />
      </template>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTableTraits } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { dataTypes, methodClasses, traitClasses } from '@/plugins/util/types'
  import { Pages } from '@/plugins/pages'
  import { columns } from '@/plugins/util/table-columns'
  import { mdiCodeBrackets, mdiGreaterThanOrEqual, mdiHelpCircle, mdiLessThanOrEqual, mdiTagMultiple } from '@mdi/js'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableTraits[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
  }>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const result = columns.traits.map(c => {
      c.title = t(c.title || '')
      return c
    })

    return result
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh(readFilter),
  })
</script>
