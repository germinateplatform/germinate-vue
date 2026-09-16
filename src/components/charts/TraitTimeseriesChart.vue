<template>
  <BaseChart
    title="pageTraitTimelinePlotTitle"
    :chart-id="id"
    :filename="filename"
    :source-file="sourceFile"
    v-model:loading="loading"
    :header-icon="mdiChartTimelineVariant"
    @force-redraw="redraw"
  >
    <template #card-text>
      <v-card-text>
        <p>{{ $t('pageTraitTimelinePlotText') }}</p>
      </v-card-text>
    </template>
    <template #chart-content>
      <div :id="id" ref="timeseriesChart" />
    </template>
  </BaseChart>
</template>

<script setup lang="ts">
  import BaseChart from '@/components/charts/BaseChart.vue'
  import { uuidv4, type DownloadBlob } from '@/plugins/util'

  import Plotly from 'plotly.js/lib/core'
  import scatter from 'plotly.js/lib/scatter'
  import { coreStore } from '@/stores/app'
  import type { ViewTableGermplasm, ViewTableTraits, ViewTableTrialsData } from '@/plugins/types/germinate'

  import { mdiChartTimelineVariant } from '@mdi/js'
  import { useI18n } from 'vue-i18n'
  import { getDateString } from '@/plugins/util/formatting'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    scatter,
  ])

  const compProps = defineProps<{
    datasetIds: number[]
    trait: ViewTableTraits
    plotData: ViewTableTrialsData[]
    timepoints: string[]
    selectedGermplasm: ViewTableGermplasm[]
    currentTimepoint: number
  }>()

  const store = coreStore()
  const { t } = useI18n()

  const sourceFile = ref<DownloadBlob>()
  const timeseriesChart = useTemplateRef('timeseriesChart')
  const id = ref('boxplot-' + uuidv4())
  const loading = ref(false)

  const filename = computed(() => {
    let name = 'trait-timeseries'
    if (compProps.datasetIds) {
      name += `-${compProps.datasetIds.join('-')}`
    } else {
      name += '-all-datasets'
    }
    if (compProps.trait) {
      name += `-${compProps.trait.variableId}`
    } else {
      name += '-all-traits'
    }

    return name
  })

  function getHeight () {
    return 400
  }

  async function redraw () {
    loading.value = true
    const data = compProps.plotData.filter(pd => pd.variableId === compProps.trait.variableId).concat()
    data.sort((a, b) => b.variableName.localeCompare(a.variableName) || (b.variableId - a.variableId))

    if (data) {
      sourceFile.value = {
        blob: new Blob([JSON.stringify(data)], { type: 'application/json' }),
        filename: filename.value,
        extension: 'json',
      }
    }

    if (timeseriesChart.value) {
      Plotly.purge(timeseriesChart.value)

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
        hovermode: 'x' as const,
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
          y: 0,
          font: { color: store.storeIsDarkMode ? 'white' : 'black' },
        },
      }

      const config = {
        modeBarButtonsToRemove: ['toImage' as const],
        responsive: true,
        displaylogo: false,
      }

      const traces = []

      const trace = {
        x: [] as string[],
        y: [] as number[],
        fill: 'tozerox',
        fillcolor: 'rgba(200, 200, 200, .3)',
        line: { color: 'transparent' },
        name: t('chartLegendValueRange'),
        hoverinfo: 'skip',
        type: 'scatter' as const,
      }

      const mins = compProps.timepoints.map(() => Number.MAX_SAFE_INTEGER)
      const sum = compProps.timepoints.map(() => 0)
      const counts = compProps.timepoints.map(() => 0)
      const maxs = compProps.timepoints.map(() => -Number.MAX_SAFE_INTEGER)

      compProps.plotData.forEach(od => {
        const date = getDateString(new Date(od.recordingDate))
        const index = compProps.timepoints.indexOf(date)
        const value = +od.traitValue
        mins[index] = Math.min(mins[index], value)
        maxs[index] = Math.max(maxs[index], value)
        sum[index] += value
        counts[index]++
      })

      for (let i = 0; i < compProps.timepoints.length; i++) {
        trace.x.push(compProps.timepoints[i])
        trace.y.push(maxs[i])
      }
      for (let i = compProps.timepoints.length - 1; i >= 0; i--) {
        trace.x.push(compProps.timepoints[i])
        trace.y.push(mins[i])
      }

      traces.push(trace)

      traces.push({
        x: compProps.timepoints,
        y: sum.map((s, i) => s / counts[i]),
        type: 'scatter',
        mode: 'lines',
        name: t('chartLegendAverage'),
        line: { color: '#7f8c8d' },
      })

      // @ts-expect-error
      Plotly.react(timeseriesChart.value, traces, layout, config)
        .then(() => {
          loading.value = false

          updateTimepoint()
        })
    }

    loading.value = false
  }

  function updateTimepoint () {
    console.log(compProps.currentTimepoint, timeseriesChart.value)

    if (!timeseriesChart.value) {
      return
    }

    Plotly.relayout(timeseriesChart.value, {
      shapes: [{
        layer: 'below',
        type: 'line',
        y0: 0,
        y1: 1,
        yref: 'paper',
        x0: compProps.timepoints[compProps.currentTimepoint],
        x1: compProps.timepoints[compProps.currentTimepoint],
        xref: 'x',
        line: { color: 'red' },
      }],
    })
  }

  watch(() => compProps.plotData, async () => nextTick(() => redraw()), { immediate: true })

  watch(() => compProps.currentTimepoint, async () => updateTimepoint())

  defineExpose({
    redraw,
  })
</script>
