<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableCollaborators} -->
  <BaseTable
    ref="baseTable"
    :headers="headers"
    :show-details="false"
    item-key="collaboratorId"
    table-key="collaborators"
    :header-icon="mdiAccountMultiple"
    :header-title="$t('modalTitleCollaborators')"
    v-bind="{ ...$attrs, ...compProps }"
  >
    <!-- Country flag -->
    <template #item.countryName="{ item }">
      <v-chip :text="item.countryCode2" label v-tooltip:top="item.countryName" v-if="item.countryCode2">
        <template #prepend>
          <v-icon start><i :class="'fi fi-' + item.countryCode2.toLowerCase()" /></v-icon>
        </template>
      </v-chip>
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
  import type { BaseTableProps } from '@/plugins/types/BaseTableProps'

  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import type { ViewTableCollaborators } from '@/plugins/types/germinate'
  import { mdiAccountMultiple } from '@mdi/js'

  const compProps = defineProps<Pick<BaseTableProps<ViewTableCollaborators>, 'getData' | 'filterOn'>>()

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
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
