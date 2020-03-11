<template>
  <div class="aside-scroll">
    <b-tabs v-model="tabIndex">
      <b-tab>
        <template slot="title">
          <i class="mdi mdi-18px mdi-download" />
        </template>
        <b-button @click="updateAsyncJobs" class="w-100 refresh-button" variant="info">
          <i class="mdi mdi-18px mdi-refresh" /> {{ $t('buttonUpdate') }}
        </b-button>

        <b-list-group class="list-group-accent">
          <b-list-group-item class="list-group-item-accent-secondary bg-light text-center font-weight-bold text-muted text-uppercase small">
            {{ $t('widgetAsyncJobPanelTitle') }}
          </b-list-group-item>
          <b-list-group-item v-for="job in asyncExportJobs"
                              :key="job.id"
                              :class="`list-group-item-accent-${status[job.status].color} list-group-item-divider`">
            <a href="#" class="text-muted" @click.prevent="deleteExportJob(job)" :title="$t('buttonDelete')"><i class="mdi mdi-close float-right"></i></a>
            <div><strong>{{ getDatasetType(job.datasettypeId) }}</strong></div>
            <div v-if="job.datasetIds" class="text-muted">{{ $t('widgetAsyncJobPanelDatasets', { datasetIds: job.datasetIds }) }}</div>
            <div class="text-muted">
              <i class="mdi fix-alignment mdi-calendar-clock"></i><small> {{ job.updatedOn | toDateTime }}</small>
            </div>
            <div :class="`text-${status[job.status].color}`">
              <b-spinner variant="info" small v-if="job.status === 'running'" />
              <i :class="`mdi fix-alignment mdi-${status[job.status].icon}`" v-else />
              <small> {{ status[job.status].text() }}</small>
            </div>
            <div v-if="job.status === 'completed'">
              <i class="mdi fix-alignment mdi-download" />&nbsp;<a :href="`${baseUrl}dataset/export/async/${job.uuid}/download`" @click="updateAsyncJobs">{{ $t('buttonDownload') }}</a>
            </div>
          </b-list-group-item>
        </b-list-group>
      </b-tab>
      <template v-if="token && token.userType && userIsAtLeast(token.userType, 'Data Curator') && serverSettings.dataImportMode !== 'NONE'">
        <b-tab>
          <template slot="title">
            <i class="mdi mdi-18px mdi-upload" />
          </template>
          <b-button @click="updateAsyncJobs" class="w-100 refresh-button" variant="info">
            <i class="mdi mdi-18px mdi-refresh" /> {{ $t('buttonUpdate') }}
          </b-button>

          <b-list-group-item v-for="job in asyncImportJobs"
                                :key="job.id"
                                :class="`list-group-item-accent-${(job.feedback && job.feedback.length) > 0 ? 'danger' : status[job.status].color} list-group-item-divider`">
            <a href="#" class="text-muted" @click.prevent="deleteImportJob(job)" :title="$t('buttonDelete')"><i class="mdi mdi-close float-right"></i></a>
            <div><strong>{{ getTemplateType(job.datatype) }}</strong></div>
            <div class="text-muted">
              <i class="mdi fix-alignment mdi-calendar-clock" /><small> {{ job.updatedOn | toDateTime }}</small><br/>
              <template v-if="job.originalFilename"><i class="mdi fix-alignment mdi-file" /><small> {{ job.originalFilename }}</small></template>
            </div>
            <div v-if="job.status === 'completed'">
              <div v-if="job.feedback">
                <span class="text-danger" v-if="job.feedback.length > 0"><i class="mdi mdi-alert-circle" />&nbsp;<a href="#" @click.prevent="showFeedback(job)">{{ $t('widgetAsyncJobPanelFeedback') }}</a></span>
                <span class="text-success" v-else-if="serverSettings.dataImportMode === 'IMPORT'"><i class="mdi mdi-check-circle" />&nbsp;<a href="#" @click.prevent="startActualImport(job)">{{ $t('widgetAsyncJobPanelImport') }}</a></span>
              </div>
            </div>
            <div :class="`text-${status[job.status].color}`" v-else>
              <b-spinner variant="info" small v-if="job.status === 'running'" />
              <i :class="`mdi fix-alignment mdi-${status[job.status].icon}`" v-else />
              <small> {{ status[job.status].text() }}</small>
            </div>
          </b-list-group-item>
        </b-tab>
      </template>
    </b-tabs>

    <b-modal ref="uploadStatusModal" :title="$t('widgetImportStatusTitle')" :ok-title="$t('buttonClose')" ok-only size="xl">
      <UploadStatusTable :job="selectedImportJob" />
    </b-modal>
  </div>
</template>

<script>
import UploadStatusTable from '@/components/tables/UploadStatusTable'
import axios from 'axios'
import datasetApi from '@/mixins/api/dataset.js'
import miscApi from '@/mixins/api/misc.js'

export default {
  name: 'DefaultAside',
  data: function () {
    return {
      asyncExportJobs: null,
      asyncImportJobs: null,
      isUpdating: false,
      tabIndex: 0,
      selectedImportJob: null,
      status: {
        running: {
          color: 'info',
          icon: 'progress-wrench',
          text: () => this.$t('asyncJobStatusRunning')
        },
        failed: {
          color: 'danger',
          icon: 'alert',
          text: () => this.$t('asyncJobStatusFailed')
        },
        completed: {
          color: 'success',
          icon: 'check-circle',
          text: () => this.$t('asyncJobStatusCompleted')
        },
        waiting: {
          color: 'info',
          icon: 'pause-circle',
          text: () => this.$t('asyncJobStatusWaiting')
        },
        cancelled: {
          color: 'warning',
          icon: 'mdi-cancel',
          text: () => this.$t('asyncJobStatusCancelled')
        }
      }
    }
  },
  components: {
    UploadStatusTable
  },
  mixins: [ datasetApi, miscApi ],
  methods: {
    showTab: function (tab) {
      if (tab === 'upload') {
        this.tabIndex = 1
      } else if (tab === 'download') {
        this.tabIndex = 0
      }
    },
    showFeedback: function (job) {
      this.selectedImportJob = job

      this.$nextTick(() => this.$refs.uploadStatusModal.show())
    },
    startActualImport: function (job) {
      this.apiGetDataAsyncImportStart(job.uuid, result => {
        if (result) {
          result.forEach(r => this.$store.commit('ON_ASYNC_JOB_UUID_ADD_MUTATION', r.uuid))
        }

        this.updateAsyncJobs()
      })
    },
    deleteExportJob: function (job) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTextDeleteAsyncJob'), {
        title: this.$t('modalTitleSure'),
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      }).then(value => {
        if (value) {
          // Delete from the database
          this.apiDeleteDatasetAsyncExport(job.uuid, result => {
            // Delete from the store
            this.$store.commit('ON_ASYNC_JOB_UUID_REMOVE_MUTATION', job.uuid)
            this.updateAsyncJobs()
          })
        }
      })
    },
    deleteImportJob: function (job) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTextDeleteAsyncJob'), {
        title: this.$t('modalTitleSure'),
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      }).then(value => {
        if (value) {
          // Delete from the database
          this.apiDeleteDataAsyncImport(job.uuid, result => {
            // Delete from the store
            this.$store.commit('ON_ASYNC_JOB_UUID_REMOVE_MUTATION', job.uuid)
            this.updateAsyncJobs()
          })
        }
      })
    },
    getDatasetType: function (datasettypeId) {
      var match = Object.keys(this.datasetTypes).filter(k => {
        return this.datasetTypes[k].id === datasettypeId
      })

      if (match && match.length > 0) {
        return this.datasetTypes[match[0]].text()
      } else {
        return 'UNKNOWN DATASET TYPE'
      }
    },
    getTemplateType: function (templateType) {
      var match = Object.keys(this.templateImportTypes).filter(k => {
        return k === templateType
      })

      if (match && match.length > 0) {
        return this.templateImportTypes[match[0]].text()
      } else {
        return 'UNKNOWN TEMPLATE TYPE'
      }
    },
    updateInternal: function () {
      this.$nextTick(() => {
        const exportJobs = this.apiPostDatasetAsyncExport(this.asyncJobUuids)
        const importJobs = this.apiPostDataAsyncImport(this.asyncJobUuids, null, {
          codes: [],
          callback: () => {
            // We do nothing here. It either works or it doesn't.
          }
        })

        axios.all([exportJobs, importJobs]).then(results => {
          this.asyncExportJobs = results[0].data
          this.asyncImportJobs = results[1].data

          const count = this.asyncExportJobs.length + this.asyncImportJobs.length
          const joined = this.asyncExportJobs.concat(this.asyncImportJobs)

          this.$store.dispatch('ON_ASYNC_JOB_COUNT_CHANGED', count)
          this.$store.dispatch('ON_ASYNC_JOB_UUID', joined.map(a => a.uuid))
        }).catch(() => {
          // We do nothing here. It either works or it doesn't.
        })
      })
    },
    updateAsyncJobs: function (setTimer, overwrite = false) {
      if (setTimer === true && (!this.isUpdating || overwrite)) {
        this.isUpdating = true
        // Check it first
        this.updateInternal()
        // Then after 10 seconds, start another check
        setTimeout(() => {
          // Only repeat if the aside is still open
          if (document.body.classList.contains('aside-menu-show')) {
            this.updateAsyncJobs(true, true)
          } else {
            this.isUpdating = false
          }
        }, 10000)
      } else {
        this.updateInternal()
      }
    }
  },
  mounted: function () {
    this.updateAsyncJobs()
  }
}
</script>

<style scoped>
.aside-scroll {
  overflow-x: hidden;
  overflow-y: auto;
  height: 100%;
}

.refresh-button {
  border-radius: 0;
}
</style>
