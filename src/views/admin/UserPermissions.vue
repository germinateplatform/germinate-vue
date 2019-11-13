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
          <UserGroups />
        </b-tab>
        <b-tab title="Tab 2">
          <template v-slot:title>
            <i class="mdi mdi-18px mdi-database-lock" /> Dataset permissions
          </template>
          <DatasetPermissions />
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import DatasetPermissions from '@/components/admin/DatasetPermissions'
import UserGroups from '@/components/admin/UserGroups'

export default {
  data: function () {
    return {
      tabIndex: 0
    }
  },
  components: {
    DatasetPermissions,
    UserGroups
  }
}
</script>

<style>
.permission-tabs .tab-content .tab-pane {
  padding: 0;
}
</style>
