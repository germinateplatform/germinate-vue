<template>
  <div>
    <div v-if="climate">
      <h1>{{ climate.climateName }} <small v-if="climate.unitName">{{ climate.unitName }}</small></h1>
      <p v-if="climate.climateDescription">{{ climate.climateDescription }}</p>

      <h2>{{ $t('pageClimateDetailsDataTitle') }}</h2>
      <p>{{ $t('pageClimateDetailsDataText') }}</p>
      <ClimateDataTable :getData="getData" :getIds="getIds" :filterOn="tableFilter" ref="climateDetailsTable" />

      <h2>{{ $t('pageClimateDetailsStatsTitle') }}</h2>
      <p>{{ $t('pageClimateDetailsStatsText') }}</p>
      <BoxplotChart chartMode="datasetByItem" :xIds="[climateId]" xType="climates" ref="climateDetailsChart" />

      <div v-show="showAdditionalDatasets">
        <DatasetsWithUnacceptedLicense datasetType="climate" v-on:license-accepted="update" v-on:data-changed="checkNumbers"/>
      </div>
    </div>
    <h3 v-else>{{ $t('headingNoData') }}</h3>
  </div>
</template>

<script>
import DatasetsWithUnacceptedLicense from '@/components/util/DatasetsWithUnacceptedLicense'
import BoxplotChart from '@/components/charts/BoxplotChart'
import ClimateDataTable from '@/components/tables/ClimateDataTable'
import miscApi from '@/mixins/api/misc.js'
import climateApi from '@/mixins/api/climate.js'

export default {
  data: function () {
    return {
      climateId: null,
      climate: null,
      tableFilter: null,
      showAdditionalDatasets: true
    }
  },
  components: {
    DatasetsWithUnacceptedLicense,
    BoxplotChart,
    ClimateDataTable
  },
  methods: {
    checkNumbers: function (requestData, data) {
      this.showAdditionalDatasets = data && data.count > 0
    },
    getData: function (data, callback) {
      return this.apiPostClimateDataTable(data, callback)
    },
    getIds: function (data, callback) {
      return this.apiPostClimateDataTableIds(data, callback)
    },
    update: function () {
      this.$refs.climateDetailsTable.refresh()
      this.$refs.climateDetailsChart.redraw()
    }
  },
  mixins: [ miscApi, climateApi ],
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

      var request = {
        page: 1,
        limit: 1,
        filter: [{
          column: 'climateId',
          comparator: 'equals',
          operator: 'and',
          values: [this.climateId]
        }]
      }
      this.apiPostClimateTable(request, result => {
        if (result && result.data && result.data.length > 0) {
          this.climate = result.data[0]
        }
      })
    }
  }
}
</script>

<style>

</style>
