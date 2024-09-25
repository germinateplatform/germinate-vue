<template>
  <div>
    <h1>{{ $t('pageExperimentsTitle') }}</h1>
    <hr />
    <p>{{ $t('pageExperimentsText') }}</p>
    <ExperimentTable :getData="getData" :filterOn="filterOn" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ExperimentTable from '@/components/tables/ExperimentTable'
import { apiPostExperimentTable } from '@/mixins/api/dataset.js'

export default {
  components: {
    ExperimentTable
  },
  computed: {
    ...mapGetters([
      'storeSelectedProjects'
    ]),
    filterOn: function () {
      if (this.storeSelectedProjects && this.storeSelectedProjects.length > 0) {
        return [{
          column: {
            name: 'projectId',
            type: Number
          },
          comparator: 'inSet',
          operator: 'and',
          values: this.storeSelectedProjects,
          canBeChanged: false
        }]
      } else {
        return null
      }
    }
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
