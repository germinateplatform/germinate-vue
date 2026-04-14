<template>
  <BaseChart
    title="pageTrialsExportTraitHeatmapTitle"
    :chart-id="id"
    filename="heatmap-chart"
    :source-file="sourceFile"
    v-model:loading="loading"
    :header-icon="mdiChartDonutVariant"
    @force-redraw="redraw"
  >
    <template #card-text>
      <v-card-text>
        <p>{{ $t('pageTrialsExportTraitHeatmapText') }}</p>
      </v-card-text>
    </template>
    <template #chart-content>
      <div :id="id" ref="heatmapChart" />
    </template>
  </BaseChart>
</template>

<script setup lang="ts">
  import BaseChart from '@/components/charts/BaseChart.vue'
  import { uuidv4, type DownloadBlob } from '@/plugins/util'

  import Plotly from 'plotly.js/lib/core'
  import heatmap from 'plotly.js/lib/heatmap'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'
  import type { TraitComparisonChartTrace } from '@/components/trials/TraitComparison.vue'
  import { mdiChartDonutVariant } from '@mdi/js'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    heatmap,
  ])

  export interface CustomRange {
    from: number
    to: number
  }

  const compProps = defineProps<{
    traces: TraitComparisonChartTrace[]
    average?: TraitComparisonChartTrace
    customRange?: CustomRange
  }>()

  const store = coreStore()

  const sourceFile = ref<DownloadBlob>()
  const heatmapChart = useTemplateRef('heatmapChart')
  const id = ref('radar-' + uuidv4())
  const loading = ref(false)

  async function redraw () {
    if (!heatmapChart.value || !compProps.traces || compProps.traces.length === 0) {
      return
    }

    emitter.emit('show-loading', true)

    loading.value = true

    const data: any[] = []
    const z = []
    const customdata = []
    const y = compProps.traces.map(pd => `${pd.id}-${pd.name}`)

    let longestDims: string[] = []

    compProps.traces.forEach(pd => {
      if (pd.dimensions.length > longestDims.length) {
        longestDims = pd.dimensions
      }
    })

    const allDims = compProps.average ? compProps.average.dimensions : longestDims

    compProps.traces.forEach(trace => {
      const values: (number | null)[] = []
      const cd: (string | null | undefined)[] = []

      allDims.forEach(d => {
        const index = trace.dimensions.indexOf(d)

        if (index !== -1) {
          values.push(trace.values[index])
          cd.push(trace.customdata[index])
        } else {
          values.push(Number.NaN)
          cd.push(null)
        }
      })

      z.push(values)
      customdata.push(cd)
    })

    if (compProps.average) {
      z.unshift(compProps.average.values)
      y.unshift(compProps.average.name)
      customdata.unshift(compProps.average.values.map(_ => ''))
    }

    data.push({
      z: z,
      y: y,
      x: allDims,
      type: 'heatmap',
      colorscale: 'Viridis',
      customdata: customdata,
      colorbar: {
        orientation: 'h',
      },
      name: '',
      hovertemplate: '%{y}<br>%{customdata}',
    })

    if (compProps.customRange) {
      data[0].zauto = false
      data[0].zmin = compProps.customRange.from
      data[0].zmax = compProps.customRange.to
    }

    const layout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      automargin: true,
      margin: {
        l: 10,
        t: 0,
        r: 10,
        b: 30,
      },
      height: Math.max(500, compProps.traces.length * 175),
      xaxis: {
        title: { text: undefined, font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
        tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
      },
      yaxis: {
        showticklabels: false,
        title: { text: undefined, font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
        tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
      },
      legend: {
        bgcolor: 'rgba(0,0,0,0)',
        orientation: 'h' as const,
        font: { color: store.storeIsDarkMode ? 'white' : 'black' },
        x: 0,
        y: 1.1,
      },
    }

    const config = {
      modeBarButtonsToRemove: ['toImage' as const],
      responsive: true,
      displaylogo: false,
    }

    try {
      Plotly.purge(heatmapChart.value)
    } catch {
      // Do nothing here
    }

    Plotly.react(heatmapChart.value, data, layout, config)
      .then(() => {
        emitter.emit('show-loading', false)
      })

    loading.value = false
  }

  watch(() => compProps.traces, async () => nextTick(() => redraw()), { immediate: true })

  defineExpose({
    redraw,
  })
</script>
