<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableDatasetAttributes} -->
  <BaseTable
    ref="baseTable"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :selection-type="selectionType"
    :show-details="false"
    item-key="datasetId"
    table-key="datasetAttributes"
    header-icon="mdi-file-document"
    :header-title="$t('modalTitleDatasetAttributes')"
    v-bind="$attrs"
  >
    <template #item.attributeDescription="{ item, value }">
      <template v-if="item.attributeDescription && item.attributeDescription.length > 0">
        <span :title="value" v-if="value">{{ truncateAfterWords(value, 10) }}</span>
        <a href="#" class="ms-2 table-icon-link" @click.prevent="showDatasetAttributeModal(item)" v-if="isTruncatedAfterWords(value, 10)">
          <v-icon icon="mdi-page-next" />
        </a>
      </template>
    </template>

    <template #item.attributeType="{ item }">
      <v-chip label :color="dataTypes[item.attributeType].color()" :prepend-icon="dataTypes[item.attributeType].path">{{ dataTypes[item.attributeType].text() }}</v-chip>
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
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTableDatasetAttributes } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { isTruncatedAfterWords, truncateAfterWords } from '@/plugins/util/formatting'
  import { dataTypes } from '@/plugins/util/types'
  import emitter from 'tiny-emitter/instance'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableDatasetAttributes[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
  }>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'datasetId',
      dataType: undefined,
      title: t('tableColumnAttributeDatasetId'),
    }, {
      key: 'datasetName',
      dataType: undefined,
      title: t('tableColumnAttributeDatasetName'),
    }, {
      key: 'datasetDescription',
      dataType: undefined,
      title: t('tableColumnAttributeDatasetDescription'),
    }, {
      key: 'attributeName',
      dataType: 'string',
      title: t('tableColumnAttributeName'),
    }, {
      key: 'attributeDescription',
      dataType: 'string',
      title: t('tableColumnAttributeDescription'),
    }, {
      key: 'attributeType',
      dataType: 'dataType',
      title: t('tableColumnAttributeDataType'),
    }, {
      key: 'attributeValue',
      dataType: 'string',
      title: t('tableColumnAttributeValue'),
    }]

    return headers
  })

  function showDatasetAttributeModal (dataset: ViewTableDatasetAttributes) {
    emitter.emit('show-confirm', {
      title: t('tableColumnAttributeDescription'),
      message: dataset.attributeDescription,
      okTitle: t('genericOk'),
      cancelTitle: undefined,
      okOnly: true,
      okVariant: 'primary',
    })
  }

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh(readFilter),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
