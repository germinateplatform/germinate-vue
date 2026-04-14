<template>
  <BaseChart
    :title="title"
    :chart-id="id"
    :filename="filename"
    :source-file="sourceFile"
    :header-icon="mdiChartBar"
    @force-redraw="redraw()"
  >
    <template #chart-content>
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
  import { uuidv4, type DownloadBlob } from '@/plugins/util'

  import Plotly from 'plotly.js/lib/core'
  import bar from 'plotly.js/lib/bar'
  import { coreStore } from '@/stores/app'
  import { getColor } from '@/plugins/util/colors'
  import { useI18n } from 'vue-i18n'
  import type { GermplasmMetaStats } from '@/plugins/types/germinate'
  import type { UserSelection } from '@/components/widgets/selections/StatsHighlightSelection.vue'
  import { mdiChartBar } from '@mdi/js'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    bar,
  ])

  const store = coreStore()
  const { t } = useI18n()

  export interface BarClickEvent {
    x: string
    trace: string
  }

  const compProps = defineProps<{
    data: GermplasmMetaStats[]
    userSelection?: UserSelection
    xValue: string
    title: string
    filename: string
    xLabels?: string[]
    xValues?: number[]
    sortByX?: boolean
  }>()

  const sourceFile = ref<DownloadBlob>()
  const id = ref(`stats-${uuidv4()}`)

  async function redraw () {
    const element = document.getElementById(id.value)
    if (element) {
      Plotly.purge(element)

      const allXValues = new Map<string, number>()

      compProps.data.forEach(d => {
        // @ts-ignore
        allXValues.set(d[compProps.xValue], (allXValues.get(d[compProps.xValue]) || 0) + 1)
      })

      let x

      if (compProps.sortByX) {
        x = [...allXValues.keys()].filter(v => v !== undefined).sort((a, b) => (allXValues.get(b) || 0) - (allXValues.get(a) || 0))
      } else {
        x = [...allXValues.keys()]
      }

      const data: any[] = [{
        x,
        y: x.map(k => allXValues.get(k)),
        name: 'All data',
        type: 'bar',
        marker: {
          color: getColor(0),
        },
      }]

      if (compProps.userSelection) {
        switch (compProps.userSelection.type) {
          case 'taxonomies':
            compProps.userSelection.selectedItems.forEach((taxonomy, index) => {
              data.push(returnData(compProps.data, td => [td.genus, td.species].join(' ') === taxonomy, x, taxonomy, index))
            })
            break
          case 'sampstat':
            compProps.userSelection.selectedItems.forEach((sampstat, index) => {
              data.push(returnData(compProps.data, td => td.sampstat === sampstat, x, sampstat, index))
            })
            break
        }
      }

      const layout: any = {
        height: 400,
        hovermode: 'x' as const,
        barmode: 'group' as const,
        bargroupgap: 0.1,
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        xaxis: {
          title: { text: compProps.title, font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
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
          gridcolor: store.storeIsDarkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)',
        },
        legend: {
          bgcolor: 'rgba(0,0,0,0)',
          orientation: 'h' as const,
          x: 0,
          y: 1.3,
          font: { color: store.storeIsDarkMode ? 'white' : 'black' },
        },
      }

      if (compProps.xLabels && compProps.xValues) {
        layout.xaxis.ticktext = compProps.xLabels
        layout.xaxis.tickvals = compProps.xValues
        layout.xaxis.range = [(compProps.xValues[0] as number) - 1, (compProps.xValues[compProps.xValues.length - 1] as number) + 1]
        layout.xaxis.tickmode = 'array'
      }

      if (compProps.data) {
        let content = 'genus\tspecies\ttaxonomy\tsampstat\tpdci'

        compProps.data.forEach(d => {
          content += `\n${d.genus || ''}\t${d.species || ''}\t${d.taxonomy || ''}\t${d.sampstat || ''}\t${d.pdci || ''}`
        })

        sourceFile.value = {
          blob: new Blob([content], { type: 'text/plain' }),
          filename: compProps.filename,
          extension: 'tsv',
        }
      }

      const config = {
        modeBarButtonsToRemove: ['toImage' as const],
        responsive: true,
        displaylogo: false,
      }

      Plotly.react(element, data, layout, config)
        .then(element => {
          const dragLayer = element.getElementsByClassName('nsewdrag')[0] as HTMLElement

          element.on('plotly_hover', () => {
            dragLayer.style.cursor = 'pointer'
          })
          element.on('plotly_unhover', () => {
            dragLayer.style.cursor = ''
          })
          element.on('plotly_click', data => {
            if (data && data.points && data.points.length > 0 && data.event && data.event.button === 0) {
              emit('bar-clicked', {
                x: data.points[0].x,
                trace: data.points[0].data.name,
              })
            }
          })
        })
    }
  }

  function returnData (traitData: GermplasmMetaStats[], filter: (dp: GermplasmMetaStats) => boolean, x: string[], name: string, index: number) {
    const localMap = new Map<string, number>()
    x.forEach(k => localMap.set(k, 0))
    // @ts-ignore
    traitData.filter(filter).forEach(dp => localMap.set(dp[compProps.xValue], (localMap.get(dp[compProps.xValue]) || 0) + 1))

    return {
      x,
      y: x.map(k => localMap.get(k)),
      name,
      type: 'bar',
      marker: {
        color: getColor(index + 1),
      },
    }
  }

  defineExpose({
    redraw,
  })

  watch(() => compProps.data, async () => redraw(), { immediate: true })
  watch(() => compProps.userSelection, async () => redraw(), { deep: true })

  onMounted(() => redraw())

  const emit = defineEmits(['bar-clicked'])
</script>
