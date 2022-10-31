<template>
  <div>
    <ExportSelection v-bind="$props"
                     :onlyNumeric="true"
                     :multipleItems="false"
                     :groupSelectionInfo="groupSelectionInfo"
                     v-on:button-clicked="plot" />
    <b-row>
      <b-col cols=12 v-if="traitChartData !== null && Object.keys(traitChartData).length > 0">
        <h3 class="mt-3">{{ $t('pageTrialsExportColorByTitle') }}</h3>
        <p>{{ $t('pageTrialsExportColorByText') }}</p>
        <!-- Color by -->
        <b-form @submit.prevent class="chart-form">
          <b-form-select :options="splitByOptions" v-model="splitBy" />
        </b-form>

        <h3 class="mt-3">{{ $t('pageTrialsExportComparisonChartTitle') }}</h3>
        <p class="text-info">{{ $t('pageTrialsExportComparisonChartText') }}</p>

        <div v-for="trait in selectedTraits" :key="`trait-${trait.traitId}`">
          <h4>{{ trait.traitName }} <small><b-badge>{{ trait.dataType }}</b-badge></small></h4>
          <ComparisonChart :categories="splitValues" :trait="trait" :getPlotData="getTraitSubset" :germplasmData="traitChartData[trait.traitId]" :germplasm="germplasm" :colorMapping="colorMapping" />
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import ComparisonChart from '@/components/charts/ComparisonChart'
import ExportSelection from '@/components/export/ExportSelection'
import { getColor } from '@/mixins/colors'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'
import { apiPostGroupGermplasmTableIds } from '@/mixins/api/germplasm.js'
import { apiPostTrialsDataTable } from '@/mixins/api/trait.js'

const emitter = require('tiny-emitter/instance')

export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => null
    },
    texts: {
      type: Object,
      default: () => {}
    },
    getItems: {
      type: Function,
      default: () => []
    },
    itemType: {
      type: String,
      default: 'germplasm'
    },
    groupType: {
      type: String,
      default: 'germinatebase'
    },
    downloadKey: {
      type: String,
      default: null
    },
    idKey: {
      type: String,
      default: null
    },
    nameKey: {
      type: String,
      default: null
    },
    groups: {
      type: Array,
      default: null
    }
  },
  data: function () {
    return {
      splitBy: null,
      germplasm: [],
      colorMapping: {},
      selectedTraits: null,
      traitChartData: {},
      splitValues: [],
      rawData: null
    }
  },
  computed: {
    splitByOptions: function () {
      const result = [{
        text: this.$t('widgetChartColoringNoColoring'),
        value: null
      }, {
        text: this.$t('widgetChartColoringByDataset'),
        value: 'dataset'
      }, {
        text: this.$t('widgetChartColoringByYear'),
        value: 'year'
      }, {
        text: this.$t('widgetChartColoringByTreatment'),
        value: 'treatment'
      }, {
        text: this.$t('widgetChartColoringByTrialSite'),
        value: 'trialsite'
      }]

      return result
    }
  },
  watch: {
    splitBy: function () {
      this.redraw()
    }
  },
  components: {
    ComparisonChart,
    ExportSelection
  },
  methods: {
    groupSelectionInfo: function (selectedGroup) {
      if (selectedGroup && selectedGroup.count > 10) {
        return {
          variant: 'text-danger',
          text: this.$t('pageTrialsExportComparisonLargeGroupWarning')
        }
      } else {
        return {
          variant: 'info',
          text: null
        }
      }
    },
    getTraitSubset: function (trait) {
      const headers = ['germplasmId', 'germplasmGid', 'germplasmName', 'entityParentName', 'entityParentGeneralIdentifier', 'entityType', 'datasetId', 'datasetName', 'datasetDescription', 'locationName', 'countryName', 'countryCode2', 'traitId', 'traitName', 'traitNameShort', 'traitRestrictions', 'unitName', 'treatment', 'recordingDate', 'traitValue']
      let result = headers.join('\t') + '\n'
      this.rawData.filter(d => +d.traitId === trait.traitId).forEach(r => {
        result += headers.map(h => r[h] || '').join('\t') + '\n'
      })
      return result
    },
    redraw: function (force) {
      if (this.rawData) {
        const tempTraitChartData = {}
        const germplasmMapping = {}
        const tempSplit = new Set()
        this.rawData.forEach(r => {
          const germplasmId = r.germplasmId
          const germplasmName = r.germplasmName
          const traitId = r.traitId
          const traitValue = r.traitValue

          let split

          if (this.splitBy === 'year') {
            try {
              split = new Date(r.recordingDate).getFullYear()
            } catch (err) {
              split = undefined
            }
          } else if (this.splitBy === 'treatment') {
            split = r.treatment
          } else if (this.splitBy === 'dataset') {
            split = r.datasetId
          } else if (this.splitBy === 'trialsite') {
            split = r.locationName
          }

          tempSplit.add(split)

          if (!germplasmMapping[germplasmId]) {
            germplasmMapping[germplasmId] = germplasmName
          }

          let data = tempTraitChartData[traitId]

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

          if (!data[germplasmId].values[split]) {
            data[germplasmId].values[split] = []
          }

          data[germplasmId].values[split].push(traitValue)
          data.count++
          data.total += +traitValue

          tempTraitChartData[traitId] = data
        })

        this.traitChartData = tempTraitChartData
        this.splitValues = Array.from(tempSplit).sort()
        this.germplasm = Object.keys(germplasmMapping).map(g => { return { id: g, name: germplasmMapping[g] } })

        this.updateChartColors()
      } else if (force) {
        this.update()
      }
    },
    update: function (datasetIds) {
      apiPostTrialsDataTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
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
          values: this.selectedTraits ? this.selectedTraits.map(t => t.traitId) : []
        }, {
          column: 'datasetId',
          operator: 'and',
          comparator: 'inSet',
          values: datasetIds
        }]
      }, result => {
        this.traitChartData = {}
        this.splitValues = []
        if (result && result.data) {
          this.rawData = result.data
          this.redraw(false)
        }

        emitter.emit('show-loading', false)
      })
    },
    plot: function (query, selectedItems) {
      this.selectedTraits = selectedItems
      this.traitChartData = {}
      this.rawData = null
      this.splitValues = []
      emitter.emit('show-loading', true)
      if (query.yGroupIds) {
        apiPostGroupGermplasmTableIds(query.yGroupIds[0], {}, result => {
          if (result && result.data) {
            this.germplasmIds = result.data
          } else {
            this.germplasmIds = []
          }

          this.update(query.datasetIds)
        })
      } else {
        this.germplasmIds = query.yIds
        this.update(query.datasetIds)
      }
    },
    updateChartColors: function () {
      const tempColorMapping = {}

      if (this.splitValues && this.splitValues.length > 1) {
        this.splitValues.forEach((t, i) => {
          tempColorMapping[t] = getColor(i)
        })
      } else {
        this.germplasm.forEach((g, i) => {
          tempColorMapping[g.id] = getColor(i)
        })
      }

      this.colorMapping = tempColorMapping
    }
  }
}
</script>

<style scoped>
</style>
