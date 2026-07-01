<template>
  <div>
    <h2>{{ $t('pageClimateExportClimateMatrixTitle') }}</h2>

    <v-row>
      <v-col cols="12" md="6">
        <ClimateSelection
          v-model="selectedClimates"
          :climates="climates"
          can-select-all
        >
          <template #text>
            <p>{{ $t('pageClimateExportSelectClimateChartText') }}</p>
          </template>
        </ClimateSelection>
      </v-col>
      <v-col cols="12" md="6">
        <GroupSelection
          v-model="selectedLocations"
          v-model:group-selection="groupSelection"
          :groups="groups"
          marked-item-type="germplasm"
        >
          <template #text>{{ $t('pageClimateExportSelectGroupChartText') }}</template>
        </GroupSelection>
      </v-col>
    </v-row>

    <v-btn class="my-5" :disabled="!canContinue" color="primary" :prepend-icon="mdiArrowRightBox" :text="$t('buttonPlot')" @click="plot" />

    <template v-if="chartData">
      <ClimateHighlightSelection
        ref="highlightSelection"
        :groups="groups"
        :dataset-ids="datasetIds"
        :climates="climates"
      />

      <v-btn @click="climateMatrixChart?.redraw()" class="mb-5" :prepend-icon="mdiRefresh" :text="$t('buttonReload')" :disabled="userSelection !== undefined && !userSelectionValid" />
    </template>

    <ClimateMatrixChart :user-selection="userSelection" :groups="groups || []" :plot-data="chartData" v-if="chartData" :dataset-ids="datasetIds" :climates="selectedClimates" :has-groups-data="hasGroupsData" ref="climateMatrixChart" />
  </div>
</template>

<script setup lang="ts">
  import type { ViewTableGroups, ViewTableClimates, ClimateExportDatasetRequest } from '@/plugins/types/germinate'
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'

  import emitter from 'tiny-emitter/instance'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { coreStore } from '@/stores/app'
  import type HighlightSelection from '@/components/widgets/selections/ClimateHighlightSelection.vue'
  import { mdiArrowRightBox, mdiRefresh } from '@mdi/js'
  import { apiPostClimateDatasetExport } from '@/plugins/api/dataset'

  const compProps = defineProps<{
    datasetIds: number[]
    climates: ViewTableClimates[]
    groups: ViewTableGroups[]
    max?: number
  }>()

  const store = coreStore()

  const selectedClimates = ref<ViewTableClimates[]>([])
  const selectedLocations = ref<ViewTableGroups[]>([])
  const groupSelection = ref<GroupSelectionType>('all')

  const climateMatrixChart = useTemplateRef('climateMatrixChart')
  const highlightSelection = ref<InstanceType<typeof HighlightSelection>>()
  const userSelection = computed(() => highlightSelection.value?.userSelection)
  const userSelectionValid = computed(() => highlightSelection.value?.valid || false)

  const hasGroupsData = ref(false)
  const chartData = ref<Blob>()

  const canContinue = computed(() => {
    return selectedClimates.value.length > 0 && selectedClimates.value.length < (compProps.max || Number.MAX_SAFE_INTEGER) && (groupSelection.value === 'all' || selectedLocations.value.length > 0)
  })

  function plot () {
    emitter.emit('show-loading', true)

    const query: ClimateExportDatasetRequest = {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      prevCount: -1,
      datasetIds: compProps.datasetIds,
      climateIds: selectedClimates.value.map(t => t.climateId),
      locationIds: groupSelection.value === 'groups' && selectedLocations.value.some(g => g.groupId === -1) ? store.storeMarkedLocations : undefined,
      locationGroupIds: selectedLocations.value.filter(g => g.groupId !== -1).map(g => g.groupId || -1),
      minimal: true,
    }

    hasGroupsData.value = query.locationGroupIds !== undefined && query.locationGroupIds.length > 0

    apiPostClimateDatasetExport(query, result => {
      chartData.value = result
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
