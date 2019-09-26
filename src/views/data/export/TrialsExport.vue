<template>
  <div>
    <h1>{{ $t('pageTrialsExportTitle') }}</h1>
    <template v-if="datasets">
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
      <TraitOverviewStats :datasetIds="datasetIds" v-show="currentTab === 'overview'" />
      <TraitGermplasmSelection :datasetIds="datasetIds" v-show="currentTab === 'matrix'"/>
      <TrialsDataTable :getData="getTrialsData" :getIds="getTrialsDataIds" v-show="currentTab === 'table'" />
    </template>
    <h2 v-else>{{ $t('headingNoData') }}</h2>
  </div>
</template>

<script>
import TraitGermplasmSelection from '@/components/export/TraitGermplasmSelection'
import TrialsDataTable from '@/components/tables/TrialsDataTable'
import TraitOverviewStats from '@/components/export/TraitOverviewStats'

export default {
  props: [ 'datasetIds' ],
  data: function () {
    return {
      datasets: null,
      currentTab: null,
      tabs: [{
        key: 'overview',
        text: () => 'Data overview',
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
    TraitGermplasmSelection,
    TrialsDataTable,
    TraitOverviewStats
  },
  methods: {
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

      if (this.currentTab === 'matrix') {
      }
    },
    getColor: function (index) {
      if (!this.serverSettings || !this.serverSettings.colorsTemplate) {
        return '#00acef'
      } else {
        const colors = this.serverSettings.colorsTemplate
        return colors[index % colors.length]
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
      this.datasets = result.data
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
