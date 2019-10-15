<template>
  <div>
    <h1>{{ $t('pageGenotypesExportTitle') }}</h1>
    <template v-if="datasets && datasets.length > 0">
      <h2>{{ $t('widgetSelectedDatasetsTitle') }}</h2>
      <ul>
        <li v-for="dataset in datasets" :key="`dataset-list-${dataset.datasetId}`">{{ dataset.datasetId + ' - ' + dataset.datasetName }}</li>
      </ul>
      <GenotypeExportSelection :datasetIds="datasetIds" />
    </template>
  </div>
</template>

<script>
import GenotypeExportSelection from '@/components/export/GenotypeExportSelection'

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
  mounted: function () {
    const request = {
      page: 1,
      limit: this.JAVA_MAX_INTEGER,
      filter: [{
        column: 'experimentType',
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
.trials-tabs *:hover {
  text-decoration: none;
}
.trials-tabs .card-footer i.mdi {
  vertical-align: sub;
}
</style>
