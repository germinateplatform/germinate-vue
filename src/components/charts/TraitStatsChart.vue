<template>
  <template v-if="traitData || (catChartData && catChartData.size > 0)">
    <HighlightSelection
      ref="highlightSelection"
      :groups="groups || []"
      :dataset-ids="datasetIds || []"
    />

    <v-switch v-model="showIndividuals" color="primary" :label="$t('chartControlShowIndividualPoints')" />

    <v-btn @click="forceRedraw" class="mb-5" prepend-icon="mdi-refresh" :text="$t('buttonReload')" :disabled="userSelection !== undefined && !userSelectionValid" />
  </template>

  <template v-if="datasets">
    <TraitBoxplotChart
      :plot-data="traitData"
      :groups="groups || []"
      :user-selection="userSelection"
      :dataset-ids="datasetIds || []"
      :traits="numericTraits"
      :datasets="datasets || []"
      :show-individuals="showIndividuals"
      ref="traitBoxPlot"
      v-if="traitData && numericTraits && numericTraits.length > 0"
    />

    <TraitBarChart
      :traits="categoricalTraits"
      :trait-data="traitData"
      :groups="groups || []"
      :datasets="datasets || []"
      :user-selection="userSelection"
      ref="traitBarChart"
      v-if="traitData && categoricalTraits && categoricalTraits.length > 0"
    />
  </template>
</template>

<script setup lang="ts">
  import { ViewTableTraitsScaleDatatype, type ViewTableDatasets, type ViewTableGroups, type ViewTableTraits, type ViewTableTrialsData } from '@/plugins/types/germinate'
  import type HighlightSelection from '@/components/widgets/selections/HighlightSelection.vue'

  const compProps = defineProps<{
    variables: ViewTableTraits[]
    datasets: ViewTableDatasets[]
    groups?: ViewTableGroups[]
    traitData: ViewTableTrialsData[]
    catChartData: Map<number, Blob>
  }>()

  const traitBoxPlot = useTemplateRef('traitBoxPlot')
  const traitBarChart = useTemplateRef('traitBarChart')

  const datasetIds = computed(() => compProps.datasets.map(ds => ds.datasetId || -1) || [])

  const numericTraits = computed(() => (compProps.variables || []).filter(t => t.scaleDatatype === ViewTableTraitsScaleDatatype.numeric))
  const categoricalTraits = computed(() => (compProps.variables || []).filter(t => t.scaleDatatype !== ViewTableTraitsScaleDatatype.numeric))

  const showIndividuals = ref(false)
  const highlightSelection = ref<InstanceType<typeof HighlightSelection>>()
  const userSelection = computed(() => highlightSelection.value?.userSelection)
  const userSelectionValid = computed(() => highlightSelection.value?.valid || false)

  function forceRedraw () {
    traitBoxPlot.value?.redraw()
    traitBarChart.value?.redrawAll()
  }

  defineExpose({
    forceRedraw,
  })
</script>
