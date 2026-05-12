<template>
  <div>
    <h2>{{ $t('pageTrialsExportTraitComparisonTitle') }}</h2>

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
          :multiple="false"
        >
          <template #text>{{ $t('pageTrialsExportSelectGroupChartText') }}</template>
        </GroupSelection>

        <GermplasmSelection
          class="mt-5"
          :germplasm="allGermplasm"
          v-model="selectedGermplasm"
        />
      </v-col>
    </v-row>

    <v-btn class="my-5" color="primary" :disabled="!canContinue" :prepend-icon="mdiArrowRightBox" :text="$t('buttonPlot')" @click="collectGermplasm" />

    <div v-if="plotTraces && plotTraces.length > 0">
      <TraitRadarChart
        :traces="plotTraces"
        :average="plotAverageTrace"
      />

      <v-row class="mt-5">
        <v-col cols="12" lg="6">
          <TraitBubbleChart
            :traces="plotTraces"
            :average="plotAverageTrace"
          />
        </v-col>
        <v-col cols="12" lg="6">
          <TraitHeatmap
            :traces="plotTraces"
            :average="plotAverageTrace"
            :custom-range="{ from: 0, to: 100 }"
          />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { type ViewTableGroups, type ViewTableTraits, type ViewTableGermplasm, type TrialsExportDatasetRequest, type ViewTableTrialsData, ViewTableTraitsScaleDatatype } from '@/plugins/types/germinate'
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'

  import { apiPostGermplasmTable, apiPostGroupGermplasmTableIds } from '@/plugins/api/germplasm'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import GroupSelection from '@/components/widgets/selections/GroupSelection.vue'
  import GermplasmSelection from '@/components/widgets/selections/GermplasmSelection.vue'
  import TraitSelection from '@/components/widgets/selections/TraitSelection.vue'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'
  import { apiPostTraitDatasetStats, apiPostTrialsDataTable } from '@/plugins/api/trait'
  import { getColor } from '@/plugins/util/colors'
  import TraitRadarChart from '@/components/charts/TraitRadarChart.vue'
  import { useI18n } from 'vue-i18n'
  import TraitBubbleChart from '@/components/charts/TraitBubbleChart.vue'
  import TraitHeatmap from '@/components/charts/TraitHeatmap.vue'
  import { mdiArrowRightBox } from '@mdi/js'

  const compProps = defineProps<{
    datasetIds: number[]
    traits: ViewTableTraits[]
    groups: ViewTableGroups[]
  }>()

  interface StatsTrait extends ViewTableTraits {
    // Domain is original value set (e.g [3.3, 104.2]). Basically FROM
    domainMin: number
    domainMax: number
    // Range is the target value area (e.g. [0, 100]). Basically TO
    rangeMin: number
    rangeMax: number
    avg?: number
    categoricalCustomData?: string[]
  }

  export interface TraitComparisonChartTrace {
    values: (number | null)[]
    name: string
    id: number | undefined
    dimensions: string[]
    customdata: (string | undefined | null)[]
    color: string
  }

  const store = coreStore()
  const { t } = useI18n()

  const canContinue = computed(() => selectedTraits.value.length > 0 && (selectedGroups.value.length > 0 || selectedGermplasm.value.length > 0))

  // User selections
  const groupSelection = ref<GroupSelectionType>('groups')
  const selectedTraits = ref<ViewTableTraits[]>([])
  const selectedGroups = ref<ViewTableGroups[]>([])
  const selectedGermplasm = ref<ViewTableGermplasm[]>([])

  // Server responses
  const allGermplasm = ref<ViewTableGermplasm[]>([])
  const traitData = ref<ViewTableTrialsData[]>()

  // Computed
  const plotAverageTrace = ref<TraitComparisonChartTrace>()
  const plotTraces = ref<TraitComparisonChartTrace[]>([])
  const selectedTraitStats = ref<StatsTrait[]>([])
  const allSelectedGermplasmIds = ref<number[]>([])

  function collectGermplasm () {
    const germplasmIds: Set<number> = new Set()

    if (selectedGermplasm.value) {
      selectedGermplasm.value.forEach(g => germplasmIds.add(g.germplasmId))
    }

    if (selectedGroups.value.length > 0) {
      if (selectedGroups.value[0].groupId === -1) {
        store.storeMarkedGermplasm.forEach(id => germplasmIds.add(id))
        update([...germplasmIds])
      } else {
        apiPostGroupGermplasmTableIds(selectedGroups.value[0].groupId || -1, {
          page: 1,
          limit: MAX_JAVA_INTEGER,
        }, result => {
          if (result && result.data) {
            result.data.forEach(id => germplasmIds.add(id))
          }

          update([...germplasmIds])
        })
      }
    } else {
      update([...germplasmIds])
    }
  }

  function update (germplasmIds: number[]) {
    allSelectedGermplasmIds.value = germplasmIds

    emitter.emit('show-loading', true)

    const query: TrialsExportDatasetRequest = {
      page: 1,
      limit: MAX_JAVA_INTEGER,
      prevCount: -1,
      datasetIds: compProps.datasetIds,
      traitIds: selectedTraits.value.map(t => t.traitId),
      germplasmIds: germplasmIds,
      minimal: true,
    }

    apiPostTrialsDataTable(query, result => {
      traitData.value = result?.data || []

      emitter.emit('show-loading', false)
    })

    apiPostTraitDatasetStats({
      datasetIds: compProps.datasetIds,
      traitIds: selectedTraits.value.map(t => t.variableId),
    }, result => {
      if (result) {
        const st: StatsTrait[] = JSON.parse(JSON.stringify(selectedTraits.value))

        result.forEach(r => {
          const matchingTrait = st.find(t => t.variableId === r.variableId)

          if (matchingTrait) {
            if (matchingTrait.scaleDatatype === ViewTableTraitsScaleDatatype.categorical) {
              matchingTrait.rangeMin = 0
              matchingTrait.rangeMax = matchingTrait.scaleRestrictions.categories[0].length - 1
              matchingTrait.domainMin = 0
              matchingTrait.domainMax = matchingTrait.scaleRestrictions.categories[0].length - 1
              matchingTrait.avg = r.avg
              matchingTrait.count = r.count
              matchingTrait.categoricalCustomData = getTraitCategoryCustomdata(matchingTrait)
            } else {
              matchingTrait.rangeMin = 0
              matchingTrait.rangeMax = 100
              matchingTrait.domainMin = r.min
              matchingTrait.domainMax = r.max
              matchingTrait.avg = r.avg
              matchingTrait.count = r.count
            }
          }
        })

        selectedTraitStats.value = st
      } else {
        selectedTraitStats.value = []
      }

      updateChartData()
    })
  }

  function findTraitValueIndex (value: string, trait: ViewTableTraits) {
    let result = -1

    trait.scaleRestrictions.categories.forEach(c => {
      result = Math.max(result, c.indexOf(value))
    })

    return result === -1 ? undefined : result
  }

  function getTraitCategoryCustomdata (trait: ViewTableTraits) {
    if (trait.scaleDatatype === ViewTableTraitsScaleDatatype.categorical) {
      const cats: string[][] = trait.scaleRestrictions.categories

      if (cats && cats.length > 0) {
        const length = cats[0].length

        if (cats.every(c => c.length === length)) {
          const values = cats[0].map((_, index) => `${index} -> `)

          for (let other = 0; other < cats.length; other++) {
            cats[other].forEach((o, i) => {
              values[i] += `${other > 0 ? ':' : ''}${o}`
            })
          }

          return values
        }
      }
    }

    return undefined
  }

  function updateChartData () {
    if (traitData.value && traitData.value.length > 0 && selectedTraitStats.value && selectedTraitStats.value.length > 0) {
      const avg: TraitComparisonChartTrace = {
        name: t('chartLegendAverageLong'),
        id: undefined,
        values: [],
        customdata: [],
        dimensions: [],
        color: 'grey',
      }

      selectedTraitStats.value.forEach(traitStats => {
        let v = traitStats.avg || 0

        if (traitStats.scaleDatatype === ViewTableTraitsScaleDatatype.categorical) {
          avg.customdata.push(`${traitStats.variableName}<br>${v}<br>${(traitStats.categoricalCustomData || []).join('<br>')}`)
        } else {
          avg.customdata.push(`${traitStats.variableName}<br>${v}`)
        }

        v = (v - traitStats.domainMin) / (traitStats.domainMax - traitStats.domainMin) * 100
        avg.values.push(v)
        avg.dimensions.push(traitStats.variableName)
      })

      if (avg.values.length > 0) {
        avg.values.push(avg.values[0])
      }
      if (avg.dimensions.length > 0) {
        avg.dimensions.push(avg.dimensions[0])
      }

      plotAverageTrace.value = avg

      const result: TraitComparisonChartTrace[] = []
      allSelectedGermplasmIds.value.forEach((gId, i) => {
        const g = allGermplasm.value.find(g => g.germplasmId === gId)

        if (!g) {
          return
        }

        const germplasmData: TraitComparisonChartTrace = {
          color: getColor(i),
          id: g.germplasmId,
          name: g.germplasmDisplayName,
          dimensions: [],
          values: [],
          customdata: [],
        }

        const dataPoints = traitData.value?.filter(td => td.germplasmId === g.germplasmId) || []

        selectedTraitStats.value.forEach(trait => {
          const traitDataPoints = dataPoints?.filter(dp => dp.traitId === trait.variableId)

          if (!traitDataPoints || traitDataPoints.length === 0) {
            germplasmData.dimensions.push(trait.variableName)
            germplasmData.values.push(null)
            germplasmData.customdata.push(null)
          } else {
            let v: number

            if (trait.scaleDatatype === ViewTableTraitsScaleDatatype.categorical) {
              const existing = traitDataPoints.map(tdp => findTraitValueIndex(tdp.traitValue, trait)).filter(tv => tv !== undefined)
              v = existing.reduce((a, b) => a + b) / existing.length
              germplasmData.customdata.push(`${trait.variableName}<br>${v}<br>${(trait.categoricalCustomData || []).join('<br>')}`)
            } else {
              v = traitDataPoints.map(tdp => +tdp.traitValue).reduce((a, b) => a + b) / traitDataPoints.length
              germplasmData.customdata.push(`${trait.variableName}<br>${v}`)
            }

            v = (v - trait.domainMin) / (trait.domainMax - trait.domainMin) * 100

            germplasmData.dimensions.push(trait.variableName)
            germplasmData.values.push(v)
          }
        })

        if (germplasmData.customdata && germplasmData.customdata.length > 0) {
          germplasmData.customdata.push(germplasmData.customdata[0])
        }

        if (germplasmData.dimensions.length > 0) {
          germplasmData.dimensions.push(germplasmData.dimensions[0])
        }

        if (germplasmData.values.length > 0) {
          germplasmData.values.push(germplasmData.values[0])
        }

        result.push(germplasmData)
      })

      plotTraces.value = result
    } else {
      plotTraces.value = []
    }
  }

  onMounted(() => {
    apiPostGermplasmTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      minimal: true,
    }, result => {
      if (result && result.data) {
        allGermplasm.value = result.data
      } else {
        allGermplasm.value = []
      }
    })
  })
</script>
