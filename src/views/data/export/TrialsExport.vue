<template>
  <div>
    <h1>{{ $t('pageTrialsExportTitle') }}</h1>
    <template v-if="datasets && datasets.length > 0">
      <hr />
      <h2>{{ $t('widgetSelectedDatasetsTitle') }}</h2>
      <!-- Selected datasets -->
      <DatasetOverview :datasets="datasets" />
      <!-- Banner buttons -->
      <b-row class="trials-tabs" v-if="tabs">
        <b-col cols=12 sm=6 xl=3 v-for="(tab, index) in tabs" :key="'trials-tabs-' + tab.key">
          <a href="#" @click.prevent="tab.onSelection">
            <b-card no-body :style="`border: 1px solid ${getColor(index)}; filter: ${getFilter(index)};`">
              <b-card-body :style="`background-color: ${getColor(index)}; color: white;`">
                <b-row>
                  <b-col cols=12 class="text-center">
                    <i :class="`mdi mdi-48px ${tab.icon}`" />
                  </b-col>
                </b-row>
              </b-card-body>
              <b-card-footer :style="`color: ${getColor(index)}`">
                <i class="mdi mdi-18px mdi-arrow-right-bold-circle" /><span> {{ tab.text() }}</span>
              </b-card-footer>
            </b-card>
          </a>
        </b-col>
      </b-row>
      <!-- Boxplot section -->
      <BoxplotSelection :datasetIds="datasetIds"
                        v-bind="config"
                        xTypes="traits"
                        :groups="groups"
                        :texts="textsChart"
                        :getItems="getTraits"
                        v-show="currentTab === 'overview'" />
      <!-- Trait matrix chart section -->
      <TraitExportChartSelection :datasetIds="datasetIds"
                                 v-bind="config"
                                 :groups="groups"
                                 :texts="textsChart"
                                 :getItems="getTraits"
                                 v-show="currentTab === 'matrix'"/>
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
import BoxplotSelection from '@/components/export/BoxplotSelection'
import DatasetOverview from '@/components/export/DatasetOverview'
import TraitExportChartSelection from '@/components/export/TraitExportChartSelection'
import ExportDownloadSelection from '@/components/export/ExportDownloadSelection'
import TrialsDataTable from '@/components/tables/TrialsDataTable'
import { EventBus } from '@/plugins/event-bus.js'
import datasetApi from '@/mixins/api/dataset.js'
import groupApi from '@/mixins/api/group.js'
import miscApi from '@/mixins/api/misc.js'
import traitApi from '@/mixins/api/trait.js'
import colorMixin from '@/mixins/colors.js'

export default {
  props: [ 'datasetIds' ],
  data: function () {
    return {
      datasets: null,
      traits: null,
      groups: null,
      config: {
        idKey: 'traitId',
        nameKey: 'traitName',
        downloadKey: 'trial',
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
    markedIds: {
      deep: true,
      handler: function () {
        this.updateGroups()
      }
    }
  },
  components: {
    BoxplotSelection,
    DatasetOverview,
    ExportDownloadSelection,
    TraitExportChartSelection,
    TrialsDataTable
  },
  mixins: [ datasetApi, groupApi, miscApi, traitApi, colorMixin ],
  methods: {
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
    tabSelected: function (tab) {
      this.currentTab = tab
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
    EventBus.$emit('show-loading', true)
    this.apiPostDatasetTraits(this.datasetIds, result => {
      this.traits = result

      this.getDatasets()
      this.updateGroups()
      EventBus.$emit('show-loading', false)
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
</style>
