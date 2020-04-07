<template>
  <div>
    <ExportSelection v-bind="$props"
                     :min="2"
                     :max="7"
                     :onlyNumeric="false"
                     v-on:button-clicked="plot" />
    <b-row>
      <b-col cols=12 v-if="plotData">
        <h3 class="mt-3">{{ $t('pageClimateExportColorByTitle') }}</h3>
        <p>{{ $t('pageClimateExportColorByText') }}</p>
        <!-- Color by -->
        <b-form-select :options="colorByOptions()" v-model="colorBySelection" @change="onColorByChanged" />

        <h3 class="mt-3">{{ $t('pageClimateExportChartTitle') }}</h3>
        <p>{{ $t('pageClimateExportChartText') }}</p>
        <!-- Show the matrix chart if there are more than 2 traits/compounds/climates -->
        <MatrixChart ref="chart" :datasetIds="datasetIds" itemType="locations" v-if="selectedItems.length > 2" datasetType="climate" />
        <!-- Otherwise, show the simple scatter plot -->
        <ScatterChart ref="chart" :datasetIds="datasetIds" itemType="locations" :x="selectedItems[0].displayName" :y="selectedItems[1].displayName" datasetType="climate" v-else />
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
    datasetType: {
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
      colorBySelection: null,
      plotData: null,
      selectedItems: null,
      colorByGroupEnabled: false
    }
  },
  components: {
    ExportSelection,
    MatrixChart,
    ScatterChart
  },
  mixins: [ datasetApi ],
  methods: {
    colorByOptions: function () {
      var result = [{
        text: this.$t('widgetChartColoringNoColoring'),
        value: null
      }, {
        text: this.$t('widgetChartColoringByDataset'),
        value: 'dataset_name'
      }, {
        text: this.$t('widgetChartColoringByYear'),
        value: 'year'
      }]

      if (this.colorByGroupEnabled) {
        result.push({
          text: this.$t('widgetChartColoringByGroup'),
          value: 'group_ids'
        })
      }

      return result
    },
    plot: function (query, selectedItems) {
      this.colorByGroupEnabled = query.yGroupIds && query.yGroupIds.length > 0

      // If coloring by group is no longer available, but it's still selected, remove selection
      if (!this.colorByGroupEnabled && this.colorBySelection === 'group_ids') {
        this.colorBySelection = null
      }

      this.plotData = null
      EventBus.$emit('show-loading', true)
      this.apiPostDatasetExport('climate', query, result => {
        this.selectedItems = selectedItems
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
