<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableMarkers} -->
  <BaseTable
    ref="baseTable"
    :headers="headers"
    :show-details="false"
    item-key="markerId"
    table-key="markers"
    marked-item-type="markers"
    :header-icon="mdiFormatIndentIncrease"
    :header-title="$t('pageMarkersTitle')"
    v-bind="{ ...$attrs, ...compProps }"
  >
    <!-- Marker id link -->
    <template #item.markerId="{ item }">
      <router-link :to="Pages.getPath(Pages.markerDetails, item.markerId)">{{ item.markerId }}</router-link>
    </template>
    <!-- Marker name link -->
    <template #item.markerName="{ item }">
      <router-link :to="Pages.getPath(Pages.markerDetails, item.markerId)">{{ item.markerName }}</router-link>
    </template>
    <!-- Synonyms -->
    <template #item.markerSynonyms="{ item }">
      <span v-if="item.markerSynonyms">{{ item.markerSynonyms.join(', ') }}</span>
    </template>
    <template #item.markerType="{ item }">
      <v-chip label :prepend-icon="mdiLabelVariant" v-if="item.markerType">{{ item.markerType }}</v-chip>
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
  import type { ViewTableMarkers } from '@/plugins/types/germinate'
  import { Pages } from '@/plugins/pages'
  import { mdiFormatIndentIncrease, mdiLabelVariant } from '@mdi/js'
  import type { BaseTableProps } from '@/plugins/types/BaseTableProps'

  const compProps = defineProps<Pick<BaseTableProps<ViewTableMarkers>, 'getData' | 'getIds' | 'download' | 'filterOn' | 'selectionType'>>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'markerId',
      title: t('tableColumnMarkerId'),
      dataType: 'integer',
    }, {
      key: 'markerName',
      title: t('tableColumnMarkerName'),
      markedItemSearchColumn: true,
      dataType: 'string',
      quickSearchable: true,
    }, {
      key: 'markerType',
      dataType: 'string',
      title: t('tableColumnMarkerType'),
    }, {
      key: 'markerSynonyms',
      dataType: 'json',
      title: t('tableColumnMarkerSynonyms'),
    }]

    return headers
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
