<template>
  <BaseChart
    title="pageTrialsExportTraitBoxplotTitle"
    :chart-id="id"
    :filename="filename"
    :source-file="sourceFile"
    v-model:loading="loading"
    :badge-count="markedItemCount"
    :header-icon="mdiChartGantt"
    @force-redraw="redraw"
  >
    <template #card-text>
      <v-card-text>
        <p>{{ $t('pageTrialsExportTraitBoxplotText') }}</p>
      </v-card-text>
    </template>
    <template #toolbar-append>
      <v-btn-group class="mx-2" density="compact" variant="tonal">
        <v-btn v-tooltip:top="$t('tooltipTableMarkedItems')" :to="Pages.getPath(Pages.markedItemType, 'germplasm')"><v-chip size="small" label>{{ getNumberWithSuffix(store.storeMarkedGermplasm.length, 1) }}</v-chip></v-btn>
        <v-btn v-tooltip:top="$t('tooltipTableMarkedItemsClear')" @click="clearMarkedItems"><v-icon :icon="mdiDelete" /></v-btn>
      </v-btn-group>
    </template>
    <template #list-append>
      <v-divider />
      <v-list-item :prepend-icon="mdiCheckboxMarked" :disabled="markedItemCount === 0" @click="toggleItems(true)">{{ $t('widgetChartMarkSelectedItems') }}</v-list-item>
      <v-list-item :prepend-icon="mdiCheckboxBlankOutline" :disabled="markedItemCount === 0" @click="toggleItems(false)">{{ $t('widgetChartUnmarkSelectedItems') }}</v-list-item>
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
  import type { ViewTableDatasets, ViewTableGroups, ViewTableTraits, ViewTableTrialsData } from '@/plugins/types/germinate'
  import { getColor } from '@/plugins/util/colors'
  import { Pages } from '@/plugins/pages'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'

  import emitter from 'tiny-emitter/instance'
  import type { UserSelection } from '@/components/widgets/selections/TraitHighlightSelection.vue'
  import { mdiChartGantt, mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiDelete } from '@mdi/js'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    box,
  ])

  const compProps = defineProps<{
    datasetIds: number[]
    traits: ViewTableTraits[]
    plotData: ViewTableTrialsData[]
    groups: ViewTableGroups[]
    datasets: ViewTableDatasets[]
    userSelection?: UserSelection
    showIndividuals?: boolean
  }>()

  const store = coreStore()

  const sourceFile = ref<DownloadBlob>()
  const boxplotChart = useTemplateRef('boxplotChart')
  const id = ref('boxplot-' + uuidv4())
  const loading = ref(false)
  const selectedIds = ref<number[]>([])
  const selectedGermplasmId = ref<number>()

  const filename = computed(() => {
    let name = 'trait-boxplot'
    if (compProps.datasetIds) {
      name += `-${compProps.datasetIds.join('-')}`
    } else {
      name += '-all-datasets'
    }
    if (compProps.traits) {
      name += `-${compProps.traits.map(t => t.variableId).join('-')}`
    } else {
      name += '-all-traits'
    }

    return name
  })

  function getHeight () {
    if (compProps.userSelection) {
      switch (compProps.userSelection.type) {
        case 'datasets':
          return Math.max(300, (compProps.traits.length + compProps.datasetIds.length + 1) * 100)
        default:
          return Math.max(300, (compProps.traits.length + compProps.userSelection.selectedItems.length + 1) * 100)
      }
    } else {
      return Math.max(300, compProps.traits.length * 100)
    }
  }

  const markedItemCount = computed(() => selectedIds.value.length)

  async function redraw () {
    emitter.emit('show-loading', true)

    loading.value = true
    const variableIdSet = new Set<number>(compProps.traits.map(t => t.variableId))
    const data = compProps.plotData.filter(pd => variableIdSet.has(pd.variableId)).concat()
    data.sort((a, b) => b.variableName.localeCompare(a.variableName) || (b.variableId - a.variableId))

    if (data) {
      sourceFile.value = {
        blob: new Blob([JSON.stringify(data)], { type: 'application/json' }),
        filename: filename.value,
        extension: 'json',
      }
    }

    if (boxplotChart.value) {
      Plotly.purge(boxplotChart.value)

      const x: number[] = []
      const y: string[] = []
      const ids: string[] = []
      const text: string[] = []

      data.forEach(dp => {
        x.push(+dp.traitValue)
        y.push(dp.variableName)
        ids.push(`${dp.germplasmId}-${uuidv4()}`)
        text.push(getGermplasmDisplayName(dp))
      })

      const traces = [{
        y,
        x,
        ids,
        text,
        marker: { color: getColor(0), size: 4 },
        name: 'All data',
        type: 'box' as const,
        boxmean: false,
        orientation: 'h' as const,
        jitter: 0.3,
        boxpoints: (compProps.showIndividuals ? ('all' as const) : false) as false | 'all',
      }]

      if (compProps.userSelection) {
        switch (compProps.userSelection.type) {
          case 'datasets':
            traces.push(...compProps.datasets.map((dataset, index) => {
              return getData(data, dp => dp.datasetId === dataset.datasetId, index, dataset.datasetName || 'N/A')
            }))
            break
          case 'germplasm':
            traces.push(...compProps.userSelection.selectedItems.map((germplasm, index) => {
              return getData(data, dp => dp.germplasmDisplayName === germplasm, index, germplasm)
            }))
            break
          case 'taxonomies':
            traces.push(...compProps.userSelection.selectedItems.map((taxonomy, index) => {
              return getData(data, dp => dp.taxonomyFull === taxonomy, index, taxonomy)
            }))
            break
          case 'plot':
            traces.push(...compProps.userSelection.selectedItems.map((plot, index) => {
              const [row, column] = plot.split('|').map(Number)
              return getData(data, dp => dp.trialRow === row && dp.trialColumn === column, index, plot)
            }))
            break
          case 'year':
            traces.push(...compProps.userSelection.selectedItems.map((year, index) => {
              return getData(data, dp => {
                if (!dp.recordingDate) {
                  return false
                } else {
                  const date = new Date(dp.recordingDate)
                  return date.getFullYear() === +year
                }
              }, index, `&nbsp;${year}`)
            }))
            break
          case 'reps':
            traces.push(...compProps.userSelection.selectedItems.map((rep, index) => {
              return getData(data, dp => dp.rep === rep, index, `&nbsp;${rep}`)
            }))
            break
          case 'group':
            const groupNames: { [index: number]: string } = {}

            compProps.groups.forEach(g => {
              groupNames[g.groupId || -1] = g.groupName || ''
            })

            traces.push(...compProps.userSelection.selectedItems.map((groupId, index) => {
              return getData(data, dp => dp.groups !== undefined && dp.groups.some(g => `${g.id}` === groupId), index, groupNames[+groupId] || `${groupId}`)
            }))
            break
          case 'treatments':
            traces.push(...compProps.userSelection.selectedItems.map((treatment, index) => {
              return getData(data, dp => dp.treatment === treatment, index, treatment)
            }))
            break
        }
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
          x: 0,
          y: 1.1,
          font: { color: store.storeIsDarkMode ? 'white' : 'black' },
        },
      }

      const config = {
        modeBarButtonsToRemove: ['toImage' as const],
        responsive: true,
        displaylogo: false,
      }

      if (traces) {
        if (compProps.traits.length < 2) {
          // @ts-ignore
          layout.boxgap = 0
        }

        Plotly.react(boxplotChart.value, traces, layout, config)
          .then(() => {
            emitter.emit('show-loading', false)

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
          })
      }
    }

    loading.value = false
  }

  function getData (data: ViewTableTrialsData[], filter: (dp: ViewTableTrialsData) => boolean, index: number, name: string) {
    const dps = data.filter(filter)
    return {
      y: dps.map(dp => dp.variableName),
      x: dps.map(dp => +dp.traitValue),
      ids: dps.map(dp => `${dp.germplasmId}-${uuidv4()}`),
      text: dps.map(dp => getGermplasmDisplayName(dp)),
      marker: { color: getColor(index + 1), size: 4 },
      name: name,
      type: 'box' as const,
      boxmean: false,
      orientation: 'h' as const,
      jitter: 0.3,
      boxpoints: (compProps.showIndividuals ? ('all' as const) : false) as false | 'all',
    }
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

  watch(() => compProps.plotData, async () => nextTick(() => redraw()), { immediate: true })

  defineExpose({
    redraw,
  })
</script>
