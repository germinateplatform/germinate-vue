<template>
  <CollaboratorTable :getData="getData" />
</template>

<script>
import CollaboratorTable from '@/components/tables/CollaboratorTable'
import { apiPostDatasetCollaboratorsTable } from '@/mixins/api/dataset.js'

export default {
  props: {
    dataset: {
      type: Object,
      default: null
    }
  },
  components: {
    CollaboratorTable
  },
  methods: {
    getData: function (data, callback) {
      return apiPostDatasetCollaboratorsTable(this.dataset.datasetId, data, callback)
    }
  }
}
</script>

<style>

</style>
