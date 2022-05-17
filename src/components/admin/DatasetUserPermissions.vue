<template>
  <div v-if="dataset">
    <h2>{{ $t('pageUserPermissionsUserPermissionsTitle') }}</h2>
    <p>{{ $t('pageUserPermissionsUserPermissionsText') }}</p>
    <b-row>
      <b-col sm=6>
        <h3>{{ $t('pageUserPermissionsUserPermissionsCurrentTitle') }}</h3>
        <p>{{ $t('pageUserPermissionsUserPermissionsCurrentText') }}</p>
        <!-- Shows the specific users that currently have access to the selected dataset -->
        <UserTable :users="usersForDataset" :isAdd="false" v-on:action-clicked="(ids) => patchUserPermission(ids, false)" />
      </b-col>
      <b-col sm=6>
        <h3>{{ $t('pageUserPermissionsUserPermissionsNewTitle') }}<small> - {{ $t('pageUserPermissionsTableSearchHint') }}</small></h3>
        <p>{{ $t('pageUserPermissionsUserPermissionsNewText') }}</p>
        <!-- Shows all users -->
        <UserTable :users="users" :isAdd="true" v-on:action-clicked="(ids) => patchUserPermission(ids, true)" />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import UserTable from '@/components/tables/UserTable'
import usergroupApi from '@/mixins/api/usergroup.js'

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
    dataset: function () {
      this.getData()
    }
  },
  mixins: [usergroupApi],
  methods: {
    refresh: function () {
      this.getData()
    },
    patchUserPermission: function (ids, isAdd) {
      const request = {
        datasetId: this.dataset.datasetId,
        addOperation: isAdd,
        userIds: ids
      }
      this.apiPatchDatasetUserMembers(request, () => {
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
