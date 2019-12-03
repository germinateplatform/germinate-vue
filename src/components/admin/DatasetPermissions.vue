<template>
  <div>
    <DatasetTable :getData="getDatasets" :filterOn="getFilter()" :clickHandler="d => { dataset = d }" ref="datasetTable" />

    <div v-if="dataset" class="mt-3">
      <hr />
      <h2>{{ dataset.datasetName }}</h2>
      <DatasetUserPermissions :dataset="dataset" v-if="dataset" v-on:permissions-changed="$refs.datasetTable.refresh()" class="mt-3" ref="userPermissions"/>
      <hr />
      <DatasetGroupPermissions :dataset="dataset" v-if="dataset" v-on:permissions-changed="$refs.datasetTable.refresh()" class="mt-3" ref="groupPermissions" />
    </div>
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
import DatasetGroupPermissions from '@/components/admin/DatasetGroupPermissions'
import DatasetUserPermissions from '@/components/admin/DatasetUserPermissions'

export default {
  data: function () {
    return {
      dataset: null
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
      return this.apiPostDatasetTable(query, callback)
    },
    getFilter: function () {
      return [{
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
  }
}
</script>

<style>

</style>
