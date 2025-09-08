<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableCollaborators} -->
  <BaseTable
    ref="baseTable"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :selection-type="selectionType"
    :show-details="false"
    item-key="collaboratorId"
    table-key="collaborators"
    header-icon="mdi-account-multiple"
    :header-title="$t('modalTitleCollaborators')"
    v-bind="$attrs"
  >
    <!-- Country flag -->
    <template #item.countryName="{ item }">
      <span class="text-no-wrap" v-tooltip:top="item.countryName" v-if="item.countryCode2">
        <i :class="'fi fi-' + item.countryCode2.toLowerCase()" /> <span> {{ item.countryCode2 }}</span>
      </span>
      <span v-else>
        {{ item.countryName }}
      </span>
    </template>

    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>
  </BaseTable>
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTableCollaborators } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableCollaborators[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
  }>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'projectIds',
      dataType: 'json',
      sortable: false,
      visibleInTable: false,
      title: t('tableColumnProjectId'),
    }, {
      key: 'collaboratorId',
      dataType: 'integer',
      title: t('tableColumnCollaboratorId'),
    }, {
      key: 'collaboratorFirstName',
      dataType: 'string',
      title: t('tableColumnCollaboratorFirstName'),
    }, {
      key: 'collaboratorLastName',
      dataType: 'string',
      title: t('tableColumnCollaboratorLastName'),
    }, {
      key: 'collaboratorEmail',
      dataType: 'string',
      title: t('tableColumnCollaboratorEmail'),
    }, {
      key: 'collaboratorExternalId',
      dataType: 'string',
      title: t('tableColumnCollaboratorExternalId'),
    }, {
      key: 'collaboratorRoles',
      dataType: 'string',
      title: t('tableColumnCollaboratorRoles'),
    }, {
      key: 'institutionName',
      dataType: 'string',
      title: t('tableColumnInstitutionName'),
    }, {
      key: 'institutionAddress',
      dataType: 'string',
      title: t('tableColumnInstitutionAddress'),
    }, {
      key: 'countryName',
      dataType: 'string',
      title: t('tableColumnCountryName'),
    }]

    return headers
  })

  defineExpose({
    refresh: () => baseTable.value?.refresh(),
  })
</script>

<style scoped>
</style>
