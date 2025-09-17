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
      header-icon="mdi-tag-multiple"
      :header-title="$t('pageTraitsTitle')"
      v-bind="$attrs"
    >
      <template #header.traitSetSize="{ column }">
        {{ column.title }} <v-tooltip location="bottom" :text="$t('tableColumnTooltipTraitSet')">
          <template #activator="{ props }">
            <v-icon v-bind="props" size="small" color="muted" icon="mdi-help-circle" />
          </template>
        </v-tooltip>
      </template>

      <!-- Trait id link -->
      <template #item.traitId="{ item }">
        <router-link :to="Pages.getPath(Pages.traitDetails, item.traitId)">{{ item.traitId }}</router-link>
      </template>
      <!-- Trait name link -->
      <template #item.traitName="{ item }">
        <router-link :to="Pages.getPath(Pages.traitDetails, item.traitId)">{{ item.traitName }}</router-link>
      </template>
      <!-- Trait short name link -->
      <template #item.traitNameShort="{ item }">
        <router-link :to="Pages.getPath(Pages.traitDetails, item.traitId)">{{ item.traitNameShort }}</router-link>
      </template>
      <!-- Trait description link -->
      <template #item.traitDescription="{ item }">
        <router-link :to="Pages.getPath(Pages.traitDetails, item.traitId)">{{ item.traitDescription }}</router-link>
      </template>

      <template #item.dataType="{ item }">
        <v-chip label :color="dataTypes[item.dataType].color()" :prepend-icon="dataTypes[item.dataType].path">{{ dataTypes[item.dataType].text() }}</v-chip>
      </template>
      <template #item.synonyms="{ item }">
        <span v-if="item.synonyms">{{ item.synonyms.join(', ') }}</span>
      </template>

      <template #item.traitRestrictions="{ item }">
        <v-tooltip v-if="item.traitRestrictions">
          <template #activator="{ props: activatorProps }">
            <v-icon color="primary" v-bind="activatorProps" icon="mdi-code-brackets" />
          </template>
          <div v-if="item.traitRestrictions.min !== undefined && item.traitRestrictions.min !== null"><v-icon size="small" icon="mdi-greater-than-or-equal" /> {{ item.traitRestrictions.min }}</div>
          <div v-if="item.traitRestrictions.max !== undefined && item.traitRestrictions.max !== null"><v-icon size="small" icon="mdi-less-than-or-equal" /> {{ item.traitRestrictions.max }}</div>
          <div v-if="item.traitRestrictions.categories"><v-icon size="small" icon="mdi-code-brackets" /> {{ item.traitRestrictions.categories.map((c: string[]) => c.join(', ')).join(', ') }}</div>
        </v-tooltip>
      </template>

      <!-- Dataset ids -->
      <template #item.datasetIds="{ item }">
        <span v-if="item.datasetIds">{{ item.datasetIds.length }}</span>
      </template>

      <!-- Category -->
      <template #item.categoryName="{ item }">
        <div v-if="item.categoryName">
          <v-chip label variant="flat" size="small" href="#" @click.prevent="emit('category-clicked', { id: item.categoryId, name: item.categoryName })" :color="getTagColor(item.categoryId)" :text="item.categoryName" />
        </div>
      </template>

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
  import { getTemplateColor } from '@/plugins/util/colors'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { dataTypes } from '@/plugins/util/types'
  import { Pages } from '@/plugins/pages'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableTraits[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
  }>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  const categories: { [key: number]: string } = {}

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers: ExtendedDataTableHeader[] = [{
      key: 'traitId',
      dataType: 'integer',
      title: t('tableColumnTraitId'),
    }, {
      key: 'traitName',
      dataType: 'string',
      title: t('tableColumnTraitName'),
    }, {
      key: 'traitNameShort',
      dataType: 'string',
      title: t('tableColumnTraitNameShort'),
    }, {
      key: 'traitDescription',
      dataType: 'string',
      title: t('tableColumnTraitDescription'),
    }, {
      key: 'dataType',
      dataType: 'dataType',
      title: t('tableColumnTraitDataType'),
    }, {
      key: 'traitRestrictions',
      dataType: undefined,
      sortable: false,
      title: t('tableColumnTraitConstraints'),
    }, {
      key: 'synonyms',
      dataType: 'json',
      title: t('tableColumnTraitSynonyms'),
    }, {
      key: 'categoryId',
      dataType: 'integer',
      visibleInTable: false,
      title: t('tableColumnTraitCategoryId'),
    }, {
      key: 'categoryName',
      dataType: 'string',
      title: t('tableColumnTraitCategoryName'),
    }, {
      key: 'traitSetSize',
      dataType: 'integer',
      title: t('tableColumnTraitSetSize'),
    }, {
      key: 'traitIsTimeseries',
      dataType: 'boolean',
      title: t('tableColumnTraitIsTimeseries'),
    }, {
      key: 'unitName',
      dataType: 'string',
      title: t('tableColumnTraitUnitName'),
    }, {
      key: 'unitDescription',
      dataType: 'string',
      title: t('tableColumnTraitUnitDescription'),
    }, {
      key: 'unitAbbreviation',
      dataType: 'string',
      title: t('tableColumnTraitUnitAbbreviation'),
    }, {
      key: 'datasetIds',
      dataType: undefined,
      sortable: false,
      title: t('tableColumnTraitNrDataset'),
    }, {
      key: 'count',
      dataType: 'integer',
      class: 'text-right',
      title: t('tableColumnTraitDataPoints'),
      // @ts-ignore
      value: (item: ViewTableTraits) => item.count !== undefined ? getNumberWithSuffix(item.count, 2) : undefined,
    }]

    return headers
  })

  function getTagColor (category: number) {
    if (!categories[category]) {
      categories[category] = getTemplateColor(Object.keys(categories).length)
    }

    return categories[category]
  }

  const emit = defineEmits(['category-clicked'])

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh(readFilter),
  })
</script>
