<template>
  <div>
    <h1>{{ $t('pageCompoundExportTitle') }}</h1>
    <template v-if="datasets && datasets.length > 0">
      <h2>{{ $t('widgetSelectedDatasetsTitle') }}</h2>
      <ul>
        <li v-for="dataset in datasets" :key="`dataset-list-${dataset.datasetId}`">{{ dataset.datasetId + ' - ' + dataset.datasetName }}</li>
      </ul>
      <b-row class="compound-tabs" v-if="tabs">
        <b-col cols=12 sm=6 xl=3 v-for="(tab, index) in tabs" :key="'compound-tabs-' + tab.key">
          <a href="#" @click.prevent="tab.onSelection">
            <b-card no-body :style="`border: 1px solid ${getColor(index)}`">
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
      <div v-show="currentTab === 'overview'">
        <h2>{{ $t('pageCompoundExportCompoundBoxplotTitle') }}</h2>
        <p>{{ $t('pageCompoundExportCompoundBoxplotText') }}</p>
        <BoxplotChart :datasetIds="datasetIds" itemType="compounds" />
      </div>
      <CompoundExportChartSelection :datasetIds="datasetIds" v-show="currentTab === 'matrix'"/>
      <CompoundDataTable :getData="getCompoundData" :getIds="getCompoundDataIds" v-show="currentTab === 'table'" />
      <CompoundExportDownloadSelection :datasetIds="datasetIds" v-show="currentTab === 'export'" />
    </template>
    <h2 v-else>{{ $t('headingNoData') }}</h2>
  </div>
</template>

<script>
import CompoundDataTable from '@/components/tables/CompoundDataTable'
import CompoundExportChartSelection from '@/components/export/CompoundExportChartSelection'
import CompoundExportDownloadSelection from '@/components/export/CompoundExportDownloadSelection'
import BoxplotChart from '@/components/charts/BoxplotChart'

export default {
  props: [ 'datasetIds' ],
  data: function () {
    return {
      datasets: null,
      currentTab: null,
      tabs: [{
        key: 'overview',
        text: () => 'Data statistics',
        icon: 'mdi-eye',
        onSelection: () => this.tabSelected('overview')
      }, {
        key: 'matrix',
        text: () => 'Data matrix',
        icon: 'mdi-grid',
        onSelection: () => this.tabSelected('matrix')
      }, {
        key: 'table',
        text: () => 'Data table',
        icon: 'mdi-table-search',
        onSelection: () => this.tabSelected('table')
      }, {
        key: 'export',
        text: () => 'Data export',
        icon: 'mdi-file-download-outline',
        onSelection: () => this.tabSelected('export')
      }]
    }
  },
  components: {
    CompoundDataTable,
    CompoundExportChartSelection,
    CompoundExportDownloadSelection,
    BoxplotChart
  },
  methods: {
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
      this.$nextTick(() => this.$router.push({ name: 'export', params: { experimentType: 'compounds' } }))
    },
    isAccepted: function (dataset) {
      if (this.token) {
        return dataset.acceptedBy && dataset.acceptedBy.indexOf(this.token.id) !== -1
      } else {
        return dataset.acceptedBy && dataset.acceptedBy.indexOf(-1000) !== -1
      }
    }
  },
  mounted: function () {
    const request = {
      page: 1,
      limit: this.JAVA_MAX_INTEGER,
      filter: [{
        column: 'experimentType',
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
}
</script>

<style>
.compound-tabs *:hover {
  text-decoration: none;
}
.compound-tabs .card-footer i.mdi {
  vertical-align: sub;
}
</style>
