<template>
  <div>
    <div v-if="compound !== null">
      <template v-if="compound === undefined">
        <div class="text-center">
          <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
        </div>
      </template>
      <template v-else>
        <h1>{{ compound.compoundName }} <small v-if="compound.unitName">{{ compound.unitName }}</small></h1>
        <p v-if="compound.compoundDescription">{{ compound.compoundDescription }}</p>

        <!-- Images, e.g. chemical structure -->
        <ImageGallery :foreignId="compound.compoundId" :downloadName="compound.compoundName" referenceTable="compounds" />

        <hr/>

        <!-- Synonyms -->
        <template v-if="compound.synonyms">
          <h2>{{ $t('genericSynonyms') }}</h2>
          <ul>
            <li v-for="(synonym, index) in compound.synonyms" :key="`compound-synonyms-${index}`">{{ synonym }}</li>
          </ul>
        </template>

        <h2>{{ $t('pageCompoundDetailsDataTitle') }}</h2>
        <p>{{ $t('pageCompoundDetailsDataText') }}</p>
        <!-- Compound data table -->
        <CompoundDataTable :getData="getData" :getIds="getIds" :filterOn="tableFilter" ref="compoundDetailsTable"/>

        <h2>{{ $t('pageCompoundDetailsStatsTitle') }}</h2>
        <p>{{ $t('pageCompoundDetailsStatsText') }}</p>
        <!-- Box plot for this compound -->
        <BoxplotChart chartMode="datasetByItem" :xIds="[compoundId]" xType="compounds" ref="compoundDetailsChart" />
        <!-- Table showing datasets containing this compound -->
        <DatasetTable :getData="getDatasetData" ref="datasetTable" />

        <div v-show="showAdditionalDatasets">
          <!-- Any other datasets containing data for this compound, where the license hasn't been accepted yet -->
          <DatasetsWithUnacceptedLicense datasetType="compound" v-on:data-changed="checkNumbers"/>
        </div>
      </template>
    </div>
    <h3 v-else>{{ $t('headingNoData') }}</h3>
  </div>
</template>

<script>
import BoxplotChart from '@/components/charts/BoxplotChart'
import CompoundDataTable from '@/components/tables/CompoundDataTable'
import DatasetTable from '@/components/tables/DatasetTable'
import DatasetsWithUnacceptedLicense from '@/components/util/DatasetsWithUnacceptedLicense'
import ImageGallery from '@/components/images/ImageGallery'
import miscApi from '@/mixins/api/misc.js'
import compoundApi from '@/mixins/api/compound.js'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      compoundId: null,
      compound: undefined,
      tableFilter: null,
      showAdditionalDatasets: true
    }
  },
  components: {
    BoxplotChart,
    CompoundDataTable,
    DatasetTable,
    DatasetsWithUnacceptedLicense,
    ImageGallery
  },
  mixins: [compoundApi, miscApi],
  methods: {
    getDatasetData: function (data, callback) {
      return this.apiPostCompoundDatasetTable(this.compoundId, data, callback)
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
      this.$refs.datasetTable.refresh()

      this.checkNumbers()
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
        operator: 'and',
        values: [this.compoundId],
        canBeChanged: false
      }]

      const request = {
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
        } else {
          this.compound = null
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
