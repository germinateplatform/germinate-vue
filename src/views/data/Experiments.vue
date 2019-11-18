<template>
  <div v-if="experiment">
    <h1>Experiment details <small>{{ experiment.name }}</small></h1>
    <DatasetTable :getData="getData" :filterOn="getFilter()" />
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'

export default {
  data: function () {
    return {
      experimentId: null,
      experiment: null
    }
  },
  components: {
    DatasetTable
  },
  methods: {
    getData: function (query, callback) {
      return this.apiPostDatasetTable(query, callback)
    },
    getFilter: function () {
      return [{
        column: {
          name: 'experimentId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
        values: [this.experimentId],
        canChange: false
      }]
    }
  },
  mounted: function () {
    const id = this.$route.params.experimentId

    if (id) {
      this.experimentId = parseInt(id)
    }

    if (this.experimentId) {
      const query = {
        page: 1,
        limit: 1,
        filter: [{
          column: 'experimentId',
          comparator: 'equals',
          operator: 'and',
          values: [this.experimentId]
        }]
      }
      this.apiPostExperimentTable(query, result => {
        if (result && result.data && result.data.length > 0) {
          this.experiment = result.data[0]
        }
      })
    }
  }
}
</script>

<style>

</style>
