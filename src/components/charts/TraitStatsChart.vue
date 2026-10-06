<template>
  <template v-if="traitData">
    <TraitHighlightSelection
      ref="highlightSelection"
    />

    <v-switch v-model="showIndividuals" color="primary" :label="$t('chartControlShowIndividualPoints')" />

    <v-btn @click="forceRedraw" class="mb-5" :prepend-icon="mdiRefresh" :text="$t('buttonReload')" :disabled="userSelection !== undefined && !userSelectionValid" />
  </template>

  <template v-if="tdStore.storeDatasets && tdStore.storeDatasets.length > 0">
    <TraitBoxplotChart
      :plot-data="traitData"
      type="numeric"
      :user-selection="userSelection"
      :traits="numericTraits"
      :show-individuals="showIndividuals"
      ref="numericTraitBoxPlot"
      v-if="traitData && numericTraits && numericTraits.length > 0"
    />

    <TraitBoxplotChart
      class="mt-5"
      type="date"
      :plot-data="traitData"
      :user-selection="userSelection"
      :traits="dateTraits"
      :show-individuals="showIndividuals"
      ref="dateTraitBoxPlot"
      v-if="traitData && dateTraits && dateTraits.length > 0"
    />

    <TraitBarChart
      class="mt-5"
      :traits="categoricalTraits"
      :trait-data="traitData"
      :user-selection="userSelection"
      ref="traitBarChart"
      v-if="traitData && categoricalTraits && categoricalTraits.length > 0"
    />
  </template>
</template>

<script setup lang="ts">
  import { ViewTableTraitsScaleDatatype, type ViewTableTraits, type ViewTableTrialsData } from '@/plugins/types/germinate'
  import type HighlightSelection from '@/components/widgets/selections/TraitHighlightSelection.vue'
  import { mdiRefresh } from '@mdi/js'

  const compProps = defineProps<{
    variables: ViewTableTraits[]
    traitData: ViewTableTrialsData[]
  }>()

  const tdStore = useTraitDataStore()

  const numericTraitBoxPlot = useTemplateRef('numericTraitBoxPlot')
  const dateTraitBoxPlot = useTemplateRef('dateTraitBoxPlot')
  const traitBarChart = useTemplateRef('traitBarChart')

  const numericTraits = computed(() => (compProps.variables || []).filter(t => t.scaleDatatype === ViewTableTraitsScaleDatatype.numeric))
  const dateTraits = computed(() => (compProps.variables || []).filter(t => t.scaleDatatype === ViewTableTraitsScaleDatatype.date))
  const categoricalTraits = computed(() => (compProps.variables || []).filter(t => t.scaleDatatype !== ViewTableTraitsScaleDatatype.numeric && t.scaleDatatype !== ViewTableTraitsScaleDatatype.date))

  const showIndividuals = ref(false)
  const highlightSelection = ref<InstanceType<typeof HighlightSelection>>()
  const userSelection = computed(() => highlightSelection.value?.userSelection)
  const userSelectionValid = computed(() => highlightSelection.value?.valid || false)

  function forceRedraw () {
    numericTraitBoxPlot.value?.redraw()
    dateTraitBoxPlot.value?.redraw()
    traitBarChart.value?.redrawAll()
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
