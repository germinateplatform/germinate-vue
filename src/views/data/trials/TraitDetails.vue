<template>
  <div>
    <div v-if="trait">
      <h1>{{ trait.traitName }}</h1>

      <h2>{{ $t('pageTraitDetailsDataTitle') }}</h2>
      <p>{{ $t('pageTraitDetailsDataText') }}</p>
      <TrialsDataTable :getData="getData" :filterOn="tableFilter" ref="traitDetailsTable" />

      <h2>{{ $t('pageTraitDetailsStatsTitle') }}</h2>
      <p>{{ $t('pageTraitDetailsStatsText') }}</p>
      <TraitBoxplotChart chartMode="datasetByTrait" :traitIds="[traitId]" ref="traitDetailsChart" />

      <div v-show="showAdditionalDatasets">
        <DatasetsWithUnacceptedLicense experimentType="trials" v-on:license-accepted="update" v-on:data-changed="checkNumbers"/>
      </div>
    </div>
    <h3 v-else>Trait not found</h3>
  </div>
</template>

<script>
import DatasetsWithUnacceptedLicense from '@/components/util/DatasetsWithUnacceptedLicense'
import TraitBoxplotChart from '@/components/charts/TraitBoxplotChart'
import TrialsDataTable from '@/components/tables/TrialsDataTable'

export default {
  data: function () {
    return {
      traitId: null,
      trait: null,
      tableFilter: null,
      showAdditionalDatasets: true
    }
  },
  components: {
    DatasetsWithUnacceptedLicense,
    TraitBoxplotChart,
    TrialsDataTable
  },
  methods: {
    checkNumbers: function (requestData, data) {
      this.showAdditionalDatasets = data && data.count > 0
    },
    getData: function (data, callback) {
      return this.apiPostTraitDataTable(this.traitId, data, callback)
    },
    update: function () {
      this.$refs.traitDetailsTable.refresh()
      this.$refs.traitDetailsChart.redraw()
    }
  },
  mounted: function () {
    if (this.$route.params.traitId) {
      this.traitId = parseInt(this.$route.params.traitId)

      this.tableFilter = [{
        column: {
          name: 'traitId',
          type: Number
        },
        comparator: 'equals',
        operator: 'or',
        values: [this.traitId],
        canBeChanged: false
      }]

      var request = {
        page: 1,
        limit: 1,
        filter: [{
          column: 'traitId',
          comparator: 'equals',
          operator: 'and',
          values: [this.traitId]
        }]
      }
      this.apiPostTraitTable(request, result => {
        if (result && result.data && result.data.length > 0) {
          this.trait = result.data[0]
        }
      })
    }
  }
}
</script>

<style>

</style>
