<template>
  <div>
    <div v-if="trait">
      <h1>{{ trait.traitName }} <small v-if="trait.unitName">{{ trait.unitName }}</small></h1>
      <p v-if="trait.traitDescription">{{ trait.traitDescription }}</p>

      <ImageGallery :getImages="getImages" :downloadImages="downloadImages" :downloadName="trait.traitName" v-on:tag-clicked="onImageTagClicked" ref="imageGallery"/>

      <hr/>

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
      <DatasetTable :getData="getDatasetData" />

      <div v-show="showAdditionalDatasets">
        <DatasetsWithUnacceptedLicense datasetType="trials" v-on:license-accepted="update" v-on:data-changed="checkNumbers"/>
      </div>
    </div>
    <h3 v-else>{{ $t('headingNoData') }}</h3>
  </div>
</template>

<script>
import DatasetsWithUnacceptedLicense from '@/components/util/DatasetsWithUnacceptedLicense'
import DatasetTable from '@/components/tables/DatasetTable'
import BoxplotChart from '@/components/charts/BoxplotChart'
import ImageGallery from '@/components/images/ImageGallery'
import TrialsDataTable from '@/components/tables/TrialsDataTable'
import miscApi from '@/mixins/api/misc.js'
import traitApi from '@/mixins/api/trait.js'

export default {
  data: function () {
    return {
      traitId: null,
      trait: null,
      tableFilter: null,
      showAdditionalDatasets: true,
      imageTag: null
    }
  },
  components: {
    DatasetsWithUnacceptedLicense,
    DatasetTable,
    BoxplotChart,
    ImageGallery,
    TrialsDataTable
  },
  methods: {
    getDatasetData: function (data, callback) {
      return this.apiPostTraitDatasetTable(this.traitId, data, callback)
    },
    onImageTagClicked: function (tag) {
      this.imageTag = tag
      this.$nextTick(() => this.$refs.imageGallery.refresh())
    },
    getImages: function (data, onSuccess, onError) {
      data.filter = [{
        column: 'imageForeignId',
        comparator: 'equals',
        operator: 'and',
        values: [this.traitId]
      }, {
        column: 'imageRefTable',
        comparator: 'equals',
        operator: 'and',
        values: ['phenotypes']
      }]

      if (this.imageTag) {
        data.filter.push({
          column: 'tags',
          comparator: 'contains',
          operator: 'and',
          values: [this.imageTag.tagName]
        })
      }

      this.apiPostImages(data, onSuccess, onError)
    },
    downloadImages: function (callback) {
      const data = {
        filter: [{
          column: 'imageForeignId',
          comparator: 'equals',
          operator: 'and',
          values: [this.traitId]
        }, {
          column: 'imageRefTable',
          comparator: 'equals',
          operator: 'and',
          values: ['phenotypes']
        }]
      }

      if (this.imageTag) {
        data.filter.push({
          column: 'tags',
          comparator: 'contains',
          operator: 'and',
          values: [this.imageTag.tagName]
        })
      }

      this.apiPostImagesExport(data, callback)
    },
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
  mixins: [ miscApi, traitApi ],
  mounted: function () {
    if (this.$route.params.traitId) {
      this.traitId = parseInt(this.$route.params.traitId)

      this.tableFilter = [{
        column: {
          name: 'traitId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
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
