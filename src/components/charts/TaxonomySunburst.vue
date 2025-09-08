<template>
  <BaseChart
    title="pageStatisticsBiologicalStatusSunburstTitle"
    :chart-id="id"
    :filename="filename"
    :source-file="sourceFile"
    @force-redraw="redraw"
  >
    <template #chart-content>
      <div :id="id" ref="taxonomyChart" />
    </template>
  </BaseChart>
</template>

<script setup lang="ts">
  import BaseChart from '@/components/charts/BaseChart.vue'
  import { uuidv4, type DownloadBlob } from '@/plugins/util'
  import { plotlySunburstChart } from '@/plugins/charts/plotly-sunburst-chart'

  import { tsvParse } from 'd3-dsv'
  import { select } from 'd3-selection'

  import Plotly from 'plotly.js/lib/core'
  import sunburst from 'plotly.js/lib/sunburst'
  import { coreStore } from '@/stores/app'
  import { Pages } from '@/plugins/pages'
  import { getColors } from '@/plugins/util/colors'
  import { FilterComparator, FilterOperator, type FilterGroup } from '@/plugins/types/germinate'
  import { apiGetStatsFile } from '@/plugins/api/stats'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    sunburst,
  ])

  const store = coreStore()
  const router = useRouter()

  const sourceFile = ref<DownloadBlob>()
  const systemTheme = ref('dark')
  const taxonomyChart = useTemplateRef('taxonomyChart')
  const id = ref('taxonomy-' + uuidv4())

  const filename = computed(() => {
    return 'taxonomy-sunburst'
  })

  async function redraw (source?: Blob) {
    if (source) {
      sourceFile.value = {
        blob: source,
        filename: filename.value,
        extension: 'tsv',
      }
    }

    if (taxonomyChart.value) {
      Plotly.purge(taxonomyChart.value)

      const text = await sourceFile.value?.blob.text()

      const data = tsvParse(text || '')

      const sunburst: { [key: string]: number } = {}

      data.forEach(t => {
        if (t.subtaxa) {
          const key = `${t.subtaxa}->${t.genus} | ${t.species}`
          if (!sunburst[key]) {
            sunburst[key] = 0
          }

          sunburst[key] += Number.parseInt(t.count)
        }

        if (t.species) {
          const key = `${t.genus} | ${t.species}->${t.genus}`
          if (!sunburst[key]) {
            sunburst[key] = 0
          }

          sunburst[key] += Number.parseInt(t.count)
        }

        if (t.genus) {
          const key = `${t.genus}->NULL`
          if (!sunburst[key]) {
            sunburst[key] = 0
          }

          sunburst[key] += Number.parseInt(t.count)
        }
      })

      const chartData = {
        labels: [] as string[],
        parents: [] as string[],
        values: [] as number[],
      }

      Object.keys(sunburst).forEach(k => {
        const parts = k.split('->')
        if (parts.length === 2) {
          chartData.labels.push(parts[0])
          chartData.parents.push(parts[1] === 'NULL' ? '' : parts[1])
          chartData.values.push(sunburst[k])
        }
      })

      select(taxonomyChart.value)
        .datum(chartData)
        .call(plotlySunburstChart(Plotly)
          .darkMode(store.storeTheme === 'system' ? systemTheme.value : store.storeTheme)
          .height(500)
          .onLeafClicked((path: string[]) => {
            // Then store a filter using genus, species and subtaxa
            const query: FilterGroup[] = [{
              filters: [],
              operator: FilterOperator.and,
            }]

            if (path.length === 1 && path[0] === 'N/A') {
              query[0].filters?.push({
                column: 'genus',
                comparator: FilterComparator.isNull,
                values: [],
              })
            } else {
              const genus = path[0]
              const species = path.length > 1 ? path[1].split(' | ')[1] : null
              const subtaxa = path.length > 2 ? path[2] : null

              query[0].filters?.push({
                column: 'genus',
                comparator: FilterComparator.equals,
                values: [genus],
              })

              if (species) {
                query[0].filters?.push({
                  column: 'species',
                  comparator: FilterComparator.equals,
                  values: [species],
                })
              }
              if (subtaxa) {
                query[0].filters?.push({
                  column: 'subtaxa',
                  comparator: FilterComparator.equals,
                  values: [subtaxa],
                })
              }
            }

            // Navigate to the germplasm page
            router.push({
              path: Pages.germplasm.path,
              query: {
                'germplasm-filter': JSON.stringify(query),
              },
            })
          })
          .colors(getColors()))
    }
  }

  onMounted(() => {
    apiGetStatsFile('taxonomy', (result: Blob) => redraw(result))
  })
</script>
