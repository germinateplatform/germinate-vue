<template>
  <div v-if="group">
    <h2>Group members <small> - {{ group.userGroupName }}</small></h2>
    <b-row>
      <b-col sm=6>
        <h3>Current group members</h3>
        <UserTable :users="usersForGroup" :isAdd="false" v-on:action-clicked="(ids) => patchGroup(ids, false)" ref="usersForGroupTable" />
      </b-col>
      <b-col sm=6>
        <h3>Search for items<small> - Use the table filter or just browse the table</small></h3>
        <UserTable :users="users" :isAdd="true" v-on:action-clicked="(ids) => patchGroup(ids, true)" ref="usersTable" />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import UserTable from '@/components/tables/UserTable'

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
  methods: {
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
      this.apiGetUsers(this.group.userGroupId, result => {
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
