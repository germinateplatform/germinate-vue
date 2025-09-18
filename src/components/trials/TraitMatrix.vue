<template>
  <div>
    <h2>{{ $t('pageTrialsExportTraitMatrixTitle') }}</h2>

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

    <TraitMatrixChart :plot-data="chartData" v-if="chartData" :dataset-ids="datasetIds" :traits="selectedTraits" :has-groups-data="hasGroupsData" />
  </div>
</template>

<script setup lang="ts">
  import type { TrialsExportDatasetRequest, ViewTableGroups, ViewTableTraits } from '@/plugins/types/germinate'
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'

  import emitter from 'tiny-emitter/instance'
  import { apiPostTrialDatasetExport } from '@/plugins/api/dataset'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { coreStore } from '@/stores/app'
  import TraitMatrixChart from '@/components/charts/TraitMatrixChart.vue'

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

  const hasGroupsData = ref(false)
  const chartData = ref<Blob>()

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

    hasGroupsData.value = query.germplasmGroupIds !== undefined && query.germplasmGroupIds.length > 0

    apiPostTrialDatasetExport<Blob>(query, result => {
      chartData.value = result
      // this.$nextTick(() => this.$refs.chart.redraw(result, {
      //   column: (this.colorBySelection === 'marked_items' || this.colorBySelection === 'specified_names') ? null : this.colorBySelection,
      //   ids: this.colorBySelection === 'marked_items' ? this.storeMarkedGermplasm : null,
      //   names: this.colorBySelection === 'specified_names' ? this.germplasmNamesSplit : null
      // }))
      emitter.emit('show-loading', false)
    }, {
      codes: [404],
      callback: () => {
        // Do nothing here, it just means there is no data.
        emitter.emit('show-loading', false)
      },
    })
  }
</script>
