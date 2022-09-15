<template>
  <div>
    <h1>{{ $t('pageGenotypesExportTitle') }}</h1>
    <div class="text-center" v-if="datasets === null">
      <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
    </div>
    <template v-else-if="datasets && datasets.length > 0">
      <!-- Selected datasets -->
      <DatasetOverview :datasets="datasets" />
      <GenotypeExportSelection :datasetIds="datasetIds" datasetType="genotype" />
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import DatasetOverview from '@/components/export/DatasetOverview'
import GenotypeExportSelection from '@/components/export/GenotypeExportSelection'
import { apiPostDatasetTable } from '@/mixins/api/dataset.js'

export default {
  data: function () {
    return {
      datasets: null,
      datasetIds: []
    }
  },
  components: {
    DatasetOverview,
    GenotypeExportSelection
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ])
  },
  methods: {
    isAccepted: function (dataset) {
      if (this.storeToken) {
        return dataset.acceptedBy && dataset.acceptedBy.indexOf(this.storeToken.id) !== -1
      } else {
        return dataset.acceptedBy && dataset.acceptedBy.indexOf(-1000) !== -1
      }
    },
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
  created: function () {
    const dsIds = this.$route.params.datasetIds || ''

    this.datasetIds = dsIds === '' ? [] : dsIds.split(',').map(Number)
  },
  mounted: function () {
    // Set up the dataset request based on the provided ids
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

    apiPostDatasetTable(request, result => {
      this.datasets = result.data.filter(d => {
        // Exclude the ones where a license exists, but hasn't been accepted
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
