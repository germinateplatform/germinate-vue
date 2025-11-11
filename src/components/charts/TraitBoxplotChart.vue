<template>
  <BaseChart
    title="pageTrialsExportTraitBoxplotTitle"
    :chart-id="id"
    :filename="filename"
    :source-file="sourceFile"
    v-model:loading="loading"
    :badge-count="markedItemCount"
    header-icon="mdi-chart-gantt"
    @force-redraw="redraw"
  >
    <template #card-text>
      <v-card-text>
        <p>{{ $t('pageTrialsExportTraitBoxplotText') }}</p>

        <v-select
          v-model="groupBy"
          :items="groupByOptions"
          :label="$t('formLabelTraitChartGrouping')"
        />
      </v-card-text>
    </template>
    <template #toolbar-append>
      <v-btn-group class="mx-2" density="compact" variant="tonal">
        <v-btn v-tooltip:top="$t('tooltipTableMarkedItems')" :to="Pages.getPath(Pages.markedItemType, 'germplasm')"><v-chip size="small" label>{{ getNumberWithSuffix(store.storeMarkedGermplasm.length, 1) }}</v-chip></v-btn>
        <v-btn v-tooltip:top="$t('tooltipTableMarkedItemsClear')" @click="clearMarkedItems"><v-icon icon="mdi-delete" /></v-btn>
      </v-btn-group>
    </template>
    <template #list-append>
      <v-divider />
      <v-list-item prepend-icon="mdi-checkbox-marked" :disabled="markedItemCount === 0" @click="toggleItems(true)">{{ $t('widgetChartMarkSelectedItems') }}</v-list-item>
      <v-list-item prepend-icon="mdi-checkbox-blank-outline" :disabled="markedItemCount === 0" @click="toggleItems(false)">{{ $t('widgetChartUnmarkSelectedItems') }}</v-list-item>
    </template>
    <template #chart-content>
      <div :id="id" ref="boxplotChart" />
    </template>
  </BaseChart>
</template>

<script setup lang="ts">
  import BaseChart from '@/components/charts/BaseChart.vue'
  import { getGermplasmDisplayName, uuidv4, type DownloadBlob } from '@/plugins/util'

  import Plotly from 'plotly.js/lib/core'
  import box from 'plotly.js/lib/box'
  import { coreStore } from '@/stores/app'
  import type { ViewTableTrialsData } from '@/plugins/types/germinate'
  import { getColor } from '@/plugins/util/colors'
  import { Pages } from '@/plugins/pages'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { useI18n } from 'vue-i18n'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    box,
  ])

  const compProps = defineProps<{
    datasetIds: number[]
    traitIds: number[]
    plotData: ViewTableTrialsData[]
  }>()

  const { t } = useI18n()
  const store = coreStore()

  const sourceFile = ref<DownloadBlob>()
  const boxplotChart = useTemplateRef('boxplotChart')
  const id = ref('boxplot-' + uuidv4())
  const groupBy = ref<'dataset' | 'treatment' | 'group'>('dataset')
  const loading = ref(false)
  const selectedIds = ref<number[]>([])
  const selectedGermplasmId = ref<number>()

  const groupByOptions = computed(() => {
    return [{
      title: t('widgetChartColoringByDataset'),
      value: 'dataset',
    }, {
      title: t('widgetChartColoringByTreatment'),
      value: 'treatment',
    }, {
      title: t('widgetChartColoringByGroup'),
      value: 'group',
    }]
  })

  const filename = computed(() => {
    let name = 'trait-boxplot'
    if (compProps.datasetIds) {
      name += `-${compProps.datasetIds.join('-')}`
    } else {
      name += '-all-datasets'
    }
    if (compProps.traitIds) {
      name += `-${compProps.traitIds.join('-')}`
    } else {
      name += '-all-traits'
    }

    return name
  })

  function getHeight () {
    switch (groupBy.value) {
      case 'dataset':
        return (traits.length + datasets.length) * 150
      case 'group':
        return (traits.length + groups.length) * 150
      case 'treatment':
        return (treatments.length + traits.length) * 150
      default:
        return traits.length * 150
    }
  }

  const markedItemCount = computed(() => selectedIds.value.length)

  let datasets = []
  let groups = []
  let traits = []
  let treatments = []

  async function redraw () {
    loading.value = true
    if (compProps.plotData) {
      sourceFile.value = {
        blob: new Blob([JSON.stringify(compProps.plotData)], { type: 'application/json' }),
        filename: filename.value,
        extension: 'json',
      }
    }

    if (boxplotChart.value) {
      Plotly.purge(boxplotChart.value)

      let traces

      const dsSet = new Set<string>()
      const traitSet = new Set()
      const treatmentSet = new Set()
      const groupSet = new Set<string>()

      const data = compProps.plotData.concat()
      data.sort((a, b) => b.traitName.localeCompare(a.traitName) || (b.traitId - a.traitId))

      data.forEach(pd => {
        if (pd.datasetId) {
          dsSet.add(JSON.stringify({ id: pd.datasetId, name: pd.datasetName }))
        }
        if (pd.traitId) {
          traitSet.add(pd.traitId)
        }
        if (pd.treatment) {
          treatmentSet.add(pd.treatment)
        }
        if (pd.groups) {
          pd.groups.forEach(g => groupSet.add(JSON.stringify(g)))
        }
      })

      datasets = [...dsSet].map(ds => JSON.parse(ds))
      traits = [...traitSet]
      treatments = [...treatmentSet]
      groups = [...groupSet].map(g => JSON.parse(g))

      if (groupBy.value === 'dataset') {
        traces = datasets.map((ds, index) => {
          const datasetData = data.filter(pd => pd.datasetId === ds.id)

          return {
            y: datasetData.map(td => td.traitName),
            x: datasetData.map(td => +td.traitValue),
            ids: datasetData.map(td => `${td.germplasmId}-${uuidv4()}`),
            text: datasetData.map(td => getGermplasmDisplayName(td)),
            name: ds.name,
            marker: { color: getColor(index), size: 4 },
            type: 'box' as const,
            boxmean: false,
            orientation: 'h' as const,
            jitter: 0.3,
            boxpoints: 'all' as const,
          }
        })
      } else if (groupBy.value === 'treatment') {
        traces = treatments.map((treatment, index) => {
          const treatmentData = data.filter(pd => pd.treatment === treatment)

          return {
            y: treatmentData.map(td => td.traitName),
            x: treatmentData.map(td => +td.traitValue),
            ids: treatmentData.map(td => `${td.germplasmId}-${uuidv4()}`),
            text: treatmentData.map(td => getGermplasmDisplayName(td)),
            name: treatment,
            marker: { color: getColor(index), size: 4 },
            type: 'box' as const,
            boxmean: false,
            orientation: 'h' as const,
            jitter: 0.3,
            boxpoints: 'all' as const,
          }
        })
      } else if (groupBy.value === 'group' && groups) {
        traces = groups.map((group, index) => {
          const groupData = data.filter(pd => pd.groups && pd.groups.some(g => g.id === group.id))

          return {
            y: groupData.map(td => td.traitName),
            x: groupData.map(td => +td.traitValue),
            ids: groupData.map(td => `${td.germplasmId}-${uuidv4()}`),
            text: groupData.map(td => getGermplasmDisplayName(td)),
            name: group.name,
            marker: { color: getColor(index), size: 4 },
            type: 'box' as const,
            boxmean: false,
            orientation: 'h' as const,
            jitter: 0.3,
            boxpoints: 'all' as const,
          }
        })
      }

      const layout = {
        xaxis: {
          zeroline: false,
          side: 'top' as const,
          title: { font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
          tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
          showgrid: true,
          gridcolor: store.storeIsDarkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)',
          mirror: 'ticks' as const,
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        height: getHeight(),
        autosize: true,
        boxmode: 'group' as const,
        dragmode: 'select' as const,
        yaxis: {
          automargin: true,
          title: { font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
          tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
        },
        legend: {
          bgcolor: 'rgba(0,0,0,0)',
          orientation: 'h' as const,
          font: { color: store.storeIsDarkMode ? 'white' : 'black' },
        },
      }

      const config = {
        modeBarButtonsToRemove: ['toImage' as const],
        displayModeBar: true,
        responsive: true,
        displaylogo: false,
      }

      if (traces) {
        Plotly.react(boxplotChart.value, traces, layout, config)

        // @ts-ignore
        boxplotChart.value.on('plotly_selected', eventData => {
          if (boxplotChart.value && (!eventData || (eventData.points.length === 0))) {
            Plotly.restyle(boxplotChart.value, { selectedpoints: null })

            selectedIds.value = []
          } else {
            selectedIds.value = [...new Set<number>(eventData.points.map((p: any) => Number.parseInt(p.id.split('-')[0])).filter((value: number, index: number, self: number[]) => self.indexOf(value) === index))]
          }
        })

        // @ts-ignore
        boxplotChart.value.on('plotly_click', (data: any) => {
          if (data.points.length > 0) {
            selectedGermplasmId.value = Number.parseInt(data.points[0].id.split('-')[0])

            // nextTick(() => this.$refs.passportModal.show())
            // TODO: Show passport popup?
          } else {
            selectedGermplasmId.value = undefined
          }
        })
      }
    }

    loading.value = false
  }

  function clearMarkedItems () {
    store.clearMarkedIds('germplasm')
  }

  function toggleItems (add: boolean) {
    if (add === true) {
      store.addMarkedIds('germplasm', selectedIds.value)
    } else {
      store.removeMarkedIds('germplasm', selectedIds.value)
    }
  }

  watch(groupBy, async () => redraw())

  watch(() => compProps.plotData, async () => nextTick(() => redraw()), { immediate: true })
</script>
