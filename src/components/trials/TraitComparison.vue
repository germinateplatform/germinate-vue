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
          <template #text>
            <p>{{ $t('pageTrialsExportSelectGroupChartText') }}</p>
          </template>
        </GroupSelection>
      </v-col>
    </v-row>

    <v-btn class="my-5" :disabled="!canContinue" color="primary" prepend-icon="mdi-arrow-right-box" :text="$t('buttonPlot')" @click="plot" />

    <template v-if="plotData">
      <p>{{ $t('pageTrialsExportComparisonChartText') }}</p>

      <v-select
        v-model="groupBy"
        :items="groupByOptions"
        :label="$t('formLabelTraitChartGrouping')"
      />

      <div v-for="trait in selectedTraits" :key="`trait-${trait.traitId}`" class="mt-5">
        <TraitComparisonChart
          :title="trait.traitName"
          :dataset-ids="datasetIds"
          :categories="splitValues"
          :trait="trait"
          :get-plot-data="getTraitSubset"
          :germplasm-data="plotData[trait.traitId]"
          :germplasm="germplasm"
          :color-mapping="colorMapping"
          :group-by="groupBy"
          v-if="plotData[trait.traitId]"
        >
          <template #title-append>
            <v-chip class="ms-2" size="small" :text="dataTypes[trait.dataType].text()" :color="dataTypes[trait.dataType].color()" :prepend-icon="dataTypes[trait.dataType].path" />
          </template>
        </TraitComparisonChart>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { FilterComparator, FilterOperator, type PaginatedResult, type ViewTableTrialsData, type ViewTableGroups, type ViewTableTraits } from '@/plugins/types/germinate'
  import type { GroupSelectionType } from '@/components/widgets/selections/GroupSelection.vue'

  import emitter from 'tiny-emitter/instance'
  import { coreStore } from '@/stores/app'
  import { apiPostGroupGermplasmTableIds } from '@/plugins/api/germplasm'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostTrialsDataTable } from '@/plugins/api/trait'
  import { getGermplasmDisplayName } from '@/plugins/util'
  import { useI18n } from 'vue-i18n'
  import { getColor } from '@/plugins/util/colors'
  import TraitComparisonChart from '@/components/charts/TraitComparisonChart.vue'
  import { dataTypes } from '@/plugins/util/types'

  export interface BoxPlotData {
    count: number
    total: number
    germplasmData: { [key: number]: GermplasmData }
  }

  export interface GermplasmData {
    germplasmName: string
    values: { [key: string]: number[] }
  }

  export interface GermplasmInfo {
    id: number
    name: string
  }

  const compProps = defineProps<{
    datasetIds: number[]
    traits: ViewTableTraits[]
    groups: ViewTableGroups[]
    max?: number
  }>()

  const { t } = useI18n()
  const store = coreStore()

  const selectedTraits = ref<ViewTableTraits[]>([])
  const selectedGroups = ref<ViewTableGroups[]>([])
  const groupSelection = ref<GroupSelectionType>('groups')

  const plotData = ref<{ [key: number]: BoxPlotData }>()
  const splitValues = ref<string[]>([])
  const germplasm = ref<GermplasmInfo[]>([])
  const colorMapping = ref<{ [key: string]: string }>({})

  const groupBy = ref<'year' | 'treatment' | 'dataset' | 'trialsite' | 'undefined'>('undefined')

  let rawData: ViewTableTrialsData[] = []

  const groupByOptions = computed(() => {
    return [{
      title: t('widgetChartColoringNoColoring'),
      value: 'undefined',
    }, {
      title: t('widgetChartColoringByDataset'),
      value: 'dataset',
    }, {
      title: t('widgetChartColoringByYear'),
      value: 'year',
    }, {
      title: t('widgetChartColoringByTreatment'),
      value: 'treatment',
    }, {
      title: t('widgetChartColoringByTrialSite'),
      value: 'trialsite',
    }]
  })

  const canContinue = computed(() => {
    return selectedTraits.value.length > 0 && selectedTraits.value.length < (compProps.max || Number.MAX_SAFE_INTEGER) && (groupSelection.value === 'all' || selectedGroups.value.length > 0)
  })

  function update (germplasmIds: number[]) {
    apiPostTrialsDataTable<PaginatedResult<ViewTableTrialsData[]>>({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      prevCount: -1,
      datasetIds: compProps.datasetIds,
      filters: [{
        filters: [{
          column: 'germplasmId',
          comparator: FilterComparator.inSet,
          values: germplasmIds.map(String),
        }, {
          column: 'traitId',
          comparator: FilterComparator.inSet,
          values: selectedTraits.value.map(t => `${t.traitId}`),
        }],
        operator: FilterOperator.and,
      }],
    }, result => {
      if (result && result.data) {
        rawData = result.data
        redraw()
      }

      emitter.emit('show-loading', false)
    })
  }

  function plot () {
    emitter.emit('show-loading', true)

    let germplasmIds: number[] = []

    if (selectedGroups.value[0].groupId === -1) {
      germplasmIds = store.storeMarkedGermplasm
      update(germplasmIds)
    } else {
      apiPostGroupGermplasmTableIds<PaginatedResult<number[]>>(selectedGroups.value[0].groupId || -1, {
        page: 1,
        limit: MAX_JAVA_INTEGER,
      }, result => {
        if (result && result.data) {
          germplasmIds = result.data
        } else {
          germplasmIds = []
        }

        update(germplasmIds)
      })
    }
  }

  function redraw () {
    const tempTraitChartData: { [key: number]: BoxPlotData } = {}
    const germplasmMapping: Map<number, string> = new Map()
    const tempSplit = new Set<string>()
    rawData.forEach(r => {
      const germplasmId = r.germplasmId
      const germplasmName = getGermplasmDisplayName(r)
      const traitId = r.traitId
      const traitValue = r.traitValue

      let split = 'undefined'

      switch (groupBy.value) {
        case 'year':
          try {
            split = `${new Date(r.recordingDate).getFullYear()}`
          } catch {
            split = 'undefined'
          }
          break
        case 'treatment':
          split = r.treatment
          break
        case 'dataset':
          split = `${r.datasetId}`
          break
        case 'trialsite':
          split = r.locationName
          break
      }

      tempSplit.add(split)

      if (!germplasmMapping.has(germplasmId)) {
        germplasmMapping.set(germplasmId, germplasmName)
      }

      let data = tempTraitChartData[traitId]

      if (!data) {
        data = {
          count: 0,
          total: 0,
          germplasmData: {},
        }
      }

      if (!data.germplasmData[germplasmId]) {
        data.germplasmData[germplasmId] = {
          germplasmName: germplasmName,
          values: {},
        }
      }

      if (!data.germplasmData[germplasmId].values[split]) {
        data.germplasmData[germplasmId].values[split] = []
      }

      data.germplasmData[germplasmId].values[split].push(+traitValue)
      data.count++
      data.total += +traitValue

      tempTraitChartData[traitId] = data
    })

    plotData.value = tempTraitChartData

    splitValues.value = Array.from(tempSplit).sort()

    const g: GermplasmInfo[] = []
    germplasmMapping.forEach((value, key) => {
      g.push({
        id: key,
        name: value,
      })
    })

    germplasm.value = g

    updateChartColors()
  }

  function updateChartColors () {
    const tempColorMapping: { [key: string]: string } = {}

    if (splitValues.value && splitValues.value.length > 0) {
      splitValues.value.forEach((t, i) => {
        tempColorMapping[t] = getColor(i)
      })
    }
    if (germplasm.value && germplasm.value.length > 0) {
      germplasm.value.forEach((g, i) => {
        tempColorMapping[g.id] = getColor(i)
      })
    }

    colorMapping.value = tempColorMapping
  }

  function getTraitSubset (trait: ViewTableTraits) {
    const headers = ['germplasmId', 'germplasmGid', 'germplasmName', 'germplasmDisplayName', 'entityParentName', 'entityParentGeneralIdentifier', 'entityType', 'datasetId', 'datasetName', 'datasetDescription', 'locationName', 'countryName', 'countryCode2', 'traitId', 'traitName', 'traitNameShort', 'traitRestrictions', 'unitName', 'treatment', 'recordingDate', 'traitValue']
    let result = headers.join('\t') + '\n'
    rawData.filter(d => +d.traitId === trait.traitId).forEach(r => {
      // @ts-ignore
      result += headers.map(h => r[h] || '').join('\t') + '\n'
    })
    return result
  }

  watch(groupBy, async () => redraw())
</script>
