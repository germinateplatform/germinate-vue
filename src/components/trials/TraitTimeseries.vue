<template>
  <div>
    <h2>{{ $t('pageTrialsExportTraitTimeseriesTitle') }}</h2>

    <v-row>
      <v-col cols="12" md="6">
        <TraitSelection
          v-model="selectedTraits"
          :traits="numericTraits"
          url-query-key="timeseries"
          :can-select-multiple="false"
          :can-select-all="false"
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
          url-query-key="timeseries"
          :groups="groups"
          marked-item-type="germplasm"
          :multiple="true"
        >
          <template #text>{{ $t('pageTrialsExportSelectGroupChartText') }}</template>
        </GroupSelection>

        <GermplasmSelection
          class="mt-5"
          url-query-key="timeseries"
          :germplasm="trialGermplasm"
          v-model="selectedGermplasm"
        />
      </v-col>
    </v-row>

    <v-btn class="my-5" color="primary" :disabled="!canContinue" :prepend-icon="mdiArrowRightBox" :text="$t('buttonPlot')" @click="getData" />

    <div v-if="plotData && plotData.length > 0 && selectedTraits && selectedTraits.length > 0">
      <DynamicTickSlider
        :min="0"
        :max="timepoints.length - 1"
        :ticks="tickLabels"
        show-ticks="always"
        step="1"
        tick-size="4"
        color="primary"
        v-model="currentTimepoint"
      />

      <TraitTimeseriesChart
        :plot-data="plotData"
        :dataset-ids="datasetIds"
        :selected-germplasm="selectedGermplasm"
        :trait="selectedTraits[0]"
        :timepoints="timepoints"
        :current-timepoint="currentTimepoint"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { type ViewTableGroups, type ViewTableTraits, type ViewTableGermplasm, ViewTableTraitsScaleDatatype, type ViewTableTrialsData, FilterOperator, FilterComparator } from '@/plugins/types/germinate'
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'

  import { apiPostDatasetGermplasmTable } from '@/plugins/api/germplasm'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

  import { mdiArrowRightBox } from '@mdi/js'
  import { handleRouterQuery } from '@/plugins/util'
  import { apiPostTrialsDataTable, apiPostTrialsDataTimepoints } from '@/plugins/api/trait'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'
  import type { SliderTick } from '@/components/input/DynamicTickSlider.vue'

  const compProps = defineProps<{
    datasetIds: number[]
    traits: ViewTableTraits[]
    groups: ViewTableGroups[]
  }>()

  const route = useRoute()
  const router = useRouter()

  const canContinue = computed(() => selectedTraits.value.length > 0 && (groupSelection.value === 'all' || selectedGroups.value.length > 0))

  const numericTraits = computed(() => compProps.traits.filter(t => t.scaleDatatype === ViewTableTraitsScaleDatatype.numeric))

  // User selections
  const groupSelection = ref<GroupSelectionType>('all')
  const selectedTraits = ref<ViewTableTraits[]>([])
  const selectedGroups = ref<ViewTableGroups[]>([])
  const selectedGermplasm = ref<ViewTableGermplasm[]>([])
  const plotData = ref<ViewTableTrialsData[]>([])
  const timepoints = ref<string[]>([])
  const currentTimepoint = ref(0)

  const tickLabels = computed(() => {
    const result: SliderTick[] = []

    timepoints.value.forEach((tp, index) => {
      result.push({ value: index, label: new Date(tp).toLocaleDateString() })
    })

    return result
  })

  const store = coreStore()

  // Server responses
  const trialGermplasm = ref<ViewTableGermplasm[]>([])

  watch(selectedGermplasm, async newValue => handleRouterQuery(router, route, 'timeseriesGermplasm', (newValue || []).map(t => t.germplasmId).map(String).join(',')))
  watch(selectedGroups, async newValue => handleRouterQuery(router, route, 'timeseriesGroups', (newValue || []).map(t => t.groupId).map(String).join(',')))

  watch(() => compProps.groups, async newValue => {
    if (route.query.timeseriesGroups) {
      const ids = new Set((route.query.timeseriesGroups as string).split(',').map(Number))
      selectedGroups.value = (newValue || []).filter(t => ids.has(t.groupId || -1))

      if (selectedGroups.value.length > 0) {
        groupSelection.value = 'groups'
      } else {
        groupSelection.value = 'all'
      }
    }
  }, { immediate: true })

  function getData () {
    emitter.emit('show-loading', true)
    const germplasmIds = groupSelection.value === 'groups' && selectedGroups.value.some(g => g.groupId === -1) ? store.storeMarkedGermplasm : undefined
    const germplasmGroupIds = selectedGroups.value.filter(g => g.groupId !== -1).map(g => g.groupId || -1)

    apiPostTrialsDataTimepoints({
      datasetIds: compProps.datasetIds,
      markedIds: germplasmIds,
      groupIds: germplasmGroupIds,
      traitIds: [selectedTraits.value?.[0]?.variableId || -1],
    }, result => {
      timepoints.value = result
    })

    apiPostTrialsDataTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      datasetIds: compProps.datasetIds,
      germplasmGroupIds: germplasmGroupIds,
      germplasmIds: germplasmIds,
      filters: [{
        operator: FilterOperator.and,
        filters: [{
          column: 'variableId',
          comparator: FilterComparator.equals,
          values: [`${selectedTraits.value?.[0]?.variableId || -1}`],
        }],
      }],
    }, result => {
      plotData.value = result.data
    }).finally(() => {
      emitter.emit('show-loading', false)
    })
  }

  onMounted(() => {
    apiPostDatasetGermplasmTable(compProps.datasetIds, {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      minimal: true,
    }, result => {
      if (result && result.data) {
        trialGermplasm.value = result.data
      } else {
        trialGermplasm.value = []
      }

      if (compProps.traits && route.query && route.query.timeseriesGroups) {
        const ids = new Set((route.query.timeseriesGroups as string).split(',').map(Number))
        selectedGermplasm.value = trialGermplasm.value.filter(t => ids.has(t.germplasmId))
      }
    })
  })
</script>
