<template>
  <div>
    <p>{{ $t('pageUserPermissionsUserGroupsText') }}</p>
    <UserGroupTable
      :get-data="getUserGroups"
      :get-ids="getUserGroupIds"
      :selection-type="TableSelectionType.single"
      @selection-changed="setGroupSelection"
      @group-deleted="() => { selectedGroups = [] }"
      ref="groupTable"
    />

    <v-row v-if="selectedGroups && selectedGroups.length > 0" class="mt-5">
      <v-col cols="12" md="8">
        <v-card
          :title="$t('pageUserPermissionsGroupMembersCurrentTitle')"
        >
          <template #subtitle>
            <span class="text-wrap">{{ $t('pageUserPermissionsGroupMembersCurrentText') }}</span>
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
        <v-card :title="$t('pageUserPermissionsGroupMembersNewTitle')">
          <template #subtitle>
            <span class="text-wrap">{{ $t('pageUserPermissionsGroupMembersNewText') }}</span>
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
    </v-row>
  </div>
</template>

<script setup lang="ts">
  import { apiGetUsers, apiPatchUserGroupMembers, apiPostUsergroupTable, apiPostUsergroupTableIds } from '@/plugins/api/usergroup'
  import type { PaginatedRequest, PaginatedResult, ViewUserDetailsType } from '@/plugins/types/germinate'
  import { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import { userTypes } from '@/plugins/util/types'
  import { mdiAccountPlus, mdiDelete, mdiPlus } from '@mdi/js'
  import type { AxiosResponse } from 'axios'

  const userTable = useTemplateRef('userTable')
  const groupTable = useTemplateRef('groupTable')

  const allUsers = ref<ViewUserDetailsType[]>([])
  const tableUsers = ref<ViewUserDetailsType[]>([])
  const selectedNewUsers = ref<ViewUserDetailsType[]>([])

  const selectedGroups = ref<number[]>([])
  const selectedUsersToDelete = ref<number[]>([])

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

  function setGroupSelection (selectedIds: number[]) {
    selectedGroups.value = selectedIds
  }

  function setUserSelection (selectedIds: number[]) {
    selectedUsersToDelete.value = selectedIds
  }

  function getUserGroups (query: PaginatedRequest) {
    return apiPostUsergroupTable(query)
  }

  function getUserGroupIds (query: PaginatedRequest) {
    return apiPostUsergroupTableIds(query)
  }

  function addUserPermissions () {
    if (!selectedGroups.value || selectedGroups.value.length === 0 || selectedNewUsers.value.length === 0) {
      return
    }

    const request = {
      userGroupId: selectedGroups.value[0],
      addOperation: true,
      userIds: selectedNewUsers.value.map(u => u.id),
    }

    apiPatchUserGroupMembers(request, () => {
      selectedNewUsers.value = []
      userTable.value?.refresh()
      groupTable.value?.refresh()
    })
  }

  function deleteUserPermissions () {
    if (!selectedGroups.value || selectedGroups.value.length === 0 || selectedUsersToDelete.value.length === 0) {
      return
    }

    const request = {
      userGroupId: selectedGroups.value[0],
      addOperation: false,
      userIds: selectedUsersToDelete.value,
    }

    apiPatchUserGroupMembers(request, () => {
      userTable.value?.refresh()
      groupTable.value?.refresh()
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

  function getUsers () {
    return new Promise<AxiosResponse<PaginatedResult<ViewUserDetailsType[]>>>(resolve => {
      apiGetUsers('usergroup', selectedGroups.value[0], result => {
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

  watch(selectedGroups, async () => {
    userTable.value?.refresh()
  })

  onMounted(() => {
    apiGetUsers('user', undefined, result => {
      allUsers.value = result
    })
  })
</script>
