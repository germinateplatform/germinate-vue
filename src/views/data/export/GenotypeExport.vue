<template>
  <div>
    <h1>{{ $t('pageGenotypesExportTitle') }}</h1>
    <template v-if="datasets && datasets.length > 0">
      <h2>{{ $t('widgetSelectedDatasetsTitle') }}</h2>
      <ul>
        <li v-for="dataset in datasets" :key="`dataset-list-${dataset.datasetId}`">{{ dataset.datasetId + ' - ' + dataset.datasetName }}</li>
      </ul>
      <GenotypeExportSelection :datasetIds="datasetIds" datasetType="genotype" />
    </template>
  </div>
</template>

<script>
import GenotypeExportSelection from '@/components/export/GenotypeExportSelection'
import datasetApi from '@/mixins/api/dataset.js'

export default {
  props: [ 'datasetIds' ],
  data: function () {
    return {
      datasets: null
    }
  },
  components: {
    GenotypeExportSelection
  },
  mixins: [ datasetApi ],
  methods: {
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
      this.$nextTick(() => this.$router.push({ name: 'export', params: { datasetType: 'genotype' } }))
    }
  },
  mounted: function () {
    const request = {
      page: 1,
      limit: this.JAVA_MAX_INTEGER,
      filter: [{
        column: 'datasetType',
        comparator: 'equals',
        operator: 'and',
        values: ['genotype']
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
</style>
