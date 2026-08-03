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
      v-if="selectedGermplasmId"
    >
      <v-card
        :title="$t('pagePassportTitle')"
        class="pb-10"
      >
        <v-card-text>
          <Passport :top-gap="false" :germplasm-id="selectedGermplasmId" />
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
  import type { ViewTableDatasets, ViewTableGroups, ViewTableTraits } from '@/plugins/types/germinate'
  import Passport from '@/components/widgets/Passport.vue'
  import type { UserSelection } from '@/components/widgets/selections/TraitHighlightSelection.vue'
  import { mdiChartGantt, mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiDelete } from '@mdi/js'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    splom,
    scattergl,
    histogram,
  ])

  const compProps = defineProps<{
    datasets: ViewTableDatasets[]
    traits: ViewTableTraits[]
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
  const selectedGermplasmId = ref<number>()
  const bottomSheetVisible = ref(false)
  const swapAxes = ref(false)

  const isScatterChart = computed(() => compProps.traits.length < 3)

  const filename = computed(() => {
    let name = 'trait-matrix'
    if (compProps.datasets) {
      name += `-${compProps.datasets.map(ds => ds.datasetId).join('-')}`
    } else {
      name += '-all-datasets'
    }
    if (compProps.traits) {
      name += `-${compProps.traits.map(t => t.variableId).join('-')}`
    } else {
      name += '-all-traits'
    }

    return name
  })

  const groupsMapped = computed(() => {
    const result: { [index: string]: string } = {}

    compProps.groups?.forEach(g => {
      result[`${g.groupId}`] = g.groupName || 'N/A'
    })

    return result
  })

  const datasetsMapped = computed(() => {
    const result: { [index: string]: string } = {}

    compProps.datasets?.forEach(d => {
      result[`${d.datasetId}`] = d.datasetName || 'N/A'
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
      const firstEOL = dirtyTsv.indexOf('\r\n')
      const tsv = dirtyTsv.slice(firstEOL + 2)
      const tsvData = tsvParse(tsv)

      if (isScatterChart.value) {
        const one = compProps.traits[0]
        const two = compProps.traits[1]

        const oneName = one.scaleUnit ? `${one.variableName} [${one.scaleUnit}]` : one.variableName
        const twoName = two.scaleUnit ? `${two.variableName} [${two.scaleUnit}]` : two.variableName

        new ScatterPlot({
          userSelection: compProps.userSelection,
          swapAxes: false,
          xColumn: swapAxes.value ? twoName : oneName,
          yColumn: swapAxes.value ? oneName : twoName,
          element: matrixChart.value,
          darkMode: store.storeIsDarkMode,
          colors: getColors(),
          groups: groupsMapped.value,
          datasets: datasetsMapped.value,
          clickHandler: (dbId: number) => {
            // For trials we show the passport page on click
            selectedGermplasmId.value = dbId
            nextTick(() => {
              bottomSheetVisible.value = true
            })
          },
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
          datasets: datasetsMapped.value,
          columnsToIgnore: ['name', 'puid', 'taxonomy', 'latitude', 'longitude', 'elevation', 'germplasm_synonyms', 'entity_parent_name', 'entity_parent_general_identifier', 'rep', 'block', 'trial_row', 'trial_column', 'dbId', 'general_identifier', 'dataset_ids', 'dataset_name', 'dataset_description', 'dataset_version', 'license_name', 'location_name', 'location', 'trial_site', 'Site', 'treatment', 'year', 'groups'],
          clickHandler: (dbId: number) => {
            // For trials we show the passport page on click
            selectedGermplasmId.value = dbId
            nextTick(() => {
              bottomSheetVisible.value = true
            })
          },
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
