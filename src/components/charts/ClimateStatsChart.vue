<template>
  <template v-if="climateData || (catChartData && catChartData.size > 0)">
    <ClimateHighlightSelection
      ref="highlightSelection"
      :groups="groups || []"
      :dataset-ids="datasetIds || []"
    />

    <v-switch v-model="showIndividuals" color="primary" :label="$t('chartControlShowIndividualPoints')" />

    <v-btn @click="forceRedraw" class="mb-5" :prepend-icon="mdiRefresh" :text="$t('buttonReload')" :disabled="userSelection !== undefined && !userSelectionValid" />
  </template>

  <template v-if="datasets">
    <ClimateBoxplotChart
      :plot-data="climateData"
      :groups="groups || []"
      :user-selection="userSelection"
      :dataset-ids="datasetIds || []"
      :climates="numericClimates"
      :datasets="datasets || []"
      :show-individuals="showIndividuals"
      ref="climateBoxPlot"
      v-if="climateData && numericClimates && numericClimates.length > 0"
    />

    <!-- <TraitBarChart
      :traits="categoricalClimates"
      :trait-data="traitData"
      :groups="groups || []"
      :datasets="datasets || []"
      :user-selection="userSelection"
      ref="traitBarChart"
      v-if="traitData && categoricalClimates && categoricalClimates.length > 0"
    /> -->
  </template>
</template>

<script setup lang="ts">
  import { ViewTableClimatesDataType, type ViewTableClimateData, type ViewTableClimates, type ViewTableDatasets, type ViewTableGroups } from '@/plugins/types/germinate'
  import type HighlightSelection from '@/components/widgets/selections/ClimateHighlightSelection.vue'
  import { mdiRefresh } from '@mdi/js'

  const compProps = defineProps<{
    climates: ViewTableClimates[]
    datasets: ViewTableDatasets[]
    groups?: ViewTableGroups[]
    climateData: ViewTableClimateData[]
    catChartData: Map<number, Blob>
  }>()

  const climateBoxPlot = useTemplateRef('climateBoxPlot')
  // const climateBarChart = useTemplateRef('climateBarChart')

  const datasetIds = computed(() => compProps.datasets.map(ds => ds.datasetId || -1) || [])

  const numericClimates = computed(() => (compProps.climates || []).filter(t => t.dataType === ViewTableClimatesDataType.numeric))
  const categoricalClimates = computed(() => (compProps.climates || []).filter(t => t.dataType !== ViewTableClimatesDataType.numeric))

  const showIndividuals = ref(false)
  const highlightSelection = ref<InstanceType<typeof HighlightSelection>>()
  const userSelection = computed(() => highlightSelection.value?.userSelection)
  const userSelectionValid = computed(() => highlightSelection.value?.valid || false)

  function forceRedraw () {
    climateBoxPlot.value?.redraw()
    // climateBarChart.value?.redrawAll()
    highlightSelection.value?.update()
  }

  function update () {
    highlightSelection.value?.update()
  }

  defineExpose({
    forceRedraw,
    update,
  })
</script>
