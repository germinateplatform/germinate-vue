<template>
  <div>
    <h1>{{ $t('pageTrialsExportTitle') }}</h1>
    <template v-if="datasets && datasets.length > 0">
      <h2>{{ $t('widgetSelectedDatasetsTitle') }}</h2>
      <ul>
        <li v-for="dataset in datasets" :key="`dataset-list-${dataset.datasetId}`">{{ dataset.datasetId + ' - ' + dataset.datasetName }}</li>
      </ul>
      <b-row class="trials-tabs" v-if="tabs">
        <b-col cols=12 sm=6 xl=3 v-for="(tab, index) in tabs" :key="'trials-tabs-' + tab.key">
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
      <TraitBoxplotSelection :datasetIds="datasetIds" v-show="currentTab === 'overview'" />
      <TraitExportChartSelection :datasetIds="datasetIds" v-show="currentTab === 'matrix'"/>
      <TrialsDataTable :getData="getTrialsData" :getIds="getTrialsDataIds" :downloadTable="downloadTrialsData" v-show="currentTab === 'table'" />
      <TraitExportDownloadSelection :datasetIds="datasetIds" v-show="currentTab === 'export'" />
    </template>
    <h2 v-else>{{ $t('headingNoData') }}</h2>
  </div>
</template>

<script>
import TraitBoxplotSelection from '@/components/export/trials/TraitBoxplotSelection'
import TraitExportChartSelection from '@/components/export/trials/TraitExportChartSelection'
import TraitExportDownloadSelection from '@/components/export/trials/TraitExportDownloadSelection'
import TrialsDataTable from '@/components/tables/TrialsDataTable'

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
    TraitBoxplotSelection,
    TraitExportDownloadSelection,
    TraitExportChartSelection,
    TrialsDataTable
  },
  methods: {
    downloadTrialsData: function (data, callback) {
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
      this.$nextTick(() => this.$router.push({ name: 'export', params: { experimentType: 'trials' } }))
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
.trials-tabs *:hover {
  text-decoration: none;
}
.trials-tabs .card-footer i.mdi {
  vertical-align: sub;
}
</style>
