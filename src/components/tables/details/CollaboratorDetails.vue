<template>
  <CollaboratorTable :getData="getData" />
</template>

<script>
import CollaboratorTable from '@/components/tables/CollaboratorTable'
import { apiPostCollaboratorsTable } from '@/mixins/api/dataset.js'

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
      return apiPostCollaboratorsTable(this.dataset.datasetId, data, callback)
    }
  }
}
</script>

<style>

</style>
