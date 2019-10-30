<template>
  <b-row>
    <b-col cols=12 md=6 v-if="compounds && compounds.length > 0">
      <h2>{{ $t('pageCompoundExportSelectCompoundTitle') }}</h2>
      <p>{{ exportType === 'export' ? $t('pageCompoundExportSelectCompoundExportText') : $t('pageCompoundExportSelectCompoundChartText') }}</p>
      <b-form-select multiple v-model="selectedCompounds" :options="compoundOptions" :select-size=7 />
      <template v-if="exportType === 'chart'">
        <p class="text-danger" v-if="selectedCompounds.length > 7">{{ $t('pageCompoundExportSelectCompoundLimit') }}</p>
        <p class="text-info" v-if="selectedCompounds.length < 2">{{ $t('pageCompoundExportSelectCompoundMinimum') }}</p>
      </template>
    </b-col>
    <b-col cols=12 md=6>
      <ExportGroupSelection title="pageCompoundExportSelectGroupTitle" :text="exportType === 'export' ? 'pageCompoundExportSelectGroupExportText' : 'pageCompoundExportSelectGroupChartText'" tooltip="pageExportSelectGroupTooltip" itemType="germplasm" :groups="groups" ref="germplasmGroups"/>
    </b-col>
    <b-col cols=12>
      <b-btn variant="primary" @click="buttonPressed" :disabled="buttonDisabled()"><i class="mdi mdi-18px mdi-arrow-right-box fix-alignment" /> {{ exportType === 'export' ? $t('buttonExport') : $t('buttonPlot') }}</b-btn>
    </b-col>
  </b-row>
</template>

<script>
import MatrixChart from '@/components/charts/MatrixChart'
import ScatterChart from '@/components/charts/ScatterChart'
import ExportGroupSelection from '@/components/export/ExportGroupSelection'
import { EventBus } from '@/plugins/event-bus.js'

export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => null
    },
    exportType: {
      type: String,
      default: 'chart'
    }
  },
  data: function () {
    return {
      compounds: [],
      selectedCompounds: [],
      compoundOptions: [],
      groups: null
    }
  },
  watch: {
    datasetIds: function (newValue, oldValue) {
      this.updateCompounds()
      this.updateGroups()
    }
  },
  components: {
    ExportGroupSelection,
    MatrixChart,
    ScatterChart
  },
  methods: {
    buttonDisabled: function () {
      if (this.$refs.germplasmGroups) {
        var settings = this.$refs.germplasmGroups.getSettings()
        if (this.exportType === 'export') {
          var exportDisabled = this.selectedCompounds.length < 1
          if (settings.specialGroupSelection === 'selection') {
            exportDisabled = exportDisabled || settings.selectedGroups.length < 1
          }
          return exportDisabled
        } else {
          var chartDisabled = this.selectedCompounds.length < 2
          if (settings.specialGroupSelection === 'selection') {
            chartDisabled = chartDisabled || settings.selectedGroups.length < 1
          }
          chartDisabled = chartDisabled || this.selectedCompounds.length > 7
          return chartDisabled
        }
      } else {
        return true
      }
    },
    buttonPressed: function () {
      EventBus.$emit('show-loading', true)
      var query = {
        xGroupIds: null,
        xIds: null,
        yGroupIds: null,
        yIds: null,
        currentCompoundCount: null,
        datasetIds: this.datasetIds
      }

      var settings = this.$refs.germplasmGroups.getSettings()

      var markedSelected = settings.selectedGroups.filter(g => g.isMarkedItem === true)
      if (settings.specialGroupSelection !== 'all' && markedSelected.length > 0) {
        query.yIds = this.markedIds.germplasm
      }

      var groups = settings.selectedGroups.filter(g => g.groupId > 0).map(g => g.groupId)
      if (settings.specialGroupSelection !== 'all' && groups.length > 0) {
        query.yGroupIds = groups
      }

      if (this.selectedCompounds.length > 0) {
        query.xIds = this.selectedCompounds.map(t => t.compoundId)
      }

      this.$emit('button-clicked', query, this.selectedCompounds)
    },
    updateCompounds: function () {
      this.apiPostDatasetCompounds(this.datasetIds, result => {
        this.compounds = result
        this.compoundOptions = []
        this.compounds.forEach(t => {
          var compoundName = t.compoundName

          if (t.unitAbbreviation) {
            compoundName += ` [${t.unitAbbreviation}]`
          }

          this.compoundOptions.push({
            value: t,
            text: compoundName
          })

          t.displayName = compoundName
        })
      })
    },
    updateGroups: function () {
      const request = {
        datasetIds: this.datasetIds,
        groupType: 'germinatebase',
        experimentType: 'compound'
      }
      this.apiPostDatasetGroups(request, result => {
        this.groups = result
      })
    }
  },
  mounted: function () {
    if (this.datasetIds) {
      this.updateCompounds()
      this.updateGroups()
    }
  }
}
</script>

<style>
.group-select > option:first-child {
  border-bottom: 1px solid;
}
</style>
