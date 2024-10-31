<template>
  <InstitutionDatasetTable :filterOn="filterOn" :getData="getData" />
</template>

<script>
import InstitutionDatasetTable from '@/components/tables/InstitutionDatasetTable'
import { apiPostInstitutionDatasetTable } from '@/mixins/api/misc'

export default {
  props: {
    dataset: {
      type: Object,
      default: null
    }
  },
  components: {
    InstitutionDatasetTable
  },
  computed: {
    filterOn: function () {
      if (this.dataset) {
        return [{
          column: {
            name: 'allDatasetIds',
            type: undefined
          },
          comparator: 'arrayContains',
          operator: 'and',
          values: [this.dataset.datasetId],
          canBeChanged: false
        }]
      } else {
        return null
      }
    }
  },
  methods: {
    getData: function (data, callback) {
      return apiPostInstitutionDatasetTable(data, callback)
    }
  }
}
</script>

<style>

</style>
