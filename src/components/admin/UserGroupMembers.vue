<template>
  <div v-if="group">
    <h2>{{ $t('pageUserPermissionsGroupMembersTitle') }} <small> - {{ group.userGroupName }}</small></h2>
    <b-row>
      <b-col sm=6>
        <h3>{{ $t('pageUserPermissionsGroupMembersCurrentTitle') }}</h3>
        <p>{{ $t('pageUserPermissionsGroupMembersCurrentText') }}</p>
        <!-- Shows the users that are currently part of the selected user group -->
        <UserTable :users="usersForGroup" :isAdd="false" v-on:action-clicked="(ids) => patchGroup(ids, false)" ref="usersForGroupTable" />
      </b-col>
      <b-col sm=6>
        <h3>{{ $t('pageUserPermissionsGroupMembersNewTitle') }}<small> - {{ $t('pageUserPermissionsTableSearchHint') }}</small></h3>
        <p>{{ $t('pageUserPermissionsGroupMembersNewText') }}</p>
        <!-- Shows all users -->
        <UserTable :users="users" :isAdd="true" v-on:action-clicked="(ids) => patchGroup(ids, true)" ref="usersTable" />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import UserTable from '@/components/tables/UserTable'
import usergroupApi from '@/mixins/api/usergroup.js'

export default {
  props: {
    group: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      users: [],
      usersForGroup: []
    }
  },
  components: {
    UserTable
  },
  mixins: [ usergroupApi ],
  methods: {
    refresh: function () {
      this.getData()
    },
    patchGroup: function (ids, isAdd) {
      const request = {
        userGroupId: this.group.userGroupId,
        isAddOperation: isAdd,
        userIds: ids
      }
      this.apiPatchUserGroupMembers(request, result => {
        this.getData()
        this.$emit('groups-changed')
      })
    },
    getData: function () {
      this.apiGetUsers(null, result => {
        this.users = result
      })
      this.apiGetUsers({ userGroupId: this.group.userGroupId }, result => {
        this.usersForGroup = result
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
