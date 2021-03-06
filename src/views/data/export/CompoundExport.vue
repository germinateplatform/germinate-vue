<template>
  <div>
    <h1>{{ $t('pageCompoundExportTitle') }}</h1>
    <div class="text-center" v-if="datasets === null">
      <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
    </div>
    <template v-else-if="datasets && datasets.length > 0">
      <hr />
      <!-- Selected datasets -->
      <DatasetOverview :datasets="datasets" />
      <!-- Banner buttons -->
      <b-row class="compound-tabs" v-if="tabs">
        <b-col cols=12 sm=6 xl=3 v-for="(tab, index) in tabs" :key="'compound-tabs-' + tab.key">
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
                        xType="compounds"
                        :groups="groups"
                        :texts="textsChart"
                        :getItems="getCompounds"
                        v-show="currentTab === 'overview'" />
      <!-- Compound matrix chart section -->
      <CompoundExportChartSelection :datasetIds="datasetIds"
                                    v-bind="config"
                                    :groups="groups"
                                    :texts="textsChart"
                                    :getItems="getCompounds"
                                    v-show="currentTab === 'matrix'"/>
      <!-- Compound data table section -->
      <CompoundDataTable :getData="getCompoundData" :getIds="getCompoundDataIds" :downloadTable="downloadCompoundTableData" v-show="currentTab === 'table'" />
      <!-- Export section -->
      <ExportDownloadSelection :datasetIds="datasetIds"
                               v-bind="config"
                               :groups="groups"
                               :texts="textsExport"
                               :getItems="getCompounds"
                               v-show="currentTab === 'export'" />
    </template>
    <h2 v-else>{{ $t('headingNoData') }}</h2>
  </div>
</template>

<script>
import BoxplotSelection from '@/components/export/BoxplotSelection'
import CompoundDataTable from '@/components/tables/CompoundDataTable'
import CompoundExportChartSelection from '@/components/export/CompoundExportChartSelection'
import DatasetOverview from '@/components/export/DatasetOverview'
import ExportDownloadSelection from '@/components/export/ExportDownloadSelection'
import { EventBus } from '@/plugins/event-bus.js'
import compoundApi from '@/mixins/api/compound.js'
import datasetApi from '@/mixins/api/dataset.js'
import groupApi from '@/mixins/api/group.js'
import miscApi from '@/mixins/api/misc.js'
import colorMixin from '@/mixins/colors.js'

export default {
  props: [ 'datasetIds' ],
  data: function () {
    return {
      datasets: null,
      compounds: null,
      groups: null,
      config: {
        idKey: 'compoundId',
        nameKey: 'compoundName',
        downloadKey: 'compound',
        itemType: 'germplasm',
        xType: 'compounds',
        groupType: 'germinatebase',
        datasetType: 'compound'
      },
      textsChart: {
        boxplotTitle: 'pageCompoundExportCompoundBoxplotTitle',
        boxplotText: 'pageCompoundExportCompoundBoxplotText',
        exportTitle: 'pageCompoundExportSelectCompoundTitle',
        exportText: 'pageCompoundExportSelectCompoundChartText',
        groupTitle: 'pageCompoundExportSelectGroupTitle',
        groupText: 'pageCompoundExportSelectGroupChartText',
        groupTooltip: 'pageExportSelectGroupTooltip',
        exportButton: 'buttonPlot'
      },
      textsExport: {
        exportTitle: 'pageCompoundExportSelectCompoundTitle',
        exportText: 'pageCompoundExportSelectCompoundExportText',
        groupTitle: 'pageCompoundExportSelectGroupTitle',
        groupText: 'pageCompoundExportSelectGroupExportText',
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
    markedGermplasm: function () {
      this.updateGroups()
    }
  },
  components: {
    BoxplotSelection,
    CompoundDataTable,
    CompoundExportChartSelection,
    DatasetOverview,
    ExportDownloadSelection
  },
  mixins: [ datasetApi, compoundApi, groupApi, miscApi, colorMixin ],
  methods: {
    updateGroups: function () {
      const request = {
        datasetIds: this.datasetIds,
        groupType: 'germinatebase',
        datasetType: 'compound'
      }
      // Get groups
      this.apiPostDatasetGroups(request, result => {
        this.groups = result
      })
    },
    getCompounds: function (callback) {
      callback(this.compounds)
    },
    downloadCompoundTableData: function (data, callback) {
      return this.apiPostTableExport(data, 'dataset/data/compound', callback)
    },
    getCompoundData: function (data, callback) {
      data.datasetIds = this.datasetIds
      return this.apiPostCompoundDataTable(data, callback)
    },
    getCompoundDataIds: function (data, callback) {
      data.datasetIds = this.datasetIds
      return this.apiPostCompoundDataTableIds(data, callback)
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
      this.$nextTick(() => this.$router.push({ name: 'export', params: { datasetType: 'compounds' } }))
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
          values: ['compound']
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
    this.apiPostDatasetCompounds(this.datasetIds, result => {
      this.compounds = result

      this.getDatasets()
      this.updateGroups()
      EventBus.$emit('show-loading', false)
    })
  }
}
</script>

<style>
.compound-tabs *:hover {
  text-decoration: none;
}
.compound-tabs .card-footer i.mdi {
  vertical-align: sub;
}
.compound-tabs .card,
.compound-tabs .card * {
  transition: filter 0.15s;
}
</style>
