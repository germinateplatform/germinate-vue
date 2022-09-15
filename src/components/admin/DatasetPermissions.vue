<template>
  <div>
    <DatasetTable :getData="getDatasets" :filterOn="filter" :clickHandler="d => { dataset = d }" ref="datasetTable" />

    <div v-if="dataset" class="mt-3">
      <hr />
      <h2>{{ dataset.datasetName }}</h2>
      <!-- Shows the specific user permissions for this dataset -->
      <DatasetUserPermissions :dataset="dataset" v-if="dataset" v-on:permissions-changed="$refs.datasetTable.refresh()" class="mt-3" ref="userPermissions"/>
      <hr />
      <!-- Shows the user group permissions for this dataset -->
      <DatasetGroupPermissions :dataset="dataset" v-if="dataset" v-on:permissions-changed="$refs.datasetTable.refresh()" class="mt-3" ref="groupPermissions" />
    </div>
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
import DatasetGroupPermissions from '@/components/admin/DatasetGroupPermissions'
import DatasetUserPermissions from '@/components/admin/DatasetUserPermissions'
import { apiPostDatasetTable } from '@/mixins/api/dataset.js'

export default {
  data: function () {
    return {
      dataset: null,
      filter: [{
        column: {
          name: 'isExternal',
          type: Boolean
        },
        comparator: 'equals',
        operator: 'and',
        values: [0],
        canBeChanged: false
      }]
    }
  },
  components: {
    DatasetTable,
    DatasetGroupPermissions,
    DatasetUserPermissions
  },
  methods: {
    refresh: function () {
      if (this.$refs.groupPermissions) {
        this.$refs.groupPermissions.refresh()
      }
      if (this.$refs.userPermissions) {
        this.$refs.userPermissions.refresh()
      }
    },
    getDatasets: function (query, callback) {
      return apiPostDatasetTable(query, callback)
    }
  }
}
</script>

<style>

</style>
