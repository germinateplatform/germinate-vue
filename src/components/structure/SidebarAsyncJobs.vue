<template>
  <b-container fluid>
    <b-tabs justified v-model="tabIndex">
      <b-tab active>
        <template #title>
          <MdiIcon :path="mdiDownload" />
        </template>
        <!-- Update button -->
        <b-button-group class="w-100 action-buttons" >
          <b-button class="w-50" @click="updateInternal" variant="info">
            <MdiIcon :path="mdiRefresh" /> {{ $t('buttonUpdate') }}
          </b-button>
          <b-button class="w-50" @click="clearExportJobs" :disabled="!asyncExportJobs || asyncExportJobs.length < 1">
            <MdiIcon :path="mdiDelete" /> {{ $t('genericClear') }}
          </b-button>
        </b-button-group>
        <b-list-group class="list-group-accent">
          <!-- Heading -->
          <b-list-group-item class="list-group-item-accent-secondary bg-light text-center font-weight-bold text-muted text-uppercase small">
            {{ $t('widgetAsyncJobPanelTitle') }}
          </b-list-group-item>
          <!-- List of jobs -->
          <b-list-group-item v-for="(job, index) in asyncExportJobs"
                              :key="`download-job-${job.id}`"
                              :class="status[job.status].color">
            <!-- Delete job -->
            <a href="#" class="text-muted float-right" @click.prevent="deleteExportJob(job)" v-b-tooltip="$t('buttonDelete')"><MdiIcon :path="mdiClose" /></a>
            <!-- Job type -->
            <div><MdiIcon :path="exportJobTypes[index].path" :color="exportJobTypes[index].color()" /><strong>&nbsp;{{ exportJobTypes[index].text() }}</strong></div>
            <!-- Date time -->
            <div class="text-muted" v-if="job.updatedOn">
              <MdiIcon :path="mdiCalendarClock" /><small> {{ new Date(job.updatedOn).toLocaleString() }}</small>
            </div>
            <!-- Dataset ids -->
            <div class="text-muted" v-if="job.datasetIds">
              <MdiIcon :path="mdiDatabase" /><small> {{ $t('widgetAsyncJobPanelDatasets', { datasetIds: job.datasetIds }) }}</small>
            </div>
            <!-- Status -->
            <div :class="`text-${status[job.status].color}`">
              <b-spinner variant="info" small v-if="job.status === 'running'" />
              <MdiIcon :path="status[job.status].path" v-else />
              <small> {{ status[job.status].text() }}</small>
            </div>

            <template v-if="job.status === 'completed'">
              <div v-if="job.datatype === 'pedigree' && storeServerSettings && storeServerSettings.heliumUrl">
                <HeliumIcon />
                <small class="d-inline-block ml-1">
                  <a target="_blank" :href="`${storeServerSettings.heliumUrl}pedigree?germinateUrl=${encodeURIComponent(storeBaseUrl + 'dataset/export/async/' + job.uuid + '/download')}`" @click="updateInternal">{{ $t('buttonSendToHelium') }}</a>
                </small>
              </div>
              <div class="d-flex flex-row align-items-start">
                <MdiIcon :path="mdiDownload" className="text-primary" />
                <div class="d-inline-block ml-1">
                  <small><a :href="`${storeBaseUrl}dataset/export/async/${job.uuid}/download`" @click="updateInternal">{{ $t('buttonDownload') }}</a></small>
                  <div v-if="job.resultSize">
                    <!-- File size -->
                    <small class="text-muted">{{ getNumberWithSuffix(job.resultSize, 2, 1024, ' ') }}</small>
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
          <b-button class="w-50" @click="updateInternal" variant="info">
            <MdiIcon :path="mdiRefresh" /> {{ $t('buttonUpdate') }}
          </b-button>
          <b-button class="w-50" @click="clearImportJobs" :disabled="!asyncImportJobs || asyncImportJobs.length < 1">
            <MdiIcon :path="mdiDelete" /> {{ $t('genericClear') }}
          </b-button>
        </b-button-group>
        <b-list-group class="list-group-accent">
          <!-- Heading -->
          <b-list-group-item class="list-group-item-accent-secondary bg-light text-center font-weight-bold text-muted text-uppercase small">
            {{ $t('widgetAsyncImportJobPanelTitle') }}
          </b-list-group-item>
          <!-- List of jobs -->
          <b-list-group-item v-for="(job, index) in asyncImportJobs"
                                :key="`upload-job-${job.id}`"
                                :class="(job.status === 'running' || job.status === 'waiting') ? status[job.status].color : getJobVariant(job)">
            <!-- Delete job -->
            <a href="#" class="text-muted float-right" @click.prevent="deleteImportJob(job)" v-b-tooltip="$t('buttonDelete')"><MdiIcon :path="mdiClose" /></a>
            <!-- Template type -->
            <div>
              <MdiIcon :path="importJobTypes[index].path" :color="importJobTypes[index].color()" /><strong>&nbsp;{{ importJobTypes[index].text() }}</strong>
            </div>
            <!-- Date time and filename -->
            <div class="text-muted">
              <MdiIcon :path="mdiCalendarClock" /><small v-if="job.updatedOn"> {{ new Date(job.updatedOn).toLocaleString() }}</small><br/>
              <template v-if="job.originalFilename"><MdiIcon :path="mdiFile" /><small>&nbsp;{{ job.originalFilename }}</small></template>
            </div>
            <!-- Status -->
            <div v-if="job.status === 'failed'">
              <!-- If there is feedback -->
              <div v-if="job.feedback">
                <!-- Show a button to view the feedback -->
                <span class="text-danger" v-if="job.feedback.length > 0"><MdiIcon :path="mdiAlertCircle" />&nbsp;<small><a href="#" @click.prevent="showFeedback(job)">{{ $t('widgetAsyncJobPanelFeedback') }}</a></small></span>
              </div>
              <div v-if="storeToken && userIsAtLeast(storeToken.userType, USER_TYPE_DATA_CURATOR)">
                <span class="text-info"><MdiIcon :path="mdiFileDocumentAlert" />&nbsp;<small><a href="#" @click.prevent="downloadImportJobLog(job)">{{ $t('widgetAsyncJobPanelDownloadLog') }}</a></small></span>
              </div>
            </div>
            <div v-else-if="job.status === 'completed'">
              <!-- If there is feedback -->
              <div v-if="job.feedback">
                <!-- Show a button to view the feedback -->
                <span class="text-danger" v-if="job.errorStatus === 'ERROR'"><MdiIcon :path="mdiAlertCircle" />&nbsp;<small><a href="#" @click.prevent="showFeedback(job)">{{ $t('widgetAsyncJobPanelFeedback') }}</a></small></span>
                <template v-else>
                  <span class="d-block text-warning" v-if="job.errorStatus === 'WARNING'"><MdiIcon :path="mdiAlertCircle" />&nbsp;<small><a href="#" @click.prevent="showFeedback(job)">{{ $t('widgetAsyncJobPanelFeedback') }}</a></small></span>
                  <!-- If it's empty and the configuration allows import (rather than just checking) and it hasn't been imported yet, allow import -->
                  <template v-if="job.imported === false">
                    <span class="d-block text-success" v-if="storeServerSettings.dataImportMode === 'IMPORT'"><MdiIcon :path="mdiCheckCircle" />&nbsp;<small><a href="#" @click.prevent="startActualImport(job)">{{ $t('widgetAsyncJobPanelImport') }}</a></small></span>
                    <span class="d-block text-success" v-else><MdiIcon :path="mdiCheckCircle" />&nbsp;<small>{{ $t('widgetAsyncJobPanelImportDisabled') }}</small></span>
                  </template>
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
    <b-modal ref="uploadStatusModal" :title="$t('widgetImportStatusTitle')" :ok-title="$t('buttonClose')" ok-only size="xl" v-if="selectedImportJob">
      <UploadStatusTable :job="selectedImportJob" />
    </b-modal>
  </b-container>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import HeliumIcon from '@/components/icons/HeliumIcon'
import { mdiDelete, mdiDownload, mdiUpload, mdiRefresh, mdiDatabase, mdiClose, mdiFileDocumentAlert, mdiCalendarClock, mdiFile, mdiAlertCircle, mdiCheckCircle, mdiAlert, mdiPauseCircle, mdiCancel, mdiProgressWrench, mdiHelpCircle, mdiPulse, mdiChartSankey, mdiDna, mdiFamilyTree, mdiImageMultiple, mdiShovel } from '@mdi/js'

import UploadStatusTable from '@/components/tables/UploadStatusTable'
import { apiPostDatasetAsyncExport, apiDeleteDatasetAsyncExport } from '@/mixins/api/dataset'
import { userIsAtLeast, USER_TYPE_DATA_CURATOR } from '@/mixins/api/auth'
import { apiPostDataAsyncImport, apiDeleteDataAsyncImport, apiGetDataAsyncImportStart, apiGetDataAsyncImportLog } from '@/mixins/api/misc'
import { templateImportTypes } from '@/mixins/types'
import { downloadBlob } from '@/mixins/util'
import { getNumberWithSuffix } from '@/mixins/formatting'

const axios = require('axios').default

export default {
  components: {
    HeliumIcon,
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
      mdiFileDocumentAlert,
      templateImportTypes,
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
          text: () => this.$t('datasetTypeAllelefreq'),
          path: mdiPulse,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[0 % this.storeServerSettings.colorsTemplate.length] : null
        },
        climate: {
          text: () => this.$t('datasetTypeClimate'),
          path: mdiChartSankey,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[1 % this.storeServerSettings.colorsTemplate.length] : null
        },
        genotype: {
          text: () => this.$t('datasetTypeGenotype'),
          path: mdiDna,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[2 % this.storeServerSettings.colorsTemplate.length] : null
        },
        trials: {
          text: () => this.$t('datasetTypeTrials'),
          path: mdiShovel,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[3 % this.storeServerSettings.colorsTemplate.length] : null
        },
        pedigree: {
          text: () => this.$t('datasetTypePedigree'),
          path: mdiFamilyTree,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[4 % this.storeServerSettings.colorsTemplate.length] : null
        },
        unknown: {
          text: () => this.$t('datasetTypeUnknown'),
          path: mdiHelpCircle,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[6 % this.storeServerSettings.colorsTemplate.length] : null
        },
        images: {
          text: () => this.$t('dataTypeImages'),
          path: mdiImageMultiple,
          color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[5 % this.storeServerSettings.colorsTemplate.length] : null
        }
      },
      USER_TYPE_DATA_CURATOR
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeBaseUrl',
      'storeAsyncJobUuids',
      'storeAsyncJobCount',
      'storeServerSettings',
      'storeAsyncSidebarTabIndex'
    ]),
    exportJobTypes: function () {
      if (this.asyncExportJobs) {
        return this.asyncExportJobs.map(j => {
          const match = this.dataExportTypes[j.datatype]

          if (match) {
            return match
          } else {
            return {
              text: 'Data export',
              path: mdiDatabase,
              color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[6 % this.storeServerSettings.colorsTemplate.length] : null
            }
          }
        })
      } else {
        return []
      }
    },
    importJobTypes: function () {
      if (this.asyncImportJobs) {
        return this.asyncImportJobs.map(j => {
          const match = Object.keys(this.templateImportTypes).filter(k => {
            return k === j.datatype
          })

          if (match && match.length > 0) {
            return this.templateImportTypes[match[0]]
          } else {
            return {
              path: mdiHelpCircle,
              color: () => this.storeServerSettings ? this.storeServerSettings.colorsTemplate[8 % this.storeServerSettings.colorsTemplate.length] : null,
              text: () => 'UNKNOWN TEMPLATE TYPE'
            }
          }
        })
      } else {
        return []
      }
    }
  },
  methods: {
    userIsAtLeast,
    getNumberWithSuffix,
    getJobVariant: function (job) {
      if (job.errorStatus === 'ERROR') {
        return 'danger'
      } else if (job.errorStatus === 'WARNING') {
        return 'warning'
      } else {
        return this.status[job.status].color
      }
    },
    downloadImportJobLog: function (job) {
      apiGetDataAsyncImportLog(job.uuid, result => {
        downloadBlob({
          blob: result,
          filename: `log-${job.uuid}`,
          extension: 'zip'
        })
      })
    },
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
              apiDeleteDatasetAsyncExport(job.uuid, () => {
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
              apiDeleteDataAsyncImport(job.uuid, () => {
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
      apiGetDataAsyncImportStart(job.uuid, result => {
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
          apiDeleteDatasetAsyncExport(job.uuid, () => {
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
          apiDeleteDataAsyncImport(job.uuid, () => {
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
    updateInternal: function () {
      this.$nextTick(() => {
        const exportJobs = apiPostDatasetAsyncExport(this.storeAsyncJobUuids, null, {
          codes: [],
          callback: (error) => {
            if (error && error.status === 403) {
              // Log the user out if we get here
              this.$store.dispatch('setToken', null)
            }
          }
        }).catch(() => null)
        const importJobs = apiPostDataAsyncImport(this.storeAsyncJobUuids, null, {
          codes: [],
          callback: () => {
            // We do nothing here. It either works or it doesn't.
          }
        }).catch(() => null)

        axios.all([exportJobs, importJobs]).then(results => {
          this.asyncExportJobs = results[0].data
          this.asyncImportJobs = results[1].data.map(j => {
            const types = {}

            if (j.feedback) {
              j.feedback.forEach(f => {
                if (!types[f.type]) {
                  types[f.type] = 1
                } else {
                  types[f.type]++
                }
              })

              if (types.ERROR > 0) {
                j.errorStatus = 'ERROR'
              } else if (types.WARNING > 0) {
                j.errorStatus = 'WARNING'
              } else {
                j.errorStatus = 'NONE'
              }
            } else {
              j.errorStatus = 'NONE'
            }

            return j
          })

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
