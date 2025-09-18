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
          :groups="groups"
          marked-item-type="germplasm"
        >
          <template #text>
            <p>{{ $t('pageTrialsExportSelectGroupChartText') }}</p>
          </template>
        </GroupSelection>
      </v-col>
    </v-row>

    <v-btn class="my-5" :disabled="!canContinue" color="primary" prepend-icon="mdi-arrow-right-box" :text="$t('buttonPlot')" @click="plot" />

    <TraitBoxplotChart :plot-data="boxChartData" :dataset-ids="datasetIds" :trait-ids="traitIds" v-if="boxChartData" />

    <div class="mt-5" v-for="(trait, i) in categoricalTraits" :key="`trait-bar-chart-${i}`">
      <BarChart
        :title="trait.traitName"
        x-column="phenotype_value"
        :x-title="trait.traitName"
        :y-title="$t('genericCount')"
        :x-labels="trait.traitRestrictions ? trait.traitRestrictions.categories : undefined"
        :height="400"
        :download-name="trait.traitName"
        :source-file="catChartData.get(trait.traitId)"
        v-if="catChartData.get(trait.traitId)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { PaginatedResult, TrialsExportDatasetRequest, ViewTableGroups, ViewTableTraits, ViewTableTrialsData } from '@/plugins/types/germinate'
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'
  import { apiPostTrialsDataTable } from '@/plugins/api/trait'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { coreStore } from '@/stores/app'
  import TraitBoxplotChart from '@/components/charts/TraitBoxplotChart.vue'
  import BarChart from '@/components/charts/BarChart.vue'

  import emitter from 'tiny-emitter/instance'
  import { apiPostTraitStatsCategorical } from '@/plugins/api/dataset'

  const compProps = defineProps<{
    datasetIds: number[]
    traits: ViewTableTraits[]
    groups: ViewTableGroups[]
    max?: number
  }>()

  const store = coreStore()

  const selectedTraits = ref<ViewTableTraits[]>([])
  const selectedGroups = ref<ViewTableGroups[]>([])
  const groupSelection = ref<GroupSelectionType>('all')

  const boxChartData = ref<ViewTableTrialsData[]>()
  const catChartData = ref<Map<number, Blob>>(new Map())

  const canContinue = computed(() => {
    return selectedTraits.value.length > 0 && selectedTraits.value.length < (compProps.max || Number.MAX_SAFE_INTEGER) && (groupSelection.value === 'all' || selectedGroups.value.length > 0)
  })
  const traitIds = computed(() => (selectedTraits.value || []).map(t => t.traitId))
  const categoricalTraits = computed(() => (compProps.traits || []).filter(t => t.dataType !== 'numeric'))

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

    apiPostTrialsDataTable<PaginatedResult<ViewTableTrialsData[]>>(query, result => {
      boxChartData.value = result.data
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
