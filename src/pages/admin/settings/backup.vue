<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageBackupTitle') }}</h1>
    <v-divider class="mb-3" />

    <p>{{ $t('pageBackupText') }}</p>

    <div class="mb-3" v-if="serverAdminSettings">
      <v-chip label color="warning" prepend-icon="mdi-file-cabinet" :to="Pages.germinateSettings.path" class="me-2 mb-2" v-if="serverAdminSettings.databaseBackupMaxSizeGB" :text="`${$t('formLabelAdminSettingsBackupMaxSizeGb')}: ${serverAdminSettings.databaseBackupMaxSizeGB}GB`" />
      <v-chip label color="warning" prepend-icon="mdi-calendar-clock" :to="Pages.germinateSettings.path" class="me-2 mb-2" v-if="serverAdminSettings.databaseBackupEveryDays" :text="`${$t('formLabelAdminSettingsBackupEveryDays')}: ${serverAdminSettings.databaseBackupEveryDays}`" />
    </div>

    <v-btn color="primary" class="mb-5" @click="createBackup" prepend-icon="mdi-database-arrow-right" :text="$t('buttonGenerateBackup')" />

    <BackupTable :get-data="getBackups" ref="backupTable" />
  </v-container>
</template>

<script setup lang="ts">
  import BackupTable from '@/components/tables/BackupTable.vue'
  import { apiGetAdminSettings, apiPostBackupTable, apiPutBackup } from '@/plugins/api/misc'
  import { Pages } from '@/plugins/pages'
  import type { BackupResult, PaginatedResult, ClientAdminConfiguration, PaginatedRequest } from '@/plugins/types/germinate'
  import { coreStore } from '@/stores/app'

  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  const store = coreStore()
  const { t } = useI18n()

  const serverAdminSettings = ref<ClientAdminConfiguration>()
  const backupTable = useTemplateRef('backupTable')

  function createBackup () {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('buttonGenerateBackup'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'success',
      callback: (result: boolean) => {
        if (result === true) {
          emitter.emit('show-loading', true)

          apiPutBackup(() => {
            backupTable.value?.refresh()
            emitter.emit('show-loading', false)

            // Show toast
            emitter.emit('show-snackbar', {
              text: t('pageBackupToastNewBackupSuccessText'),
              color: 'success',
            })
          })
        }
      },
    })
  }

  function getBackups (data: PaginatedRequest) {
    return apiPostBackupTable<PaginatedResult<BackupResult[]>>(data, result => {
      if (result && result.data) {
        result.data.forEach(b => {
          b.href = `${store.storeBaseUrl}backup/download?token=${store.storeToken ? store.storeToken.token : null}&filename=${encodeURIComponent(b.filename)}`
        })
      }
    })
  }

  onMounted(() => {
    apiGetAdminSettings<ClientAdminConfiguration>(result => {
      serverAdminSettings.value = result
    })
  })
</script>
