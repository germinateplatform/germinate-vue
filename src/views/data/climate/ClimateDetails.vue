<template>
  <div>
    <div v-if="climate !== null">
      <template v-if="climate === undefined">
        <div class="text-center">
          <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
        </div>
      </template>
      <template v-else>
        <h1>{{ climate.climateName }} <small v-if="climate.unitName">{{ climate.unitName }}</small></h1>
        <p v-if="climate.climateDescription">{{ climate.climateDescription }}</p>

        <h2>{{ $t('pageClimateDetailsDataTitle') }}</h2>
        <p>{{ $t('pageClimateDetailsDataText') }}</p>
        <!-- Climate data table -->
        <ClimateDataTable :getData="getData" :getIds="getIds" :filterOn="tableFilter" ref="climateDetailsTable" />

        <h2>{{ $t('pageClimateDetailsStatsTitle') }}</h2>
        <p>{{ $t('pageClimateDetailsStatsText') }}</p>
        <!-- Box plot for this climate -->
        <ClimateBoxplotChart :climateIds="[climateId]" ref="climateDetailsChart" />
        <!-- Table showing datasets containing this climate -->
        <DatasetTable :getData="getDatasetData" ref="datasetTable" />

        <div v-show="showAdditionalDatasets">
          <!-- Any other datasets containing data for this climate, where the license hasn't been accepted yet -->
          <DatasetsWithUnacceptedLicense datasetType="climate" v-on:data-changed="checkNumbers"/>
        </div>
      </template>
    </div>
    <h3 v-else>{{ $t('headingNoData') }}</h3>
  </div>
</template>

<script>
import DatasetsWithUnacceptedLicense from '@/components/util/DatasetsWithUnacceptedLicense'
import ClimateBoxplotChart from '@/components/charts/ClimateBoxplotChart'
import ClimateDataTable from '@/components/tables/ClimateDataTable'
import DatasetTable from '@/components/tables/DatasetTable'
import { apiPostClimateTable, apiPostClimateDataTable, apiPostClimateDataTableIds, apiPostClimateDatasetTable } from '@/mixins/api/climate.js'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      climateId: null,
      climate: undefined,
      tableFilter: null,
      showAdditionalDatasets: true
    }
  },
  components: {
    DatasetTable,
    DatasetsWithUnacceptedLicense,
    ClimateBoxplotChart,
    ClimateDataTable
  },
  methods: {
    getDatasetData: function (data, callback) {
      return apiPostClimateDatasetTable(this.climateId, data, callback)
    },
    checkNumbers: function (requestData, data) {
      this.showAdditionalDatasets = data && data.count > 0
    },
    getData: function (data, callback) {
      return apiPostClimateDataTable(data, callback)
    },
    getIds: function (data, callback) {
      return apiPostClimateDataTableIds(data, callback)
    },
    update: function () {
      this.$refs.climateDetailsTable.refresh()
      this.$refs.climateDetailsChart.redraw()

      this.checkNumbers()
    }
  },
  mounted: function () {
    if (this.$route.params.climateId) {
      this.climateId = parseInt(this.$route.params.climateId)

      this.tableFilter = [{
        column: {
          name: 'climateId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
        values: [this.climateId],
        canBeChanged: false
      }]

      const request = {
        page: 1,
        limit: 1,
        filter: [{
          column: 'climateId',
          comparator: 'equals',
          operator: 'and',
          values: [this.climateId]
        }]
      }
      apiPostClimateTable(request, result => {
        if (result && result.data && result.data.length > 0) {
          this.climate = result.data[0]
        } else {
          this.climate = null
        }
      })
    }

    emitter.on('license-accepted', this.update)
  },
  beforeDestroy: function () {
    emitter.off('license-accepted', this.update)
  }
}
</script>

<style>

</style>
