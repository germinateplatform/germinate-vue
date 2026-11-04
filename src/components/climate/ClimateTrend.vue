<template>
  <div>
    <h2>{{ $t('pageClimateExportClimateTrendTitle') }}</h2>

    <v-row>
      <v-col cols="12" md="6">
        <ClimateSelection
          v-model="selectedClimates"
          :climates="numericClimates"
          can-select-all
        >
          <template #text>
            <p>{{ $t('pageClimateExportSelectClimateTrendText') }}</p>
          </template>
        </ClimateSelection>
      </v-col>
      <v-col cols="12" md="6">
        <GroupSelection
          v-model="selectedLocations"
          v-model:group-selection="groupSelection"
          url-query-key="matrix"
          :groups="cdStore.storeGroups"
          marked-item-type="locations"
        >
          <template #text>{{ $t('pageClimateExportSelectGroupChartText') }}</template>
        </GroupSelection>
      </v-col>
    </v-row>

    <v-btn class="my-5" :disabled="!canContinue" color="primary" :prepend-icon="mdiArrowRightBox" :text="$t('buttonPlot')" @click="plot" />

    <BaseChart
      title="pageClimateExportClimateTrendTitle"
      :chart-id="id"
      :filename="filename"
      :source-file="sourceFile"
      v-model:loading="loading"
      :header-icon="mdiChartMultiline"
      @force-redraw="updateChart"
      ref="baseChart"
      v-if="chartData && chartData.length > 0"
    >
      <template #chart-content>
        <div :id="id" ref="trendChart" />
      </template>
    </BaseChart>
  </div>
</template>

<script setup lang="ts">
  import { type ViewTableGroups, type ViewTableClimates, type ClimateExportDatasetRequest, ViewTableClimatesDataType, type ViewTableClimateData } from '@/plugins/types/germinate'
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'
  import box from 'plotly.js/lib/box'

  import emitter from 'tiny-emitter/instance'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

  import { mdiArrowRightBox, mdiChartMultiline } from '@mdi/js'
  import { apiPostClimateDataTable } from '@/plugins/api/climate'
  import type { Data, Layout } from 'plotly.js'
  import { DEFAULT_PLOTLY_CONFIG, uuidv4, type DownloadBlob } from '@/plugins/util'
  import { getColor } from '@/plugins/util/colors'

  const compProps = defineProps<{
    max?: number
  }>()

  const store = useCoreStore()
  const cdStore = useClimateDataStore()

  const id = ref('trend-' + uuidv4())
  const loading = ref(false)
  const sourceFile = ref<DownloadBlob>()

  const selectedClimates = ref<ViewTableClimates[]>([])
  const selectedLocations = ref<ViewTableGroups[]>([])
  const groupSelection = ref<GroupSelectionType>('all')

  const baseChart = useTemplateRef('baseChart')
  const trendChart = useTemplateRef('trendChart')

  const libLoaded = ref(false)

  const numericClimates = computed(() => (cdStore.storeClimates ?? []).filter(c => c.dataType === ViewTableClimatesDataType.numeric))

  const hasGroupsData = ref(false)
  const chartData = ref<ViewTableClimateData[]>([])

  const canContinue = computed(() => {
    return selectedClimates.value.length > 0 && selectedClimates.value.length < (compProps.max || Number.MAX_SAFE_INTEGER) && (groupSelection.value === 'all' || selectedLocations.value.length > 0)
  })

  const filename = computed(() => {
    let name = 'trait-boxplot'
    if (cdStore.storeDatasetIds) {
      name += `-${cdStore.storeDatasetIds.join('-')}`
    } else {
      name += '-all-datasets'
    }
    if (numericClimates.value) {
      name += `-${numericClimates.value.map(t => t.climateId).join('-')}`
    } else {
      name += '-all-climates'
    }

    return name
  })

  function calendarDate (value: Date | string): { year: number, month: number, day: number } | null {
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        return null
      }
      return { year: value.getFullYear(), month: value.getMonth() + 1, day: value.getDate() }
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value))
    if (!m) {
      return null
    }
    return { year: +m[1], month: +m[2], day: +m[3] }
  }

  const pad2 = (n: number) => String(n).padStart(2, '0')

  /**
   * Returns the first day of the record's month as 'YYYY-MM-01'.
   * Every record in the same calendar month of the same year gets the same x value,
   * so Plotly draws one box per month per year (Jan 2020, Feb 2020, ... Jan 2021, ...).
   * UTC is used so a date like 2020-03-01T00:00Z is never shifted into February.
   * recordingDate is normalized via new Date() in case it arrives as an ISO string from JSON.
   */
  function toMonthBucket (value: Date | string): string | null {
    const d = calendarDate(value)
    return d ? `${d.year}-${pad2(d.month)}-01` : null
  }

  function buildClimateBoxTraces (data: ViewTableClimateData[]): Data[] {
    // Group by climateId (keeping the name for the legend)
    const groups = new Map<number, { name: string, x: string[], y: number[], index: number, pointText: string[] }>()

    let index = 0
    for (const row of data) {
      const bucket = toMonthBucket(row.recordingDate)
      const value = Number.parseFloat(row.climateValue)
      if (bucket === null || !Number.isFinite(value)) {
        continue
      }

      let g = groups.get(row.climateId)
      if (!g) {
        g = { name: row.climateName, x: [], y: [], index: index++, pointText: [] }
        groups.set(row.climateId, g)
      }
      g.x.push(bucket)
      g.y.push(value)
      g.pointText.push(`${escapeHtml(row.countryName)} - ${escapeHtml(row.locationName)}<br>${row.recordingDate instanceof Date ? row.recordingDate.toISOString().slice(0, 10) : String(row.recordingDate).slice(0, 10)}`)
    }

    return Array.from(groups.entries()).map(([climateId, g]) => ({
      type: 'box',
      name: g.name, // legend entry
      legendgroup: String(climateId),
      marker: { color: getColor(g.index), size: 4 },
      x: g.x, // one x value per month bucket
      y: g.y,
      boxpoints: 'outliers' as const,
      // hovertemplate: `${g.name}<br>%{x|%b %Y}<br>%{y}<extra></extra>`,
      hovertemplate: '%{hovertext}<br>%{y}<extra>%{fullData.name}</extra>',
      hovertext: g.pointText,
      hoverinfo: 'all',
    }))
  }

  function escapeHtml (s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function updateChart () {
    if (!trendChart.value) {
      return
    }

    if (!libLoaded.value) {
      baseChart.value?.register([box])
      libLoaded.value = true
    }

    const traces = buildClimateBoxTraces(chartData.value)

    const buckets = traces.flatMap(t => ((t as { x?: string[] }).x ?? []))
    const first = buckets.reduce((a, b) => (b < a ? b : a))
    const last = buckets.reduce((a, b) => (b > a ? b : a))

    // Boxes are centred on the 1st of the month, so pad by half a month
    // on each side to keep the outer boxes from being cut off.
    const shift = (bucket: string, months: number, days: number): string => {
      const [y, m] = bucket.split('-').map(Number)
      const d = new Date(Date.UTC(y, m - 1 + months, 1 + days))
      return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
    }
    const fullRange: [string, string] | undefined = buckets.length > 0
      ? [shift(first, 0, -15), shift(last, 0, 14)]
      : undefined
    const initialRange: [string, string] | undefined = buckets.length > 0
      ? [shift(`${last.slice(0, 4)}-01-01`, 0, -15), shift(last, 0, 14)]
      : undefined

    if (chartData.value) {
      sourceFile.value = {
        blob: new Blob([JSON.stringify(chartData.value)], { type: 'application/json' }),
        filename: filename.value,
        extension: 'json',
      }
    }

    const layout: Partial<Layout> = {
      xaxis: {
        zeroline: false,
        title: { font: { color: store.storeIsDarkMode ? 'white' : 'black' }, text: 'Month' },
        tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
        showgrid: true,
        gridcolor: store.storeIsDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        type: 'date',
        tickformat: '%b %Y',
        dtick: 'M1',
        tickangle: -45,
        range: initialRange,
        rangeselector: {
          buttons: [{
            step: 'year',
            stepmode: 'todate',
            count: 1,
            label: 'YTD',
          }, {
            step: 'year',
            stepmode: 'backward',
            count: 1,
            label: '1y',
          }, {
            step: 'all',
          }],
        },
        rangeslider: {
          visible: true,
          range: fullRange, // slider track always spans ALL the data
        }, // handy when there are many years
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      height: 500,
      autosize: true,
      boxmode: 'group' as const,
      dragmode: 'select' as const,
      yaxis: {
        title: { font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
        tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
        fixedrange: false,
      },
      legend: {
        bgcolor: 'rgba(0,0,0,0)',
        orientation: 'h' as const,
        x: 0,
        y: 1.1,
        font: { color: store.storeIsDarkMode ? 'white' : 'black' },
      },
    }

    baseChart.value?.react(trendChart.value, traces, layout, DEFAULT_PLOTLY_CONFIG)
  }

  function plot () {
    emitter.emit('show-loading', true)

    const query: ClimateExportDatasetRequest = {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      prevCount: -1,
      datasetIds: cdStore.storeDatasetIds,
      climateIds: selectedClimates.value.map(t => t.climateId),
      locationIds: groupSelection.value === 'groups' && selectedLocations.value.some(g => g.groupId === -1) ? store.storeMarkedLocations : undefined,
      locationGroupIds: selectedLocations.value.filter(g => g.groupId !== -1).map(g => g.groupId || -1),
      minimal: true,
    }

    hasGroupsData.value = query.locationGroupIds !== undefined && query.locationGroupIds.length > 0

    apiPostClimateDataTable(query, result => {
      chartData.value = result.data
    }).finally(() => {
      emitter.emit('show-loading', false)
    })
  }

  watch(chartData, async () => nextTick(() => updateChart()), { immediate: true })
</script>
