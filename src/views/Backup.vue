<template>
  <div>
    <h1 class="mt-3">{{ $t('pageBackupTitle') }}</h1>
    <p>{{ $t('pageBackupText') }}</p>

    <b-button variant="info" @click="createBackup"><MdiIcon :path="mdiDatabaseArrowRight" />{{ $t('buttonGenerateBackup') }}</b-button>

    <b-row class="mt-3">
      <b-col cols="12" md="6" lg="3" v-for="backup in backups" :key="`backup-${backup.filename}`">
        <b-card no-body>
          <b-card-body>
            <b-card-title><MdiIcon :path="backupTypes[backup.type].icon" /> {{ backupTypes[backup.type].title }}</b-card-title>
            <b-card-sub-title>{{ backupTypes[backup.type].text }}</b-card-sub-title>
            <hr />
            <b-card-text>
              <div><MdiIcon className="mr-2" :path="mdiCalendarClock" /> <span v-b-tooltip="new Date(backup.timestamp).toLocaleString()">{{ new Date(backup.timestamp).toLocaleDateString() }}</span></div>
              <div><MdiIcon className="mr-2" :path="mdiTag" /> v{{ backup.germinateVersion }}</div>
              <div><MdiIcon className="mr-2" :path="mdiFileCabinet" /> {{ backup.formattedSize }}</div>
            </b-card-text>
          </b-card-body>

          <b-card-footer class="d-flex justify-content-between">
            <b-button variant="primary" :href="backup.href"><MdiIcon :path="mdiDownload" /> {{ $t('buttonDownload') }}</b-button>
            <b-dropdown>
              <template #button-content>
                <MdiIcon :path="mdiCog" />
              </template>
              <b-dropdown-item variant="danger" @click="deleteBackup(backup)"><MdiIcon :path="mdiDelete" /> {{ $t('buttonDelete') }}</b-dropdown-item>
            </b-dropdown>
          </b-card-footer>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon.vue'
import { apiDeleteBackup, apiGetBackups, apiPutBackup } from '@/mixins/api/misc'
import { getNumberWithSuffix } from '@/mixins/formatting'
import { mdiCalendarClock, mdiCog, mdiDatabaseArrowRight, mdiDatabaseClock, mdiDatabaseEdit, mdiDatabaseSync, mdiDelete, mdiDownload, mdiFileCabinet, mdiTag } from '@mdi/js'
import { mapGetters } from 'vuex'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    MdiIcon
  },
  data: function () {
    return {
      mdiTag,
      mdiFileCabinet,
      mdiCog,
      mdiDatabaseArrowRight,
      mdiDelete,
      mdiDownload,
      mdiCalendarClock,
      backups: []
    }
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl',
      'storeToken'
    ]),
    backupTypes: function () {
      return {
        PERIODICAL: {
          title: this.$t('pageBackupTypePeriodicalTitle'),
          text: this.$t('pageBackupTypePeriodicalText'),
          icon: mdiDatabaseClock
        },
        UPDATE: {
          title: this.$t('pageBackupTypeUpdateTitle'),
          text: this.$t('pageBackupTypeUpdateText'),
          icon: mdiDatabaseSync
        },
        MANUAL: {
          title: this.$t('pageBackupTypeManualTitle'),
          text: this.$t('pageBackupTypeManualText'),
          icon: mdiDatabaseEdit
        }
      }
    }
  },
  methods: {
    deleteBackup: function (backup) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okTitle: this.$t('buttonDelete'),
        okVariant: 'danger',
        cancelTitle: this.$t('buttonCancel')
      })
        .then(value => {
          if (value === true) {
            apiDeleteBackup(backup, () => this.update(), {
              codes: [404],
              callback: () => {
                // Do nothing here, it just means there is nothing to delete
              }
            })
          }
        })
    },
    createBackup: function () {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okTitle: this.$t('buttonGenerateBackup'),
        okVariant: 'primary',
        cancelTitle: this.$t('buttonCancel')
      })
        .then(value => {
          if (value === true) {
            emitter.emit('show-loading', true)

            apiPutBackup(() => {
              this.update()
              emitter.emit('show-loading', false)

              // Show toast
              this.$bvToast.toast(this.$t('pageBackupToastNewBackupSuccessText'), {
                title: this.$t('pageBackupToastNewBackupSuccessTitle'),
                variant: 'success',
                autoHideDelay: 5000,
                appendToast: true
              })
            })
          }
        })
    },
    update: function () {
      apiGetBackups(result => {
        if (result) {
          result.forEach(r => {
            r.formattedSize = getNumberWithSuffix(r.filesize, 2, 1024)
            r.href = `${this.storeBaseUrl}backup/download?token=${this.storeToken ? this.storeToken.token : null}&filename=${encodeURIComponent(r.filename)}`
          })
          result.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
          this.backups = result
        }
      })
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>
</style>
