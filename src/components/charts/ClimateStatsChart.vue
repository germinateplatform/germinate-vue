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
      :user-selection="userSelection"
      :climates="numericClimates"
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
  import { ViewTableClimatesDataType, type ViewTableClimateData, type ViewTableClimates } from '@/plugins/types/germinate'
  import type HighlightSelection from '@/components/widgets/selections/ClimateHighlightSelection.vue'
  import { mdiRefresh } from '@mdi/js'

  const compProps = defineProps<{
    climates: ViewTableClimates[]
    climateData: ViewTableClimateData[]
  }>()

  const cdStore = climateDataStore()

  const climateBoxPlot = useTemplateRef('climateBoxPlot')
  // const climateBarChart = useTemplateRef('climateBarChart')

  const numericClimates = computed(() => cdStore.storeClimates.filter(t => t.dataType === ViewTableClimatesDataType.numeric))
  const categoricalClimates = computed(() => cdStore.storeClimates.filter(t => t.dataType !== ViewTableClimatesDataType.numeric))

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
