<template>
  <BaseChart
    :title="title"
    :chart-id="id"
    :filename="filename"
    :source-file="sourceFile"
    :header-icon="mdiChartBarStacked"
    @force-redraw="redraw()"
    ref="baseChart"
  >
    <template #chart-content>
      <div class="d-flex ga-2">
        <HintContainer :text="$t('widgetChartGroupMode')">
          <v-btn-toggle v-model="mode" variant="tonal" color="primary" mandatory>
            <v-btn value="year" :prepend-icon="mdiCalendar" :text="$t('widgetChartModeYear')" />
            <v-btn value="type" :prepend-icon="mdiFormatListBulletedType" :text="$t('widgetChartModeType')" />
          </v-btn-toggle>
        </HintContainer>

        <HintContainer :text="$t('widgetChartCountType')">
          <v-btn-toggle v-model="count" variant="tonal" color="primary" mandatory>
            <v-btn value="datasetCount" :prepend-icon="mdiDatabase" :text="$t('widgetChartCountDataset')" />
            <v-btn value="dataObjectCount" :prepend-icon="mdiFormatListBulleted" :text="$t('widgetChartCountDataObject')" />
            <v-btn value="dataPointCount" :prepend-icon="mdiScatterPlot" :text="$t('widgetChartCountDataPoint')" />
          </v-btn-toggle>
        </HintContainer>
      </div>

      <div :id="id" />
    </template>

    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>
  </BaseChart>
</template>

<script setup lang="ts">
  import BaseChart from '@/components/charts/BaseChart.vue'
  import { DEFAULT_PLOTLY_CONFIG, uuidv4, type DownloadBlob } from '@/plugins/util'

  import bar from 'plotly.js/lib/bar'
  import { mdiCalendar, mdiChartBarStacked, mdiDatabase, mdiFormatListBulleted, mdiFormatListBulletedType, mdiScatterPlot } from '@mdi/js'
  import type { ViewStatsDatasets } from '@/plugins/types/germinate'
  import { getColor } from '@/plugins/util/colors'
  import { datasetTypes } from '@/plugins/util/types'
  import { useI18n } from 'vue-i18n'

  const baseChart = useTemplateRef('baseChart')

  const mode = ref<'year' | 'type'>('year')
  const count = ref<'datasetCount' | 'dataObjectCount' | 'dataPointCount'>('datasetCount')

  const compProps = defineProps<{
    data: ViewStatsDatasets[]
    title: string
    filename: string
  }>()

  const store = useCoreStore()
  const { t } = useI18n()

  const sourceFile = ref<DownloadBlob>()
  const id = ref(`dataset-stats-${uuidv4()}`)

  function getYearViewTraces () {
    const data = compProps.data
    const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b)
    const types = Array.from(new Set(data.map(d => d.type))).sort()

    const traces = types.map(type => {
      const yValues = years.map(year => {
        const match = data.find(d => d.year === year && d.type === type)
        return match?.[count.value] || 0
      })

      return {
        x: years.map(String),
        y: yValues,
        name: datasetTypes[type].text(),
        marker: {
          color: datasetTypes[type].color(),
        },
        type: 'bar',
      }
    })

    return traces
  }

  function getTypeViewTraces () {
    const data = compProps.data
    const types = Array.from(new Set(data.map(d => datasetTypes[d.type].text()))).sort()
    const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b)

    const traces = years.map((year, index) => {
      const yValues = types.map(type => {
        const match = data.find(d => d.year === year && datasetTypes[d.type].text() === type)
        return match?.[count.value] || 0
      })

      return {
        x: types,
        y: yValues,
        name: String(year),
        marker: {
          color: getColor(index),
        },
        type: 'bar',
      }
    })

    return traces
  }

  async function redraw () {
    const element = document.getElementById(id.value)
    const isYear = mode.value === 'year'
    if (element) {
      const yearTraces = getYearViewTraces()
      const typeTraces = getTypeViewTraces()

      const layout = {
        barmode: 'stack',
        legend: {
          orientation: 'h',
          y: 1.1,
        },
        xaxis: {
          title: { text: isYear ? t('widgetChartModeYear') : t('widgetChartModeType'), font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
          tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
          automargin: true,
          fixedrange: true,
        },
        yaxis: {
          title: { text: t('genericCount'), font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
          tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
          automargin: true,
          fixedrange: true,
          showgrid: true,
          gridcolor: store.storeIsDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      }

      baseChart.value?.react(element, isYear ? yearTraces : typeTraces, layout, DEFAULT_PLOTLY_CONFIG)
    }
  }

  defineExpose({
    redraw,
  })

  watch(() => compProps.data, async () => redraw(), { immediate: true })
  watch([mode, count], async () => redraw())

  onMounted(() => {
    // Only register the chart types we're actually using to reduce the final bundle size
    baseChart.value?.register([
      bar,
    ])

    redraw()
  })
</script>
