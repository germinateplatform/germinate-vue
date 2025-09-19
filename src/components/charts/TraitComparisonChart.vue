<template>
  <BaseChart
    title="pageTrialsExportComparisonChartTitle"
    :chart-id="id"
    :filename="filename"
    :source-file="sourceFile"
    v-model:loading="loading"
    header-icon="mdi-chart-gantt"
    @force-redraw="redraw"
  >
    <template #chart-content>
      <div :id="id" ref="boxplotChart" />
    </template>

    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>
  </BaseChart>
</template>

<script setup lang="ts">
  import BaseChart from '@/components/charts/BaseChart.vue'
  import { uuidv4, type DownloadBlob } from '@/plugins/util'

  import Plotly, { type Layout } from 'plotly.js/lib/core'
  import box from 'plotly.js/lib/box'
  import { coreStore } from '@/stores/app'
  import type { ViewTableTraits } from '@/plugins/types/germinate'
  import type { BoxPlotData, GermplasmInfo } from '@/components/trials/TraitComparison.vue'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    box,
  ])

  const compProps = defineProps<{
    datasetIds: number[]
    trait: ViewTableTraits
    groupBy: 'year' | 'treatment' | 'dataset' | 'trialsite' | 'undefined'
    germplasmData: BoxPlotData
    germplasm: GermplasmInfo[]
    categories: string[]
    colorMapping: { [key: string]: string }
    getPlotData: (trait: ViewTableTraits) => string
  }>()

  const store = coreStore()

  const sourceFile = ref<DownloadBlob>()
  const systemTheme = ref('dark')
  const boxplotChart = useTemplateRef('boxplotChart')
  const id = ref('boxplot-' + uuidv4())
  const loading = ref(false)

  const filename = computed(() => `comparison-${compProps.trait.traitName.replace(' ', '-')}`)

  const darkMode = computed(() => (store.storeTheme === 'system' ? systemTheme.value : store.storeTheme) === 'dark')

  function getTraces () {
    let traces
    if (compProps.categories && (compProps.categories.length > 1 || compProps.categories[0] !== 'undefined')) {
      // If there are categories, we're going to use them as the traces
      traces = compProps.categories.map(tr => {
        const color = compProps.colorMapping[tr]

        // Construct all the x values
        const x = compProps.germplasm.flatMap(g => {
          // Get the data for this germplasm
          const germplasmData = compProps.germplasmData.germplasmData[g.id]
          if (germplasmData && germplasmData.values[tr]) {
            // If there is data for this germplasm and treatment, return an array of the same length filled with the name
            return germplasmData.values[tr].map(() => g.name)
          } else {
            // Otherwise, just return an array with the germplasm name
            return [g.name]
          }
        })
        // Construct all the y values
        const y = compProps.germplasm.flatMap(g => {
          // Get the data for this germplasm
          const germplasmData = compProps.germplasmData.germplasmData[g.id]
          if (germplasmData && germplasmData.values[tr]) {
            // If there is data for this germplasm and treatment, return ir
            return germplasmData.values[tr]
          } else {
            // Otherwise, just return an array with null
            return [null]
          }
        })

        // Let's get all distinct values
        const distinct = new Set()
        y.forEach(a => distinct.add(a))

        // If there are at least two or the individual one isn't null, assume this is valid/present data
        const exists = distinct.size > 2 || distinct.values().next().value !== null

        if (exists) {
          // In this case, return the data as is
          return {
            x: x,
            y: y,
            name: tr || 'N/A',
            type: 'box' as const,
            marker: {
              color: color,
            },
          }
        } else {
          // Otherwise, return dummy data that results in the desired chart formatting
          return {
            visible: true,
            x: x,
            y: x.map(() => compProps.germplasmData.total / compProps.germplasmData.count),
            hoverinfo: 'none',
            opacity: 0,
            name: tr || 'N/A',
            type: 'box' as const,
            marker: {
              color: color,
            },
          }
        }
      })
    } else {
      // Otherwise use the germplasm as traces
      traces = compProps.germplasm.map(g => {
        // Get and remember the color
        const color = compProps.colorMapping[`${g.id}`]

        // Check if here is data for this germplasm
        const germplasmData = compProps.germplasmData.germplasmData[g.id]
        if (germplasmData) {
          // If so, simply return it
          return {
            y: germplasmData.values['undefined'],
            name: g.name,
            type: 'box' as const,
            marker: {
              color: color,
            },
          }
        } else {
          // Otherwise, return dummy data that results in the desired chart formatting
          return {
            visible: true,
            y: [compProps.germplasmData.total / compProps.germplasmData.count],
            hoverinfo: 'none',
            opacity: 0,
            name: g.name,
            type: 'box' as const,
            marker: {
              color: color,
            },
          }
        }
      })
    }

    return traces
  }

  async function redraw () {
    loading.value = true
    if (compProps.germplasmData) {
      sourceFile.value = {
        blob: new Blob([compProps.getPlotData(compProps.trait)], { type: 'text/plain' }),
        filename: filename.value,
        extension: 'json',
      }
    }

    if (boxplotChart.value) {
      Plotly.purge(boxplotChart.value)

      const traces = getTraces()

      // @ts-ignore
      const layout: Layout = {
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        xaxis: {
          zeroline: false,
          side: 'top',
          title: { font: { color: darkMode.value ? 'white' : 'black' } },
          tickfont: { color: darkMode.value ? 'white' : 'black' },
        },
        height: 400,
        autosize: true,
        yaxis: {
          automargin: true,
          title: { text: compProps.trait.traitName, font: { color: darkMode.value ? 'white' : 'black' } },
          tickfont: { color: darkMode.value ? 'white' : 'black' },
          showgrid: true,
          gridcolor: darkMode.value ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)',
        },
        legend: {
          bgcolor: 'rgba(0,0,0,0)',
          orientation: 'h',
          font: { color: darkMode.value ? 'white' : 'black' },
        },
        shapes: [{
          type: 'line',
          xref: 'paper',
          yref: 'y',
          layer: 'below',
          x0: 0,
          y0: compProps.germplasmData.total / compProps.germplasmData.count,
          x1: 1,
          y1: compProps.germplasmData.total / compProps.germplasmData.count,
          line: {
            width: 2,
            color: '#666666',
            dash: 'dot',
          },
        }],
      }

      if (compProps.categories && (compProps.categories.length > 1 || compProps.categories[0] !== 'undefined')) {
        layout.boxmode = 'group' as const
      }

      const config = {
        modeBarButtonsToRemove: ['toImage' as const],
        displayModeBar: false,
        responsive: true,
        displaylogo: false,
      }

      // @ts-ignore
      Plotly.react(boxplotChart.value, traces, layout, config)
    }

    loading.value = false
  }

  watch(() => compProps.groupBy, async () => redraw())

  watch(() => compProps.germplasmData, async () => nextTick(() => redraw()), { immediate: true })
</script>
