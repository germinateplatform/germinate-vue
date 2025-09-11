<template>
  <div>
    <!-- @vue-generic {import('@/plugins/types/germinate').BackupResult} -->
    <BaseTable
      ref="baseTable"
      :get-data="compProps.getData"
      :get-ids="compProps.getIds"
      :download="compProps.download"
      :headers="headers"
      :filter-on="filterOn"
      :show-details="false"
      :sort-by="[{ key: 'timestamp', order: 'desc' }]"
      :display-type="compProps.displayType"
      supports-grid-cards
      item-key="id"
      table-key="backups"
      header-icon="mdi-database-import"
      :header-title="$t('pageBackupTitle')"
      v-bind="$attrs"
    >
      <template #item.filesize="{ item }">
        <v-chip label prepend-icon="mdi-file-cabinet" :text="getNumberWithSuffix(item.filesize, 2, 1024)" />
      </template>

      <template #item.germinateVersion="{ item }">
        <v-chip prepend-icon="mdi-tag" label :text="`v${item.germinateVersion}`" />
      </template>

      <template #item.type="{ item }">
        <v-chip label :color="backupTypes[item.type].color" :text="backupTypes[item.type].title" :prepend-icon="backupTypes[item.type].icon" />
      </template>

      <template #item.actions="{ item }">
        <v-btn class="mx-1" color="primary" prepend-icon="mdi-download" variant="tonal" :text="$t('buttonDownload')" :href="item.href" />

        <v-btn class="mx-1" color="error" prepend-icon="mdi-delete" variant="tonal" :text="$t('buttonDelete')" @click="deleteBackup(item)" />
      </template>

      <template #card-item="{ item }">
        <v-card class="flex-grow-1 d-flex justify-space-between flex-column" :title="backupTypes[item.type].title" :subtitle="backupTypes[item.type].text">
          <template #prepend>
            <v-icon :icon="backupTypes[item.type].icon" :color="backupTypes[item.type].color" />
          </template>
          <div class="d-flex flex-column">
            <v-list>
              <v-list-item prepend-icon="mdi-calendar" :title="new Date(item.timestamp).toLocaleDateString()" v-if="item.timestamp" />
              <v-list-item prepend-icon="mdi-tag" :title="`v${item.germinateVersion}`" />
              <v-list-item prepend-icon="mdi-file-cabinet" :title="getNumberWithSuffix(item.filesize, 2, 1024)" />
            </v-list>
          </div>

          <template #actions>
            <v-btn
              color="primary"
              :href="item.href"
              prepend-icon="mdi-download"
              :text="$t('buttonDownload')"
            />
            <v-spacer />
            <v-btn
              color="error"
              prepend-icon="mdi-delete"
              @click="deleteBackup(item)"
              :text="$t('buttonDelete')"
            />
          </template>
        </v-card>
      </template>

      <!-- Pass on all named slots -->
      <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
        <slot :name="slot" v-bind="slotProps" />
      </template>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
  import BaseTable, { type DisplayType } from '@/components/tables/BaseTable.vue'

  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, PaginatedRequest, PaginatedResult, BackupResult } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { getTemplateColor } from '@/plugins/util/colors'

  import emitter from 'tiny-emitter/instance'
  import { apiDeleteBackup } from '@/plugins/api/misc'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<BackupResult[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
    displayType?: DisplayType
  }>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  interface BackupType {
    title: string
    text: string
    icon: string
    color: string
  }

  const backupTypes: ComputedRef<{ [key: string]: BackupType }> = computed(() => {
    return {
      PERIODICAL: {
        title: t('pageBackupTypePeriodicalTitle'),
        text: t('pageBackupTypePeriodicalText'),
        icon: 'mdi-database-clock',
        color: getTemplateColor(0),
      },
      UPDATE: {
        title: t('pageBackupTypeUpdateTitle'),
        text: t('pageBackupTypeUpdateText'),
        icon: 'mdi-database-sync',
        color: getTemplateColor(1),
      },
      MANUAL: {
        title: t('pageBackupTypeManualTitle'),
        text: t('pageBackupTypeManualText'),
        icon: 'mdi-database-edit',
        color: getTemplateColor(2),
      },
    }
  })

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'filename',
      title: t('tableColumnBackupFilename'),
      dataType: 'string',
    }, {
      key: 'germinateVersion',
      title: t('tableColumnBackupGerminateVersion'),
      dataType: 'string',
    }, {
      key: 'type',
      title: t('tableColumnBackupType'),
      dataType: 'string',
    }, {
      key: 'filesize',
      title: t('tableColumnBackupFilesize'),
      dataType: 'float',
    }, {
      key: 'timestamp',
      dataType: 'date',
      title: t('tableColumnBackupCreatedOn'),
      value: (value: BackupResult) => value.timestamp ? new Date(value.timestamp).toLocaleDateString() : undefined,
    }, {
      key: 'actions',
      visibleInFilter: false,
      title: '',
      dataType: undefined,
    }]

    return headers
  })

  function deleteBackup (item: BackupResult) {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          apiDeleteBackup(item, () => {
            baseTable.value?.refresh()
          }, {
            codes: [404],
            callback: () => {
              // Do nothing here, it just means there is nothing to delete
            }
          })
        }
      },
    })
  }

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh(readFilter),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
