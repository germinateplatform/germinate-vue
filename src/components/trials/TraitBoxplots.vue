<template>
  <div>
    <h2>{{ $t('pageTrialsExportTraitBoxplotTitle') }}</h2>

    <v-row>
      <v-col cols="12" md="6">
        <TraitSelection
          v-model="selectedTraits"
          :traits="traits"
          can-select-all
        >
          <template #text>
            <p>{{ $t('pageTrialsExportSelectTraitChartText') }}</p>
          </template>
        </TraitSelection>
      </v-col>
      <v-col cols="12" md="6">
        <GroupSelection
          v-model="selectedGroups"
          v-model:group-selection="groupSelection"
          :groups="groups || []"
          marked-item-type="germplasm"
        >
          <template #text>
            <p>{{ $t('pageTrialsExportSelectGroupChartText') }}</p>
          </template>
        </GroupSelection>
      </v-col>
    </v-row>

    <v-btn class="my-5" :disabled="!canContinue" color="primary" :prepend-icon="mdiArrowRightBox" :text="$t('buttonPlot')" @click="plot" />

    <TraitStatsChart
      :datasets="datasets || []"
      :variables="selectedTraits"
      :groups="groups || []"
      :trait-data="traitData || []"
      :cat-chart-data="catChartData"
      ref="traitStatsChart"
      v-if="traitData || (catChartData && catChartData.size > 0)"
    />
    <!-- <template v-if="traitData || (catChartData && catChartData.size > 0)">
      <TraitHighlightSelection
        ref="highlightSelection"
        :groups="groups || []"
        :dataset-ids="datasetIds || []"
      />

      <v-switch v-model="showIndividuals" color="primary" :label="$t('chartControlShowIndividualPoints')" />

      <v-btn @click="forceRedraw" class="mb-5" :prepend-icon="mdiRefresh" :text="$t('buttonReload')" :disabled="userSelection !== undefined && !userSelectionValid" />
    </template>

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
    /> -->
  </div>
</template>

<script setup lang="ts">
  import { ViewTableTraitsScaleDatatype, type TrialsExportDatasetRequest, type ViewTableDatasets, type ViewTableGroups, type ViewTableTraits, type ViewTableTrialsData } from '@/plugins/types/germinate'
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'
  import { apiPostTrialsDataTable } from '@/plugins/api/trait'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'
  import { apiPostTraitStatsCategorical } from '@/plugins/api/dataset'
  import TraitStatsChart from '@/components/charts/TraitStatsChart.vue'
  import { mdiArrowRightBox } from '@mdi/js'

  const compProps = defineProps<{
    traits: ViewTableTraits[]
    groups?: ViewTableGroups[]
    datasets?: ViewTableDatasets[]
    datasetIds?: number[]
    max?: number
  }>()

  const store = coreStore()

  const traitStatsChart = useTemplateRef('traitStatsChart')

  const selectedTraits = ref<ViewTableTraits[]>([])
  const selectedGroups = ref<ViewTableGroups[]>([])
  const groupSelection = ref<GroupSelectionType>('all')

  const traitData = ref<ViewTableTrialsData[]>()
  const catChartData = ref<Map<number, Blob>>(new Map())

  const categoricalTraits = computed(() => (compProps.traits || []).filter(t => t.scaleDatatype !== ViewTableTraitsScaleDatatype.numeric))
  const canContinue = computed(() => {
    return selectedTraits.value.length > 0 && selectedTraits.value.length < (compProps.max || Number.MAX_SAFE_INTEGER) && (groupSelection.value === 'all' || selectedGroups.value.length > 0)
  })

  function plot () {
    emitter.emit('show-loading', true)

    const query: TrialsExportDatasetRequest = {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      prevCount: -1,
      datasetIds: compProps.datasetIds,
      traitIds: selectedTraits.value.map(t => t.traitId),
      germplasmIds: groupSelection.value === 'groups' && selectedGroups.value.some(g => g.groupId === -1) ? store.storeMarkedGermplasm : undefined,
      germplasmGroupIds: selectedGroups.value.filter(g => g.groupId !== -1).map(g => g.groupId || -1),
      minimal: true,
    }

    apiPostTrialsDataTable(query, result => {
      traitData.value = result.data
      emitter.emit('show-loading', false)
    })

    categoricalTraits.value.forEach(t => {
      const q = Object.assign(query, { traitIds: [t.traitId] })

      apiPostTraitStatsCategorical<Blob>(q, result => {
        catChartData.value.set(t.traitId, result)
      })
    })
  }
</script>
