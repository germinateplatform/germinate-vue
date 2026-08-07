<template>
  <div>
    <div class="text-title-small mt-3">{{ $t('widgetHighlightSelectionTitle') }}</div>
    <v-btn-toggle
      v-model="selectionMode"
      color="primary"
      variant="tonal"
      class="d-flex mb-5"
    >
      <v-btn class="flex-grow-1" value="datasets" :prepend-icon="mdiDatabase" :text="$t('widgetHighlightSelectionDataset')" />
      <v-btn class="flex-grow-1" value="germplasm" :prepend-icon="mdiSprout" :text="$t('widgetHighlightSelectionGermplasm')" />
      <v-btn class="flex-grow-1" value="plot" :prepend-icon="mdiViewGridPlus" :disabled="!trialPlots || trialPlots.length === 0" :text="$t('widgetHighlightSelectionPlot')" v-if="allowCellSelect">
        <template #append><v-badge inline :content="getNumberWithSuffix((trialPlots || []).length, 0)" /></template>
      </v-btn>
      <v-btn class="flex-grow-1" value="group" :prepend-icon="mdiGroup" :text="$t('widgetHighlightSelectionGroup')">
        <template #append><v-badge inline :content="getNumberWithSuffix((groups|| []).length, 0)" /></template>
      </v-btn>
      <v-btn class="flex-grow-1" value="year" :prepend-icon="mdiCalendarWeek" :disabled="!trialYears || trialYears.length === 0" :text="$t('widgetHighlightSelectionYear')">
        <template #append><v-badge inline :content="getNumberWithSuffix((trialYears|| []).length, 0)" /></template>
      </v-btn>
      <v-btn class="flex-grow-1" value="taxonomies" :disabled="!trialTaxonomies || trialTaxonomies.length === 0" :prepend-icon="mdiSitemap" :text="$t('widgetHighlightSelectionTaxonomy')">
        <template #append><v-badge inline :content="getNumberWithSuffix((trialTaxonomies|| []).length, 0)" /></template>
      </v-btn>
      <v-btn class="flex-grow-1" value="reps" :disabled="!trialReps || trialReps.length === 0" :prepend-icon="mdiFormatListNumbered" :text="$t('widgetHighlightSelectionRep')">
        <template #append><v-badge inline :content="getNumberWithSuffix((trialReps|| []).length, 0)" /></template>
      </v-btn>
      <v-btn class="flex-grow-1" value="treatments" :disabled="!trialTreatments || trialTreatments.length === 0" :prepend-icon="mdiSprinklerFire" :text="$t('widgetHighlightSelectionTreatment')">
        <template #append><v-badge inline :content="getNumberWithSuffix((trialTreatments|| []).length, 0)" /></template>
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

    <PlotSelection
      v-else-if="selectionMode === 'plot'"
      v-model="selectedPlots"
      :plots="trialPlots"
      :label="$t('formLabelHighlightPlots')"
      :hint="$t('formDescriptionHighlightPlots')"
      persistent-hint
      multiple
    />

    <GroupSelection
      v-else-if="selectionMode === 'group'"
      v-model="selectedGroups"
      :groups="compProps.groups"
      marked-item-type="germplasm"
      :label="$t('formLabelHighlightGroups')"
      :hint="$t('formDescriptionHighlightGroups')"
      type="groups"
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
      item-value="id"
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

    <SelectAllBox
      v-else-if="selectionMode === 'year'"
      :label="$t('formLabelHighlightYears')"
      :hint="$t('formDescriptionHighlightYears')"
      multiple
      clearable
      v-model="selectedYears"
      :items="trialYears"
    />
  </div>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostGermplasmTable } from '@/plugins/api/germplasm'
  import { apiPostTrialSetupStats } from '@/plugins/api/trait'
  import type { Taxonomies, PlotDetails, Treatments, ViewTableGermplasm, ViewTableGroups } from '@/plugins/types/germinate'
  import { concat, getNumberWithSuffix } from '@/plugins/util/formatting'
  import PlotSelection from '@/components/widgets/selections/PlotSelection.vue'
  import { mdiCalendarWeek, mdiDatabase, mdiFormatListNumbered, mdiGroup, mdiSitemap, mdiSprinklerFire, mdiSprout, mdiViewGridPlus } from '@mdi/js'

  export interface UserSelection {
    type: 'group' | 'datasets' | 'plot' | 'germplasm' | 'reps' | 'treatments' | 'year' | 'taxonomies'
    selectedItems: string[]
  }

  export interface HighlightSelectionProps {
    allowCellSelect?: boolean
    datasetIds: number[]
    groups: ViewTableGroups[]
  }

  const compProps = withDefaults(defineProps<HighlightSelectionProps>(), {
    allowCellSelect: true,
  })

  const selectionMode = ref<'group' | 'datasets' | 'plot' | 'germplasm' | 'reps' | 'treatments' | 'year' | 'taxonomies'>()

  const selectedGermplasm = ref<ViewTableGermplasm[]>([])
  const selectedPlots = ref<PlotDetails[]>([])
  const selectedReps = ref<string[]>([])
  const selectedTreatments = ref<Treatments[]>([])
  const selectedGroups = ref<ViewTableGroups[]>([])
  const selectedYears = ref<number[]>([])
  const selectedTaxonomies = ref<Taxonomies[]>([])

  const trialReps = ref<string[]>([])
  const trialTreatments = ref<Treatments[]>([])
  const trialPlots = ref<PlotDetails[]>([])
  const trialGermplasm = ref<ViewTableGermplasm[]>([])
  const trialYears = ref<number[]>([])
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
      case 'datasets':
        return {
          type: selectionMode.value,
          selectedItems: (compProps.datasetIds || []).map(ds => `${ds}`),
        }
      case 'group':
        return {
          type: selectionMode.value,
          selectedItems: (selectedGroups.value || []).map(g => `${g.groupId}`),
        }
      case 'plot':
        return {
          type: selectionMode.value,
          selectedItems: (selectedPlots.value || []).map(c => `${c.row}|${c.column}`),
        }
      case 'germplasm':
        return {
          type: selectionMode.value,
          selectedItems: (selectedGermplasm.value || []).map(g => g.germplasmDisplayName),
        }
      case 'taxonomies':
        return {
          type: selectionMode.value,
          selectedItems: (selectedTaxonomies.value || []).map(g => concat(' ', [g.genus, g.species, g.subtaxa])),
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
      case 'year':
        return {
          type: selectionMode.value,
          selectedItems: (selectedYears.value || []).map(y => `${y}`),
        }
      default:
        return undefined
    }
  })

  watch(selectionMode, async () => {
    selectedPlots.value = []
    selectedReps.value = []
    selectedTreatments.value = []
    selectedYears.value = []
    selectedTaxonomies.value = []
  })

  function update () {
    apiPostTrialSetupStats({
      datasetIds: compProps.datasetIds,
    }, result => {
      trialTreatments.value = result.treatments || []
      trialReps.value = result.reps || []
      trialPlots.value = result.plots || []
      trialYears.value = result.years || []
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
