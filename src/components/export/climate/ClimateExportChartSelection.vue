<template>
  <div>
    <ExportSelection :datasetIds="datasetIds"
                     :texts="texts"
                     itemType="locations"
                     groupType="locations"
                     experimentType="climate"
                     idKey="climateId"
                     nameKey="climateName"
                     :min="2"
                     :max="7"
                     :onlyNumeric="false"
                     :getItems="getItems"
                     v-on:button-clicked="plot" />
    <b-row>
      <b-col cols=12 v-if="plotData">
        <h3 class="mt-3">{{ $t('pageClimateExportColorByTitle') }}</h3>
        <p>{{ $t('pageClimateExportColorByText') }}</p>
        <b-form-select :options="colorByOptions" v-model="colorBySelection" @change="onColorByChanged" />

        <h3 class="mt-3">{{ $t('pageClimateExportChartTitle') }}</h3>
        <p>{{ $t('pageClimateExportChartText') }}</p>
        <MatrixChart ref="chart" :datasetIds="datasetIds" itemType="locations" v-if="selectedClimates.length > 2" experimentType="climate" />
        <ScatterChart ref="chart" :datasetIds="datasetIds" itemType="locations" :x="selectedClimates[0].displayName" :y="selectedClimates[1].displayName" experimentType="climate" v-else />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import MatrixChart from '@/components/charts/MatrixChart'
import ScatterChart from '@/components/charts/ScatterChart'
import ExportSelection from '@/components/export/ExportSelection'
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
      colorByOptions: [{
        text: this.$t('widgetChartColoringNoColoring'),
        value: null
      }, {
        text: this.$t('widgetChartColoringByDataset'),
        value: 'dataset_name'
      }, {
        text: this.$t('widgetChartColoringByYear'),
        value: 'year'
      }],
      colorBySelection: null,
      plotData: null,
      selectedClimates: null,
      texts: {
        title: 'pageClimateExportSelectClimateTitle',
        text: 'pageClimateExportSelectClimateChartText',
        groupTitle: 'pageClimateExportSelectGroupTitle',
        groupText: 'pageClimateExportSelectGroupChartText',
        groupTooltip: 'pageExportSelectGroupTooltip',
        button: 'buttonPlot'
      }
    }
  },
  components: {
    ExportSelection,
    MatrixChart,
    ScatterChart
  },
  methods: {
    getItems: function (callback) {
      this.apiPostDatasetClimates(this.datasetIds, callback)
    },
    plot: function (query, selectedClimates) {
      this.plotData = null
      EventBus.$emit('show-loading', true)
      this.apiPostDatasetExport('climate', query, result => {
        this.selectedClimates = selectedClimates
        this.plotData = result
        this.$nextTick(() => this.$refs.chart.redraw(result, this.colorBySelection))
        EventBus.$emit('show-loading', false)
      })
    },
    onColorByChanged: function () {
      if (this.plotData) {
        this.$refs.chart.redraw(this.plotData, this.colorBySelection)
      }
    }
  }
}
</script>

<style>
</style>
