<template>
  <div>
    <h1>{{ $t('pageDatasetsTitle') }}</h1>
    <hr />
    <h2>{{ $t('pageDatasetsInternalTitle') }}</h2>
    <p>{{ $t('pageDatasetsInternalText') }}</p>
    <!-- Internal datasets -->
    <DatasetTable :getData="getData" :filterOn="filterOn[1]"/>
    <h2>{{ $t('pageDatasetsExternalTitle') }}</h2>
    <p>{{ $t('pageDatasetsExternalText') }}</p>
    <!-- External datasets -->
    <DatasetTable :getData="getData" :filterOn="filterOn[0]"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import DatasetTable from '@/components/tables/DatasetTable'
import { apiPostDatasetTable } from '@/mixins/api/dataset.js'

export default {
  data: function () {
    return {
      datasetId: null
    }
  },
  components: {
    DatasetTable
  },
  computed: {
    ...mapGetters([
      'storeSelectedProjects'
    ]),
    filterOn: function () {
      const isExternal = [1, 0]

      return isExternal.map(ie => {
        const filter = []

        if (this.datasetId) {
          filter.push({
            column: {
              name: 'datasetId',
              type: Number
            },
            comparator: 'equals',
            operator: 'and',
            values: [this.datasetId],
            canBeChanged: true
          })
        }

        if (this.storeSelectedProjects && this.storeSelectedProjects.length > 0) {
          filter.push({
            column: {
              name: 'projectId',
              type: Number
            },
            comparator: 'inSet',
            operator: 'and',
            values: this.storeSelectedProjects,
            canBeChanged: false
          })
        }

        filter.push({
          column: {
            name: 'isExternal',
            type: Boolean
          },
          comparator: 'equals',
          operator: 'and',
          values: [ie],
          canBeChanged: false
        })

        return filter
      })
    }
  },
  methods: {
    getData: function (data, callback) {
      return apiPostDatasetTable(data, callback)
    }
  },
  beforeMount: function () {
    if (this.$route.params && this.$route.params.datasetId) {
      this.datasetId = +(this.$route.params.datasetId)
    }
  }
}
</script>

<style>
</style>
