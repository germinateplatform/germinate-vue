<template>
  <template v-if="climateData">
    <ClimateHighlightSelection
      ref="highlightSelection"
    />

    <v-switch v-model="showIndividuals" color="primary" :label="$t('chartControlShowIndividualPoints')" />

    <v-btn @click="forceRedraw" class="mb-5" :prepend-icon="mdiRefresh" :text="$t('buttonReload')" :disabled="userSelection !== undefined && !userSelectionValid" />
  </template>

  <template v-if="cdStore.storeDatasets">
    <ClimateBoxplotChart
      :plot-data="climateData"
      type="numeric"
      :user-selection="userSelection"
      :climates="numericClimates"
      :show-individuals="showIndividuals"
      ref="numericClimateBoxPlot"
      v-if="climateData && numericClimates && numericClimates.length > 0"
    />

    <ClimateBoxplotChart
      class="mt-5"
      type="date"
      :plot-data="climateData"
      :user-selection="userSelection"
      :climates="dateClimates"
      :show-individuals="showIndividuals"
      ref="dateClimateBoxPlot"
      v-if="climateData && dateClimates && dateClimates.length > 0"
    />

    <ClimateBarChart
      class="mt-5"
      :climates="categoricalClimates"
      :climate-data="climateData"
      :user-selection="userSelection"
      ref="climateBarChart"
      v-if="climateData && categoricalClimates && categoricalClimates.length > 0"
    />
  </template>
</template>

<script setup lang="ts">
  import { ViewTableClimatesDataType, type ViewTableClimateData, type ViewTableClimates } from '@/plugins/types/germinate'
  import type HighlightSelection from '@/components/widgets/selections/ClimateHighlightSelection.vue'
  import { mdiRefresh } from '@mdi/js'

  const compProps = defineProps<{
    climates: ViewTableClimates[]
    climateData: ViewTableClimateData[]
  }>()

  const cdStore = useClimateDataStore()

  const numericClimateBoxPlot = useTemplateRef('numericClimateBoxPlot')
  const dateClimateBoxPlot = useTemplateRef('dateClimateBoxPlot')
  const climateBarChart = useTemplateRef('climateBarChart')

  const numericClimates = computed(() => (compProps.climates || []).filter(t => t.dataType === ViewTableClimatesDataType.numeric))
  const dateClimates = computed(() => (compProps.climates || []).filter(t => t.dataType === ViewTableClimatesDataType.date))
  const categoricalClimates = computed(() => (compProps.climates || []).filter(t => t.dataType !== ViewTableClimatesDataType.numeric && t.dataType !== ViewTableClimatesDataType.date))

  const showIndividuals = ref(false)
  const highlightSelection = ref<InstanceType<typeof HighlightSelection>>()
  const userSelection = computed(() => highlightSelection.value?.userSelection)
  const userSelectionValid = computed(() => highlightSelection.value?.valid || false)

  function forceRedraw () {
    numericClimateBoxPlot.value?.redraw()
    dateClimateBoxPlot.value?.redraw()
    climateBarChart.value?.redrawAll()
    // highlightSelection.value?.update()
  }

  function update () {
    // highlightSelection.value?.update()
  }

  defineExpose({
    forceRedraw,
    update,
  })
</script>
