<template>
  <BaseChart
    title="pageTrialsExportTraitBubbleTitle"
    :chart-id="id"
    filename="bubble-chart"
    :source-file="sourceFile"
    v-model:loading="loading"
    :header-icon="mdiChartDonutVariant"
    @force-redraw="redraw"
  >
    <template #card-text>
      <v-card-text>
        <p>{{ $t('pageTrialsExportTraitBubbleText') }}</p>
      </v-card-text>
    </template>
    <template #chart-content>
      <div :id="id" ref="bubbleChart" />
    </template>
  </BaseChart>
</template>

<script setup lang="ts">
  import BaseChart from '@/components/charts/BaseChart.vue'
  import { uuidv4, type DownloadBlob } from '@/plugins/util'

  import Plotly from 'plotly.js/lib/core'
  import scatter from 'plotly.js/lib/scatter'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'
  import type { TraitComparisonChartTrace } from '@/components/trials/TraitComparison.vue'
  import { mdiChartDonutVariant } from '@mdi/js'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    scatter,
  ])

  const compProps = defineProps<{
    traces: TraitComparisonChartTrace[]
    average?: TraitComparisonChartTrace
  }>()

  const store = coreStore()

  const sourceFile = ref<DownloadBlob>()
  const bubbleChart = useTemplateRef('bubbleChart')
  const id = ref('radar-' + uuidv4())
  const loading = ref(false)

  async function redraw () {
    if (!bubbleChart.value || !compProps.traces || compProps.traces.length === 0) {
      return
    }

    emitter.emit('show-loading', true)

    loading.value = true

    const data: any[] = compProps.traces.map(trace => {
      return {
        y: trace.values.map(_ => trace.name),
        x: trace.dimensions,
        mode: 'markers',
        customdata: trace.customdata,
        name: trace.name,
        marker: {
          size: trace.values.map(v => v === null ? null : Math.max(v, 8)),
          color: trace.values.map(_ => trace.color),
          opacity: trace.values.map(_ => 1),
        },
        hovertemplate: '%{y}<br>%{customdata}',
      }
    })

    const avg = compProps.average
    if (avg) {
      data.unshift({
        y: avg.values.map(_ => avg.name),
        x: avg.dimensions,
        mode: 'markers',
        name: avg.name,
        marker: {
          size: avg.values,
          color: avg.values.map(_ => avg.color),
          opacity: avg.values.map(_ => 1),
        },
      })
    }

    const layout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      automargin: true,
      margin: {
        l: 10,
        t: 0,
        b: 80,
        r: 10,
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
      showlegend: data.length > 1,
    }

    const config = {
      modeBarButtonsToRemove: ['toImage' as const],
      responsive: true,
      displaylogo: false,
    }

    try {
      Plotly.purge(bubbleChart.value)
    } catch {
      // Do nothing here
    }

    Plotly.react(bubbleChart.value, data, layout, config)
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
