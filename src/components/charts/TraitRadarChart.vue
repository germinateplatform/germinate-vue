<template>
  <BaseChart
    title="pageTrialsExportTraitRadarTitle"
    :chart-id="id"
    filename="radar-chart"
    :source-file="sourceFile"
    v-model:loading="loading"
    header-icon="mdi-chart-donut-variant"
    @force-redraw="redraw"
  >
    <template #card-text>
      <v-card-text>
        <p>{{ $t('pageTrialsExportTraitRadarText') }}</p>
      </v-card-text>
    </template>
    <template #chart-content>
      <div :id="id" ref="radarChart" />
    </template>
  </BaseChart>
</template>

<script setup lang="ts">
  import BaseChart from '@/components/charts/BaseChart.vue'
  import { uuidv4, type DownloadBlob } from '@/plugins/util'

  import Plotly from 'plotly.js/lib/core'
  import scatterpolar from 'plotly.js/lib/scatterpolar'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'
  import type { TraitComparisonChartTrace } from '@/components/trials/TraitComparison.vue'
  import { hexToRGBA } from '@/plugins/util/colors'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    scatterpolar,
  ])

  const compProps = defineProps<{
    traces: TraitComparisonChartTrace[]
    average?: TraitComparisonChartTrace
  }>()

  const store = coreStore()

  const sourceFile = ref<DownloadBlob>()
  const radarChart = useTemplateRef('radarChart')
  const id = ref('radar-' + uuidv4())
  const loading = ref(false)

  async function redraw () {
    if (!radarChart.value || !compProps.traces || compProps.traces.length === 0) {
      return
    }

    emitter.emit('show-loading', true)

    loading.value = true

    const data: any[] = compProps.traces.map(trace => {
      return {
        type: 'scatterpolar',
        customdata: trace.customdata,
        r: trace.values,
        theta: trace.dimensions,
        fill: 'toself',
        marker: {
          color: trace.color,
        },
        fillcolor: compProps.traces.length > 1 ? hexToRGBA(trace.color, 0.3) : null,
        name: trace.name,
        hovertemplate: '%{theta}<br>%{customdata}',
      }
    })

    if (compProps.average) {
      data.unshift({
        type: 'scatterpolar',
        customdata: compProps.average.customdata,
        r: compProps.average.values,
        theta: compProps.average.dimensions,
        fill: 'toself',
        mode: 'lines',
        marker: {
          color: compProps.average.color,
        },
        fillcolor: hexToRGBA(compProps.average.color, 0.3),
        name: compProps.average.name,
        hovertemplate: '%{theta}<br>%{customdata}',
      })
    }

    const layout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      height: Math.min(700, radarChart.value.offsetWidth),
      dragmode: 'pan' as const,
      polar: {
        bgcolor: 'transparent',
        angularaxis: {
          color: store.storeIsDarkMode ? '#ccc' : '#333',
          rotation: 0,
        },
        radialaxis: {
          color: store.storeIsDarkMode ? '#ccc' : '#333',
          visible: true,
          range: [0, 100],
          showticklabels: false,
        },
      },
      showlegend: data.length > 1,
      legend: {
        font: { color: store.storeIsDarkMode ? 'white' : 'black' },
      },
    }

    const config = {
      modeBarButtonsToRemove: ['toImage' as const],
      responsive: true,
      displaylogo: false,
    }

    try {
      Plotly.purge(radarChart.value)
    } catch {
      // Do nothing here
    }

    Plotly.react(radarChart.value, data, layout, config)
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
