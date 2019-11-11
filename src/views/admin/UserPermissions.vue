<template>
  <div>
    <h1>User permissions</h1>
    <hr />
    <b-card no-body>
      <b-tabs card
              active-nav-item-class="text-primary"
              v-model="tabIndex">
        <b-tab active>
          <template v-slot:title>
            <i class="mdi mdi-18px mdi-account-group" /> User groups
          </template>
          <p>The table below shows the groups of users that are currently defined. You can add new groups, delete existing groups and add users to or remove users from groups.</p>
          <UserGroupTable :getData="getUserGroups" :tableActions="userGroupActions" />
        </b-tab>
        <b-tab title="Tab 2">
          <b-card-text>Tab Contents 2</b-card-text>
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import UserGroupTable from '@/components/tables/UserGroupTable'

export default {
  data: function () {
    return {
      tabIndex: 0,
      userGroupActions: [
        {
          id: 0,
          text: 'Add group',
          variant: null,
          disabled: () => false,
          icon: 'mdi mdi-18px mdi-plus-box',
          callback: (selectedIds) => {
            // TODO
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
    }
  }
}
</script>

<style>
.permission-tabs .tab-content .tab-pane {
  padding: 0;
}
</style>
