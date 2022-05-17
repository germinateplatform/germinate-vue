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
      <b-row class="climate-tabs mb-3" v-if="tabs">
        <!-- Left padding if there are 5 tabs, because 5 doesn't work well with 12 columns -->
        <b-col class="d-none d-xl-block" sm=1 v-if="tabs.length === 5"/>
        <b-col cols=12 sm=6 :xl="tabs.length === 5 ? 2 : 3" v-for="(tab, index) in tabs" :key="'climate-tabs-' + tab.key">
          <b-card no-body :style="`border: 1px solid ${getColor(index)}; filter: ${getFilter(index)};`">
            <b-card-body :style="`background-color: ${getColor(index)}; color: white;`">
              <b-row>
                <b-col cols=12 class="text-center">
                  <MdiIcon :size="48" :path="tab.path" />
                </b-col>
              </b-row>
              <span class="help" v-b-tooltip="tab.help()" v-if="tab.help">
                <MdiIcon :path="mdiHelpCircle" />
              </span>
            </b-card-body>
            <b-card-footer :style="`color: ${getColor(index)}`">
              <a href="#" @click.prevent="tab.onSelection" class="stretched-link"><MdiIcon :path="mdiArrowRightBoldCircle" /><span> {{ tab.text() }}</span></a>
            </b-card-footer>
          </b-card>
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
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import BoxplotSelection from '@/components/export/BoxplotSelection'
import ClimateDataTable from '@/components/tables/ClimateDataTable'
import ClimateExportChartSelection from '@/components/export/ClimateExportChartSelection'
import LocationMap from '@/components/map/LocationMap'
import DatasetOverview from '@/components/export/DatasetOverview'
import ExportDownloadSelection from '@/components/export/ExportDownloadSelection'
import climateApi from '@/mixins/api/climate.js'
import datasetApi from '@/mixins/api/dataset.js'
import groupApi from '@/mixins/api/group.js'
import miscApi from '@/mixins/api/misc.js'
import colorMixin from '@/mixins/colors.js'

import { mdiArrowRightBoldCircle, mdiFileDownloadOutline, mdiEye, mdiHelpCircle, mdiGrid, mdiMapPlus, mdiTableSearch } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      mdiArrowRightBoldCircle,
      mdiHelpCircle,
      datasetIds: [],
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
      overlayTab: {
        key: 'overlays',
        text: () => this.$t('pageDataExportTabClimateOverlays'),
        path: mdiMapPlus,
        onSelection: () => this.tabSelected('overlays'),
        help: () => this.$t('pageDataExportTabHelpClimateOverlays')
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeServerSettings',
      'storeToken',
      'storeMarkedLocations'
    ])
  },
  watch: {
    storeMarkedLocations: function () {
      this.updateGroups()
    }
  },
  components: {
    BoxplotSelection,
    ClimateDataTable,
    ClimateExportChartSelection,
    LocationMap,
    DatasetOverview,
    ExportDownloadSelection,
    MdiIcon
  },
  mixins: [climateApi, datasetApi, groupApi, miscApi, colorMixin],
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
    tabSelected: function (tab, trigger = true) {
      this.currentTab = tab

      if (this.currentTab === 'overlays') {
        this.$nextTick(() => this.$refs.overlayMap.invalidateSize())
      }

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
      if (!this.storeServerSettings || !this.storeServerSettings.colorsTemplate) {
        return '#00acef'
      } else {
        const colors = this.storeServerSettings.colorsTemplate
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
  created: function () {
    const dsIds = this.$route.params.datasetIds || ''

    this.datasetIds = dsIds === '' ? [] : dsIds.split(',').map(Number)
  },
  mounted: function () {
    emitter.emit('show-loading', true)
    this.apiPostDatasetClimates(this.datasetIds, result => {
      this.climates = result

      const hasOverlays = result.filter(c => c.overlays > 0).length > 0

      if (hasOverlays) {
        this.tabs.push(this.overlayTab)
      }

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
.climate-tabs .card .card-footer a {
  color: inherit;
}
.climate-tabs .card .help {
  position: absolute;
  top: 0.5em;
  right: 1em;
  z-index: 2;
}
</style>
