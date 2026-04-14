<template>
  <BaseChart
    title="pageMapsHistogramTitle"
    :chart-id="id"
    :filename="filename"
    :source-file="sourceFile"
    :header-icon="mdiChartHistogram"
    @force-redraw="redraw"
  >
    <template #card-text>
      <v-card-text>
        <p>{{ $t('pageMapsHistogramText') }}</p>
        <p class="text-info">{{ $t('pageMapsHistogramInfo') }}</p>
      </v-card-text>
    </template>
    <template #toolbar-append>
      <v-btn-group class="mx-2" density="compact" variant="tonal">
        <v-btn v-tooltip:top="$t('tooltipTableMarkedItems')" :to="Pages.getPath(Pages.markedItemType, 'markers')"><v-chip size="small" label>{{ getNumberWithSuffix(store.storeMarkedMarkers.length, 1) }}</v-chip></v-btn>
        <v-btn v-tooltip:top="$t('tooltipTableMarkedItemsClear')" @click="clearMarkedItems"><v-icon :icon="mdiDelete" /></v-btn>
      </v-btn-group>
    </template>
    <template #list-append>
      <v-divider />
      <v-list-item :prepend-icon="mdiCheckboxMarked" :disabled="mapSelections.length === 0" @click="toggleItems(true)">{{ $t('widgetChartMarkSelectedItems') }}</v-list-item>
      <v-list-item :prepend-icon="mdiCheckboxBlankOutline" :disabled="mapSelections.length === 0" @click="toggleItems(false)">{{ $t('widgetChartUnmarkSelectedItems') }}</v-list-item>
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
  import { apiPostMapdefinitionTableIds, apiPostMapExport } from '@/plugins/api/genotype'
  import { Pages } from '@/plugins/pages'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { FilterComparator, FilterOperator, type PaginatedRequest } from '@/plugins/types/germinate'

  import emitter from 'tiny-emitter/instance'
  import { mdiChartHistogram, mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiDelete } from '@mdi/js'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    histogram,
  ])

  interface MapSelection {
    chromosome: string
    start: number
    end: number
  }

  const compProps = defineProps<{
    mapId: number
  }>()

  const emit = defineEmits(['points-selected', 'selection-cleared'])

  const store = coreStore()

  const sourceFile = ref<DownloadBlob>()
  const mapChart = useTemplateRef('mapChart')
  const id = ref('taxonomy-' + uuidv4())
  const distinctChromosomes = ref<number>(0)
  const mapSelections = ref<MapSelection[]>([])

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

  function toggleItems (add: boolean) {
    if (mapSelections.value && mapSelections.value.length > 0) {
      let counter = 0

      // For each selection, i.e. for each selected area per chromosome, do this individually.
      // The boolean logic the filter uses isn't powerful enough to run the complex query in one go.
      mapSelections.value.forEach(s => {
        const query: PaginatedRequest = {
          page: 1,
          limit: MAX_JAVA_INTEGER,
          filters: [{
            operator: FilterOperator.and,
            filters: [{
              column: 'mapId',
              comparator: FilterComparator.equals,
              values: [`${compProps.mapId}`],
            }, {
              column: 'chromosome',
              comparator: FilterComparator.equals,
              values: [s.chromosome],
            }, {
              column: 'position',
              comparator: FilterComparator.between,
              values: [`${s.start}`, `${s.end}`],
            }],
          }],
        }

        counter = counter + 1
        // Show loading indicator
        emitter.emit('show-loading', true)
        // Get the ids of the markers in the requested regions
        apiPostMapdefinitionTableIds(query, result => {
          if (result && result.data && result.data.length > 0) {
            if (add) {
              store.addMarkedIds('markers', result.data)
            } else {
              store.removeMarkedIds('markers', result.data)
            }
          }

          counter = counter - 1
          // If this is the last one to finish, hide the loading indicator
          if (counter < 1) {
            emitter.emit('show-loading', false)
          }
        })
      })
    }
  }

  function clearMarkedItems () {
    store.clearMarkedIds('markers')
  }

  function plot () {
    select(mapChart.value)
      .datum(tsvData)
      .call(plotlyMapChart(Plotly)
        .darkMode(store.storeIsDarkMode)
        .colors(getColors())
        .onPointsSelected((chromosome: string, start: number, end: number) => {
          const changed = (mapSelections.value || []).filter(ms => ms.chromosome !== chromosome)
          changed.push({
            chromosome: chromosome,
            start: Math.floor(start),
            end: Math.ceil(end),
          })
          mapSelections.value = changed
          emit('points-selected', chromosome, start, end)
        })
        .onDistinctChromosomes((d: string[]) => {
          if (d && d.length > 0) {
            distinctChromosomes.value = d.length
          }
        })
        .onSelectionCleared(() => {
          mapSelections.value = []
          emit('selection-cleared')
        }))
  }

  onMounted(() => {
    redraw()
  })
</script>
