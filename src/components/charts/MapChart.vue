<template>
  <BaseChart
    title="pageMapsHistogramTitle"
    :chart-id="id"
    :filename="filename"
    :source-file="sourceFile"
    header-icon="mdi-chart-histogram"
    @force-redraw="redraw"
  >
    <template #card-text>
      <v-card-text>
        <p>{{ $t('pageMapsHistogramText') }}</p>
        <p class="text-info">{{ $t('pageMapsHistogramInfo') }}</p>
      </v-card-text>
    </template>

    <template #chart-content>
      <div :id="id" ref="mapChart" />
    </template>
  </BaseChart>
</template>

<script setup lang="ts">
  import BaseChart from '@/components/charts/BaseChart.vue'
  import { uuidv4, type DownloadBlob } from '@/plugins/util'
  import { plotlyMapChart } from '@/plugins/charts/plotly-map-chart'

  import { tsvParse } from 'd3-dsv'
  import { select } from 'd3-selection'

  import Plotly from 'plotly.js/lib/core'
  import histogram from 'plotly.js/lib/histogram'
  import { coreStore } from '@/stores/app'
  import { getColors } from '@/plugins/util/colors'
  import { apiPostMapExport } from '@/plugins/api/genotype'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    histogram,
  ])

  const compProps = defineProps<{
    mapId: number
  }>()

  const emit = defineEmits(['points-selected', 'selection-cleared'])

  const store = coreStore()

  const sourceFile = ref<DownloadBlob>()
  const mapChart = useTemplateRef('mapChart')
  const id = ref('taxonomy-' + uuidv4())
  const distinctChromosomes = ref<number>(0)

  let tsvData: any

  const filename = computed(() => {
    return `map-${compProps.mapId}`
  })

  async function redraw () {
    if (mapChart.value) {
      Plotly.purge(mapChart.value)
    }

    if (!sourceFile.value) {
      apiPostMapExport<Blob>(compProps.mapId, { format: 'flapjack' })
        .then(result => {
          sourceFile.value = {
            blob: result.data,
            filename: filename.value,
            extension: 'map',
          }

          return sourceFile.value?.blob.text()
        })
        .then(dirtyTsv => {
          const firstEOL = dirtyTsv.indexOf('\r\n')
          const tsv = 'markerName\tchromosome\tposition\r\n' + dirtyTsv.slice(firstEOL + 2)
          tsvData = tsvParse(tsv)
          plot()
        })
    } else {
      plot()
    }
  }

  function plot () {
    select(mapChart.value)
      .datum(tsvData)
      .call(plotlyMapChart(Plotly)
        .darkMode(store.storeIsDarkMode)
        .colors(getColors())
        .onPointsSelected((chromosome: string, start: number, end: number) => {
          // this.chartSelection.push({
          //   chromosome: chromosome,
          //   range: [Math.floor(start), Math.ceil(end)]
          // })
          emit('points-selected', chromosome, start, end)

          // TODO
        })
        .onDistinctChromosomes((d: string[]) => {
          if (d && d.length > 0) {
            distinctChromosomes.value = d.length
          }
        })
        .onSelectionCleared(() => {
          // this.chartSelection = []
          emit('selection-cleared')
        }))
  }

  onMounted(() => {
    redraw()
  })
</script>
