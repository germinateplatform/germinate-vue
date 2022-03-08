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
      <b-row class="trials-tabs" v-if="tabs" cols-xl=5>
        <b-col cols=12 sm=6 xl=2 :offset-xl="index === 0 ? 1 : 0" v-for="(tab, index) in tabs" :key="'trials-tabs-' + tab.key">
          <b-card no-body :style="`border: 1px solid ${getColor(index)}; filter: ${getFilter(index)};`">
            <b-card-body :style="`background-color: ${getColor(index)}; color: white;`">
              <b-row>
                <b-col cols=12 class="text-center">
                  <i :class="`mdi mdi-48px ${tab.icon}`" />
                </b-col>
              </b-row>
            </b-card-body>
            <b-card-footer :style="`color: ${getColor(index)}`">
              <a href="#" @click.prevent="tab.onSelection" class="stretched-link"><i class="mdi mdi-18px mdi-arrow-right-bold-circle" /><span> {{ tab.text() }}</span></a>
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
    </template>
    <h2 v-else>{{ $t('headingNoData') }}</h2>
  </div>
</template>

<script>
import BarChart from '@/components/charts/BarChart'
import BoxplotSelection from '@/components/export/BoxplotSelection'
import DatasetOverview from '@/components/export/DatasetOverview'
import TraitExportChartSelection from '@/components/export/TraitExportChartSelection'
import TraitComparisonSelection from '@/components/export/TraitComparisonSelection'
import ExportDownloadSelection from '@/components/export/ExportDownloadSelection'
import TrialsDataTable from '@/components/tables/TrialsDataTable'
import datasetApi from '@/mixins/api/dataset.js'
import groupApi from '@/mixins/api/group.js'
import miscApi from '@/mixins/api/misc.js'
import traitApi from '@/mixins/api/trait.js'
import colorMixin from '@/mixins/colors.js'
import Vue from 'vue'

const emitter = require('tiny-emitter/instance')

export default {
  props: [ 'datasetIds' ],
  data: function () {
    return {
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
        icon: 'mdi-eye',
        onSelection: () => this.tabSelected('overview')
      }, {
        key: 'matrix',
        text: () => this.$t('pageDataExportTabDataMatrix'),
        icon: 'mdi-grid',
        onSelection: () => this.tabSelected('matrix')
      }, {
        key: 'comparison',
        text: () => this.$t('pageDataExportTabComparison'),
        icon: 'mdi-distribute-horizontal-center',
        onSelection: () => this.tabSelected('comparison')
      }, {
        key: 'table',
        text: () => this.$t('pageDataExportTabDataTable'),
        icon: 'mdi-table-search',
        onSelection: () => this.tabSelected('table')
      }, {
        key: 'export',
        text: () => this.$t('pageDataExportTabDataExport'),
        icon: 'mdi-file-download-outline',
        onSelection: () => this.tabSelected('export')
      }]
    }
  },
  watch: {
    markedGermplasm: function () {
      this.updateGroups()
    }
  },
  components: {
    BarChart,
    BoxplotSelection,
    DatasetOverview,
    ExportDownloadSelection,
    TraitComparisonSelection,
    TraitExportChartSelection,
    TrialsDataTable
  },
  mixins: [ datasetApi, groupApi, miscApi, traitApi, colorMixin ],
  methods: {
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

        this.apiPostTraitStatsCategorical(data, result => {
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
      this.apiPostDatasetGroups(request, result => {
        this.groups = result
      })
    },
    getTraits: function (callback) {
      callback(this.traits)
    },
    downloadTrialsTableData: function (data, callback) {
      return this.apiPostTableExport(data, 'dataset/data/trial', callback)
    },
    getTrialsData: function (data, callback) {
      data.datasetIds = this.datasetIds
      return this.apiPostTrialsDataTable(data, callback)
    },
    getTrialsDataIds: function (data, callback) {
      data.datasetIds = this.datasetIds
      return this.apiPostTrialsDataTableIds(data, callback)
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
    getColor: function (index) {
      if (!this.serverSettings || !this.serverSettings.colorsTemplate) {
        return '#00acef'
      } else {
        const colors = this.serverSettings.colorsTemplate
        return colors[index % colors.length]
      }
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
      this.$nextTick(() => this.$router.push({ name: 'export', params: { datasetType: 'trials' } }))
    },
    isAccepted: function (dataset) {
      if (this.token) {
        return dataset.acceptedBy && dataset.acceptedBy.indexOf(this.token.id) !== -1
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

      this.apiPostDatasetTable(request, result => {
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
  mounted: function () {
    emitter.emit('show-loading', true)
    this.apiPostDatasetTraits(this.datasetIds, result => {
      this.traits = result

      this.getDatasets()
      this.updateGroups()
      emitter.emit('show-loading', false)
    })

    if (this.$route.query && this.$route.query.tab) {
      this.$nextTick(() => this.tabSelected(this.$route.query.tab, false))
    }
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
</style>
