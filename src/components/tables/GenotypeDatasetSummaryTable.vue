<template>
  <v-data-table
    :items="datasets"
    :headers="headers"
    show-select
    v-model="selection"
    item-value="datasetId"
    return-object
    :items-per-page="datasets.length"
    hide-default-footer
    :row-props="getRowProps"
    :item-selectable="isSelectable"
  >
    <template #item.item-selected="{ item }">
      <!-- @vue-ignore -->
      <div v-if="selectedIds.includes(item.datasetId)" class="indicator-flag" :style="{ backgroundColor: 'rgb(var(--v-theme-primary))' }" />
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
  import { apiPostGenotypeDatasetSummary } from '@/plugins/api/genotype'
  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import type { ViewTableDatasets, GenotypeSubsetDatasetRequest } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import type { ItemKeySlot } from 'vuetify/lib/components/VDataTable/types.mjs'

  const compProps = defineProps<{
    datasetIds: number[]
    queryParams: GenotypeSubsetDatasetRequest
  }>()

  const datasets = ref<ViewTableDatasets[]>([])

  const selection = defineModel<ViewTableDatasets[]>({
    default: () => [],
  })

  const selectedIds = computed(() => selection.value.map(ds => ds.datasetId))

  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    return [{
      title: '',
      key: 'item-selected',
      width: '1em',
      cellProps: { class: 'ma-0 pa-0' },
      sortable: false,
      headerProps: { class: 'ma-0 pa-0' },
      dataType: 'boolean',
    }, {
      key: 'datasetName',
      title: t('tableColumnDatasetName'),
      dataType: 'string',
    }, {
      key: 'datasetDescription',
      title: t('tableColumnDatasetDescription'),
      dataType: 'string',
    }, {
      key: 'dataObjectCount',
      title: t('tableColumnGenotypeDatasetGermplasmCount'),
      dataType: 'integer',
      // @ts-ignore
      value: (value: ViewTableDatasets) => value.dataObjectCount ? getNumberWithSuffix(value.dataObjectCount.value, 2) : undefined,
    }, {
      key: 'dataPointCount',
      title: t('tableColumnGenotypeDatasetMarkerCount'),
      dataType: 'integer',
      // @ts-ignore
      value: (value: ViewTableDatasets) => value.dataPointCount ? getNumberWithSuffix(value.dataPointCount.value, 2) : undefined,
    }]
  })

  function isSelectable (item: ViewTableDatasets) {
    return (item.dataObjectCount?.value || 0) > 0 && (item.dataPointCount?.value || 0) > 0
  }

  function getRowProps (item: ItemKeySlot<ViewTableDatasets>) {
    if ((item.item.dataObjectCount?.value || 0) <= 0 || (item.item.dataPointCount?.value || 0) <= 0) {
      return { class: 'bg-red-lighten-4', disabled: true }
    }
  }

  function update () {
    apiPostGenotypeDatasetSummary(compProps.queryParams, result => {
      if (result && result.data) {
        datasets.value = result.data
      } else {
        datasets.value = []
      }

      selection.value = datasets.value.filter(ds => (ds.dataPointCount?.value || 0) > 0 && (ds.dataObjectCount?.value || 0) > 0)
    })
  }

  onMounted(() => update())

  watch(() => compProps.queryParams.markerIds, async () => update())
  watch(() => compProps.queryParams.markerGroupIds, async () => update())
  watch(() => compProps.queryParams.germplasmIds, async () => update())
  watch(() => compProps.queryParams.germplasmGroupIds, async () => update())
</script>

<style scoped>
.indicator-flag {
  height: 100%;
  width: 1em;
}
</style>
