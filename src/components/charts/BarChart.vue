<template>
  <BaseChart
    :title="compProps.title ? $t(compProps.title) : undefined"
    :chart-id="id"
    :filename="compProps.downloadName"
    :source-file="sourceFile"
    @force-redraw="redraw"
  >
    <template #chart-content>
      <div :id="id" ref="barChart" />
    </template>
  </BaseChart>
</template>

<script setup lang="ts">
  import BaseChart from '@/components/charts/BaseChart.vue'
  import { uuidv4, type DownloadBlob } from '@/plugins/util'
  import { plotlyBarChart } from '@/plugins/charts/plotly-bar-chart'

  import { tsvParse } from 'd3-dsv'
  import { select } from 'd3-selection'

  import Plotly from 'plotly.js/lib/core'
  import bar from 'plotly.js/lib/bar'
  import { coreStore } from '@/stores/app'
  import { getColors } from '@/plugins/util/colors'
  import { useI18n } from 'vue-i18n'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    bar,
  ])

  const { t } = useI18n()
  const emit = defineEmits(['bar-clicked'])

  export interface BarClickEvent {
    x: string
    trace: string
  }
  interface BarChartProps {
    title?: string
    xTitle: string
    yTitle: string
    xColumn: string
    xLabels?: string[]
    groupBy?: string
    downloadName?: string
    mode?: 'traces'
    height?: number
  }
  const compProps = withDefaults(defineProps<BarChartProps>(), {
    downloadName: 'bar-chart',
    mode: 'traces',
  })

  const store = coreStore()

  const sourceFile = ref<DownloadBlob>()
  const systemTheme = ref('dark')
  const barChart = useTemplateRef('barChart')
  const id = ref('taxonomy-' + uuidv4())

  async function redraw (source?: Blob) {
    if (source) {
      sourceFile.value = {
        blob: source,
        filename: compProps.downloadName,
        extension: 'tsv',
      }
    }

    if (barChart.value) {
      Plotly.purge(barChart.value)

      const text = await sourceFile.value?.blob.text()

      const data = tsvParse(text || '')

      select(barChart.value)
        .datum(data)
        .call(plotlyBarChart(Plotly)
          .darkMode((store.storeTheme === 'system' ? systemTheme.value : store.storeTheme) === 'dark')
          .height(compProps.height)
          .colors(getColors())
          .x(compProps.xColumn)
          .columnsToIgnore(['genus'])
          .xCategory(t(compProps.xTitle))
          .yCategory(t(compProps.yTitle))
          .xLabels(compProps.xLabels)
          .groupBy(compProps.groupBy)
          .mode(compProps.mode)
          .onPointClicked((data: any) => {
            emit('bar-clicked', data)
          }))
    }
  }

  defineExpose({
    redraw,
  })
</script>
