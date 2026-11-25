<template>
  <div>
    <!-- @vue-generic {import('@/plugins/types/germinate').ViewUserDetails} -->
    <BaseTable
      ref="baseTable"
      :headers="headers"
      :show-details="false"
      item-key="id"
      table-key="users"
      :header-icon="mdiAccountMultiple"
      :header-title="$t('pageUsersTitle')"
      v-bind="{ ...$attrs, ...compProps }"
    >
      <template #item.userType="{ item }">
        <v-chip label variant="flat" :prepend-icon="userTypes[item.userType].path" :color="userTypes[item.userType].color()" :text="userTypes[item.userType].text" />
      </template>

      <!-- Pass on all named slots -->
      <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
        <slot :name="slot" v-bind="slotProps" />
      </template>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import type { ViewUserDetails } from '@/plugins/types/germinate'

  import { mdiAccountMultiple } from '@mdi/js'
  import { userTypes } from '@/plugins/util/types'
  import type { BaseTableProps } from '@/plugins/types/BaseTableProps'

  const compProps = defineProps<Pick<BaseTableProps<ViewUserDetails>, 'getData' | 'getIds' | 'selectionType'>>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    return [{
      key: 'id',
      title: t('tableColumnUserId'),
      dataType: 'integer',
      visibleInFilter: false,
    }, {
      key: 'username',
      title: t('tableColumnUserUsername'),
      dataType: 'string',
      visibleInFilter: false,
    }, {
      key: 'fullName',
      title: t('tableColumnUserFullname'),
      dataType: 'string',
      visibleInFilter: false,
    }, {
      key: 'userType',
      title: t('tableColumnUserType'),
      dataType: 'string',
      visibleInFilter: false,
    }, {
      key: 'emailAddress',
      title: t('tableColumnUserEmail'),
      dataType: 'string',
      visibleInFilter: false,
    }, {
      key: 'name',
      title: t('tableColumnUserInstitution'),
      dataType: 'string',
      visibleInFilter: false,
    }]
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
