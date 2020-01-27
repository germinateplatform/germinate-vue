<template>
  <div>
    <div v-if="compound">
      <h1>{{ compound.compoundName }} <small v-if="compound.unitName">{{ compound.unitName }}</small></h1>
      <p v-if="compound.compoundDescription">{{ compound.compoundDescription }}</p>

      <ImageGallery :getImages="getImages" :downloadImages="downloadImages" :downloadName="compound.compoundName" />

      <hr/>

      <template v-if="compound.synonyms">
        <h2>{{ $t('genericSynonyms') }}</h2>
        <ul>
          <li v-for="(synonym, index) in compound.synonyms" :key="`compound-synonyms-${index}`">{{ synonym }}</li>
        </ul>
      </template>

      <h2>{{ $t('pageCompoundDetailsDataTitle') }}</h2>
      <p>{{ $t('pageCompoundDetailsDataText') }}</p>
      <CompoundDataTable :getData="getData" :getIds="getIds" :filterOn="tableFilter" ref="compoundDetailsTable"/>

      <h2>{{ $t('pageCompoundDetailsStatsTitle') }}</h2>
      <p>{{ $t('pageCompoundDetailsStatsText') }}</p>
      <BoxplotChart chartMode="datasetByItem" :xIds="[compoundId]" xType="compounds" ref="compoundDetailsChart" />

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
import ImageGallery from '@/components/images/ImageGallery'
import miscApi from '@/mixins/api/misc.js'
import compoundApi from '@/mixins/api/compound.js'

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
    DatasetsWithUnacceptedLicense,
    ImageGallery
  },
  mixins: [ compoundApi, miscApi ],
  methods: {
    getImages: function (data, onSuccess, onError) {
      data.filter = [{
        column: 'imageForeignId',
        comparator: 'equals',
        operator: 'and',
        values: [this.compoundId]
      }, {
        column: 'imageRefTable',
        comparator: 'equals',
        operator: 'and',
        values: ['compounds']
      }]
      this.apiPostImages(data, onSuccess, onError)
    },
    downloadImages: function (callback) {
      const data = {
        filter: [{
          column: 'imageForeignId',
          comparator: 'equals',
          operator: 'and',
          values: [this.compoundId]
        }, {
          column: 'imageRefTable',
          comparator: 'equals',
          operator: 'and',
          values: ['compounds']
        }]
      }

      this.apiPostImagesExport(data, callback)
    },
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
