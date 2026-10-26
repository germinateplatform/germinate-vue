<template>
  <div>
    <h2>{{ $t('pageTrialsExportTraitBoxplotTitle') }}</h2>

    <v-row>
      <v-col cols="12" md="6">
        <TraitSelection
          v-model="selectedTraits"
          :traits="tdStore.storeTraits"
          url-query-key="boxplot"
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
          :groups="tdStore.storeGroups"
          url-query-key="boxplot"
          marked-item-type="germplasm"
        >
          <template #text>{{ $t('pageTrialsExportSelectGroupChartText') }}</template>
        </GroupSelection>
      </v-col>
    </v-row>

    <v-btn class="my-5" :disabled="!canContinue" color="primary" :prepend-icon="mdiArrowRightBox" :text="$t('buttonPlot')" @click="plot" />

    <TraitStatsChart
      :variables="selectedTraits"
      :trait-data="traitData || []"
      ref="traitStatsChart"
      v-if="traitData"
    />
  </div>
</template>

<script setup lang="ts">
  import { ViewTableTraitsScaleDatatype, type TrialsExportDatasetRequest, type ViewTableGroups, type ViewTableTraits, type ViewTableTrialsData } from '@/plugins/types/germinate'
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'
  import { apiPostTrialsDataTable } from '@/plugins/api/trait'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

  import emitter from 'tiny-emitter/instance'
  import TraitStatsChart from '@/components/charts/TraitStatsChart.vue'
  import { mdiArrowRightBox } from '@mdi/js'

  const compProps = defineProps<{
    max?: number
  }>()

  const store = useCoreStore()
  const tdStore = useTraitDataStore()

  const traitStatsChart = useTemplateRef('traitStatsChart')

  const selectedTraits = ref<ViewTableTraits[]>([])
  const selectedGroups = ref<ViewTableGroups[]>([])
  const groupSelection = ref<GroupSelectionType>('all')

  const traitData = ref<ViewTableTrialsData[]>()

  const canContinue = computed(() => {
    return selectedTraits.value.length > 0 && selectedTraits.value.length < (compProps.max || Number.MAX_SAFE_INTEGER) && (groupSelection.value === 'all' || selectedGroups.value.length > 0)
  })

  function plot () {
    emitter.emit('show-loading', true)

    const query: TrialsExportDatasetRequest = {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      prevCount: -1,
      datasetIds: tdStore.storeDatasetIds,
      traitIds: selectedTraits.value.map(t => t.variableId),
      germplasmIds: groupSelection.value === 'groups' && selectedGroups.value.some(g => g.groupId === -1) ? store.storeMarkedGermplasm : undefined,
      germplasmGroupIds: selectedGroups.value.filter(g => g.groupId !== -1).map(g => g.groupId || -1),
      minimal: true,
    }

    apiPostTrialsDataTable(query, result => {
      traitData.value = result.data
    }).finally(() => emitter.emit('show-loading', false))
  }
</script>
