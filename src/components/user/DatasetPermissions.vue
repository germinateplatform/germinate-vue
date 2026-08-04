<template>
  <div>
    <p>{{ $t('pageUserPermissionsDatasetsText') }}</p>

    <DatasetTable
      :get-data="getDatasets"
      :filter-on="datasetFilter"
      :selection-type="TableSelectionType.single"
      ref="datasetTable"
      @selection-changed="setDatasetSelection"
    />

    <v-row v-if="selectedDatasets && selectedDatasets.length > 0" class="mt-5">
      <v-col cols="12" md="8">
        <v-card
          :title="$t('pageUserPermissionsUserPermissionsCurrentTitle')"
        >
          <template #subtitle>
            <span class="text-wrap">{{ $t('pageUserPermissionsUserPermissionsCurrentText') }}</span>
          </template>

          <UserTable
            :get-data="getUsers"
            :get-ids="getUserIds"
            :selection-type="TableSelectionType.all"
            @selection-changed="setUserSelection"
            ref="userTable"
          >
            <template #footer>
              <v-btn @click="deleteUserPermissions" :disabled="selectedUsersToDelete.length === 0" :text="$t('buttonRemoveUserAccess')" :prepend-icon="mdiDelete" color="error" variant="tonal" />
            </template>
          </UserTable>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card :title="$t('pageUserPermissionsUserPermissionsNewTitle')">
          <template #subtitle>
            <span class="text-wrap">{{ $t('pageUserPermissionsUserPermissionsNewText') }}</span>
          </template>
          <template #text>
            <v-autocomplete
              v-model="selectedNewUsers"
              :items="usersWithoutCurrentAccess"
              :label="$t('buttonAddUserAccess')"
              multiple
              clearable
              return-object
              item-value="id"
              :prepend-inner-icon="mdiAccountPlus"
              :item-title="item => `${item.username} · ${item.fullName} · ${userTypes[item.userType].text}`"
              autocomplete="off"
            >
              <template #selection="{ internalItem: item, index }">
                <v-chip size="small" v-if="index < 5" :text="item.raw.fullName || item.raw.username" />

                <span v-if="index === 5" class="text-grey text-body-small align-self-center">(+{{ (selectedNewUsers || []).length - 5 }} others)</span>
              </template>

              <template #append>
                <v-btn :disabled="selectedNewUsers.length === 0" :icon="mdiPlus" v-tooltip:top="$t('buttonAddUserAccess')" @click="addUserPermissions" />
              </template>
            </v-autocomplete>
          </template>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card
          :title="$t('pageUserPermissionsGroupPermissionsCurrentTitle')"
        >
          <template #subtitle>
            <span class="text-wrap">{{ $t('pageUserPermissionsGroupPermissionsCurrentText') }}</span>
          </template>

          <UserGroupTable
            :get-data="getUserGroups"
            :get-ids="getUserGroupIds"
            :selection-type="TableSelectionType.all"
            @selection-changed="setUserGroupSelection"
            :can-create-new="false"
            :can-edit="false"
            ref="userGroupTable"
          >
            <template #footer>
              <v-btn @click="deleteUserGroupPermissions" :disabled="selectedUserGroupsToDelete.length === 0" :text="$t('buttonRemoveGroupAccess')" :prepend-icon="mdiDelete" color="error" variant="tonal" />
            </template>
          </UserGroupTable>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card :title="$t('pageUserPermissionsGroupPermissionsNewTitle')">
          <template #subtitle>
            <span class="text-wrap">{{ $t('pageUserPermissionsGroupPermissionsNewText') }}</span>
          </template>
          <template #text>
            <v-autocomplete
              v-model="selectedNewUserGroups"
              :items="userGroupsWithoutCurrentAccess"
              :label="$t('buttonAddGroupAccess')"
              multiple
              clearable
              return-object
              item-value="id"
              :prepend-inner-icon="mdiAccountMultiplePlus"
              :item-title="item => `${item.userGroupName} · ${item.userGroupDescription}`"
              autocomplete="off"
            >
              <template #selection="{ internalItem: item, index }">
                <v-chip size="small" v-if="index < 5" :text="item.raw.userGroupName" />

                <span v-if="index === 5" class="text-grey text-body-small align-self-center">(+{{ (selectedNewUserGroups || []).length - 5 }} others)</span>
              </template>

              <template #append>
                <v-btn :disabled="selectedNewUserGroups.length === 0" :icon="mdiPlus" v-tooltip:top="$t('buttonAddGroupAccess')" @click="addUserGroupPermissions" />
              </template>
            </v-autocomplete>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostDatasetTable } from '@/plugins/api/dataset'
  import { apiGetUsers, apiPatchDatasetUserGroups, apiPatchDatasetUserMembers, apiPostDatasetUserGroupTable, apiPostDatasetUsergroupTableIds, apiPostUsergroupTable } from '@/plugins/api/usergroup'
  import { FilterComparator, FilterOperator, type ViewTableUsergroups, type FilterGroup, type PaginatedRequest, type PaginatedResult, type ViewUserDetailsType } from '@/plugins/types/germinate'
  import { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import { userTypes } from '@/plugins/util/types'
  import { mdiAccountMultiplePlus, mdiAccountPlus, mdiDelete, mdiPlus } from '@mdi/js'
  import type { AxiosResponse } from 'axios'

  const selectedDatasets = ref<number[]>([])
  const datasetTable = useTemplateRef('datasetTable')
  const userTable = useTemplateRef('userTable')
  const userGroupTable = useTemplateRef('userGroupTable')

  const allUsers = ref<ViewUserDetailsType[]>([])
  const tableUsers = ref<ViewUserDetailsType[]>([])
  const selectedNewUsers = ref<ViewUserDetailsType[]>([])
  const selectedUsersToDelete = ref<number[]>([])

  const allGroups = ref<ViewTableUsergroups[]>([])
  const tableGroups = ref<ViewTableUsergroups[]>([])
  const selectedUserGroupsToDelete = ref<number[]>([])
  const selectedNewUserGroups = ref<ViewTableUsergroups[]>([])

  function setDatasetSelection (selectedIds: number[]) {
    selectedDatasets.value = selectedIds
  }

  function setUserSelection (selectedIds: number[]) {
    selectedUsersToDelete.value = selectedIds
  }

  function setUserGroupSelection (selectedIds: number[]) {
    selectedUserGroupsToDelete.value = selectedIds
  }

  function getUsers () {
    return new Promise<AxiosResponse<PaginatedResult<ViewUserDetailsType[]>>>(resolve => {
      apiGetUsers('dataset', selectedDatasets.value[0] || -1, result => {
        tableUsers.value = result

        const response: Partial<AxiosResponse<PaginatedResult<ViewUserDetailsType[]>>> = {
          data: {
            data: result,
            count: result.length,
          },
        }
        resolve(response as AxiosResponse<PaginatedResult<ViewUserDetailsType[]>>)
      })
    })
  }

  function getUserIds () {
    return new Promise<AxiosResponse<PaginatedResult<number[]>>>(resolve => {
      const response: Partial<AxiosResponse<PaginatedResult<number[]>>> = {
        data: {
          data: tableUsers.value.map(tu => tu.id),
          count: tableUsers.value.length,
        },
      }
      resolve(response as AxiosResponse<PaginatedResult<number[]>>)
    })
  }

  function getUserGroups (query: PaginatedRequest) {
    const copy = JSON.parse(JSON.stringify(query))
    copy.page = 1
    copy.limit = MAX_JAVA_INTEGER
    apiPostDatasetUserGroupTable(copy, selectedDatasets.value[0], result => {
      tableGroups.value = result.data
    })

    return apiPostDatasetUserGroupTable(query, selectedDatasets.value[0])
  }

  function getUserGroupIds (query: PaginatedRequest) {
    return apiPostDatasetUsergroupTableIds(query, selectedDatasets.value[0])
  }

  function deleteUserGroupPermissions () {
    const request = {
      datasetId: selectedDatasets.value[0],
      addOperation: false,
      groupIds: selectedUserGroupsToDelete.value,
    }
    apiPatchDatasetUserGroups(request, () => {
      userGroupTable.value?.refresh()
    })
  }

  function addUserGroupPermissions () {
    const request = {
      datasetId: selectedDatasets.value[0],
      addOperation: true,
      groupIds: selectedNewUserGroups.value.map(ug => ug.userGroupId || -1),
    }
    apiPatchDatasetUserGroups(request, () => {
      selectedNewUserGroups.value = []
      userGroupTable.value?.refresh()
    })
  }

  function deleteUserPermissions () {
    if (!selectedDatasets.value || selectedUsersToDelete.value.length === 0) {
      return
    }

    const request = {
      datasetId: selectedDatasets.value[0],
      addOperation: false,
      userIds: selectedUsersToDelete.value,
    }

    apiPatchDatasetUserMembers(request, () => {
      userTable.value?.refresh()
    })
  }

  function addUserPermissions () {
    if (!selectedDatasets.value || selectedNewUsers.value.length === 0) {
      return
    }

    const request = {
      datasetId: selectedDatasets.value[0],
      addOperation: true,
      userIds: selectedNewUsers.value.map(u => u.id),
    }

    apiPatchDatasetUserMembers(request, () => {
      selectedNewUsers.value = []
      userTable.value?.refresh()
    })
  }

  const usersWithoutCurrentAccess = computed(() => {
    if (allUsers.value) {
      // We have information on all users
      if (tableUsers.value && tableUsers.value.length > 0) {
        // We have information on users with current access. Only return those that currently don't have access
        const ids = new Set<number>(tableUsers.value.map(u => u.id))
        return allUsers.value.filter(u => !ids.has(u.id))
      } else {
        // Return all users
        return allUsers.value
      }
    } else {
      // No information available
      return []
    }
  })

  const userGroupsWithoutCurrentAccess = computed(() => {
    if (allGroups.value) {
      // We have information on all groups
      if (tableGroups.value && tableGroups.value.length > 0) {
        // We have information on groups with current access. Only return those that currently don't have access
        const ids = new Set<number>(tableGroups.value.map(u => u.userGroupId || -1))
        return allGroups.value.filter(u => !ids.has(u.userGroupId || -1))
      } else {
        // Return all groups
        return allGroups.value
      }
    } else {
      // No information available
      return []
    }
  })

  const datasetFilter: ComputedRef<FilterGroup[]> = computed(() => {
    return [{
      operator: FilterOperator.and,
      filters: [{
        column: 'isExternal',
        comparator: FilterComparator.equals,
        values: ['0'],
        canBeChanged: false,
      }],
    }]
  })

  function getDatasets (query: PaginatedRequest) {
    return apiPostDatasetTable(query)
  }

  watch(selectedDatasets, async () => {
    userTable.value?.refresh()
    userGroupTable.value?.refresh()
  })

  onMounted(() => {
    apiGetUsers('user', undefined, result => {
      allUsers.value = result
    })
    apiPostUsergroupTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
    }, result => {
      allGroups.value = result.data
    })
  })
</script>
