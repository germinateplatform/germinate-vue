<template>
  <div>
    <h1>{{ $t('pageExperimentsTitle') }}</h1>
    <hr />
    <p>{{ $t('pageExperimentsText') }}</p>
    <ExperimentTable :getData="getData" />
  </div>
</template>

<script>
import ExperimentTable from '@/components/tables/ExperimentTable'
import { apiPostExperimentTable } from '@/mixins/api/dataset.js'

export default {
  data: function () {
    return {
      filterOn: null
    }
  },
  components: {
    ExperimentTable
  },
  methods: {
    getData: function (data, callback) {
      return apiPostExperimentTable(data, callback)
    }
  }
}
</script>

<style>
</style>
