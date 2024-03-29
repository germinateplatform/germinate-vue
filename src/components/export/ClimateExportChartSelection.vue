<template>
  <div>
    <ExportSelection v-bind="$props"
                     queryId="climateMatrix"
                     :min="2"
                     :max="10"
                     :onlyNumeric="false"
                     v-on:button-clicked="plot" />
    <b-row>
      <b-col cols=12 v-if="hasPlotData">
        <h3 class="mt-3">{{ $t('pageClimateExportColorByTitle') }}</h3>
        <p>{{ $t('pageClimateExportColorByText') }}</p>
        <!-- Color by -->
        <b-form @submit.prevent class="chart-form">
          <b-form-select :options="colorByOptions" v-model="colorBySelection" @change="onColorByChanged" />

          <b-input-group v-if="colorBySelection === 'specified_names'">
            <b-textarea v-model="locationNames" />
            <b-input-group-append>
              <b-button @click="onColorByChanged"><MdiIcon :path="mdiRefresh" /></b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form>

        <h3 class="mt-3">{{ $t('pageClimateExportChartTitle') }}</h3>
        <p>{{ $t('pageClimateExportChartText') }}</p>
        <!-- Show the matrix chart if there are more than 2 traits/climates -->
        <MatrixChart ref="chart" :datasetIds="datasetIds" itemType="locations" v-if="selectedItems.length > 2" datasetType="climate" />
        <!-- Otherwise, show the simple scatter plot -->
        <ScatterChart ref="chart" :datasetIds="datasetIds" itemType="locations" :x="selectedItems[0].displayName" :y="selectedItems[1].displayName" datasetType="climate" v-else />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import MatrixChart from '@/components/charts/MatrixChart'
import ScatterChart from '@/components/charts/ScatterChart'
import ExportSelection from '@/components/export/ExportSelection'
import { apiPostDatasetExport } from '@/mixins/api/dataset.js'

import { mdiRefresh } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

let plotData = null

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
      default: 'locations'
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
    },
    groups: {
      type: Array,
      default: null
    }
  },
  data: function () {
    return {
      mdiRefresh,
      colorBySelection: null,
      hasPlotData: false,
      selectedItems: null,
      colorByGroupEnabled: false,
      locationNames: null
    }
  },
  computed: {
    ...mapGetters([
      'storeMarkedLocations'
    ]),
    locationNamesSplit: function () {
      if (this.locationNames) {
        return this.locationNames.split('\n')
      } else {
        return null
      }
    },
    colorByOptions: function () {
      const result = [{
        text: this.$t('widgetChartColoringNoColoring'),
        value: null
      }, {
        text: this.$t('widgetChartColoringByDataset'),
        value: 'dataset_name'
      }, {
        text: this.$t('widgetChartColoringByYear'),
        value: 'year'
      }, {
        text: this.$t('widgetChartColoringByMarkedItems'),
        value: 'marked_items'
      }, {
        text: this.$t('widgetChartColoringByLocationName'),
        value: 'specified_names'
      }]

      if (this.colorByGroupEnabled) {
        result.push({
          text: this.$t('widgetChartColoringByGroup'),
          value: 'groups'
        })
      }

      return result
    }
  },
  watch: {
    storeMarkedLocations: function () {
      if (this.colorBySelection === 'marked_items') {
        this.onColorByChanged()
      }
    }
  },
  components: {
    ExportSelection,
    MdiIcon,
    MatrixChart,
    ScatterChart
  },
  methods: {
    plot: function (query, selectedItems) {
      this.colorByGroupEnabled = query.yGroupIds && query.yGroupIds.length > 0

      // If coloring by group is no longer available, but it's still selected, remove selection
      if (!this.colorByGroupEnabled && this.colorBySelection === 'groups') {
        this.colorBySelection = null
      }

      plotData = null
      this.hasPlotData = false
      emitter.emit('show-loading', true)
      apiPostDatasetExport('climate', query, result => {
        this.selectedItems = selectedItems
        plotData = result
        this.hasPlotData = true
        this.$nextTick(() => this.$refs.chart.redraw(result, {
          column: (this.colorBySelection === 'marked_items' || this.colorBySelection === 'specified_names') ? null : this.colorBySelection,
          ids: this.colorBySelection === 'marked_items' ? this.storeMarkedLocations : null,
          names: this.colorBySelection === 'specified_names' ? this.locationNamesSplit : null
        }))
        emitter.emit('show-loading', false)
      }, {
        codes: [404],
        callback: () => {
          // Do nothing here, it just means there is no data.
          emitter.emit('show-loading', false)
        }
      })
    },
    onColorByChanged: function () {
      if (plotData) {
        this.$refs.chart.redraw(plotData, {
          column: (this.colorBySelection === 'marked_items' || this.colorBySelection === 'specified_names') ? null : this.colorBySelection,
          ids: this.colorBySelection === 'marked_items' ? this.storeMarkedLocations : null,
          names: this.colorBySelection === 'specified_names' ? this.locationNamesSplit : null
        })
      }
    }
  }
}
</script>

<style>
.chart-form > select:not(:only-child) {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.chart-form > .input-group * {
  border-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
