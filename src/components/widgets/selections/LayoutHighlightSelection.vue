<template>
  <div>
    <div class="text-title-small mt-3">{{ $t('widgetHighlightSelectionTitle') }}</div>
    <v-btn-toggle
      v-model="selectionMode"
      color="primary"
      variant="tonal"
      class="d-flex mb-5"
    >
      <v-btn class="flex-grow-1" value="germplasm" :prepend-icon="mdiSprout" :text="$t('widgetHighlightSelectionGermplasm')" />
      <v-btn class="flex-grow-1" value="taxonomies" :disabled="!trialTaxonomies || trialTaxonomies.length === 0" :prepend-icon="mdiSitemap" :text="$t('widgetHighlightSelectionTaxonomy')">
        <template #append><v-badge inline :content="getNumberWithSuffix((trialTaxonomies|| []).length, 0)" /></template>
      </v-btn>
      <v-btn class="flex-grow-1" value="reps" :disabled="!trialReps || trialReps.length === 0" :prepend-icon="mdiFormatListNumbered" :text="$t('widgetHighlightSelectionRep')">
        <template #append><v-badge inline :content="getNumberWithSuffix((trialReps|| []).length, 0)" /></template>
      </v-btn>
      <v-btn class="flex-grow-1" value="treatments" :disabled="!trialTreatments || trialTreatments.length === 0" :prepend-icon="mdiSprinklerFire" :text="$t('widgetHighlightSelectionTreatment')">
        <template #append><v-badge inline :content="getNumberWithSuffix((trialTreatments|| []).length, 0)" /></template>
      </v-btn>
      <v-btn class="flex-grow-1" value="trait" :disabled="!traits || traits.length === 0" :prepend-icon="mdiTag" :text="$t('widgetHighlightSelectionTraitData')">
        <template #append><v-badge inline :content="getNumberWithSuffix((traits|| []).length, 0)" /></template>
      </v-btn>
    </v-btn-toggle>

    <GermplasmSelection
      v-if="selectionMode === 'germplasm'"
      v-model="selectedGermplasm"
      :germplasm="trialGermplasm"
      :label="$t('formLabelHighlightGermplasm')"
      :hint="$t('formDescriptionHighlightGermplasm')"
      persistent-hint
      multiple
    />

    <SelectAllBox
      v-else-if="selectionMode === 'taxonomies'"
      :label="$t('formLabelHighlightTaxonomies')"
      :hint="$t('formDescriptionHighlightTaxonomies')"
      multiple
      clearable
      item-key="id"
      :item-title="(tax: Taxonomies) => concat(' ', [tax.genus, tax.species, tax.subtaxa])"
      v-model="selectedTaxonomies"
      :items="trialTaxonomies"
    />

    <SelectAllBox
      v-else-if="selectionMode === 'treatments'"
      :label="$t('formLabelHighlightTreatments')"
      :hint="$t('formDescriptionHighlightTreatments')"
      multiple
      clearable
      item-key="id"
      item-title="name"
      v-model="selectedTreatments"
      :items="trialTreatments"
    />

    <SelectAllBox
      v-else-if="selectionMode === 'reps'"
      :label="$t('formLabelHighlightReps')"
      :hint="$t('formDescriptionHighlightReps')"
      multiple
      clearable
      v-model="selectedReps"
      :items="trialReps"
    />

    <TraitSelection
      v-else-if="selectionMode === 'trait'"
      :traits="traits"
      :label="$t('formLabelHighlightTraitValues')"
      :hint="$t('formDescriptionHighlightTraitValues')"
      v-model="selectedTrait"
      :can-select-all="false"
      :can-select-multiple="false"
    >
      <template #title><span /></template>
    </TraitSelection>
  </div>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostGermplasmTable } from '@/plugins/api/germplasm'
  import { apiPostTrialSetupStats } from '@/plugins/api/trait'
  import type { Taxonomies, Treatments, ViewTableGermplasm, ViewTableTraits } from '@/plugins/types/germinate'
  import { concat, getNumberWithSuffix } from '@/plugins/util/formatting'
  import { mdiFormatListNumbered, mdiSitemap, mdiSprinklerFire, mdiSprout, mdiTag } from '@mdi/js'

  export interface UserSelection {
    type: 'germplasm' | 'reps' | 'treatments' | 'taxonomies' | 'trait'
    selectedItems: string[]
  }

  export interface HighlightSelectionProps {
    datasetId: number
    traits: ViewTableTraits[]
  }

  const compProps = defineProps<HighlightSelectionProps>()

  const selectionMode = ref<'germplasm' | 'reps' | 'treatments' | 'taxonomies' | 'trait'>()

  const selectedGermplasm = ref<ViewTableGermplasm[]>([])
  const selectedReps = ref<string[]>([])
  const selectedTreatments = ref<Treatments[]>([])
  const selectedTrait = ref<ViewTableTraits[]>([])
  const selectedTaxonomies = defineModel<Taxonomies[]>('taxonomies', {
    default: () => [],
  })

  const trialReps = ref<string[]>([])
  const trialTreatments = ref<Treatments[]>([])
  const trialGermplasm = ref<ViewTableGermplasm[]>([])
  const trialTaxonomies = ref<Taxonomies[]>([])

  const valid = computed(() => {
    if (!userSelection.value) {
      return false
    } else {
      return userSelection.value.selectedItems.length > 0
    }
  })

  const userSelection: ComputedRef<UserSelection | undefined> = computed(() => {
    switch (selectionMode.value) {
      case 'germplasm':
        return {
          type: selectionMode.value,
          selectedItems: (selectedGermplasm.value || []).map(g => g.germplasmDisplayName),
        }
      case 'taxonomies':
        return {
          type: selectionMode.value,
          selectedItems: (selectedTaxonomies.value || []).map(g => `${g.id}`),
        }
      case 'reps':
        return {
          type: selectionMode.value,
          selectedItems: (selectedReps.value || []).concat(),
        }
      case 'treatments':
        return {
          type: selectionMode.value,
          selectedItems: (selectedTreatments.value || []).map(t => t.name),
        }
      case 'trait':
        return {
          type: selectionMode.value,
          selectedItems: (selectedTrait.value && selectedTrait.value[0]) ? [`${selectedTrait.value[0].variableId}`] : [],
        }
      default:
        return undefined
    }
  })

  watch(selectionMode, async () => {
    selectedReps.value = []
    selectedTreatments.value = []
    selectedTaxonomies.value = []
    selectedTrait.value = []
  })

  function update () {
    apiPostTrialSetupStats({
      datasetIds: [compProps.datasetId],
    }, result => {
      trialTreatments.value = result.treatments || []
      trialReps.value = result.reps || []
      trialTaxonomies.value = result.taxonomies || []
    })

    apiPostGermplasmTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      minimal: true,
    }, result => {
      if (result && result.data) {
        trialGermplasm.value = result.data
      } else {
        trialGermplasm.value = []
      }
    })
  }

  onMounted(() => update())

  defineExpose({
    userSelection,
    valid,
    update,
  })
</script>
