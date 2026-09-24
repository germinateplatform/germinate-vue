<template>
  <BaseChart
    :title="compProps.title ? $t(compProps.title) : undefined"
    :chart-id="id"
    :filename="compProps.downloadName"
    :source-file="sourceFileDownload"
    :header-icon="compProps.headerIcon"
    @force-redraw="redraw"
    ref="baseChart"
  >
    <template #chart-content>
      <div :id="id" ref="barChart" />
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
  import { BarChart, type ClickHandlerPayload } from '@/plugins/charts/plotly-bar-chart'

  import { tsvParse } from 'd3-dsv'

  import bar from 'plotly.js/lib/bar'
  import { coreStore } from '@/stores/app'
  import { getColors } from '@/plugins/util/colors'
  import { useI18n } from 'vue-i18n'
  import { mdiChartBar } from '@mdi/js'

  const emit = defineEmits(['bar-clicked'])
  const { t } = useI18n()

  export interface BarClickEvent {
    x: string
    trace: string
  }
  interface BarChartProps {
    title?: string
    xTitle: string
    yTitle: string
    xColumn: string
    xLabels?: string[][]
    headerIcon?: string
    groupBy?: string
    downloadName?: string
    mode?: 'traces'
    height?: number
    sourceFile?: Blob
  }
  const compProps = withDefaults(defineProps<BarChartProps>(), {
    downloadName: 'bar-chart',
    mode: 'traces',
    headerIcon: mdiChartBar,
  })

  const store = coreStore()

  const sourceFileDownload = ref<DownloadBlob>()
  const barChart = useTemplateRef('barChart')
  const baseChart = useTemplateRef('baseChart')
  const id = ref('taxonomy-' + uuidv4())

  async function redraw (source?: Blob) {
    if (source) {
      sourceFileDownload.value = {
        blob: source,
        filename: compProps.downloadName,
        extension: 'tsv',
      }
    }

    if (barChart.value) {
      const text = await sourceFileDownload.value?.blob.text()

      const data = tsvParse(text || '')

      new BarChart({
        element: barChart.value,
        darkMode: store.storeIsDarkMode,
        height: compProps.height,
        colors: getColors(),
        x: compProps.xColumn,
        columnsToIgnore: ['genus'],
        xCategory: t(compProps.xTitle),
        yCategory: t(compProps.yTitle),
        xLabels: compProps.xLabels,
        groupBy: compProps.groupBy,
        mode: compProps.mode,
        onPointClicked: (data: ClickHandlerPayload) => {
          emit('bar-clicked', data)
        },
      }).create(baseChart.value, data)
    }
  }

  onMounted(() => {
    // Only register the chart types we're actually using to reduce the final bundle size
    baseChart.value?.register([
      bar,
    ])

    if (compProps.sourceFile) {
      nextTick(() => redraw(compProps.sourceFile))
    }
  })

  defineExpose({
    redraw,
  })
</script>
