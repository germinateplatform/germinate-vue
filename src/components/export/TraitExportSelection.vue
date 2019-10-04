<template>
  <b-row>
    <b-col cols=12 md=6 v-if="traits && traits.length > 0">
      <h2>{{ $t('pageTrialsExportSelectTraitTitle') }}</h2>
      <p>{{ $t('pageTrialsExportSelectTraitText') }}</p>
      <b-form-select multiple v-model="selectedTraits" :options="traitOptions" :select-size=7 />
      <p class="text-danger" v-if="selectedTraits.length > 7">{{ $t('pageTrialsExportSelectTraitLimit') }}</p>
      <p class="text-info" v-if="selectedTraits.length < 2">{{ $t('pageTrialsExportSelectTraitMinimum') }}</p>
    </b-col>
    <b-col cols=12 md=6 v-if="groups && groups.length > 0">
      <ExportGroupSelection title="pageTrialsExportSelectGroupTitle" text="pageTrialsExportSelectGroupText" tooltip="pageExportSelectGroupTooltip" itemType="germplasm" :groups="groups" ref="germplasmGroups"/>
    </b-col>
    <b-col cols=12>
      <b-btn variant="primary" @click="plot" :disabled="plotButtonDisabled"><i class="mdi mdi-18px mdi-arrow-right-bold fix-alignment" /> Plot</b-btn>
    </b-col>
    <b-col cols=12 v-if="plotData">
      <h3 class="mt-3">{{ $t('pageTrialsExportColorByTitle') }}</h3>
      <p>{{ $t('pageTrialsExportColorByText') }}</p>
      <b-form-select :options="colorByOptions" v-model="colorBySelection" @change="onColorByChanged" />

      <h3 class="mt-3">{{ $t('pageTrialsExportChartTitle') }}</h3>
      <p>{{ $t('pageTrialsExportChartText') }}</p>
      <MatrixChart ref="chart" :datasetIds="datasetIds" v-if="currentTraitCount > 2" />
      <ScatterChart ref="chart" :datasetIds="datasetIds" :x="selectedTraits[0].displayName" :y="selectedTraits[1].displayName" v-else />
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
    }
  },
  data: function () {
    return {
      traits: [],
      selectedTraits: [],
      traitOptions: [],
      groups: [],
      colorByOptions: [{
        text: this.$t('widgetChartColoringNoColoring'),
        value: null
      }, {
        text: this.$t('widgetChartColoringByDataset'),
        value: 'dataset_name'
      }, {
        text: this.$t('widgetChartColoringByYear'),
        value: 'year'
      }, {
        text: this.$t('widgetChartColoringByTreatment'),
        value: 'treatments_description'
      }, {
        text: this.$t('widgetChartColoringByTrialSite'),
        value: 'trial_site'
      }],
      colorBySelection: null,
      plotData: null
    }
  },
  watch: {
    datasetIds: function (newValue, oldValue) {
      this.updateTraits()
      this.updateGroups()
    }
  },
  computed: {
    plotButtonDisabled: function () {
      var disabled = this.selectedTraits.length < 2
      if (this.specialGroupSelection === 'selection') {
        disabled = disabled || this.selectedGroups.length < 1
      }
      disabled = disabled || this.selectedTraits.length > 7
      return disabled
    }
  },
  components: {
    ExportGroupSelection,
    MatrixChart,
    ScatterChart
  },
  methods: {
    plot: function () {
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

      this.plotData = null
      this.apiPostDatasetExport('trial', query, result => {
        this.plotData = result
        this.currentTraitCount = this.selectedTraits.length
        this.$nextTick(() => this.$refs.chart.redraw(result, this.colorBySelection))
        EventBus.$emit('show-loading', false)
      })
    },
    onColorByChanged: function () {
      if (this.plotData) {
        this.$refs.chart.redraw(this.plotData, this.colorBySelection)
      }
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
