<template>
  <div>
    <div v-if="trait">
      <h1>{{ trait.traitName }} <small v-if="trait.unitName">{{ trait.unitName }}</small></h1>
      <p v-if="trait.traitDescription">{{ trait.traitDescription }}</p>

      <template v-if="trait.synonyms">
        <h2>{{ $t('genericSynonyms') }}</h2>
        <ul>
          <li v-for="(synonym, index) in trait.synonyms" :key="`trait-synonyms-${index}`">{{ synonym }}</li>
        </ul>
      </template>

      <h2>{{ $t('pageTraitDetailsDataTitle') }}</h2>
      <p>{{ $t('pageTraitDetailsDataText') }}</p>
      <TrialsDataTable :getData="getData" :getIds="getIds" :filterOn="tableFilter" ref="traitDetailsTable" />

      <h2>{{ $t('pageTraitDetailsStatsTitle') }}</h2>
      <p>{{ $t('pageTraitDetailsStatsText') }}</p>
      <BoxplotChart chartMode="datasetByItem" :xIds="[traitId]" xType="traits" ref="traitDetailsChart" />

      <div v-show="showAdditionalDatasets">
        <DatasetsWithUnacceptedLicense experimentType="trials" v-on:license-accepted="update" v-on:data-changed="checkNumbers"/>
      </div>
    </div>
    <h3 v-else>Trait not found</h3>
  </div>
</template>

<script>
import DatasetsWithUnacceptedLicense from '@/components/util/DatasetsWithUnacceptedLicense'
import BoxplotChart from '@/components/charts/BoxplotChart'
import TrialsDataTable from '@/components/tables/TrialsDataTable'
import traitApi from '@/mixins/api/trait.js'

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
    BoxplotChart,
    TrialsDataTable
  },
  methods: {
    checkNumbers: function (requestData, data) {
      this.showAdditionalDatasets = data && data.count > 0
    },
    getData: function (data, callback) {
      return this.apiPostTrialsDataTable(data, callback)
    },
    getIds: function (data, callback) {
      return this.apiPostTrialsDataTableIds(data, callback)
    },
    update: function () {
      this.$refs.traitDetailsTable.refresh()
      this.$refs.traitDetailsChart.redraw()
    }
  },
  mixins: [ traitApi ],
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
