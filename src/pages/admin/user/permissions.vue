<template>
  <v-container fluid>
    <PageHeaderBreadcrumbs :items="[$t('pageUserPermissionsTitle')]" :icon="mdiAccountKey" />
    <v-divider class="mb-3" />

    <p>{{ $t('pageUserPermissionsText') }}</p>

    <v-tabs grow color="primary" v-model="activeTab">
      <v-tab value="groups" variant="tonal" :prepend-icon="mdiAccountGroup" :text="$t('pageUserPermissionsTabUserGroups')" />
      <v-tab value="datasets" variant="tonal" :prepend-icon="mdiDatabaseLock" :text="$t('pageUserPermissionsTabDatasetPermissions')" />
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item value="groups">
        <v-sheet class="py-2">
          <UserPermissions />
        </v-sheet>
      </v-tabs-window-item>
      <v-tabs-window-item value="datasets">
        <v-sheet class="py-2">
          <DatasetPermissions />
        </v-sheet>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>

<route lang="yaml">
name: userPermissions
</route>

<script setup lang="ts">
  import { mdiAccountGroup, mdiAccountKey, mdiDatabaseLock } from '@mdi/js'

  const activeTab = ref<'groups' | 'datasets'>('groups')
</script>
