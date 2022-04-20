<template>
  <div>
    <!-- Shows all user groups -->
    <UserGroupTable :getData="getUserGroups"
                    :tableActions="userGroupActions"
                    :hideDefaultActions="false"
                    v-on:delete-group-clicked="deleteGroup"
                    v-on:edit-group-clicked="editGroup"
                    v-on:group-selected="selectGroup"
                    ref="userGroupTable" />

    <!-- If a group is selected, show the group members -->
    <UserGroupMembers :group="selectedGroup" v-if="selectedGroup" v-on:groups-changed="updateTable" class="mt-3" ref="userGroupMembers" />

    <!-- Modal to create a new user group -->
    <b-modal id="add-user-group"
             :title="$t('modalTitleAddUserGroup')"
             ref="newGroupModal"
             :ok-title="newGroup.userGroupId ? $t('buttonUpdate') : $t('buttonCreate')"
             :cancel-title="$t('buttonCancel')"
             ok-variant="success"
             @ok="createNewGroup">
      <b-form @submit.stop.prevent="createNewGroup">
        <b-form-group
          :label="$t('formLabelUserGroupName')"
          label-for="group-name">
          <b-form-input
            id="group-name"
            v-model="newGroup.userGroupName"
            type="email"
            autofocus
            required
            :placeholder="$t('formLabelUserGroupName')" />
        </b-form-group>
        <b-form-group
          :label="$t('formLabelUserGroupDescription')"
          label-for="group-description">
          <b-form-input
            id="group-description"
            v-model="newGroup.userGroupDescription"
            type="email"
            required
            :placeholder="$t('formLabelUserGroupDescription')" />
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import UserGroupTable from '@/components/tables/UserGroupTable'
import UserGroupMembers from '@/components/admin/UserGroupMembers'
import usergroupApi from '@/mixins/api/usergroup.js'
import { mdiPlusBox } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      newGroup: {
        userGroupName: null,
        userGroupDescription: null
      },
      selectedGroup: null,
      userGroupActions: [
        {
          id: 0,
          text: this.$t('tooltipCreateNewGroup'),
          variant: null,
          disabled: () => false,
          path: mdiPlusBox,
          callback: () => {
            this.newGroup = {
              userGroupName: null,
              userGroupDescription: null
            }
            this.$refs.newGroupModal.show()
          }
        }
      ]
    }
  },
  components: {
    UserGroupMembers,
    UserGroupTable
  },
  mixins: [usergroupApi],
  methods: {
    selectGroup: function (group) {
      this.selectedGroup = group
      this.updateTable()
    },
    editGroup: function (group) {
      this.newGroup = group
      this.$refs.newGroupModal.show()
    },
    updateTable: function () {
      this.$nextTick(() => {
        this.$refs.userGroupMembers.refresh()
        this.$refs.userGroupTable.refresh()
        this.$emit('groups-changed')
      })
    },
    getUserGroups: function (query, callback) {
      return this.apiPostUserGroupTable(query, callback)
    },
    deleteGroup: function (group) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okTitle: this.$t('buttonDelete'),
        okVariant: 'danger',
        cancelTitle: this.$t('buttonCancel')
      })
        .then(value => {
          if (value === true) {
            emitter.emit('show-loading', true)
            this.apiDeleteUserGroup(group.userGroupId, () => {
              this.$refs.userGroupTable.refresh()
              emitter.emit('show-loading', false)

              if (this.selectedGroup && this.selectedGroup.userGroupId === group.userGroupId) {
                this.selectedGroup = null
              }

              this.$emit('groups-changed')
            })
          }
        })
    },
    createNewGroup: function () {
      emitter.emit('show-loading', true)
      const payload = {
        id: this.newGroup.userGroupId,
        name: this.newGroup.userGroupName,
        description: this.newGroup.userGroupDescription
      }

      if (payload.id) {
        this.apiPatchUserGroup(payload, () => {
          this.newGroup = {
            userGroupName: null,
            userGroupDescription: null
          }
          this.$refs.userGroupTable.refresh()
          emitter.emit('show-loading', false)
          this.$emit('groups-changed')
        })
      } else {
        this.apiPutUserGroup(payload, () => {
          this.newGroup = {
            userGroupName: null,
            userGroupDescription: null
          }
          this.$refs.userGroupTable.refresh()
          emitter.emit('show-loading', false)
          this.$emit('groups-changed')
        })
      }
    }
  }
}
</script>

<style>

</style>
