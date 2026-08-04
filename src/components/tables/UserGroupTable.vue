<template>
  <div>
    <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableUsergroups} -->
    <BaseTable
      ref="baseTable"
      :get-data="compProps.getData"
      :get-ids="compProps.getIds"
      :headers="headers"
      :filter-on="filterOn"
      :show-details="false"
      item-key="userGroupId"
      table-key="userGroups"
      :header-icon="mdiAccountGroup"
      :selection-type="selectionType"
      :header-title="$t('pageUserPermissionsTabUserGroups')"
      v-bind="$attrs"
    >
      <template #header v-if="canCreateNew && store.storeUserIsAuthenticated">
        <v-btn variant="outlined" :text="$t('buttonAddGroup')" :prepend-icon="mdiPlus" @click="addItem" />
      </template>

      <template #item.groupActions="{ item }">
        <template v-if="canEdit && (store.storeUserIsAdmin || (item.userId === store.storeToken?.id))">
          <v-icon class="mx-1" color="info" :icon="mdiPencil" @click="editItem(item)" />
          <v-icon class="mx-1" color="error" :icon="mdiDelete" @click="deleteItem(item)" />
        </template>
      </template>

      <!-- Pass on all named slots -->
      <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
        <slot :name="slot" v-bind="slotProps" />
      </template>
    </BaseTable>

    <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableUsergroups} -->
    <GenericAddEditFormModal
      title="modalTitleEditGroup"
      v-model="selectedGroup"
      :notify="onSendGroup"
      :fields="groupFields"
      @items-changed="baseTable?.refresh()"
      ref="groupModal"
      v-if="selectedGroup"
    />
  </div>
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTableUsergroups } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'
  import { mdiAccountGroup, mdiDelete, mdiPencil, mdiPlus } from '@mdi/js'
  import { apiDeleteUsergroup, apiPatchUsergroup, apiPutUsergroup } from '@/plugins/api/usergroup'

  const compProps = withDefaults(defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableUsergroups[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
    canCreateNew?: boolean
    canEdit?: boolean
  }>(), {
    canCreateNew: true,
    canEdit: true,
  })

  const store = coreStore()
  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()
  const selectedGroup = ref<ViewTableUsergroups>()
  const groupModal = useTemplateRef('groupModal')

  const groupFields = computed(() => {
    return [{
      key: 'userGroupName',
      title: 'formLabelUserGroupName',
      type: 'text' as const,
      required: true,
      width: 2,
      valid: (value: string) => value !== undefined && value !== null && value.trim().length > 0,
    }, {
      key: 'userGroupDescription',
      title: 'formLabelUserGroupDescription',
      type: 'textarea' as const,
      required: false,
      width: 2,
    }]
  })

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers: ExtendedDataTableHeader[] = [{
      key: 'userGroupId',
      title: t('tableColumnGroupId'),
      dataType: 'integer',
    }, {
      key: 'userGroupName',
      title: t('tableColumnGroupName'),
      dataType: 'string',
      quickSearchable: true,
    }, {
      key: 'userGroupDescription',
      title: t('tableColumnGroupDescription'),
      dataType: 'string',
      quickSearchable: true,
    }, {
      key: 'createdOn',
      dataType: 'date',
      title: t('tableColumnUserGroupCreatedOn'),
      // @ts-ignore
      value: (item: ViewTableUsergroups) => item.createdOn ? new Date(item.createdOn).toLocaleDateString() : undefined,
    }, {
      key: 'count',
      dataType: 'integer',
      align: 'end' as 'end' | 'start' | 'center',
      title: t('tableColumnUserGroupCount'),
      // @ts-ignore
      value: (item: ViewTableUsergroups) => getNumberWithSuffix(item.count || 0, 2),
    }]

    if (store.token) {
      headers.push({
        key: 'groupActions',
        title: '',
        align: 'end' as 'start' | 'end' | 'center',
        visibleInFilter: false,
        dataType: undefined,
      })
    }

    return headers
  })

  function editItem (group: ViewTableUsergroups) {
    selectedGroup.value = group

    nextTick(() => groupModal.value?.show())
  }

  function addItem () {
    selectedGroup.value = {}

    nextTick(() => groupModal.value?.show())
  }

  function deleteItem (group: ViewTableUsergroups) {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          apiDeleteUsergroup(group.userGroupId || -1, result => {
            if (result) {
              baseTable.value?.refresh()
              emit('group-deleted', group.userGroupId)
            }
          })
        }
      },
    })
  }

  function onSendGroup () {
    return new Promise<boolean>(resolve => {
      if (selectedGroup.value) {
        if (selectedGroup.value.userGroupId) {
          apiPatchUsergroup({
            id: selectedGroup.value.userGroupId,
            name: selectedGroup.value.userGroupName,
            description: selectedGroup.value.userGroupDescription,
            createdOn: selectedGroup.value.createdOn,
          }, () => {
            resolve(true)
          })
        } else {
          apiPutUsergroup({
            id: selectedGroup.value.userGroupId,
            name: selectedGroup.value.userGroupName,
            description: selectedGroup.value.userGroupDescription,
            createdOn: selectedGroup.value.createdOn,
          }, () => {
            resolve(true)
          })
        }
      } else {
        resolve(false)
      }
    })
  }

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })

  const emit = defineEmits(['group-selected', 'group-deleted'])
</script>

<style scoped>
</style>
