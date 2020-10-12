<template>
  <div>
    <h1>{{ $t('pageClimateExportTitle') }}</h1>
    <div class="text-center" v-if="datasets === null">
      <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
    </div>
    <template v-else-if="datasets && datasets.length > 0">
      <hr />
      <!-- Selected datasets -->
      <DatasetOverview :datasets="datasets" />
      <!-- Banner buttons -->
      <b-row class="climate-tabs" v-if="tabs">
        <!-- Left padding if there are 5 tabs, because 5 doesn't work well with 12 columns -->
        <b-col class="d-none d-xl-block" sm=1 v-if="tabs.length === 5"/>
        <b-col cols=12 sm=6 :xl="tabs.length === 5 ? 2 : 3" v-for="(tab, index) in tabs" :key="'climate-tabs-' + tab.key">
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
        <!-- Left padding if there are 5 tabs, because 5 doesn't work well with 12 columns -->
        <b-col class="d-none d-xl-block" sm=1 v-if="tabs.length === 5"/>
      </b-row>
      <!-- Boxplot section -->
      <BoxplotSelection :datasetIds="datasetIds"
                        v-bind="config"
                        :groups="groups"
                        xType="climates"
                        datasetType="climate"
                        :texts="textsChart"
                        :getItems="getClimates"
                        v-show="currentTab === 'overview'" />
      <!-- Climate matrix chart section -->
      <ClimateExportChartSelection :datasetIds="datasetIds"
                                   v-bind="config"
                                   :groups="groups"
                                   :texts="textsChart"
                                   :getItems="getClimates"
                                   v-show="currentTab === 'matrix'"/>
      <!-- Climate data table section -->
      <ClimateDataTable :getData="getClimateData" :getIds="getClimateDataIds" :downloadTable="downloadClimateDataTable" v-show="currentTab === 'table'" />
      <!-- Export section -->
      <ExportDownloadSelection :datasetIds="datasetIds"
                               v-bind="config"
                               :groups="groups"
                               :texts="textsExport"
                               :getItems="getClimates"
                               v-show="currentTab === 'export'" />

      <LocationMap :locations="[]" v-show="currentTab === 'overlays'" ref="overlayMap" />
    </template>
    <h2 v-else>{{ $t('headingNoData') }}</h2>
  </div>
</template>

<script>
import BoxplotSelection from '@/components/export/BoxplotSelection'
import ClimateDataTable from '@/components/tables/ClimateDataTable'
import ClimateExportChartSelection from '@/components/export/ClimateExportChartSelection'
import LocationMap from '@/components/map/LocationMap'
import DatasetOverview from '@/components/export/DatasetOverview'
import ExportDownloadSelection from '@/components/export/ExportDownloadSelection'
import { EventBus } from '@/plugins/event-bus.js'
import climateApi from '@/mixins/api/climate.js'
import datasetApi from '@/mixins/api/dataset.js'
import groupApi from '@/mixins/api/group.js'
import miscApi from '@/mixins/api/misc.js'
import colorMixin from '@/mixins/colors.js'

export default {
  props: [ 'datasetIds' ],
  data: function () {
    return {
      datasets: null,
      climates: null,
      groups: null,
      config: {
        idKey: 'climateId',
        nameKey: 'climateName',
        downloadKey: 'climate',
        itemType: 'locations',
        xType: 'climates',
        groupType: 'locations',
        datasetType: 'climate'
      },
      textsChart: {
        boxplotTitle: 'pageClimateExportClimateBoxplotTitle',
        boxplotText: 'pageClimateExportClimateBoxplotText',
        exportTitle: 'pageClimateExportSelectClimateTitle',
        exportText: 'pageClimateExportSelectClimateChartText',
        groupTitle: 'pageClimateExportSelectGroupTitle',
        groupText: 'pageClimateExportSelectGroupChartText',
        groupTooltip: 'pageExportSelectGroupTooltip',
        exportButton: 'buttonPlot'
      },
      textsExport: {
        exportTitle: 'pageClimateExportSelectClimateTitle',
        exportText: 'pageClimateExportSelectClimateExportText',
        groupTitle: 'pageClimateExportSelectGroupTitle',
        groupText: 'pageClimateExportSelectGroupExportText',
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
      }],
      overlayTab: {
        key: 'overlays',
        text: () => this.$t('pageDataExportTabClimateOverlays'),
        icon: 'mdi-map-plus',
        onSelection: () => this.tabSelected('overlays')
      }
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
    ClimateDataTable,
    ClimateExportChartSelection,
    LocationMap,
    DatasetOverview,
    ExportDownloadSelection
  },
  mixins: [ climateApi, datasetApi, groupApi, miscApi, colorMixin ],
  methods: {
    updateGroups: function () {
      const request = {
        datasetIds: this.datasetIds,
        groupType: 'locations',
        datasetType: 'climate'
      }
      // Get groups
      this.apiPostDatasetGroups(request, result => {
        this.groups = result
      })
    },
    getClimates: function (callback) {
      callback(this.climates)
    },
    downloadClimateDataTable: function (data, callback) {
      return this.apiPostTableExport(data, 'dataset/data/climate', callback)
    },
    getClimateData: function (data, callback) {
      data.datasetIds = this.datasetIds
      return this.apiPostClimateDataTable(data, callback)
    },
    getClimateDataIds: function (data, callback) {
      data.datasetIds = this.datasetIds
      return this.apiPostClimateDataTableIds(data, callback)
    },
    tabSelected: function (tab) {
      this.currentTab = tab

      if (this.currentTab === 'overlays') {
        this.$nextTick(() => this.$refs.overlayMap.invalidateSize())
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
          values: ['climate']
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
    this.apiPostDatasetClimates(this.datasetIds, result => {
      this.climates = result

      const hasOverlays = result.filter(c => c.overlays > 0).length > 0

      if (hasOverlays) {
        this.tabs.push(this.overlayTab)
      }

      this.getDatasets()
      this.updateGroups()
      EventBus.$emit('show-loading', false)
    })
  }
}
</script>

<style>
.climate-tabs *:hover {
  text-decoration: none;
}
.climate-tabs .card-footer i.mdi {
  vertical-align: sub;
}
.climate-tabs .card,
.climate-tabs .card * {
  transition: filter 0.15s;
}
</style>
