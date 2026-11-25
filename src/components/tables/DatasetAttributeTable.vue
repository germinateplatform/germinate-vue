<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableDatasetAttributes} -->
  <BaseTable
    ref="baseTable"
    :headers="headers"
    :show-details="false"
    item-key="datasetId"
    table-key="datasetAttributes"
    :header-icon="mdiFileDocument"
    :header-title="$t('modalTitleDatasetAttributes')"
    v-bind="{ ...$attrs, ...compProps }"
  >
    <template #item.datasetName="{ item }">
      <span>{{ truncateAfterWords(item.datasetName, 10) }}</span>
    </template>

    <template #item.datasetDescription="{ item }">
      <ShowFullCell :content="item.datasetDescription" title="tableColumnAttributeValue" v-if="item.datasetDescription && item.datasetDescription.length > 0" />
    </template>

    <template #item.attributeValue="{ item }">
      <ShowFullCell :content="item.attributeValue" title="tableColumnattributeValue" v-if="item.attributeValue && item.attributeValue.length > 0" />
    </template>

    <template #item.attributeDescription="{ item, value }">
      <template v-if="item.attributeDescription && item.attributeDescription.length > 0">
        <span :title="value" v-if="value">{{ truncateAfterWords(value, 10) }}</span>
        <a href="#" class="ms-2 table-icon-link" @click.prevent="showDatasetAttributeModal(item)" v-if="isTruncatedAfterWords(value, 10)">
          <v-icon :icon="mdiPageNext" />
        </a>
      </template>
    </template>

    <template #item.attributeType="{ item }">
      <v-chip label :color="dataTypes[item.attributeType].color()" :prepend-icon="dataTypes[item.attributeType].path">{{ $t(dataTypes[item.attributeType].text) }}</v-chip>
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
  import type { ViewTableDatasetAttributes } from '@/plugins/types/germinate'
  import { isTruncatedAfterWords, truncateAfterWords } from '@/plugins/util/formatting'
  import { dataTypes } from '@/plugins/util/types'
  import emitter from 'tiny-emitter/instance'
  import { mdiFileDocument, mdiPageNext } from '@mdi/js'
  import { columns } from '@/plugins/util/table-columns'
  import type { BaseTableProps } from '@/plugins/types/BaseTableProps'

  const compProps = defineProps<Pick<BaseTableProps<ViewTableDatasetAttributes>, 'getData' | 'download' | 'filterOn'>>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    return columns.datasetAttributes.map(c => {
      return {
        ...c,
        title: t(c.title || ''),
      }
    })
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
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
