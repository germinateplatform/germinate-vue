<template>
  <div>
    <BaseChart
      title="pageTrialsExportChartTitle"
      :chart-id="id"
      :filename="filename"
      :source-file="sourceFile"
      v-model:loading="loading"
      :badge-count="markedItemCount"
      :header-icon="mdiChartGantt"
      @force-redraw="redraw"
    >
      <template #card-text>
        <v-card-text>
          <p class="text-info">{{ $t('pageTrialsExportChartText') }}</p>
        </v-card-text>
      </template>
      <template #toolbar-append>
        <v-btn-group class="mx-2" density="compact" variant="tonal">
          <v-btn v-tooltip:top="$t('tooltipTableMarkedItems')" :to="Pages.getPath(Pages.markedItemType, 'germplasm')"><v-chip size="small" label>{{ getNumberWithSuffix(store.storeMarkedGermplasm.length, 1) }}</v-chip></v-btn>
          <v-btn v-tooltip:top="$t('tooltipTableMarkedItemsClear')" @click="clearMarkedItems"><v-icon :icon="mdiDelete" /></v-btn>
        </v-btn-group>
      </template>
      <template #list-append>
        <v-divider />
        <v-list-item :prepend-icon="mdiCheckboxMarked" :disabled="markedItemCount === 0" @click="toggleItems(true)">{{ $t('widgetChartMarkSelectedItems') }}</v-list-item>
        <v-list-item :prepend-icon="mdiCheckboxBlankOutline" :disabled="markedItemCount === 0" @click="toggleItems(false)">{{ $t('widgetChartUnmarkSelectedItems') }}</v-list-item>
      </template>
      <template #chart-content>
        <v-switch v-model="swapAxes" v-if="isScatterChart" :label="$t('formLabelChartScatterSwapAxes')" color="primary" />

        <div :id="id" ref="matrixChart" />
      </template>
    </BaseChart>

    <v-bottom-sheet
      v-model="bottomSheetVisible"
      inset
      max-height="75vh"
      v-if="selectedLocationsId"
    >
      <v-card
        :title="$t('pagePassportTitle')"
        class="pb-10"
      >
        <v-card-text>
          <Passport :top-gap="false" :germplasm-id="selectedLocationsId" />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script setup lang="ts">
  import BaseChart from '@/components/charts/BaseChart.vue'
  import { uuidv4, type DownloadBlob } from '@/plugins/util'

  import Plotly from 'plotly.js/lib/core'
  import splom from 'plotly.js/lib/splom'
  import scattergl from 'plotly.js/lib/scattergl'
  import histogram from 'plotly.js/lib/histogram'
  import { coreStore } from '@/stores/app'
  import { ScatterMatrix } from '@/plugins/charts/plotly-scatter-matrix.ts'
  import { ScatterPlot } from '@/plugins/charts/plotly-scatter-plot.ts'
  import { getColors } from '@/plugins/util/colors'
  import { Pages } from '@/plugins/pages'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { tsvParse } from 'd3-dsv'
  import type { ViewTableGroups, ViewTableClimates } from '@/plugins/types/germinate'
  import Passport from '@/components/widgets/Passport.vue'
  import type { UserSelection } from '@/components/widgets/selections/ClimateHighlightSelection.vue'
  import { mdiChartGantt, mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiDelete } from '@mdi/js'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    splom,
    scattergl,
    histogram,
  ])

  const compProps = defineProps<{
    datasetIds: number[]
    climates: ViewTableClimates[]
    plotData: Blob
    groups: ViewTableGroups[]
    hasGroupsData: boolean
    userSelection?: UserSelection
  }>()

  const store = coreStore()

  const sourceFile = ref<DownloadBlob>()
  const matrixChart = useTemplateRef('matrixChart')
  const id = ref('scattermatrixplot-' + uuidv4())
  const loading = ref(false)
  const selectedIds = ref<number[]>([])
  const selectedLocationsId = ref<number>()
  const bottomSheetVisible = ref(false)
  const swapAxes = ref(false)

  const isScatterChart = computed(() => compProps.climates.length < 3)

  const filename = computed(() => {
    let name = 'climate-matrix'
    if (compProps.datasetIds) {
      name += `-${compProps.datasetIds.join('-')}`
    } else {
      name += '-all-datasets'
    }
    if (compProps.climates) {
      name += `-${compProps.climates.map(t => t.climateId).join('-')}`
    } else {
      name += '-all-climates'
    }

    return name
  })

  const groupsMapped = computed(() => {
    const result: { [index: string]: string } = {}

    compProps.groups.forEach(g => {
      result[`${g.groupId}`] = g.groupName || 'N/A'
    })

    return result
  })

  const markedItemCount = computed(() => selectedIds.value.length)

  async function redraw () {
    loading.value = true
    if (compProps.plotData) {
      sourceFile.value = {
        blob: compProps.plotData,
        filename: filename.value,
        extension: 'json',
      }
    }

    if (matrixChart.value) {
      Plotly.purge(matrixChart.value)

      loading.value = true

      const dirtyTsv = await sourceFile.value?.blob.text() || ''
      const tsvData = tsvParse(dirtyTsv)

      if (isScatterChart.value) {
        const one = compProps.climates[0]
        const two = compProps.climates[1]

        const oneName = one.unitName ? `${one.climateName} [${one.unitName}]` : one.climateName
        const twoName = two.unitName ? `${two.climateName} [${two.unitName}]` : two.climateName

        new ScatterPlot({
          userSelection: compProps.userSelection,
          swapAxes: false,
          xColumn: swapAxes.value ? twoName : oneName,
          yColumn: swapAxes.value ? oneName : twoName,
          element: matrixChart.value,
          darkMode: store.storeIsDarkMode,
          colors: getColors(),
          groups: groupsMapped.value,
          selectionHandler: (dbIds: number[]) => {
            selectedIds.value = dbIds
          },
        }).create(tsvData)
      } else {
        new ScatterMatrix({
          userSelection: compProps.userSelection,
          element: matrixChart.value,
          darkMode: store.storeIsDarkMode,
          colors: getColors(),
          groups: groupsMapped.value,
          columnsToIgnore: ['name', 'dbId', 'dataset_name', 'dataset_version', 'latitude', 'longitude', 'elevation', 'license_name', 'year', 'groups'],
          selectionHandler: (dbIds: number[]) => {
            selectedIds.value = dbIds
          },
        }).create(tsvData)
      }
    }

    loading.value = false
  }

  function clearMarkedItems () {
    store.clearMarkedIds('germplasm')
  }

  function toggleItems (add: boolean) {
    if (add === true) {
      store.addMarkedIds('germplasm', selectedIds.value)
    } else {
      store.removeMarkedIds('germplasm', selectedIds.value)
    }
  }

  watch(swapAxes, async () => redraw())
  watch(() => compProps.plotData, async () => nextTick(() => redraw()), { immediate: true })

  defineExpose({
    redraw,
  })
</script>
