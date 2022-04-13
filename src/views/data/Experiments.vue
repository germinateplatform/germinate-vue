<template>
  <div>
    <h1>{{ $t('pageExperimentsTitle') }}</h1>
    <p>{{ $t('pageExperimentsText') }}</p>
    <ExperimentTable :getData="getData" />
  </div>
</template>

<script>
import ExperimentTable from '@/components/tables/ExperimentTable'
import datasetApi from '@/mixins/api/dataset.js'

export default {
  data: function () {
    return {
      filterOn: null
    }
  },
  components: {
    ExperimentTable
  },
  mixins: [datasetApi],
  methods: {
    getData: function (data, callback) {
      return this.apiPostExperimentTable(data, callback)
    }
  }
}
</script>

<style>
</style>
