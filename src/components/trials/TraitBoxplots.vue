<template>
  <div>
    <h2>{{ $t('pageTrialsExportTraitBoxplotTitle') }}</h2>
    <p>{{ $t('pageTrialsExportTraitBoxplotText') }}</p>

    <v-row>
      <v-col cols="12" md="6">
        <TraitSelection
          v-model="selectedTraits"
          :traits="traits"
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

    <v-btn :disabled="!canContinue" color="primary" prepend-icon="mdi-arrow-right-box" :text="$t('buttonPlot')" @click="plot" />

    <TraitBoxplotChart class="mt-5" :plot-data="boxChartData" :dataset-ids="datasetIds" :trait-ids="traitIds" v-if="boxChartData" />
  </div>
</template>

<script setup lang="ts">
  import type { PaginatedResult, ViewTableGroups, ViewTableTraits, ViewTableTrialsData } from '@/plugins/types/germinate'
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'
  import { apiPostTrialsDataTable } from '@/plugins/api/trait'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { coreStore } from '@/stores/app'
  import TraitBoxplotChart from '@/components/charts/TraitBoxplotChart.vue'

  import emitter from 'tiny-emitter/instance'

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

  const traitIds = computed(() => (selectedTraits.value || []).map(t => t.traitId))

  const canContinue = computed(() => {
    return selectedTraits.value.length > 0 && selectedTraits.value.length < (compProps.max || Number.MAX_SAFE_INTEGER) && (groupSelection.value === 'all' || selectedGroups.value.length > 0)
  })

  function plot () {
    emitter.emit('show-loading', true)
    apiPostTrialsDataTable<PaginatedResult<ViewTableTrialsData[]>>({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      prevCount: -1,
      datasetIds: compProps.datasetIds,
      traitIds: selectedTraits.value.map(t => t.traitId),
      germplasmIds: groupSelection.value === 'groups' && selectedGroups.value.some(g => g.groupId === -1) ? store.storeMarkedGermplasm : undefined,
      germplasmGroupIds: selectedGroups.value.filter(g => g.groupId !== -1).map(g => g.groupId || -1),
      minimal: true,
    }, result => {
      boxChartData.value = result.data
      emitter.emit('show-loading', false)
    })
  }
</script>
