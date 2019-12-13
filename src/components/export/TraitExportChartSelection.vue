<template>
  <div>
    <ExportSelection v-bind="$props"
                     :min="2"
                     :max="7"
                     :onlyNumeric="false"
                     v-on:button-clicked="plot" />
    <b-row>
      <b-col cols=12 v-if="plotData">
        <h3 class="mt-3">{{ $t('pageTrialsExportColorByTitle') }}</h3>
        <p>{{ $t('pageTrialsExportColorByText') }}</p>
        <b-form-select :options="colorByOptions" v-model="colorBySelection" @change="onColorByChanged" />

        <h3 class="mt-3">{{ $t('pageTrialsExportChartTitle') }}</h3>
        <p>{{ $t('pageTrialsExportChartText') }}</p>
        <MatrixChart ref="chart" :datasetIds="datasetIds" itemType="germplasm" v-if="selectedTraits.length > 2" experimentType="trials" />
        <ScatterChart ref="chart" :datasetIds="datasetIds" itemType="germplasm" :x="selectedTraits[0].displayName" :y="selectedTraits[1].displayName" experimentType="trials" v-else />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import MatrixChart from '@/components/charts/MatrixChart'
import ScatterChart from '@/components/charts/ScatterChart'
import ExportSelection from '@/components/export/ExportSelection'
import { EventBus } from '@/plugins/event-bus.js'
import datasetApi from '@/mixins/api/dataset.js'

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
    experimentType: {
      type: String,
      default: null
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
      }, {
        text: this.$t('widgetChartColoringByTreatment'),
        value: 'treatments_description'
      }, {
        text: this.$t('widgetChartColoringByTrialSite'),
        value: 'trial_site'
      }],
      colorBySelection: null,
      plotData: null,
      selectedTraits: null
    }
  },
  components: {
    ExportSelection,
    MatrixChart,
    ScatterChart
  },
  mixins: [ datasetApi ],
  methods: {
    plot: function (query, selectedTraits) {
      this.plotData = null
      EventBus.$emit('show-loading', true)
      this.apiPostDatasetExport('trial', query, result => {
        this.selectedTraits = selectedTraits
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
