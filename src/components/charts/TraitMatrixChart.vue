<template>
  <div>
    <BaseChart
      title="pageTrialsExportChartTitle"
      :chart-id="id"
      :filename="filename"
      :source-file="sourceFile"
      v-model:loading="loading"
      :badge-count="markedItemCount"
      header-icon="mdi-chart-gantt"
      @force-redraw="redraw"
    >
      <template #card-text>
        <v-card-text>
          <p class="text-info">{{ $t('pageTrialsExportChartText') }}</p>

          <v-select
            v-model="groupBy"
            :items="groupByOptions"
            :label="$t('pageTrialsExportColorByTitle')"
            :hint="$t('pageTrialsExportColorByText')"
            persistent-hint
          />

          <template v-if="groupBy === 'specified_names'">
            <GermplasmSelection
              class="my-5"
              v-model="selectedGermplasm"
              :germplasm="allGermplasm"
              :can-select-all="false"
            />

            <v-btn color="primary" prepend-icon="mdi-refresh" :text="$t('buttonReload')" @click="redraw" />
          </template>
        </v-card-text>
      </template>
      <template #toolbar-append>
        <v-btn-group class="mx-2" density="compact" variant="tonal">
          <v-btn v-tooltip:top="$t('tooltipTableMarkedItems')" :to="Pages.getPath(Pages.markedItemType, 'germplasm')"><v-chip size="small" label>{{ getNumberWithSuffix(store.storeMarkedGermplasm.length, 1) }}</v-chip></v-btn>
          <v-btn v-tooltip:top="$t('tooltipTableMarkedItemsClear')" @click="clearMarkedItems"><v-icon icon="mdi-delete" /></v-btn>
        </v-btn-group>
      </template>
      <template #list-append>
        <v-divider />
        <v-list-item prepend-icon="mdi-checkbox-marked" :disabled="markedItemCount === 0" @click="toggleItems(true)">{{ $t('widgetChartMarkSelectedItems') }}</v-list-item>
        <v-list-item prepend-icon="mdi-checkbox-blank-outline" :disabled="markedItemCount === 0" @click="toggleItems(false)">{{ $t('widgetChartUnmarkSelectedItems') }}</v-list-item>
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
  import { plotlyScatterMatrix } from '@/plugins/charts/plotly-scatter-matrix.js'
  import { plotlyScatterPlot } from '@/plugins/charts/plotly-scatter-plot'
  import { getColors } from '@/plugins/util/colors'
  import { Pages } from '@/plugins/pages'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { useI18n } from 'vue-i18n'
  import { tsvParse } from 'd3-dsv'
  import { select } from 'd3-selection'
  import type { PaginatedResult, ViewTableGermplasm, ViewTableTraits } from '@/plugins/types/germinate'
  import { apiPostGermplasmTable } from '@/plugins/api/germplasm'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import Passport from '@/components/widgets/Passport.vue'

  // Only register the chart types we're actually using to reduce the final bundle size
  Plotly.register([
    splom,
    scattergl,
    histogram,
  ])

  const compProps = defineProps<{
    datasetIds: number[]
    traits: ViewTableTraits[]
    plotData: Blob
    hasGroupsData: boolean
  }>()

  const { t } = useI18n()
  const store = coreStore()

  const sourceFile = ref<DownloadBlob>()
  const matrixChart = useTemplateRef('matrixChart')
  const id = ref('scattermatrixplot-' + uuidv4())
  const groupBy = ref<'dataset_name' | 'entity_parent_name' | 'year' | 'Date' | 'taxonomy' | 'treatments_description' | 'rep' | 'block' | 'trial_row' | 'trial_column' | 'trial_site' | 'location' | 'marked_items' | 'specified_names' | 'groups' | undefined>()
  const loading = ref(false)
  const selectedIds = ref<number[]>([])
  const selectedGermplasmId = ref<number>()
  const selectedGermplasm = ref<ViewTableGermplasm[]>([])
  const allGermplasm = ref<ViewTableGermplasm[]>([])
  const bottomSheetVisible = ref(false)
  const swapAxes = ref(false)

  const colorByStats = ref<{ [key: string]: number }>({})

  const isScatterChart = computed(() => compProps.traits.length < 3)

  const groupByOptions = computed(() => {
    const result = [{
      title: t('widgetChartColoringNoColoring'),
      value: undefined,
    }, {
      title: `${t('widgetChartColoringByDataset')}${getStatsText('dataset_name')}`,
      value: 'dataset_name',
      props: { disabled: getStatsCount('dataset_name') < 2 },
    }, {
      title: `${t('widgetChartColoringByEntityParent')}${getStatsText('entity_parent_name')}`,
      value: 'entity_parent_name',
      props: { disabled: getStatsCount('entity_parent_name') < 2 },
    }, {
      title: `${t('widgetChartColoringByYear')}${getStatsText('year')}`,
      value: 'year',
      props: { disabled: getStatsCount('year') < 2 },
    }, {
      title: `${t('widgetChartColoringByRecordingDate')}${getStatsText('Date')}`,
      value: 'Date',
      props: { disabled: getStatsCount('Date') < 2 },
    }, {
      title: `${t('widgetChartColoringByTaxonomy')}${getStatsText('taxonomy')}`,
      value: 'taxonomy',
      props: { disabled: getStatsCount('taxonomy') < 2 },
    }, {
      title: `${t('widgetChartColoringByTreatment')}${getStatsText('treatments_description')}`,
      value: 'treatments_description',
      props: { disabled: getStatsCount('treatments_description') < 2 },
    }, {
      title: `${t('widgetChartColoringByRep')}${getStatsText('rep')}`,
      value: 'rep',
      props: { disabled: getStatsCount('rep') < 2 },
    }, {
      title: `${t('widgetChartColoringByBlock')}${getStatsText('block')}`,
      value: 'block',
      props: { disabled: getStatsCount('block') < 2 },
    }, {
      title: `${t('widgetChartColoringByRow')}${getStatsText('trial_row')}`,
      value: 'trial_row',
      props: { disabled: getStatsCount('trial_row') < 2 },
    }, {
      title: `${t('widgetChartColoringByColumn')}${getStatsText('trial_column')}`,
      value: 'trial_column',
      props: { disabled: getStatsCount('trial_column') < 2 },
    }, {
      title: `${t('widgetChartColoringByTrialSite')}${getStatsText('trial_site')}`,
      value: 'trial_site',
      props: { disabled: getStatsCount('trial_site') < 2 },
    }, {
      title: `${t('widgetChartColoringByLocation')}${getStatsText('location')}`,
      value: 'location',
      props: { disabled: getStatsCount('location') < 2 },
    }, {
      title: t('widgetChartColoringByMarkedItems'),
      value: 'marked_items',
    }, {
      title: t('widgetChartColoringByGermplasmName'),
      value: 'specified_names',
    }]

    if (compProps.hasGroupsData) {
      result.push({
        title: t('widgetChartColoringByGroup'),
        value: 'groups',
      })
    }

    return result
  })

  const filename = computed(() => {
    let name = 'trait-matrix'
    if (compProps.datasetIds) {
      name += `-${compProps.datasetIds.join('-')}`
    } else {
      name += '-all-datasets'
    }
    if (compProps.traits) {
      name += `-${compProps.traits.map(t => t.traitId).join('-')}`
    } else {
      name += '-all-traits'
    }

    return name
  })

  const markedItemCount = computed(() => selectedIds.value.length)

  const germplasmNames = computed(() => selectedGermplasm.value ? selectedGermplasm.value.map(g => g.germplasmDisplayName) : undefined)
  const colorByValue = computed(() => {
    return {
      column: (groupBy.value === 'marked_items' || groupBy.value === 'specified_names') ? undefined : groupBy.value,
      ids: groupBy.value === 'marked_items' ? store.storeMarkedGermplasm : undefined,
      names: groupBy.value === 'specified_names' ? germplasmNames.value : undefined,
    }
  })

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

        const oneName = one.unitId ? `${one.traitName} [${one.unitAbbreviation}]` : one.traitName
        const twoName = two.unitId ? `${two.traitName} [${two.unitAbbreviation}]` : two.traitName

        select(matrixChart.value)
          .datum(tsvData)
          .call(plotlyScatterPlot(Plotly)
            .darkMode(store.storeIsDarkMode)
            .colorBy(colorByValue.value)
            .xCategory(swapAxes.value ? twoName : oneName)
            .yCategory(swapAxes.value ? oneName : twoName)
            .onPointClicked((p: number) => {
              // For trials we show the passport page on click
              selectedGermplasmId.value = p
              nextTick(() => {
                bottomSheetVisible.value = true
              })
            })
            .onPointsSelected((ps: number[]) => {
              selectedIds.value = ps
            })
            .onColorByStatsLoaded((stats: { [key: string]: number }) => {
              colorByStats.value = stats
            })
            .colors(getColors()))
      } else {
        select(matrixChart.value)
          .datum(tsvData)
          .call(plotlyScatterMatrix(Plotly)
            .darkMode(store.storeIsDarkMode)
            .colorBy(colorByValue.value)
            .columnsToIgnore(['name', 'puid', 'taxonomy', 'latitude', 'longitude', 'elevation', 'germplasm_synonyms', 'entity_parent_name', 'entity_parent_general_identifier', 'rep', 'block', 'trial_row', 'trial_column', 'dbId', 'general_identifier', 'dataset_name', 'dataset_description', 'dataset_version', 'license_name', 'location_name', 'location', 'trial_site', 'Site', 'treatments_description', 'year', 'groups'])
            .onPointClicked((p: number) => {
              // For trials we show the passport page on click
              selectedGermplasmId.value = p
              nextTick(() => {
                bottomSheetVisible.value = true
              })
            })
            .onPointsSelected((ps: number[]) => {
              selectedIds.value = ps
            })
            .onColorByStatsLoaded((stats: { [key: string]: number }) => {
              colorByStats.value = stats
            })
            .colors(getColors()))
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

  function getStatsCount (name: string) {
    if (colorByStats.value != null && colorByStats.value[name] !== undefined && colorByStats.value[name] !== null) {
      return colorByStats.value[name]
    } else {
      return Number.MAX_SAFE_INTEGER
    }
  }
  function getStatsText (name: string) {
    if (colorByStats.value != null && colorByStats.value[name] !== undefined && colorByStats.value[name] !== null) {
      return ` (${colorByStats.value[name]})`
    } else {
      return ''
    }
  }

  watch(colorByValue, async () => {
    if (groupBy.value !== 'specified_names') {
      redraw()
    }
  })

  watch(swapAxes, async () => redraw())
  watch(() => compProps.plotData, async () => nextTick(() => redraw()), { immediate: true })

  onMounted(() => {
    apiPostGermplasmTable<PaginatedResult<ViewTableGermplasm[]>>({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      minimal: true,
    }, result => {
      if (result && result.data) {
        allGermplasm.value = result.data
      } else {
        allGermplasm.value = []
      }
    })
  })
</script>
