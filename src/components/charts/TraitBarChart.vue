<template>
  <div class="mt-5" v-for="(data, i) in traitBarChartData" :key="`trait-bar-chart-${i}`">
    <BaseChart
      :title="data.trait.traitName"
      :chart-id="data.id"
      :filename="data.filename"
      :source-file="data.sourceFile"
      header-icon="mdi-chart-bar"
      @force-redraw="redraw(data)"
    >
      <template #chart-content>
        <div :id="data.id" />
      </template>

      <!-- Pass on all named slots -->
      <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
        <slot :name="slot" v-bind="slotProps" />
      </template>
    </BaseChart>
  </div>
</template>

<script setup lang="ts">
  import BaseChart from '@/components/charts/BaseChart.vue'
  import { uuidv4, type DownloadBlob } from '@/plugins/util'

  import Plotly from 'plotly.js/lib/core'
  import bar from 'plotly.js/lib/bar'
  import { coreStore } from '@/stores/app'
  import { getColor, hexToRGBA } from '@/plugins/util/colors'
  import { useI18n } from 'vue-i18n'
  import { ViewTableTraitsScaleDatatype, type ViewTableDatasets, type ViewTableGroups, type ViewTableTraits, type ViewTableTrialsData } from '@/plugins/types/germinate'
  import type { UserSelection } from '@/components/widgets/selections/HighlightSelection.vue'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    bar,
  ])

  const store = coreStore()
  const { t } = useI18n()

  interface TraitBarChartData {
    id: string
    trait: ViewTableTraits
    filename: string
    sourceFile?: DownloadBlob
    data: ViewTableTrialsData[]
  }

  const compProps = defineProps<{
    traits: ViewTableTraits[]
    traitData: ViewTableTrialsData[]
    userSelection?: UserSelection
    groups: ViewTableGroups[]
    datasets: ViewTableDatasets[]
  }>()

  const traitBarChartData = ref<TraitBarChartData[]>([])

  async function redraw (traitData: TraitBarChartData) {
    const element = document.getElementById(traitData.id)
    if (element) {
      Plotly.purge(element)

      const xValues = new Map<string, number>()

      traitData.data.forEach(d => {
        xValues.set(d.traitValue, (xValues.get(d.traitValue) || 0) + 1)
      })

      const x = [...xValues.keys()]
      const data: any[] = [{
        x,
        y: x.map(k => xValues.get(k)),
        name: 'All data',
        type: 'bar',
        marker: {
          color: hexToRGBA(getColor(0), 0.5),
          line: {
            color: getColor(0),
            width: 2,
          },
        },
      }]

      if (compProps.userSelection) {
        switch (compProps.userSelection.type) {
          case 'dataset':
            compProps.datasets.forEach((dataset, index) => {
              data.push(returnData(traitData.data, td => td.datasetId === dataset.datasetId, x, dataset.datasetName || '', index))
            })
            break
          case 'germplasm':
            compProps.userSelection.selectedItems.forEach((germplasm, index) => {
              data.push(returnData(traitData.data, td => td.germplasmDisplayName === germplasm, x, germplasm, index))
            })
            break
          case 'taxonomies':
            compProps.userSelection.selectedItems.forEach((taxonomy, index) => {
              data.push(returnData(traitData.data, td => td.taxonomyFull === taxonomy, x, taxonomy, index))
            })
            break
          case 'plot':
            compProps.userSelection.selectedItems.map((plot, index) => {
              const [row, column] = plot.split('|').map(Number)
              data.push(returnData(traitData.data, dp => dp.trialRow === row && dp.trialColumn === column, x, plot, index))
            })
            break
          case 'year':
            compProps.userSelection.selectedItems.forEach((year, index) => {
              data.push(returnData(traitData.data, dp => {
                if (!dp.recordingDate) {
                  return false
                } else {
                  const date = new Date(dp.recordingDate)
                  return date.getFullYear() === +year
                }
              }, x, `&nbsp;${year}`, index))
            })
            break
          case 'reps':
            compProps.userSelection.selectedItems.forEach((rep, index) => {
              data.push(returnData(traitData.data, td => td.rep === rep, x, `&nbsp;${rep}`, index))
            })
            break
          case 'treatments':
            compProps.userSelection.selectedItems.forEach((treatment, index) => {
              data.push(returnData(traitData.data, td => td.treatment === treatment, x, treatment, index))
            })
            break
          case 'group':
            const groupNames: { [index: number]: string } = {}

            compProps.groups.forEach(g => {
              groupNames[g.groupId || -1] = g.groupName || ''
            })
            compProps.userSelection.selectedItems.forEach((groupId, index) => {
              data.push(returnData(traitData.data, td => td.groups !== undefined && td.groups.some(g => `${g.id}` === groupId), x, groupNames[+groupId] || `${groupId}`, index))
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
          title: { text: traitData.trait.variableName, font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
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
          y: 1.1,
          font: { color: store.storeIsDarkMode ? 'white' : 'black' },
        },
      }

      if (traitData.trait.scaleDatatype === ViewTableTraitsScaleDatatype.categorical && traitData.trait.scaleRestrictions && traitData.trait.scaleRestrictions.categories) {
        let xTickLabels: string[] = []

        const potentialLabels: string[][] = []

        traitData.trait.scaleRestrictions.categories.forEach(scale => {
          scale.forEach((l, i) => {
            if (i > potentialLabels.length - 1) {
              potentialLabels.push([l])
            } else {
              potentialLabels[i].push(l)
            }
          })
        })

        xTickLabels = potentialLabels.map(lbs => lbs.join('<br>'))

        const xTickValues = potentialLabels.map(lbs => {
          return lbs.map(lb => xValues.has(lb) ? lb : undefined).find(lb => lb !== undefined) || null
        })

        layout.xaxis.ticktext = xTickLabels
        layout.xaxis.tickvals = xTickValues
        layout.xaxis.tickmode = 'array'
      }

      const config = {
        modeBarButtonsToRemove: ['toImage' as const],
        responsive: true,
        displaylogo: false,
      }

      Plotly.react(element, data, layout, config)
    }
  }

  function returnData (traitData: ViewTableTrialsData[], filter: (dp: ViewTableTrialsData) => boolean, x: string[], name: string, index: number) {
    const localMap = new Map<string, number>()
    x.forEach(k => localMap.set(k, 0))
    traitData.filter(filter).forEach(dp => localMap.set(dp.traitValue, (localMap.get(dp.traitValue) || 0) + 1))

    return {
      x,
      y: x.map(k => localMap.get(k)),
      name,
      type: 'bar',
      marker: {
        color: hexToRGBA(getColor(index + 1), 0.5),
        line: {
          color: getColor(index + 1),
          width: 2,
        },
      },
    }
  }

  function init () {
    traitBarChartData.value = compProps.traits.map(t => {
      return {
        trait: t,
        id: `trait-bar-chart-${uuidv4()}`,
        filename: t.variableName,
        data: compProps.traitData.filter(d => d.traitId === t.variableId),
        sourceFile: undefined, // TODO
      }
    })

    nextTick(() => {
      traitBarChartData.value.forEach(data => redraw(data))
    })
  }

  function redrawAll () {
    traitBarChartData.value.forEach(data => redraw(data))
  }

  defineExpose({
    redrawAll,
  })

  watch(() => compProps.traitData, async () => init(), { immediate: true })
</script>
