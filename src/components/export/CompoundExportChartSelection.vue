<template>
  <div>
    <ExportSelection v-bind="$props"
                     :min="2"
                     :max="10"
                     :onlyNumeric="false"
                     v-on:button-clicked="plot" />
    <b-row>
      <b-col cols=12 v-if="plotData">
        <h3 class="mt-3">{{ $t('pageCompoundExportColorByTitle') }}</h3>
        <p>{{ $t('pageCompoundExportColorByText') }}</p>
        <!-- Color by -->
        <b-form @submit.prevent class="chart-form">
          <b-form-select :options="colorByOptions" v-model="colorBySelection" @change="onColorByChanged" />

          <b-input-group v-if="colorBySelection === 'specified_names'">
            <b-textarea v-model="germplasmNames" />
            <b-input-group-append>
              <b-button @click="onColorByChanged"><i class="mdi mdi-18px mdi-refresh" /></b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form>

        <h3 class="mt-3">{{ $t('pageCompoundExportChartTitle') }}</h3>
        <p>{{ $t('pageCompoundExportChartText') }}</p>
        <!-- Show the matrix chart if there are more than 2 traits/compounds/climates -->
        <MatrixChart ref="chart" :datasetIds="datasetIds" itemType="germplasm" v-if="selectedItems.length > 2" datasetType="compound" />
        <!-- Otherwise, show the simple scatter plot -->
        <ScatterChart ref="chart" :datasetIds="datasetIds" itemType="germplasm" :x="selectedItems[0].displayName" :y="selectedItems[1].displayName" datasetType="compound" v-else />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import MatrixChart from '@/components/charts/MatrixChart'
import ScatterChart from '@/components/charts/ScatterChart'
import ExportSelection from '@/components/export/ExportSelection'
import datasetApi from '@/mixins/api/dataset.js'

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
      colorBySelection: null,
      plotData: null,
      selectedItems: null,
      colorByGroupEnabled: false,
      germplasmNames: null
    }
  },
  computed: {
    germplasmNamesSplit: function () {
      if (this.germplasmNames) {
        return this.germplasmNames.split('\n')
      } else {
        return null
      }
    },
    colorByOptions: function () {
      let result = [{
        text: this.$t('widgetChartColoringNoColoring'),
        value: null
      }, {
        text: this.$t('widgetChartColoringByDataset'),
        value: 'dataset_name'
      }, {
        text: this.$t('widgetChartColoringByTaxonomy'),
        value: 'taxonomy'
      }, {
        text: this.$t('widgetChartColoringByYear'),
        value: 'year'
      }, {
        text: this.$t('widgetChartColoringByMarkedItems'),
        value: 'marked_items'
      }, {
        text: this.$t('widgetChartColoringByGermplasmName'),
        value: 'specified_names'
      }]

      if (this.colorByGroupEnabled) {
        result.push({
          text: this.$t('widgetChartColoringByGroup'),
          value: 'group_ids'
        })
      }

      return result
    }
  },
  watch: {
    markedGermplasm: function () {
      if (this.colorBySelection === 'marked_items') {
        this.onColorByChanged()
      }
    }
  },
  components: {
    ExportSelection,
    MatrixChart,
    ScatterChart
  },
  mixins: [ datasetApi ],
  methods: {
    plot: function (query, selectedItems) {
      this.colorByGroupEnabled = query.yGroupIds && query.yGroupIds.length > 0

      // If coloring by group is no longer available, but it's still selected, remove selection
      if (!this.colorByGroupEnabled && this.colorBySelection === 'group_ids') {
        this.colorBySelection = null
      }

      this.plotData = null
      emitter.emit('show-loading', true)
      this.apiPostDatasetExport('compound', query, result => {
        this.selectedItems = selectedItems
        this.plotData = result
        this.$nextTick(() => this.$refs.chart.redraw(result, {
          column: (this.colorBySelection === 'marked_items' || this.colorBySelection === 'specified_names') ? null : this.colorBySelection,
          ids: this.colorBySelection === 'marked_items' ? this.markedGermplasm : null,
          names: this.colorBySelection === 'specified_names' ? this.germplasmNamesSplit : null
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
      if (this.plotData) {
        this.$refs.chart.redraw(this.plotData, {
          column: (this.colorBySelection === 'marked_items' || this.colorBySelection === 'specified_names') ? null : this.colorBySelection,
          ids: this.colorBySelection === 'marked_items' ? this.markedGermplasm : null,
          names: this.colorBySelection === 'specified_names' ? this.germplasmNamesSplit : null
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
