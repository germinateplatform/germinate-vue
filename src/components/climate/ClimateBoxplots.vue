<template>
  <div>
    <h2>{{ $t('pageClimateExportClimateBoxplotTitle') }}</h2>

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
          v-model="selectedGroups"
          v-model:group-selection="groupSelection"
          :groups="groups || []"
          marked-item-type="locations"
        >
          <template #text>{{ $t('pageClimateExportSelectGroupChartText') }}</template>
        </GroupSelection>
      </v-col>
    </v-row>

    <v-btn class="my-5" :disabled="!canContinue" color="primary" :prepend-icon="mdiArrowRightBox" :text="$t('buttonPlot')" @click="plot" />

    <ClimateStatsChart
      :datasets="datasets || []"
      :climates="selectedClimates"
      :groups="groups || []"
      :climate-data="climateData || []"
      :cat-chart-data="catChartData"
      ref="climateStatsChart"
      v-if="climateData || (catChartData && catChartData.size > 0)"
    />
  </div>
</template>

<script setup lang="ts">
  import { type ViewTableDatasets, type ViewTableGroups, type ViewTableClimates, ViewTableClimatesDataType, type ClimateExportDatasetRequest, type ViewTableClimateData } from '@/plugins/types/germinate'
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'
  import { apiPostClimateStatsCategorical } from '@/plugins/api/dataset'
  import { mdiArrowRightBox } from '@mdi/js'
  import { apiPostClimateDataTable } from '@/plugins/api/climate'

  const compProps = defineProps<{
    climates: ViewTableClimates[]
    groups?: ViewTableGroups[]
    datasets?: ViewTableDatasets[]
    datasetIds?: number[]
    max?: number
  }>()

  const store = coreStore()

  const climateStatsChart = useTemplateRef('climateStatsChart')

  const selectedClimates = ref<ViewTableClimates[]>([])
  const selectedGroups = ref<ViewTableGroups[]>([])
  const groupSelection = ref<GroupSelectionType>('all')

  const climateData = ref<ViewTableClimateData[]>()
  const catChartData = ref<Map<number, Blob>>(new Map())

  const categoricalClimates = computed(() => (compProps.climates || []).filter(c => c.dataType !== ViewTableClimatesDataType.numeric))
  const canContinue = computed(() => {
    return selectedClimates.value.length > 0 && selectedClimates.value.length < (compProps.max || Number.MAX_SAFE_INTEGER) && (groupSelection.value === 'all' || selectedGroups.value.length > 0)
  })

  function plot () {
    emitter.emit('show-loading', true)

    const query: ClimateExportDatasetRequest = {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      prevCount: -1,
      datasetIds: compProps.datasetIds || [],
      climateIds: selectedClimates.value.map(t => t.climateId),
      locationIds: groupSelection.value === 'groups' && selectedGroups.value.some(g => g.groupId === -1) ? store.storeMarkedLocations : undefined,
      locationGroupIds: selectedGroups.value.filter(g => g.groupId !== -1).map(g => g.groupId || -1),
      minimal: true,
    }

    apiPostClimateDataTable(query, result => {
      climateData.value = result.data
      emitter.emit('show-loading', false)
    })

    categoricalClimates.value.forEach(t => {
      const q = Object.assign(query, { traitIds: [t.climateId] })

      apiPostClimateStatsCategorical(q, result => {
        catChartData.value.set(t.climateId, result)
      })
    })
  }
</script>
