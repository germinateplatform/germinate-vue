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
      <b-row class="compound-tabs mb-3" v-if="tabs">
        <b-col cols=12 sm=6 xl=3 v-for="(tab, index) in tabs" :key="'compound-tabs-' + tab.key">
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
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import BoxplotSelection from '@/components/export/BoxplotSelection'
import CompoundDataTable from '@/components/tables/CompoundDataTable'
import CompoundExportChartSelection from '@/components/export/CompoundExportChartSelection'
import DatasetOverview from '@/components/export/DatasetOverview'
import ExportDownloadSelection from '@/components/export/ExportDownloadSelection'
import { apiPostDatasetCompounds, apiPostCompoundDataTable, apiPostCompoundDataTableIds } from '@/mixins/api/compound.js'
import { apiPostDatasetTable } from '@/mixins/api/dataset.js'
import { apiPostDatasetGroups } from '@/mixins/api/group.js'
import { apiPostTableExport } from '@/mixins/api/misc.js'
import { getTemplateColor, hexToRgb, rgbColorToHex, brighten } from '@/mixins/colors.js'

import { mdiArrowRightBoldCircle, mdiFileDownloadOutline, mdiHelpCircle, mdiEye, mdiGrid, mdiTableSearch } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      mdiArrowRightBoldCircle,
      mdiHelpCircle,
      datasetIds: [],
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
      }]
    }
  },
  watch: {
    storeMarkedGermplasm: function () {
      this.updateGroups()
    }
  },
  components: {
    BoxplotSelection,
    CompoundDataTable,
    CompoundExportChartSelection,
    DatasetOverview,
    ExportDownloadSelection,
    MdiIcon
  },
  computed: {
    ...mapGetters([
      'storeServerSettings',
      'storeToken',
      'storeMarkedGermplasm'
    ])
  },
  methods: {
    getTemplateColor,
    updateGroups: function () {
      const request = {
        datasetIds: this.datasetIds,
        groupType: 'germinatebase',
        datasetType: 'compound'
      }
      // Get groups
      apiPostDatasetGroups(request, result => {
        this.groups = result
      })
    },
    getCompounds: function (callback) {
      callback(this.compounds)
    },
    downloadCompoundTableData: function (data, callback) {
      return apiPostTableExport(data, 'dataset/data/compound', callback)
    },
    getCompoundData: function (data, callback) {
      data.datasetIds = this.datasetIds
      return apiPostCompoundDataTable(data, callback)
    },
    getCompoundDataIds: function (data, callback) {
      data.datasetIds = this.datasetIds
      return apiPostCompoundDataTableIds(data, callback)
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
      this.$nextTick(() => this.$router.push({ name: 'export', params: { datasetType: 'compounds' } }))
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
    apiPostDatasetCompounds(this.datasetIds, result => {
      this.compounds = result

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
.compound-tabs .card .card-footer a {
  color: inherit;
}
.compound-tabs .card .help {
  position: absolute;
  top: 0.5em;
  right: 1em;
  z-index: 2;
}
</style>
