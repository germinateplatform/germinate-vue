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
      <h2>{{ $t('pageTrialsExportSelectGroupTitle') }}</h2>
      <p>{{ $t('pageTrialsExportSelectGroupText') }}</p>
      <div class="select-with-options">
        <div id="trait-selection">
          <b-form-select multiple v-model="selectedGroups" :options="groupOptions" :select-size=7 class="group-select" :disabled="specialGroupSelection !== 'selection'" />
        </div>
        <b-tooltip target="trait-selection" triggers="hover">
          {{ specialGroupSelection !== 'selection' ? $t('pageTrialsExportSelectGroupTooltip') : null }}
        </b-tooltip>
        <b-button-group v-if="specialGroupSelection && specialGroupSelection.length > 0 && specialGroupOptions && specialGroupOptions.length > 0">
          <b-form-radio-group
            v-model="specialGroupSelection"
            :options="specialGroupOptions"
            button-variant="outline-info"
            buttons />
        </b-button-group>
      </div>
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
      selectedGroups: [],
      groupOptions: [],
      specialGroupOptions: [{
        html: '<i class="mdi mdi-18px mdi-arrow-up-box fix-alignment"></i> ' + this.$t('pageTrialsExportSelectGroupModeSelect'),
        value: 'selection'
      }, {
        html: '<i class="mdi mdi-18px mdi-select-all fix-alignment"></i> ' + this.$t('pageTrialsExportSelectGroupModeAll'),
        value: 'all'
      }],
      specialGroupSelection: 'all',
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

      var markedSelected = this.selectedGroups.filter(g => g.isMarkedItem === true)
      if (this.specialGroupSelection !== 'all' && markedSelected.length > 0) {
        query.yIds = this.markedIds.germplasm
      }

      var groups = this.selectedGroups.filter(g => g.groupId > 0).map(g => g.groupId)
      if (this.specialGroupSelection !== 'all' && groups.length > 0) {
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
      this.apiPostTrialDatasetGroups(this.datasetIds, result => {
        this.groups = result
        this.groups.unshift({
          groupId: -1,
          groupName: 'Marked items',
          isMarkedItem: true,
          count: this.markedIds.germplasm.length
        })
        this.groupOptions = []
        this.groups.forEach(g => {
          var groupName = g.groupName

          if (g.count !== undefined) {
            groupName += ` (${g.count})`
          }

          this.groupOptions.push({
            value: g,
            disabled: g.count === undefined || g.count < 1,
            text: groupName
          })
        })
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
