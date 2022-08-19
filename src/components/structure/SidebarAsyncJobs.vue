<template>
  <b-container fluid>
    <b-tabs justified v-model="tabIndex">
      <b-tab active>
        <template #title>
          <MdiIcon :path="mdiDownload" />
        </template>
        <!-- Update button -->
        <b-button-group class="w-100 action-buttons" >
          <b-button @click="updateInternal" variant="info">
            <MdiIcon :path="mdiRefresh" /> {{ $t('buttonUpdate') }}
          </b-button>
          <b-button @click="clearExportJobs" :disabled="!asyncExportJobs || asyncExportJobs.length < 1">
            <MdiIcon :path="mdiDelete" /> {{ $t('genericClear') }}
          </b-button>
        </b-button-group>
        <b-list-group class="list-group-accent">
          <!-- Heading -->
          <b-list-group-item class="list-group-item-accent-secondary bg-light text-center font-weight-bold text-muted text-uppercase small">
            {{ $t('widgetAsyncJobPanelTitle') }}
          </b-list-group-item>
          <!-- List of jobs -->
          <b-list-group-item v-for="job in asyncExportJobs"
                              :key="job.id"
                              :class="status[job.status].color">
            <!-- Delete job -->
            <a href="#" class="text-muted float-right" @click.prevent="deleteExportJob(job)" :title="$t('buttonDelete')"><MdiIcon :path="mdiClose" /></a>
            <!-- Job type -->
            <div><strong>{{ getDatasetType(job.datatype) }}</strong></div>
            <!-- Dataset ids -->
            <div class="text-muted" v-if="job.datasetIds">
              <MdiIcon :path="mdiDatabase" /><small> {{ $t('widgetAsyncJobPanelDatasets', { datasetIds: job.datasetIds }) }}</small>
            </div>
            <!-- Date time -->
            <div class="text-muted" v-if="job.updatedOn">
              <MdiIcon :path="mdiCalendarClock" /><small> {{ new Date(job.updatedOn).toLocaleString() }}</small>
            </div>
            <!-- Status -->
            <div :class="`text-${status[job.status].color}`">
              <b-spinner variant="info" small v-if="job.status === 'running'" />
              <MdiIcon :path="status[job.status].path" v-else />
              <small> {{ status[job.status].text() }}</small>
            </div>
            <!-- Download link -->
            <template v-if="job.status === 'completed'">
              <div class="d-flex flex-row align-items-start" v-if="job.datatype === 'pedigree' && storeServerSettings && storeServerSettings.heliumUrl">
                <i class="mdi fix-alignment icon-helium" />
                <div class="d-inline-block ml-1">
                  <a target="_blank" :href="`${storeServerSettings.heliumUrl}pedigree?germinateUrl=${encodeURIComponent(storeBaseUrl + 'dataset/export/async/' + job.uuid + '/download')}`" @click="updateInternal">{{ $t('buttonSendToHelium') }}</a>
                </div>
              </div>
              <div class="d-flex flex-row align-items-start">
                <MdiIcon :path="mdiDownload" />
                <div class="d-inline-block ml-1">
                  <a :href="`${storeBaseUrl}dataset/export/async/${job.uuid}/download`" @click="updateInternal">{{ $t('buttonDownload') }}</a>
                  <div v-if="job.resultSize">
                    <!-- File size -->
                    <small class="text-muted">{{ getNumberWithSuffix(job.resultSize, 2, 1024, ' ') }}B</small>
                  </div>
                </div>
              </div>
            </template>
          </b-list-group-item>
        </b-list-group>
      </b-tab>
      <b-tab>
        <template #title>
          <MdiIcon :path="mdiUpload" />
        </template>
        <!-- Update button -->
        <b-button-group class="w-100 action-buttons">
          <b-button @click="updateInternal" variant="info">
            <MdiIcon :path="mdiRefresh" /> {{ $t('buttonUpdate') }}
          </b-button>
          <b-button @click="clearImportJobs" :disabled="!asyncImportJobs || asyncImportJobs.length < 1">
            <MdiIcon :path="mdiDelete" /> {{ $t('genericClear') }}
          </b-button>
        </b-button-group>
        <b-list-group class="list-group-accent">
          <!-- Heading -->
          <b-list-group-item class="list-group-item-accent-secondary bg-light text-center font-weight-bold text-muted text-uppercase small">
            {{ $t('widgetAsyncImportJobPanelTitle') }}
          </b-list-group-item>
          <!-- List of jobs -->
          <b-list-group-item v-for="job in asyncImportJobs"
                                :key="job.id"
                                :class="`${(job.feedback && job.feedback.length) > 0 ? 'danger' : status[job.status].color}`">
            <!-- Delete job -->
            <a href="#" class="text-muted float-right" @click.prevent="deleteImportJob(job)" :title="$t('buttonDelete')"><MdiIcon :path="mdiClose" /></a>
            <!-- Template type -->
            <div class="text-muted">
              <MdiIcon :path="mdiDatabase" /><strong>{{ getTemplateType(job.datatype) }}</strong>
            </div>
            <!-- Date time and filename -->
            <div class="text-muted">
              <MdiIcon :path="mdiCalendarClock" /><small v-if="job.updatedOn"> {{ new Date(job.updatedOn).toLocaleString() }}</small><br/>
              <template v-if="job.originalFilename"><MdiIcon :path="mdiFile" /><small> {{ job.originalFilename }}</small></template>
            </div>
            <!-- Status -->
            <div v-if="job.status === 'failed'">
              <!-- If there is feedback -->
              <div v-if="job.feedback">
                <!-- Show a button to view the feedback -->
                <span class="text-danger" v-if="job.feedback.length > 0"><MdiIcon :path="mdiAlertCircle" />&nbsp;<a href="#" @click.prevent="showFeedback(job)">{{ $t('widgetAsyncJobPanelFeedback') }}</a></span>
              </div>
            </div>
            <div v-else-if="job.status === 'completed'">
              <!-- If there is feedback -->
              <div v-if="job.feedback">
                <!-- Show a button to view the feedback -->
                <span class="text-danger" v-if="job.feedback.length > 0"><MdiIcon :path="mdiAlertCircle" />&nbsp;<a href="#" @click.prevent="showFeedback(job)">{{ $t('widgetAsyncJobPanelFeedback') }}</a></span>
                <!-- If it's empty and the configuration allows import (rather than just checking) and it hasn't been imported yet, allow import -->
                <template v-else-if="job.imported === false">
                  <span class="text-success" v-if="storeServerSettings.dataImportMode === 'IMPORT'"><MdiIcon :path="mdiCheckCircle" />&nbsp;<a href="#" @click.prevent="startActualImport(job)">{{ $t('widgetAsyncJobPanelImport') }}</a></span>
                  <span class="text-success" v-else><MdiIcon :path="mdiCheckCircle" />&nbsp;{{ $t('widgetAsyncJobPanelImportDisabled') }}</span>
                </template>
              </div>
            </div>
            <div :class="`text-${status[job.status].color}`" v-else>
              <b-spinner variant="info" small v-if="job.status === 'running'" />
              <MdiIcon :path="status[job.status].path" v-else/>
              <small> {{ status[job.status].text() }}</small>
            </div>
          </b-list-group-item>
        </b-list-group>
      </b-tab>
    </b-tabs>

    <!-- Modal showing the issues with the selected upload job -->
    <b-modal ref="uploadStatusModal" :title="$t('widgetImportStatusTitle')" :ok-title="$t('buttonClose')" ok-only size="xl">
      <UploadStatusTable :job="selectedImportJob" />
    </b-modal>
  </b-container>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import { mdiDelete, mdiDownload, mdiUpload, mdiRefresh, mdiDatabase, mdiClose, mdiCalendarClock, mdiFile, mdiAlertCircle, mdiCheckCircle, mdiAlert, mdiPauseCircle, mdiCancel, mdiProgressWrench } from '@mdi/js'

import UploadStatusTable from '@/components/tables/UploadStatusTable'
import axios from 'axios'
import datasetApi from '@/mixins/api/dataset'
import miscApi from '@/mixins/api/misc'
import typesMixin from '@/mixins/types'
import formattingMixin from '@/mixins/formatting'

export default {
  components: {
    MdiIcon,
    UploadStatusTable
  },
  props: {
    direction: {
      type: String,
      default: null
    }
  },
  watch: {
    tabIndex: function (newValue) {
      this.$store.dispatch('setAsyncSidebarTabIndex', newValue)
    },
    storeAsyncSidebarTabIndex: function (newValue) {
      this.showTab()
    }
  },
  data: function () {
    return {
      mdiDelete,
      mdiDownload,
      mdiUpload,
      mdiRefresh,
      mdiClose,
      mdiCalendarClock,
      mdiDatabase,
      mdiFile,
      mdiAlertCircle,
      mdiCheckCircle,
      asyncExportJobs: null,
      asyncImportJobs: null,
      timeout: null,
      tabIndex: 0,
      selectedImportJob: null,
      status: {
        running: {
          color: 'info',
          path: mdiProgressWrench,
          text: () => this.$t('asyncJobStatusRunning')
        },
        failed: {
          color: 'danger',
          path: mdiAlert,
          text: () => this.$t('asyncJobStatusFailed')
        },
        completed: {
          color: 'success',
          path: mdiCheckCircle,
          text: () => this.$t('asyncJobStatusCompleted')
        },
        waiting: {
          color: 'info',
          path: mdiPauseCircle,
          text: () => this.$t('asyncJobStatusWaiting')
        },
        cancelled: {
          color: 'warning',
          path: mdiCancel,
          text: () => this.$t('asyncJobStatusCancelled')
        }
      },
      dataExportTypes: {
        allelefreq: {
          text: () => this.$t('datasetTypeAllelefreq')
        },
        climate: {
          text: () => this.$t('datasetTypeClimate')
        },
        compound: {
          text: () => this.$t('datasetTypeCompound')
        },
        genotype: {
          text: () => this.$t('datasetTypeGenotype')
        },
        trials: {
          text: () => this.$t('datasetTypeTrials')
        },
        pedigree: {
          text: () => this.$t('datasetTypePedigree')
        },
        unknown: {
          text: () => this.$t('datasetTypeUnknown')
        },
        images: {
          text: () => this.$t('dataTypeImages')
        }
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl',
      'storeAsyncJobUuids',
      'storeAsyncJobCount',
      'storeServerSettings',
      'storeAsyncSidebarTabIndex'
    ])
  },
  mixins: [datasetApi, miscApi, typesMixin, formattingMixin],
  methods: {
    clearExportJobs: function () {
      if (this.asyncExportJobs) {
        this.$bvModal.msgBoxConfirm(this.$t('modalTextDeleteAsyncJob'), {
          title: this.$t('modalTitleSure'),
          okVariant: 'danger',
          okTitle: this.$t('genericYes'),
          cancelTitle: this.$t('genericNo')
        }).then(value => {
          if (value) {
            this.asyncExportJobs.forEach(job => {
              this.apiDeleteDatasetAsyncExport(job.uuid, () => {
                // Delete from the store
                this.$store.commit('ON_ASYNC_JOB_UUID_REMOVE_MUTATION', job.uuid)
                this.updateInternal()
              })
            })
          }
        })
      }
    },
    clearImportJobs: function () {
      if (this.asyncImportJobs) {
        this.$bvModal.msgBoxConfirm(this.$t('modalTextDeleteAsyncJob'), {
          title: this.$t('modalTitleSure'),
          okVariant: 'danger',
          okTitle: this.$t('genericYes'),
          cancelTitle: this.$t('genericNo')
        }).then(value => {
          if (value) {
            // Delete from the database
            this.asyncImportJobs.forEach(job => {
              this.apiDeleteDataAsyncImport(job.uuid, () => {
                // Delete from the store
                this.$store.commit('ON_ASYNC_JOB_UUID_REMOVE_MUTATION', job.uuid)
                this.updateInternal()
              })
            })
          }
        })
      }
    },
    showTab: function () {
      this.$nextTick(() => {
        this.tabIndex = this.storeAsyncSidebarTabIndex
      })
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

        this.updateInternal()
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
          this.apiDeleteDatasetAsyncExport(job.uuid, () => {
            // Delete from the store
            this.$store.commit('ON_ASYNC_JOB_UUID_REMOVE_MUTATION', job.uuid)
            this.updateInternal()
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
          this.apiDeleteDataAsyncImport(job.uuid, () => {
            // Delete from the store
            this.$store.commit('ON_ASYNC_JOB_UUID_REMOVE_MUTATION', job.uuid)
            this.updateInternal()
          })
        }
      })
    },
    getDatasetType: function (datatype) {
      const match = this.dataExportTypes[datatype]

      if (match) {
        return match.text()
      } else {
        return 'Data export'
      }
    },
    getTemplateType: function (templateType) {
      const match = Object.keys(this.templateImportTypes).filter(k => {
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
        const exportJobs = this.apiPostDatasetAsyncExport(this.storeAsyncJobUuids, null, {
          codes: [],
          callback: (error) => {
            if (error && error.status === 403) {
              // Log the user out if we get here
              this.$store.dispatch('setToken', null)
            }
          }
        }).catch(() => null)
        const importJobs = this.apiPostDataAsyncImport(this.storeAsyncJobUuids, null, {
          codes: [],
          callback: () => {
            // We do nothing here. It either works or it doesn't.
          }
        }).catch(() => null)

        axios.all([exportJobs, importJobs]).then(results => {
          this.asyncExportJobs = results[0].data
          this.asyncImportJobs = results[1].data

          const count = this.asyncExportJobs.length + this.asyncImportJobs.length
          const joined = this.asyncExportJobs.concat(this.asyncImportJobs)

          this.$store.dispatch('setAsyncJobCount', count)
          this.$store.dispatch('setAsyncJobUuid', joined.map(a => a.uuid))
        }).catch(() => {
          // We do nothing here. It either works or it doesn't.
        })
      })
    },
    updateAsyncJobs: function () {
      if (this.timeout) {
        clearTimeout(this.timeout)
        this.timeout = null
      }
      this.updateInternal()
      this.timeout = setTimeout(() => {
        this.updateAsyncJobs()
      }, 5000)
    }
  },
  beforeDestroy: function () {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  },
  mounted: function () {
    this.updateAsyncJobs()

    this.showTab()
  }
}
</script>

<style scoped>
.icon-helium:before {
  content: url("~@/assets/img/helium.png");
}

.aside-scroll {
  overflow-x: hidden;
  overflow-y: auto;
  height: 100%;
}

.action-buttons .btn {
  border-radius: 0;
}
</style>
