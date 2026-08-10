<template>
  <v-navigation-drawer
    id="async-status-bar"
    location="end"
    temporary
    :width="navbarWidth"
    v-model="visible"
  >
    <v-list-item class="my-2" :title="$t('widgetAsyncJobTitle')">
      <template #append>
        <v-btn size="x-small" :icon="mdiReload" @click="updateJobs" />
      </template>
    </v-list-item>
    <v-divider />
    <v-tabs v-model="activeTab" color="primary" grow>
      <v-tab value="download" :prepend-icon="mdiDownload" variant="tonal" :text="$t('buttonDownload')">
        <template #append><v-chip size="small" :text="exportJobs.length" /></template>
      </v-tab>
      <v-tab value="upload" :prepend-icon="mdiUpload" variant="tonal" :text="$t('buttonUpload')" v-if="store.storeToken && (store.storeUserIsDataCurator || store.storeUserIsAdmin)">
        <template #append><v-chip size="small" :text="importJobs.length" /></template>
      </v-tab>
    </v-tabs>

    <v-divider />

    <template v-if="activeTab === 'download'">
      <template
        v-for="job in exportJobs"
        :key="`export-job-${job.uuid}`"
      >
        <v-card
          :class="`border-s-lg border-opacity-100 border-${asyncJobStatus[job.status].color}`"
          variant="flat"
          :rounded="0"
        >
          <template #prepend>
            <v-avatar :color="dataExportTypes[job.datatype].color">
              <v-icon :icon="dataExportTypes[job.datatype].path" />
            </v-avatar>
          </template>

          <template #title>
            <div class="text-title-medium">{{ dataExportTypes[job.datatype].text() }}</div>
          </template>

          <template #append>
            <v-btn size="x-small" variant="text" v-tooltip:top="$t('buttonDelete')" :icon="mdiClose" @click="deleteExportJob(job)" />
          </template>

          <template #subtitle>
            <div v-if="job.updatedOn">{{ new Date(job.updatedOn).toLocaleString() }}</div>
          </template>

          <template #text>
            <div class="d-flex justify-space-between">
              <div :class="`text-${asyncJobStatus[job.status].color}`">
                <v-progress-circular color="info" indeterminate size="18" width="3" v-if="job.status === DataExportJobsStatus.running" />
                <v-icon :icon="asyncJobStatus[job.status].path" v-else /> {{ asyncJobStatus[job.status].text() }}
              </div>

              <v-chip label size="small" v-if="job.status === DataExportJobsStatus.completed"><v-icon :icon="mdiPaperclip" /> {{ getNumberWithSuffix(job.resultSize, 2, 1024, ' ') }}</v-chip>
            </div>

            <div class="text-body-small" v-if="job.status === DataExportJobsStatus.completed && job.datatype === DataExportJobsDatatype.pedigree"><v-icon icon="$helium" />&nbsp;<a target="_blank" :href="`${heliumUrl}?germinateUrl=${encodeURIComponent(getHeliumExportUrl(job.uuid))}`" @click="updateJobs">{{ $t('buttonSendToHelium') }}</a></div>
          </template>

          <template #actions v-if="job.status === DataExportJobsStatus.completed">
            <v-spacer />
            <v-btn :prepend-icon="mdiDownload" :text="$t('buttonDownload')" variant="elevated" color="success" :href="`${store.storeBaseUrl}dataset/export/async/${job.uuid}/download`" @click="updateJobs" />
          </template>
        </v-card>
        <v-divider />
      </template>
    </template>
    <template v-else>
      <template
        v-for="job in importJobs"
        :key="`import-job-${job.uuid}`"
      >
        <v-card
          :class="`border-s-lg border-opacity-100 border-${getJobVariant(job)}`"
          variant="flat"
          :rounded="0"
        >
          <template #prepend>
            <v-avatar :color="templateImportTypes[job.datatype].color()">
              <v-icon :icon="templateImportTypes[job.datatype].path" />
            </v-avatar>
          </template>

          <template #append>
            <v-btn size="x-small" variant="text" v-tooltip:top="$t('buttonDelete')" :icon="mdiClose" @click="deleteImportJob(job)" />
          </template>

          <template #title>
            <div class="text-title-medium">{{ templateImportTypes[job.datatype].text() }}</div>
          </template>

          <template #subtitle>
            <div v-if="job.updatedOn">{{ new Date(job.updatedOn).toLocaleString() }}</div>
          </template>

          <template #text>
            <v-chip label size="small" v-if="job.originalFilename"><v-icon :icon="mdiPaperclip" /> {{ job.originalFilename }}</v-chip>

            <div :class="`mt-2 text-${asyncJobStatus[job.status].color}`" v-if="showStandardStatus(job)">
              <v-icon :icon="asyncJobStatus[job.status].path" /> {{ asyncJobStatus[job.status].text() }}
            </div>
          </template>
          <v-card-actions class="flex-wrap" v-if="(job.status === DataImportJobsStatus.completed && job.imported === false) || job.status === DataImportJobsStatus.failed">
            <v-btn
              :prepend-icon="mdiAlertCircle"
              :text="$t('widgetAsyncJobPanelFeedback')"
              @click="showFeedback(job)"
              variant="tonal"
              :color="job.errorStatus"
              v-if="job.feedback && job.status === DataImportJobsStatus.failed || (job.status === DataImportJobsStatus.completed && (job.errorStatus === 'error' || job.errorStatus === 'warning'))"
            />
            <v-spacer />
            <template v-if="job.status === DataImportJobsStatus.failed && store.storeUserIsDataCurator">
              <v-btn
                :prepend-icon="mdiFileDocumentAlert"
                :text="$t('widgetAsyncJobPanelDownloadLog')"
                @click="downloadImportJobLog(job)"
                variant="tonal"
                color="info"
              />
            </template>
            <template v-else-if="job.status === DataImportJobsStatus.completed && job.imported === false && job.errorStatus !== 'error'">
              <v-btn
                :prepend-icon="mdiCheckCircle"
                :text="$t('widgetAsyncJobPanelImport')"
                @click="startActualImport(job)"
                variant="tonal"
                color="success"
                v-if="store.storeServerSettings?.dataImportMode === 'IMPORT'"
              />
              <v-btn
                :prepend-icon="mdiCheckCircle"
                :text="$t('widgetAsyncJobPanelImportDisabled')"
                disabled
                v-else
              />
            </template>
          </v-card-actions>
        </v-card>
        <v-divider />
      </template>
    </template>

    <v-dialog v-model="dialog" scrollable fullscreen v-if="selectedImportJob">
      <v-card>
        <template #title>
          <div class="d-flex justify-space-between">
            <span>{{ $t('widgetImportStatusTitle') }}</span>
            <v-btn
              size="small"
              variant="flat"
              :icon="mdiClose"
              @click="dialog = false"
            />
          </div>
        </template>
        <template #text>
          <p>{{ $t('widgetImportStatusText') }}</p>

          <ImportStatusTable
            :get-data="getImportJobs"
            hide-footer
          />
        </template>

        <v-card-actions>
          <v-spacer />
          <v-btn :text="$t('buttonClose')" @click="dialog = false" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { apiDeleteDatasetAsyncExport, apiPostDatasetAsyncExport } from '@/plugins/api/dataset'
  import { DataExportJobsDatatype, DataExportJobsStatus, DataImportJobsStatus, type PaginatedResult, type DataExportJobs, type DataImportJobs, type ImportResult, type PaginatedRequest } from '@/plugins/types/germinate'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { coreStore } from '@/stores/app'
  import type { AxiosError, AxiosResponse } from 'axios'
  import emitter from 'tiny-emitter/instance'
  import { useDisplay } from 'vuetify'
  import { useI18n } from 'vue-i18n'
  import { asyncJobStatus, templateImportTypes } from '@/plugins/util/types'
  import { mdiAlertCircle, mdiChartSankey, mdiCheckCircle, mdiClose, mdiDna, mdiDownload, mdiFamilyTree, mdiFileDocumentAlert, mdiHelpCircle, mdiImageMultiple, mdiPaperclip, mdiPulse, mdiReload, mdiShovel, mdiUpload } from '@mdi/js'
  import { downloadBlob } from '@/plugins/util'
  import { apiDeleteDataAsyncImport, apiGetDataAsyncImportLog, apiGetDataAsyncImportStart, apiPostDataAsyncImport } from '@/plugins/api/dataimport'

  const store = coreStore()
  const { name } = useDisplay()

  const { t } = useI18n()

  const dialog = ref(false)
  const visible = ref(false)
  const activeTab = ref<'download' | 'upload'>('download')
  const importJobs = ref<DataImportJobs[]>([])
  const exportJobs = ref<DataExportJobs[]>([])
  const selectedImportJob = ref<DataImportJobs>()

  let timeout: any | undefined = undefined

  interface DataExportType {
    text: Function
    path: string
    color: string
  }

  const dataExportTypes: { [key: string]: DataExportType } = {
    allelefreq: {
      text: () => t('datasetTypeAllelefreq'),
      path: mdiPulse,
      color: getTemplateColor(0),
    },
    climate: {
      text: () => t('datasetTypeClimate'),
      path: mdiChartSankey,
      color: getTemplateColor(1),
    },
    genotype: {
      text: () => t('datasetTypeGenotype'),
      path: mdiDna,
      color: getTemplateColor(2),
    },
    trial: {
      text: () => t('datasetTypeTrials'),
      path: mdiShovel,
      color: getTemplateColor(3),
    },
    pedigree: {
      text: () => t('datasetTypePedigree'),
      path: mdiFamilyTree,
      color: getTemplateColor(4),
    },
    unknown: {
      text: () => t('datasetTypeUnknown'),
      path: mdiHelpCircle,
      color: getTemplateColor(6),
    },
    images: {
      text: () => t('dataTypeImages'),
      path: mdiImageMultiple,
      color: getTemplateColor(5),
    },
  }

  const heliumUrl = computed(() => {
    if (store.storeServerSettings && store.storeServerSettings.heliumUrl) {
      let url = store.storeServerSettings.heliumUrl

      if (url.endsWith('/')) {
        if (url.endsWith('/#/')) {
          url += 'pedigree'
        } else {
          url += '#/pedigree'
        }
      } else {
        if (url.endsWith('/#')) {
          url += '/pedigree'
        } else {
          url += '/#/pedigree'
        }
      }

      return url
    } else {
      return ''
    }
  })

  function showFeedback (job: DataImportJobs) {
    selectedImportJob.value = job

    nextTick(() => {
      dialog.value = true
    })
  }

  function getImportJobs (data: PaginatedRequest) {
    return new Promise<AxiosResponse<PaginatedResult<ImportResult[]>>>(resolve => {
      const items = selectedImportJob.value?.feedback || []

      if (data.orderBy) {
        items.sort((a, b) => {
          let result = 0
          switch (data.orderBy) {
            case 'rowIndex':
              result = Math.sign(a.rowIndex - b.rowIndex)
              break
            case 'type':
              result = a.type.localeCompare(b.type)
              break
            case 'status':
              result = a.status.localeCompare(b.status)
              break
            case 'message':
              result = a.message.localeCompare(b.message)
              break
          }

          return data.ascending ? result : -result
        })
      }

      resolve({
        status: 200,
        statusText: '',
        headers: {},
        // @ts-ignore
        config: {},
        data: {
          count: items.length,
          data: items,
        },
      })
    })
  }

  function deleteExportJob (job: DataExportJobs) {
    emitter.emit('show-confirm', {
      title: t('modalTitleSure'),
      message: t('modalTextDeleteAsyncJob'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'warning',
      callback: (result: boolean) => {
        if (result === true) {
          // Delete from the database
          apiDeleteDatasetAsyncExport(job.uuid, () => {
            // Delete from the store
            store.removeAsyncJobUuids([job.uuid])
            updateJobs()
          })
        }
      },
    })
  }

  function deleteImportJob (job: DataImportJobs) {
    emitter.emit('show-confirm', {
      title: t('modalTitleSure'),
      message: t('modalTextDeleteAsyncJob'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'warning',
      callback: (result: boolean) => {
        if (result === true) {
          // Delete from the database
          apiDeleteDataAsyncImport(job.uuid, () => {
            // Delete from the store
            store.removeAsyncJobUuids([job.uuid])
            updateJobs()
          })
        }
      },
    })
  }

  function downloadImportJobLog (job: DataImportJobs) {
    apiGetDataAsyncImportLog(job.uuid, result => {
      downloadBlob({
        blob: result,
        filename: `log-${job.uuid}`,
        extension: 'zip',
      })
    })
  }

  function startActualImport (job: DataImportJobs) {
    apiGetDataAsyncImportStart(job.uuid, result => {
      if (result) {
        store.addAsyncJobUuids(result.map(r => r.uuid))
      }

      updateJobs()
    })
  }

  function toggleSidebar (at: 'upload' | 'download') {
    if (!visible.value) {
      visible.value = true
    } else if (!at) {
      visible.value = false
    }

    if (at) {
      activeTab.value = at
    }
  }

  const navbarWidth = computed(() => {
    switch (name.value) {
      case 'xs': return 250
      case 'sm':
      case 'md':
      case 'lg':
        return 300
      default:
        return 350
    }
  })

  watch(visible, async newValue => {
    if (newValue) {
      updateAsyncJobs()
    } else {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  })

  watch(store.storeAsyncJobUuids, () => {
    updateJobs()
  }, { immediate: true })

  function updateJobs () {
    nextTick(async () => {
      const expJobs = await apiPostDatasetAsyncExport(store.storeAsyncJobUuids, undefined, {
        codes: [],
        callback: (error: AxiosError) => {
          if (error && error.status === 403) {
            // Log the user out if we get here
            store.setToken(undefined)
          }
        },
      }).catch(() => null)
      const impJobs = await apiPostDataAsyncImport(store.storeAsyncJobUuids, undefined, {
        codes: [],
        callback: () => {
          // We do nothing here. It either works or it doesn't.
        },
      }).catch(() => null)

      const uuids = new Set<string>()

      expJobs?.data.forEach((job: DataExportJobs) => {
        uuids.add(job.uuid)
      })
      impJobs?.data.forEach((job: DataImportJobs, index: number) => {
        uuids.add(job.uuid)
        job.id = index

        const types: { [key: string]: number } = {}

        if (job.status === DataImportJobsStatus.failed) {
          job.errorStatus = 'error'
        } else if (job.feedback) {
          job.feedback.forEach(f => {
            if (!types[f.type]) {
              types[f.type] = 1
            } else {
              types[f.type]++
            }
          })

          if (types.ERROR > 0) {
            job.errorStatus = 'error'
          } else if (types.WARNING > 0) {
            job.errorStatus = 'warning'
          } else {
            job.errorStatus = 'success'
          }
        } else {
          job.errorStatus = 'success'
        }

        return job
      })

      exportJobs.value = expJobs?.data || []
      importJobs.value = impJobs?.data || []

      store.setAsyncJobUuids([...uuids])
    })
  }

  function updateAsyncJobs () {
    if (timeout) {
      clearTimeout(timeout)
      timeout = undefined
    }
    updateJobs()
    timeout = setTimeout(() => {
      updateAsyncJobs()
    }, 5000)
  }

  function getJobVariant (job: DataImportJobs) {
    if (job.errorStatus === 'error') {
      return 'error'
    } else if (job.errorStatus === 'warning') {
      return 'warning'
    } else {
      return asyncJobStatus[job.status].color
    }
  }

  function showStandardStatus (job: DataImportJobs) {
    if (getJobVariant(job) === 'error') {
      return false
    } else if (job.status === DataImportJobsStatus.completed && job.imported === false) {
      return false
    }
    return true
  }

  function getHeliumExportUrl (jobUuid: string) {
    const end = `dataset/export/async/${jobUuid}/download`

    if (store.storeBaseUrl?.startsWith('http')) {
      let base = store.storeBaseUrl

      if (!base.endsWith('/')) {
        base += '/'
      }

      return `${base}${end}`
    } else {
      return `${window.location.protocol}//${window.location.host}${window.location.pathname}/api/${end}`
    }
  }

  onBeforeMount(() => {
    emitter.on('toggle-aside', toggleSidebar)
    emitter.on('update-async-jobs', toggleSidebar)
  })
  onBeforeUnmount(() => {
    emitter.off('toggle-aside', toggleSidebar)
    emitter.off('update-async-jobs', toggleSidebar)

    if (timeout) {
      clearInterval(timeout)
    }
  })
</script>
