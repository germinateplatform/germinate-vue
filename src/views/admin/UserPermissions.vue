<template>
  <div>
    <h1>{{ $t('pageUserPermissionsTitle') }}</h1>
    <hr />
    <p>{{ $t('pageUserPermissionsText') }}</p>
    <b-card no-body>
      <!-- Tabs -->
      <b-tabs card
              active-nav-item-class="text-primary"
              v-model="tabIndex">
        <b-tab active>
          <template v-slot:title>
            <MdiIcon :path="mdiAccountGroup" /> {{ $t('pageUserPermissionsTabUserGroups') }}
          </template>
          <p>{{ $t('pageUserPermissionsUserGroupsText') }}</p>
          <!-- User groups -->
          <UserGroups v-on:groups-changed="$refs.datasetPermissions.refresh()"/>
        </b-tab>
        <b-tab title="Tab 2">
          <template v-slot:title>
            <MdiIcon :path="mdiDatabaseLock" /> {{ $t('pageUserPermissionsTabDatasetPermissions') }}
          </template>
          <p>{{ $t('pageUserPermissionsDatasetsText') }}</p>
          <!-- Dataset permissions -->
          <DatasetPermissions ref="datasetPermissions" />
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import DatasetPermissions from '@/components/admin/DatasetPermissions'
import UserGroups from '@/components/admin/UserGroups'

import { mdiAccountGroup, mdiDatabaseLock } from '@mdi/js'

export default {
  data: function () {
    return {
      mdiAccountGroup,
      mdiDatabaseLock,
      tabIndex: 0
    }
  },
  components: {
    DatasetPermissions,
    MdiIcon,
    UserGroups
  }
}
</script>

<style>
.permission-tabs .tab-content .tab-pane {
  padding: 0;
}
</style>
