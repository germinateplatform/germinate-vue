<template>
  <div>
    <h1>{{ $t('pageGermplasmComparisonTitle') }}</h1>
    <hr />
    <p>{{ $t('pageGermplasmComparisonText') }} </p>

    <!-- Table showing all datasets of the type -->
    <DatasetTable :getData="getDatasets" :getIds="getDatasetIds" :selectable="true" selectionMode="multi" class="mb-3" ref="datasetTable" v-on:selection-changed="onDatasetsSelected" />

    <div :class="`mb-3 ${groups === null ? 'loading-select' : ''}`" v-if="selectedDatasets && selectedDatasets.length > 0">
      <!-- Loading indicator -->
      <b-progress :value="100" height="5px" variant="primary" striped animated v-if="groups === null" />
      <!-- Group select -->
      <SearchableSelect v-model="selectedGroups" :multiple="false" :options="groupOptions" :selectSize=7 className="group-select"/>
      <p class="text-danger" v-if="selectedGroups && selectedGroups.count > 10"><i class="mdi mdi-18px mdi-alert fix-alignment"/> {{ $t('pageGermplasmComparisonLargeGroupWarning') }}</p>
    </div>

    <b-button variant="primary" :disabled="!selectedDatasets || selectedDatasets.length < 1 || !selectedGroups || selectedGroups.length < 1" @click="updateTraits" class="mb-3"><i class="mdi mdi-18px mdi-arrow-right-box fix-alignment"/> {{ $t('buttonNext') }}</b-button>

    <template v-if="traits && traits.length > 0">
      <p>{{ $t('pageGermplasmComparisonTraitsText') }}
      <!-- Selected traits -->
      <SearchableSelect v-model="selectedTraits" :options="traitOptions" :selectSize=7 />
      <p class="text-info" v-if="selectedTraits.length < 1">{{ $tc('pageExportSelectItemMinimum', 1) }}</p>

      <b-button class="my-3" variant="primary" @click="update" :disabled="selectedTraits.length < 1 || !germplasmIds || germplasmIds.length < 1"><i class="mdi mdi-18px mdi-file-compare fix-alignment"/> {{ $t('buttonCompare') }}</b-button>

      <template v-if="traitChartData !== null && Object.keys(traitChartData).length > 0">
        <div v-for="trait in selectedTraits" :key="`trait-${trait.traitId}`">
          <h3>{{ trait.traitName }} <small><b-badge>{{ trait.dataType }}</b-badge></small></h3>
          <ComparisonChart :treatments="treatments" :trait="trait" :germplasmData="traitChartData[trait.traitId]" :germplasm="germplasm" :colorMapping="colorMapping" />
        </div>
      </template>
      <h3 class="mt-3" v-else-if="traitChartData !== null">{{ $t('headingNoData') }}</h3>
    </template>
  </div>
</template>

<script>
import ComparisonChart from '@/components/charts/ComparisonChart'
import DatasetTable from '@/components/tables/DatasetTable'
import SearchableSelect from '@/components/util/SearchableSelect'

import { EventBus } from '@/plugins/event-bus.js'

import colorMixin from '@/mixins/colors.js'
import datasetApi from '@/mixins/api/dataset.js'
import germplasmApi from '@/mixins/api/germplasm.js'
import groupApi from '@/mixins/api/group.js'
import traitApi from '@/mixins/api/trait.js'

export default {
  data: function () {
    return {
      firstRun: true,
      selectedDatasets: [],
      selectedTraits: [],
      groups: null,
      selectedGroups: [],
      germplasmIds: [],
      germplasm: [],
      traits: [],
      traitChartData: null,
      treatments: [],
      colorMapping: {}
    }
  },
  components: {
    ComparisonChart,
    DatasetTable,
    SearchableSelect
  },
  watch: {
    markedIds: {
      deep: true,
      handler: function () {
        this.update()
      }
    },
    selectedGroups: function (newValue) {
      this.reset()
      if (!newValue || Array.isArray(newValue)) {
        this.germplasmIds = []
      } else {
        if (newValue.groupId === null) {
          this.germplasmIds = this.markedIds.germplasm
        } else {
          this.apiPostGroupGermplasmTableIds(newValue.groupId, {}, result => {
            if (result && result.data) {
              this.germplasmIds = result.data
            } else {
              this.germplasmIds = []
            }
          })
        }
      }
    },
    selectedDatasets: function (newValue) {
      if (newValue && newValue.length > 0) {
        const request = {
          datasetIds: newValue,
          groupType: 'germinatebase',
          datasetType: 'trials'
        }
        // Get groups
        this.apiPostDatasetGroups(request, result => {
          this.groups = result
          this.selectedGroups = []
        })
      }
    },
    selectedTraits: function (newValue) {
      this.traitChartData = null
      this.treatments = []
    }
  },
  computed: {
    groupOptions: function () {
      if (!this.groups) {
        return []
      }
      const groups = this.groups.map(g => {
        let groupName = g.groupName

        if (g.count !== undefined) {
          groupName += ` (${g.count})`
        }

        return {
          value: g,
          disabled: g.count === undefined || g.count < 1,
          text: groupName
        }
      })

      groups.unshift({
        text: `${this.$t('pageExportSelectMarkedItems')} (${this.markedIds.germplasm.length})`,
        value: { groupId: null },
        disabled: this.markedIds.germplasm.length < 1
      })

      return groups
    },
    traitOptions: function () {
      return this.traits.map(t => {
        let traitName = t.traitName

        if (t.unitAbbreviation) {
          traitName += ` [${t.unitAbbreviation}]`
        }

        return {
          value: t,
          text: traitName
        }
      })
    }
  },
  mixins: [ colorMixin, datasetApi, germplasmApi, groupApi, traitApi ],
  methods: {
    onDatasetsSelected: function (selectedIds) {
      this.selectedDatasets = selectedIds
      this.reset()
    },
    reset: function () {
      this.treatments = []
      this.traits = []
      this.selectedTraits = []
      this.traitChartData = null
    },
    adjustFilter: function (data) {
      if (!data.filter) {
        data.filter = []
      }

      data.filter = [{
        column: 'datasetType',
        operator: 'and',
        comparator: 'equals',
        values: ['trials']
      }, {
        column: 'isExternal',
        comparator: 'equals',
        operator: 'and',
        values: [0]
      }].concat(data.filter)
    },
    getDatasets: function (data, callback) {
      this.adjustFilter(data)
      return this.apiPostDatasetTable(data, callback)
        .then(result => {
          if (this.firstRun) {
            this.firstRun = false
            this.getDatasetIds(data, ids => {
              this.$refs.datasetTable.setSelectedItems(ids.data)
            })
          }
          return result
        })
    },
    getDatasetIds: function (data, callback) {
      this.adjustFilter(data)
      return this.apiPostDatasetTableIds(data, callback)
    },
    updateTraits: function () {
      // Get all traits
      this.apiPostTraitTable({
        page: 1,
        limit: this.MAX_JAVA_INTEGER,
        prevCount: -1,
        orderBy: 'traitName',
        ascending: 1,
        filter: [{
          column: 'dataType',
          operator: 'and',
          comparator: 'equals',
          values: ['numeric']
        }, {
          column: 'datasetIds',
          operator: 'and',
          comparator: 'arrayContains',
          values: this.selectedDatasets
        }]
      }, result => {
        if (result && result.data) {
          this.traits = result.data
        }
      })
    },
    update: function () {
      this.traitChartData = null
      EventBus.$emit('show-loading', true)
      this.apiPostTrialsDataTable({
        page: 1,
        limit: this.MAX_JAVA_INTEGER,
        prevCount: -1,
        filter: [{
          column: 'germplasmId',
          operator: 'and',
          comparator: 'inSet',
          values: this.germplasmIds
        }, {
          column: 'traitId',
          operator: 'and',
          comparator: 'inSet',
          values: this.selectedTraits.map(t => t.traitId)
        }]
      }, result => {
        this.traitChartData = {}
        this.treatments = []
        if (result && result.data) {
          const germplasmMapping = {}
          const tempTreatments = new Set()
          result.data.forEach(r => {
            const germplasmId = r.germplasmId
            const germplasmName = r.germplasmName
            const traitId = r.traitId
            const traitValue = r.traitValue
            const treatment = r.treatment

            tempTreatments.add(treatment)

            if (!germplasmMapping[germplasmId]) {
              germplasmMapping[germplasmId] = germplasmName
            }

            let data = this.traitChartData[traitId]

            if (!data) {
              data = {
                count: 0,
                total: 0
              }
            }

            if (!data[germplasmId]) {
              data[germplasmId] = {
                germplasmName: germplasmName,
                values: {}
              }
            }

            if (!data[germplasmId].values[treatment]) {
              data[germplasmId].values[treatment] = []
            }

            data[germplasmId].values[treatment].push(traitValue)
            data.count++
            data.total += +traitValue

            this.traitChartData[traitId] = data
          })

          this.treatments = Array.from(tempTreatments)
          this.germplasm = Object.keys(germplasmMapping).map(g => { return { id: g, name: germplasmMapping[g] } })

          this.updateChartColors()
        }

        EventBus.$emit('show-loading', false)
      })
    },
    updateChartColors: function () {
      const tempColorMapping = {}

      if (this.treatments && this.treatments.length > 1) {
        this.treatments.forEach((t, i) => {
          tempColorMapping[t] = this.getColor(i)
        })
      } else {
        this.germplasm.forEach((g, i) => {
          tempColorMapping[g.id] = this.getColor(i)
        })
      }

      this.colorMapping = tempColorMapping
    }
  },
  mounted: function () {
    EventBus.$on('chart-colors-changed', this.updateChartColors)
  },
  destroyed: function () {
    EventBus.$off('chart-colors-changed', this.updateChartColors)
  }
}
</script>

<style>
.loading-select > *:first-child {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.loading-select > *:last-child > input {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
