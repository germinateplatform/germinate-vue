<template>
  <div>
    <div class="mt-5" v-for="(data, i) in climateBarChartData" :key="`trait-bar-chart-${i}`">
      <BaseChart
        :title="data.climate.climateName"
        :chart-id="data.id"
        :filename="data.filename"
        v-model:loading="loading[i]"
        :source-file="data.sourceFile"
        :header-icon="mdiChartBar"
        @force-redraw="redraw(data, i)"
        ref="baseChart"
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
  </div>
</template>

<script setup lang="ts">
  import { DEFAULT_PLOTLY_CONFIG, uuidv4, type DownloadBlob } from '@/plugins/util'

  import bar from 'plotly.js/lib/bar'
  import { getColor, hexToRGBA } from '@/plugins/util/colors'
  import { useI18n } from 'vue-i18n'
  import type { ViewTableClimates, ViewTableClimateData } from '@/plugins/types/germinate'
  import type { UserSelection } from '@/components/widgets/selections/ClimateHighlightSelection.vue'
  import { mdiChartBar } from '@mdi/js'

  const store = useCoreStore()
  const cdStore = useClimateDataStore()
  const { t } = useI18n()

  const loading = ref<boolean[]>([])
  const baseChart = useTemplateRef('baseChart')

  interface ClimateBarChartData {
    id: string
    climate: ViewTableClimates
    filename: string
    sourceFile?: DownloadBlob
    data: ViewTableClimateData[]
  }

  const compProps = defineProps<{
    climates: ViewTableClimates[]
    climateData: ViewTableClimateData[]
    userSelection?: UserSelection
  }>()

  const climateBarChartData = ref<ClimateBarChartData[]>([])

  async function redraw (climateData: ClimateBarChartData, index: number) {
    if (climateData.data.length === 0) {
      return
    }

    loading.value[index] = true

    nextTick(() => {
      const element = document.getElementById(climateData.id)
      if (element) {
        const xValues = new Map<string, number>()

        climateData.data.forEach(d => {
          xValues.set(d.climateValue, (xValues.get(d.climateValue) || 0) + 1)
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
              cdStore.storeDatasets.forEach((dataset, index) => {
                data.push(returnData(climateData.data, td => td.datasetId === dataset.datasetId, x, dataset.datasetName || '', index))
              })
              break
            case 'location':
              compProps.userSelection.selectedItems.forEach((location, index) => {
                data.push(returnData(climateData.data, td => `${td.countryName} | ${td.locationName}` === location, x, location, index))
              })
              break
            case 'year':
              compProps.userSelection.selectedItems.forEach((year, index) => {
                data.push(returnData(climateData.data, dp => {
                  if (!dp.recordingDate) {
                    return false
                  } else {
                    const date = new Date(dp.recordingDate)
                    return date.getFullYear() === +year
                  }
                }, x, `&nbsp;${year}`, index))
              })
              break
            case 'group':
              const groupNames: { [index: number]: string } = {}

              cdStore.storeGroups.forEach(g => {
                groupNames[g.groupId || -1] = g.groupName || ''
              })
              compProps.userSelection.selectedItems.forEach((groupId, index) => {
                data.push(returnData(climateData.data, td => td.groups !== undefined && td.groups.some(g => `${g.id}` === groupId), x, groupNames[+groupId] || `${groupId}`, index))
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
            title: { text: climateData.climate.climateName, font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
            tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
            automargin: true,
            fixedrange: true,
            type: 'category',
          },
          yaxis: {
            title: { text: t('genericCount'), font: { color: store.storeIsDarkMode ? 'white' : 'black' } },
            tickfont: { color: store.storeIsDarkMode ? 'white' : 'black' },
            automargin: true,
            fixedrange: true,
            showgrid: true,
            gridcolor: store.storeIsDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
          legend: {
            bgcolor: 'rgba(0,0,0,0)',
            orientation: 'h' as const,
            x: 0,
            y: 1.1,
            font: { color: store.storeIsDarkMode ? 'white' : 'black' },
          },
        }

        baseChart.value?.[index]?.react(element, data, layout, DEFAULT_PLOTLY_CONFIG)
          .then(() => {
            loading.value[index] = false
          })
      }
    })
  }

  function returnData (climateData: ViewTableClimateData[], filter: (dp: ViewTableClimateData) => boolean, x: string[], name: string, index: number) {
    const localMap = new Map<string, number>()
    x.forEach(k => localMap.set(k, 0))
    climateData.filter(filter).forEach(dp => localMap.set(dp.climateValue, (localMap.get(dp.climateValue) || 0) + 1))

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
    loading.value = compProps.climates.map(() => true)
    climateBarChartData.value = compProps.climates.map(t => {
      return {
        climate: t,
        id: `climate-bar-chart-${uuidv4()}`,
        filename: t.climateName,
        data: compProps.climateData.filter(d => d.climateId === t.climateId),
        sourceFile: undefined, // TODO
      }
    })

    nextTick(() => {
      climateBarChartData.value.forEach((data, index) => redraw(data, index))
    })
  }

  function redrawAll () {
    climateBarChartData.value.forEach((data, index) => redraw(data, index))
  }

  defineExpose({
    redrawAll,
  })

  onMounted(() => {
    // Only register the chart types we're actually using to reduce the final bundle size
    baseChart.value?.forEach(c => c?.register([
      bar,
    ]))
  })

  watch(() => compProps.climateData, async () => init(), { immediate: true })
</script>
