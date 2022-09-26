<template>
  <div>
    <h1>{{ $t('pageTrialsExportTitle') }}</h1>
    <div class="text-center" v-if="datasets === null">
      <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
    </div>
    <template v-else-if="datasets && datasets.length > 0">
      <hr />
      <!-- Selected datasets -->
      <DatasetOverview :datasets="datasets" />
      <!-- Banner buttons -->
      <b-row class="trials-tabs mb-3" v-if="tabs" :cols-xl="tabs.length">
        <b-col cols=12 sm=6 xl=2 :offset-xl="(tabs.length < 6 && index === 0) ? 1 : 0" v-for="(tab, index) in tabs" :key="'trials-tabs-' + tab.key">
          <b-card no-body :style="`border: 1px solid ${getTemplateColor(index)}; filter: ${getFilter(index)};`">
            <b-card-body :style="`background: linear-gradient(330deg, ${getBrighterColor(index)} 0%, ${getTemplateColor(index)} 50%); color: white;`">
              <b-row>
                <b-col cols=12 class="text-center">
                  <MdiIcon :size="48" :path="tab.path" />
                </b-col>
              </b-row>
              <span class="help" v-b-tooltip="tab.help()" v-if="tab.help">
                <MdiIcon :path="mdiHelpCircle" />
              </span>
            </b-card-body>
            <b-card-footer :style="`color: ${getTemplateColor(index)}`">
              <a href="#" @click.prevent="tab.onSelection" class="stretched-link"><MdiIcon :path="mdiArrowRightBoldCircle" /><span> {{ tab.text() }}</span></a>
            </b-card-footer>
          </b-card>
        </b-col>
      </b-row>
      <!-- Boxplot section -->
      <div v-show="currentTab === 'overview'">
        <BoxplotSelection :datasetIds="datasetIds"
                          v-bind="config"
                          xTypes="traits"
                          :groups="groups"
                          :texts="textsChart"
                          :getItems="getTraits"
                          v-on:plot-clicked="updateCategoricalTraitCharts" />

        <div v-for="(trait, i) in categoricalTraitsSelected" :key="`trait-bar-chart-${i}`">
          <h3>{{ trait.traitName }}</h3>
          <BarChart xColumn="phenotype_value"
            :xTitle="trait.traitName"
            :yTitle="$t('genericCount')"
            :height="400"
            :downloadName="trait.traitName"
            :sourceFile="categoricalTraitFiles[trait.traitId]"
            v-if="categoricalTraitFiles[trait.traitId]"/>
        </div>
      </div>
      <!-- Trait matrix chart section -->
      <TraitExportChartSelection :datasetIds="datasetIds"
                                 v-bind="config"
                                 :groups="groups"
                                 :texts="textsChart"
                                 :getItems="getTraits"
                                 v-show="currentTab === 'matrix'"/>
      <TraitComparisonSelection :datasetIds="datasetIds"
                                v-bind="config"
                                :groups="groups"
                                :texts="textsComparison"
                                :getItems="getTraits"
                                v-show="currentTab === 'comparison'"/>
      <!-- Trials data table section -->
      <TrialsDataTable :getData="getTrialsData" :getIds="getTrialsDataIds" :downloadTable="downloadTrialsTableData" v-show="currentTab === 'table'" />
      <!-- Export section -->
      <ExportDownloadSelection :datasetIds="datasetIds"
                               v-bind="config"
                               :groups="groups"
                               :texts="textsExport"
                               :getItems="getTraits"
                               v-show="currentTab === 'export'" />

      <TrialsLocationMap :shown="currentTab === 'locations'" :datasetIds="datasetIds" ref="locationsMap" v-show="currentTab === 'locations'" />
    </template>
    <h2 v-else>{{ $t('headingNoData') }}</h2>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import BarChart from '@/components/charts/BarChart'
import BoxplotSelection from '@/components/export/BoxplotSelection'
import DatasetOverview from '@/components/export/DatasetOverview'
import TraitExportChartSelection from '@/components/export/TraitExportChartSelection'
import TraitComparisonSelection from '@/components/export/TraitComparisonSelection'
import ExportDownloadSelection from '@/components/export/ExportDownloadSelection'
import TrialsDataTable from '@/components/tables/TrialsDataTable'
import TrialsLocationMap from '@/components/map/TrialsLocationMap'
import { apiPostDatasetTable, apiPostTraitStatsCategorical } from '@/mixins/api/dataset'
import { apiPostDatasetGroups } from '@/mixins/api/group'
import { apiPostTableExport } from '@/mixins/api/misc'
import { apiPostTrialsDataTable, apiPostTrialsDataTableIds, apiPostDatasetTraits, apiPostTrialLocationCount } from '@/mixins/api/trait'
import { getTemplateColor, hexToRgb, rgbColorToHex, brighten } from '@/mixins/colors'
import Vue from 'vue'

import { mdiArrowRightBoldCircle, mdiDistributeHorizontalCenter, mdiEye, mdiHelpCircle, mdiFileDownloadOutline, mdiGrid, mdiMapMarkerPath, mdiTableSearch } from '@mdi/js'
import { Pages } from '@/mixins/pages'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      mdiArrowRightBoldCircle,
      mdiHelpCircle,
      datasetIds: [],
      datasets: null,
      traits: null,
      groups: null,
      categoricalTraitsSelected: [],
      categoricalTraitFiles: {},
      config: {
        idKey: 'traitId',
        nameKey: 'traitName',
        downloadKey: 'trial?format=tab',
        downloadFileExtension: 'txt',
        itemType: 'germplasm',
        xType: 'traits',
        groupType: 'germinatebase',
        datasetType: 'trials'
      },
      textsChart: {
        boxplotTitle: 'pageTrialsExportTraitBoxplotTitle',
        boxplotText: 'pageTrialsExportTraitBoxplotText',
        exportTitle: 'pageTrialsExportSelectTraitTitle',
        exportText: 'pageTrialsExportSelectTraitChartText',
        groupTitle: 'pageTrialsExportSelectGroupTitle',
        groupText: 'pageTrialsExportSelectGroupChartText',
        groupTooltip: 'pageExportSelectGroupTooltip',
        exportButton: 'buttonPlot'
      },
      textsComparison: {
        exportTitle: 'pageTrialsExportSelectTraitTitle',
        exportText: 'pageTrialsExportSelectTraitChartText',
        groupTitle: 'pageTrialsExportSelectGroupTitle',
        groupText: 'pageTrialsExportSelectGroupChartText',
        groupTooltip: 'pageExportSelectGroupTooltip',
        exportButton: 'buttonCompare'
      },
      textsExport: {
        exportTitle: 'pageTrialsExportSelectTraitTitle',
        exportText: 'pageTrialsExportSelectTraitExportText',
        groupTitle: 'pageTrialsExportSelectGroupTitle',
        groupText: 'pageTrialsExportSelectGroupExportText',
        groupTooltip: 'pageExportSelectGroupTooltip',
        exportButton: 'buttonExport'
      },
      currentTab: 'overview',
      tabs: [{
        key: 'overview',
        text: () => this.$t('pageDataExportTabDataStatistics'),
        path: mdiEye,
        onSelection: () => this.tabSelected('overview'),
        help: () => this.$t('pageDataExportTabHelpDataStatistics')
      }, {
        key: 'matrix',
        text: () => this.$t('pageDataExportTabDataMatrix'),
        path: mdiGrid,
        onSelection: () => this.tabSelected('matrix'),
        help: () => this.$t('pageDataExportTabHelpDataMatrix')
      }, {
        key: 'comparison',
        text: () => this.$t('pageDataExportTabComparison'),
        path: mdiDistributeHorizontalCenter,
        onSelection: () => this.tabSelected('comparison'),
        help: () => this.$t('pageDataExportTabHelpComparison')
      }, {
        key: 'table',
        text: () => this.$t('pageDataExportTabDataTable'),
        path: mdiTableSearch,
        onSelection: () => this.tabSelected('table'),
        help: () => this.$t('pageDataExportTabHelpDataTable')
      }, {
        key: 'export',
        text: () => this.$t('pageDataExportTabDataExport'),
        path: mdiFileDownloadOutline,
        onSelection: () => this.tabSelected('export'),
        help: () => this.$t('pageDataExportTabHelpDataExport')
      }],
      locationTab: {
        key: 'locations',
        text: () => this.$t('pageDataExportTabLocations'),
        path: mdiMapMarkerPath,
        onSelection: () => this.tabSelected('locations'),
        help: () => this.$t('pageDataExportTabHelpLocations')
      }
    }
  },
  watch: {
    storeMarkedGermplasm: function () {
      this.updateGroups()
    },
    currentTab: function (newValue) {
      if (newValue === 'locations') {
        this.$nextTick(() => this.$refs.locationsMap.invalidateSize())
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeServerSettings',
      'storeToken',
      'storeMarkedGermplasm'
    ])
  },
  components: {
    BarChart,
    MdiIcon,
    BoxplotSelection,
    DatasetOverview,
    ExportDownloadSelection,
    TraitComparisonSelection,
    TraitExportChartSelection,
    TrialsDataTable,
    TrialsLocationMap
  },
  methods: {
    getTemplateColor,
    updateCategoricalTraitCharts: function (query, selectedTraits) {
      this.categoricalTraitsSelected = selectedTraits.filter(t => t.dataType !== 'numeric')
      this.categoricalTraitFiles = {}
      this.categoricalTraitsSelected.forEach(t => {
        const data = {
          datasetIds: this.datasetIds,
          xIds: [t.traitId],
          yIds: query.yIds,
          yGroupIds: query.yGroupIds
        }

        apiPostTraitStatsCategorical(data, result => {
          Vue.set(this.categoricalTraitFiles, t.traitId, result)
        })
      })
    },
    updateGroups: function () {
      const request = {
        datasetIds: this.datasetIds,
        groupType: 'germinatebase',
        datasetType: 'trials'
      }
      // Get groups
      apiPostDatasetGroups(request, result => {
        this.groups = result
      })
    },
    getTraits: function (callback) {
      callback(this.traits)
    },
    downloadTrialsTableData: function (data, callback) {
      return apiPostTableExport(data, 'dataset/data/trial', callback)
    },
    getTrialsData: function (data, callback) {
      data.datasetIds = this.datasetIds
      return apiPostTrialsDataTable(data, callback)
    },
    getTrialsDataIds: function (data, callback) {
      data.datasetIds = this.datasetIds
      return apiPostTrialsDataTableIds(data, callback)
    },
    tabSelected: function (tab, trigger = true) {
      this.currentTab = tab

      if (trigger) {
        const query = Object.assign({}, this.$route.query)
        query.tab = tab

        this.$router.replace({ query })
      }
    },
    getFilter: function (index) {
      return this.tabs[index].key === this.currentTab ? '' : 'brightness(75%)'
    },
    getBrighterColor: function (index) {
      return rgbColorToHex(brighten(hexToRgb(getTemplateColor(index))))
    },
    redirectBack: function () {
      this.$store.dispatch('ON_TABLE_FILTERING_CHANGED', [{
        column: {
          name: 'datasetId',
          type: Number
        },
        comparator: 'inSet',
        operator: 'and',
        values: this.datasetIds
      }])
      this.$nextTick(() => this.$router.push({ name: Pages.export, params: { datasetType: 'trials' } }))
    },
    isAccepted: function (dataset) {
      if (this.storeToken) {
        return dataset.acceptedBy && dataset.acceptedBy.indexOf(this.storeToken.id) !== -1
      } else {
        return dataset.acceptedBy && dataset.acceptedBy.indexOf(-1000) !== -1
      }
    },
    getDatasets: function () {
      // Set up the dataset request based on the provided ids
      const request = {
        page: 1,
        limit: this.JAVA_MAX_INTEGER,
        filter: [{
          column: 'datasetType',
          comparator: 'equals',
          operator: 'and',
          values: ['trials']
        }, {
          column: 'isExternal',
          comparator: 'equals',
          operator: 'and',
          values: [0]
        }, {
          column: 'datasetId',
          comparator: 'inSet',
          operator: 'and',
          values: this.datasetIds
        }]
      }

      apiPostDatasetTable(request, result => {
        this.datasets = result.data.filter(d => {
          // Exclude the ones where a license exists, but hasn't been accepted
          return (!d.licenseName || this.isAccepted(d))
        })

        if (this.datasets.length < 1) {
          this.redirectBack()
        }
      }, {
        codes: [404],
        callback: () => {
          this.redirectBack()
        }
      })
    }
  },
  created: function () {
    const dsIds = this.$route.params.datasetIds || ''

    this.datasetIds = dsIds === '' ? [] : dsIds.split(',').map(Number)
  },
  mounted: function () {
    emitter.emit('show-loading', true)
    apiPostDatasetTraits(this.datasetIds, result => {
      this.traits = result

      this.getDatasets()
      this.updateGroups()
      emitter.emit('show-loading', false)
    })

    if (this.$route.query && this.$route.query.tab) {
      this.$nextTick(() => this.tabSelected(this.$route.query.tab, false))
    }

    apiPostTrialLocationCount({
      datasetIds: this.datasetIds
    }, result => {
      if (result) {
        this.tabs.push(this.locationTab)
      }
    })
  }
}
</script>

<style>
.trials-tabs *:hover {
  text-decoration: none;
}
.trials-tabs .card-footer i.mdi {
  vertical-align: sub;
}
.trials-tabs .card,
.trials-tabs .card * {
  transition: filter 0.15s;
}
.trials-tabs .card .card-footer a {
  color: inherit;
}
.trials-tabs .card .help {
  position: absolute;
  top: 0.5em;
  right: 1em;
  z-index: 2;
}
</style>
