<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableGroups} -->
  <BaseTable
    ref="baseTable"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :show-details="false"
    item-key="groupId"
    table-key="groups"
    header-icon="mdi-group"
    :header-title="$t('pageGroupsTitle')"
    v-bind="$attrs"
  >
    <template #header v-if="store.storeUserIsAuthenticated">
      <v-btn variant="outlined" :text="$t('buttonAddGroup')" prepend-icon="mdi-plus" @click="addItem" />
    </template>

    <template #item.groupId="{ item }">
      <router-link :to="Pages.getPath(Pages.groupDetails, item.groupId)">{{ item.groupId }}</router-link>
    </template>
    <template #item.groupName="{ item }">
      <router-link :to="Pages.getPath(Pages.groupDetails, item.groupId)">{{ item.groupName }}</router-link>
    </template>

    <template #item.groupType="{ item }">
      <v-chip label :color="groupTypes[item.groupType].color()" :prepend-icon="groupTypes[item.groupType].path">{{ groupTypes[item.groupType].text() }}</v-chip>
    </template>

    <template #item.groupActions="{ item }">
      <template v-if="store.storeUserIsAdmin || (item.userId === store.storeToken?.id)">
        <v-icon class="mx-1" color="info" icon="mdi-pencil" @click="editItem(item)" />
        <v-icon class="mx-1" color="error" icon="mdi-delete" @click="deleteItem(item)" />
      </template>
    </template>

    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>
  </BaseTable>

  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableGroups} -->
  <GenericAddEditFormModal
    title="modalTitleEditGroup"
    :item="selectedGroup"
    :notify="onSendGroup"
    :fields="groupFields"
    @items-changed="baseTable?.refresh()"
    ref="groupModal"
    v-if="selectedGroup"
  />
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import type { Grouptypes, FilterGroup, PaginatedRequest, PaginatedResult, ViewTableGroups } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { groupTypes } from '@/plugins/util/types'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'
  import { apiDeleteGroup, apiGetGroupTypes, apiPatchGroup, apiPutGroup } from '@/plugins/api/group'
  import { Pages } from '@/plugins/pages'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableGroups[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
  }>()

  const store = coreStore()
  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()
  const selectedGroup = ref<ViewTableGroups>()
  const localGroupTypes = ref<Grouptypes[]>([])
  const groupModal = useTemplateRef('groupModal')

  const groupFields = computed(() => {
    return [{
      key: 'groupTypeId',
      title: 'formLabelGroupType',
      hint: selectedGroup.value?.groupId ? 'formDescriptionGroupTypeDisabled' : 'formDescriptionGroupType',
      type: 'select' as const,
      required: true,
      width: 2,
      disabled: selectedGroup.value?.groupId !== undefined,
      selectOptions: localGroupTypes.value?.map(gt => {
        return {
          value: gt.id,
          title: groupTypes[gt.targetTable].text(),
        }
      }),
    }, {
      key: 'groupName',
      title: 'formLabelGroupName',
      hint: 'formDescriptionGroupName',
      type: 'text' as const,
      required: true,
      width: 2,
      valid: (value: string) => value !== undefined && value !== null && value.trim().length > 0,
    }, {
      key: 'groupDescription',
      title: 'formLabelGroupDescription',
      hint: 'formDescriptionGroupDescription',
      type: 'textarea' as const,
      required: false,
      width: 2,
    }]
  })

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers: ExtendedDataTableHeader[] = [{
      key: 'projectIds',
      dataType: 'json',
      sortable: false,
      visibleInTable: false,
      title: t('tableColumnProjectId'),
    }, {
      key: 'groupId',
      title: t('tableColumnGroupId'),
      dataType: 'integer',
    }, {
      key: 'groupName',
      title: t('tableColumnGroupName'),
      dataType: 'string',
    }, {
      key: 'groupDescription',
      title: t('tableColumnGroupDescription'),
      dataType: 'string',
    }, {
      key: 'groupType',
      dataType: 'groupType',
      title: t('tableColumnGroupType'),
    }, {
      key: 'userId',
      dataType: 'string',
      title: t('tableColumnGroupUserId'),
    }, {
      key: 'userName',
      dataType: undefined,
      sortable: false,
      title: t('tableColumnGroupUserName'),
    }, {
      key: 'createdOn',
      dataType: 'date',
      title: t('tableColumnGroupCreatedOn'),
      value: (value: ViewTableGroups) => value.createdOn ? new Date(value.createdOn).toLocaleDateString() : undefined,
    }, {
      key: 'updatedOn',
      dataType: 'date',
      title: t('tableColumnGroupUpdatedOn'),
      value: (value: ViewTableGroups) => value.updatedOn ? new Date(value.updatedOn).toLocaleDateString() : undefined,
    }, {
      key: 'count',
      dataType: 'integer',
      align: 'end' as 'end' | 'start' | 'center',
      title: t('tableColumnGroupCount'),
      value: (item: ViewTableGroups) => getNumberWithSuffix(item.count || 0, 2),
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

  function editItem (group: ViewTableGroups) {
    selectedGroup.value = group

    nextTick(() => groupModal.value?.show())
  }

  function addItem () {
    selectedGroup.value = {}

    nextTick(() => groupModal.value?.show())
  }

  function deleteItem (group: ViewTableGroups) {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          apiDeleteGroup(group.groupId || -1, result => {
            if (result) {
              baseTable.value?.refresh()
              emitter.emit('update-sidebar-menu')
            }
          })
        }
      },
    })
  }

  function onSendGroup (item: ViewTableGroups) {
    return new Promise<boolean>(resolve => {
      if (item.groupId) {
        apiPatchGroup({
          id: item.groupId,
          grouptypeId: item.groupTypeId,
          name: item.groupName,
          description: item.groupDescription,
          visibility: item.groupVisibility,
          createdBy: item.userId,
          createdOn: item.createdOn,
          updatedOn: item.updatedOn,
        }, () => {
          resolve(true)
        })
      } else {
        apiPutGroup({
          id: item.groupId,
          grouptypeId: item.groupTypeId,
          name: item.groupName,
          description: item.groupDescription,
          visibility: item.groupVisibility,
          createdBy: store.storeToken?.id,
          createdOn: item.createdOn,
          updatedOn: item.updatedOn,
        }, () => {
          resolve(true)
        })
      }
    })
  }

  defineExpose({
    refresh: () => baseTable.value?.refresh(),
  })

  onMounted(() => {
    apiGetGroupTypes<PaginatedResult<Grouptypes[]>>(result => {
      localGroupTypes.value = result.data
    })
  })
</script>

<style scoped>
</style>
