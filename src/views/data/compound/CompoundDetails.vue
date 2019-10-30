<template>
  <div>
    <div v-if="compound">
      <h1>{{ compound.compoundName }}</h1>

      <h2>{{ $t('pageCompoundDetailsDataTitle') }}</h2>
      <p>{{ $t('pageCompoundDetailsDataText') }}</p>
      <CompoundDataTable :getData="getData" :getIds="getIds" :filterOn="tableFilter" ref="compoundDetailsTable"/>

      <h2>{{ $t('pageCompoundDetailsStatsTitle') }}</h2>
      <p>{{ $t('pageCompoundDetailsStatsText') }}</p>
      <BoxplotChart chartMode="datasetByItem" :xIds="[compoundId]" itemType="compounds" ref="compoundDetailsChart" />

      <div v-show="showAdditionalDatasets">
        <DatasetsWithUnacceptedLicense experimentType="compound" v-on:license-accepted="update" v-on:data-changed="checkNumbers"/>
      </div>
    </div>
    <h3 v-else>Compound not found</h3>
  </div>
</template>

<script>
import BoxplotChart from '@/components/charts/BoxplotChart'
import CompoundDataTable from '@/components/tables/CompoundDataTable'
import DatasetsWithUnacceptedLicense from '@/components/util/DatasetsWithUnacceptedLicense'

export default {
  data: function () {
    return {
      compoundId: null,
      compound: null,
      tableFilter: null,
      showAdditionalDatasets: true
    }
  },
  components: {
    BoxplotChart,
    CompoundDataTable,
    DatasetsWithUnacceptedLicense
  },
  methods: {
    checkNumbers: function (requestData, data) {
      this.showAdditionalDatasets = data && data.count > 0
    },
    getData: function (data, callback) {
      return this.apiPostCompoundDataTable(data, callback)
    },
    getIds: function (data, callback) {
      return this.apiPostCompoundDataTableIds(data, callback)
    },
    update: function () {
      this.$refs.compoundDetailsTable.refresh()
      this.$refs.compoundDetailsChart.redraw()
    }
  },
  mounted: function () {
    if (this.$route.params.compoundId) {
      this.compoundId = parseInt(this.$route.params.compoundId)

      this.tableFilter = [{
        column: {
          name: 'compoundId',
          type: Number
        },
        comparator: 'equals',
        operator: 'or',
        values: [this.compoundId],
        canBeChanged: false
      }]

      var request = {
        page: 1,
        limit: 1,
        filter: [{
          column: 'compoundId',
          comparator: 'equals',
          operator: 'and',
          values: [this.compoundId]
        }]
      }
      this.apiPostCompoundTable(request, result => {
        if (result && result.data && result.data.length > 0) {
          this.compound = result.data[0]
        }
      })
    }
  }
}
</script>

<style>

</style>
