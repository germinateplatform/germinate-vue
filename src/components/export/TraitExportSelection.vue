<template>
  <b-row>
    <b-col cols=12 md=6 v-if="traits && traits.length > 0">
      <h2>{{ $t('pageTrialsExportSelectTraitTitle') }}</h2>
      <p>{{ exportType === 'export' ? $t('pageTrialsExportSelectTraitExportText') : $t('pageTrialsExportSelectTraitChartText') }}</p>
      <b-form-select multiple v-model="selectedTraits" :options="traitOptions" :select-size=7 />
      <template v-if="exportType === 'chart'">
        <p class="text-danger" v-if="selectedTraits.length > 7">{{ $t('pageTrialsExportSelectTraitLimit') }}</p>
        <p class="text-info" v-if="selectedTraits.length < 2">{{ $t('pageTrialsExportSelectTraitMinimum') }}</p>
      </template>
    </b-col>
    <b-col cols=12 md=6>
      <ExportGroupSelection title="pageTrialsExportSelectGroupTitle" :text="exportType === 'export' ? 'pageTrialsExportSelectGroupExportText' : 'pageTrialsExportSelectGroupChartText'" tooltip="pageExportSelectGroupTooltip" itemType="germplasm" :groups="groups" ref="germplasmGroups"/>
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
      traits: [],
      selectedTraits: [],
      traitOptions: [],
      groups: null
    }
  },
  watch: {
    datasetIds: function (newValue, oldValue) {
      this.updateTraits()
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
          var exportDisabled = this.selectedTraits.length < 1
          if (settings.specialGroupSelection === 'selection') {
            exportDisabled = exportDisabled || settings.selectedGroups.length < 1
          }
          return exportDisabled
        } else {
          var chartDisabled = this.selectedTraits.length < 2
          if (settings.specialGroupSelection === 'selection') {
            chartDisabled = chartDisabled || settings.selectedGroups.length < 1
          }
          chartDisabled = chartDisabled || this.selectedTraits.length > 7
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
        currentTraitCount: null,
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

      if (this.selectedTraits.length > 0) {
        query.xIds = this.selectedTraits.map(t => t.traitId)
      }

      this.$emit('button-clicked', query, this.selectedTraits)
    },
    updateTraits: function () {
      this.apiPostDatasetTraits(this.datasetIds, result => {
        this.traits = result
        this.traitOptions = []
        this.traits.forEach(t => {
          var traitName = t.traitName

          if (t.unitAbbreviation) {
            traitName += ` [${t.unitAbbreviation}]`
          }

          this.traitOptions.push({
            value: t,
            text: traitName
          })

          t.displayName = traitName
        })
      })
    },
    updateGroups: function () {
      const request = {
        datasetIds: this.datasetIds,
        groupType: 'germinatebase',
        experimentType: 'trials'
      }
      this.apiPostDatasetGroups(request, result => {
        this.groups = result
      })
    }
  },
  mounted: function () {
    if (this.datasetIds) {
      this.updateTraits()
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
