<template>
  <div v-if="dataset">
    <h2>User permissions</h2>
    <b-row>
      <b-col sm=6>
        <h3>Current user permissions</h3>
        <UserTable :users="usersForDataset" :isAdd="false" v-on:action-clicked="(ids) => patchUserPermission(ids, false)" />
      </b-col>
      <b-col sm=6>
        <h3>Search for items<small> - Use the table filter or just browse the table</small></h3>
        <UserTable :users="users" :isAdd="true" v-on:action-clicked="(ids) => patchUserPermission(ids, true)" />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import UserTable from '@/components/tables/UserTable'

export default {
  props: {
    dataset: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      users: [],
      usersForDataset: []
    }
  },
  components: {
    UserTable
  },
  watch: {
    dataset: function (newValue, oldValue) {
      this.getData()
    }
  },
  methods: {
    refresh: function () {
      this.getData()
    },
    patchUserPermission: function (ids, isAdd) {
      const request = {
        datasetId: this.dataset.datasetId,
        isAddOperation: isAdd,
        userIds: ids
      }
      this.apiPatchDatasetUserMembers(request, result => {
        this.getData()
        this.$emit('permissions-changed')
      })
    },
    getData: function () {
      this.apiGetUsers(null, result => {
        this.users = result
      })
      this.apiGetUsers({ datasetId: this.dataset.datasetId }, result => {
        this.usersForDataset = result
      })
    }
  },
  mounted: function () {
    this.getData()
  }
}
</script>

<style>

</style>
