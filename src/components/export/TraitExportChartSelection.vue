<template>
  <div>
    <ExportSelection v-bind="$props"
                     :queryId="queryId"
                     :min="2"
                     :max="10"
                     :onlyNumeric="false"
                     v-on:button-clicked="plot" />
    <b-row>
      <b-col cols=12 v-if="hasPlotData">
        <h3 class="mt-3">{{ $t('pageTrialsExportColorByTitle') }}</h3>
        <p>{{ $t('pageTrialsExportColorByText') }}</p>
        <!-- Color by -->
        <b-form @submit.prevent class="chart-form">
          <b-form-select :options="colorByOptions" v-model="colorBySelection" @change="onColorByChanged" />

          <b-input-group v-if="colorBySelection === 'specified_names'">
            <b-textarea v-model="germplasmNames" />
            <b-input-group-append>
              <b-button @click="onColorByChanged"><MdiIcon :path="mdiRefresh" /></b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form>

        <h3 class="mt-3">{{ $t('pageTrialsExportChartTitle') }}</h3>
        <p class="text-info">{{ $t('pageTrialsExportChartText') }}</p>
        <!-- Show the matrix chart if there are more than 2 traits/climates -->
        <MatrixChart ref="chart" :datasetIds="datasetIds" itemType="germplasm" v-if="selectedItems.length > 2" datasetType="trials" @color-by-stats-changed="colorByStatsChanged" />
        <!-- Otherwise, show the simple scatter plot -->
        <ScatterChart ref="chart" :datasetIds="datasetIds" itemType="germplasm" :x="selectedItems[0].displayName" :y="selectedItems[1].displayName" datasetType="trials" @color-by-stats-changed="colorByStatsChanged" v-else />
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
import { apiPostDatasetExport } from '@/mixins/api/dataset'

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
      queryId: 'traitMatrix',
      mdiRefresh,
      colorBySelection: null,
      hasPlotData: false,
      selectedItems: null,
      colorByGroupEnabled: false,
      germplasmNames: null,
      colorByStats: null
    }
  },
  computed: {
    ...mapGetters([
      'storeMarkedGermplasm'
    ]),
    germplasmNamesSplit: function () {
      if (this.germplasmNames) {
        return this.germplasmNames.split('\n')
      } else {
        return null
      }
    },
    colorByOptions: function () {
      const result = [{
        text: this.$t('widgetChartColoringNoColoring'),
        value: null
      }, {
        text: `${this.$t('widgetChartColoringByDataset')}${this.getStatsText('dataset_name')}`,
        value: 'dataset_name',
        disabled: this.getStatsCount('dataset_name') < 2
      }, {
        text: `${this.$t('widgetChartColoringByEntityParent')}${this.getStatsText('entity_parent_name')}`,
        value: 'entity_parent_name',
        disabled: this.getStatsCount('entity_parent_name') < 2
      }, {
        text: `${this.$t('widgetChartColoringByYear')}${this.getStatsText('year')}`,
        value: 'year',
        disabled: this.getStatsCount('year') < 2
      }, {
        text: `${this.$t('widgetChartColoringByRecordingDate')}${this.getStatsText('Date')}`,
        value: 'Date',
        disabled: this.getStatsCount('Date') < 2
      }, {
        text: `${this.$t('widgetChartColoringByTaxonomy')}${this.getStatsText('taxonomy')}`,
        value: 'taxonomy',
        disabled: this.getStatsCount('taxonomy') < 2
      }, {
        text: `${this.$t('widgetChartColoringByTreatment')}${this.getStatsText('treatments_description')}`,
        value: 'treatments_description',
        disabled: this.getStatsCount('treatments_description') < 2
      }, {
        text: `${this.$t('widgetChartColoringByRep')}${this.getStatsText('rep')}`,
        value: 'rep',
        disabled: this.getStatsCount('rep') < 2
      }, {
        text: `${this.$t('widgetChartColoringByBlock')}${this.getStatsText('block')}`,
        value: 'block',
        disabled: this.getStatsCount('block') < 2
      }, {
        text: `${this.$t('widgetChartColoringByRow')}${this.getStatsText('trial_row')}`,
        value: 'trial_row',
        disabled: this.getStatsCount('trial_row') < 2
      }, {
        text: `${this.$t('widgetChartColoringByColumn')}${this.getStatsText('trial_column')}`,
        value: 'trial_column',
        disabled: this.getStatsCount('trial_column') < 2
      }, {
        text: `${this.$t('widgetChartColoringByTrialSite')}${this.getStatsText('trial_site')}`,
        value: 'trial_site',
        disabled: this.getStatsCount('trial_site') < 2
      }, {
        text: `${this.$t('widgetChartColoringByLocation')}${this.getStatsText('location')}`,
        value: 'location',
        disabled: this.getStatsCount('location') < 2
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
          value: 'groups'
        })
      }

      return result
    }
  },
  watch: {
    storeMarkedGermplasm: function () {
      if (this.colorBySelection === 'marked_items') {
        this.onColorByChanged()
      }
    }
  },
  components: {
    ExportSelection,
    MatrixChart,
    MdiIcon,
    ScatterChart
  },
  methods: {
    getStatsCount: function (name) {
      if (this.colorByStats != null && this.colorByStats[name] !== undefined && this.colorByStats[name] !== null) {
        return this.colorByStats[name]
      } else {
        return Number.MAX_SAFE_INTEGER
      }
    },
    getStatsText: function (name) {
      if (this.colorByStats != null && this.colorByStats[name] !== undefined && this.colorByStats[name] !== null) {
        return ` (${this.colorByStats[name]})`
      } else {
        return ''
      }
    },
    plot: async function (query, selectedItems) {
      this.colorByStats = null
      this.colorByGroupEnabled = query.yGroupIds && query.yGroupIds.length > 0

      // If coloring by group is no longer available, but it's still selected, remove selection
      if (!this.colorByGroupEnabled && this.colorBySelection === 'groups') {
        this.colorBySelection = null
      }

      const urlQuery = Object.assign({}, this.$route.query)
      urlQuery[`${this.queryId}ColorBy`] = this.colorBySelection
      await this.$router.replace({ query: urlQuery })

      plotData = null
      this.hasPlotData = false
      emitter.emit('show-loading', true)
      apiPostDatasetExport('trial', query, result => {
        this.selectedItems = selectedItems
        plotData = result
        this.hasPlotData = true
        this.$nextTick(() => this.$refs.chart.redraw(result, {
          column: (this.colorBySelection === 'marked_items' || this.colorBySelection === 'specified_names') ? null : this.colorBySelection,
          ids: this.colorBySelection === 'marked_items' ? this.storeMarkedGermplasm : null,
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
    onColorByChanged: async function () {
      const urlQuery = Object.assign({}, this.$route.query)
      urlQuery[`${this.queryId}ColorBy`] = this.colorBySelection
      await this.$router.replace({ query: urlQuery })

      if (plotData) {
        if (this.colorBySelection !== 'specified_names' || (this.germplasmNamesSplit !== null && this.germplasmNamesSplit.length > 0)) {
          this.$refs.chart.redraw(plotData, {
            column: (this.colorBySelection === 'marked_items' || this.colorBySelection === 'specified_names') ? null : this.colorBySelection,
            ids: this.colorBySelection === 'marked_items' ? this.storeMarkedGermplasm : null,
            names: this.colorBySelection === 'specified_names' ? this.germplasmNamesSplit : null
          })
        }
      }
    },
    colorByStatsChanged: function (stats) {
      if (stats) {
        this.colorByStats = stats
      } else {
        this.colorByStats = null
      }
    }
  },
  mounted: function () {
    if (this.$route.query && this.$route.query[`${this.queryId}ColorBy`]) {
      this.colorBySelection = this.$route.query[`${this.queryId}ColorBy`]
    }
  }
}
</script>

<style scoped>
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
