<template>
  <div>
    <UserGroupTable :getData="getUserGroups" :tableActions="userGroupActions" v-on:delete-group-clicked="deleteGroup" ref="userGroupTable" />

    <b-modal id="add-user-group" :title="$t('modalTitleAddUserGroup')" ref="newGroupModal" :ok-title="$t('buttonCreate')" :cancel-title="$t('buttonCancel')" ok-variant="success" @ok="createNewGroup">
      <b-form @submit.stop.prevent="createNewGroup">
        <b-form-group
          :label="$t('formLabelUserGroupName')"
          label-for="group-name">
          <b-form-input
            id="group-name"
            v-model="newGroup.name"
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
            v-model="newGroup.description"
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
import { EventBus } from '@/plugins/event-bus.js'

export default {
  data: function () {
    return {
      newGroup: {
        name: null,
        description: null,
        userGroup: null
      },
      userGroupActions: [
        {
          id: 0,
          text: this.$t('tooltipCreateNewGroup'),
          variant: null,
          disabled: () => false,
          icon: 'mdi mdi-18px mdi-plus-box',
          callback: (selectedIds) => {
            this.$refs.newGroupModal.show()
          }
        }
      ]
    }
  },
  components: {
    UserGroupTable
  },
  methods: {
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
            EventBus.$emit('show-loading', true)
            this.apiDeleteUserGroup(group.userGroupId, result => {
              this.$refs.userGroupTable.refresh()
              EventBus.$emit('show-loading', false)

              if (this.userGroup && this.userGroup.userGroupId === group.userGroupId) {
                this.userGroup = null
              }
            })
          }
        })
    },
    createNewGroup: function (event) {
      EventBus.$emit('show-loading', true)
      this.apiPutUserGroup(this.newGroup, result => {
        this.newGroup.name = null
        this.newGroup.description = null
        this.$refs.userGroupTable.refresh()
        EventBus.$emit('show-loading', false)
      })
    }
  }
}
</script>

<style>

</style>
