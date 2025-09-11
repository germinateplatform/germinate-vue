<template>
  <v-navigation-drawer
    id="async-status-bar"
    location="right"
    temporary
    :width="navbarWidth"
    v-model="visible"
  >
    <v-list-item :title="$t('widgetAsyncJobTitle')" />
    <v-divider />
    <v-btn-toggle
      class="d-flex align-stretch ma-3"
      border
      mandatory
      color="primary"
      v-model="activeTab"
    >
      <v-btn class="flex-grow-1" value="download" icon="mdi-download" />
      <v-btn class="flex-grow-1" value="upload" icon="mdi-upload" v-if="store.storeUserIsDataCurator || store.storeUserIsAdmin" />
    </v-btn-toggle>

    <v-divider />

    <template v-if="activeTab === 'download'">
      <v-list-item :title="$t('widgetAsyncJobPanelTitle')" />
      <v-divider />
      <template
        v-for="job in exportJobs"
        :key="`export-job-${job.uuid}`"
      >
        <v-list-item
          :class="`border-s-lg border-opacity-100 border-${asyncJobStatus[job.status].color}`"
          :title="dataExportTypes[job.datatype].text()"
        >
          <template #prepend>
            <v-avatar :color="dataExportTypes[job.datatype].color">
              <v-icon :icon="dataExportTypes[job.datatype].path" />
            </v-avatar>
          </template>

          <template #append>
            <v-btn icon="mdi-download" color="success" v-if="job.status === DataExportJobsStatus.completed" :href="`${store.storeBaseUrl}dataset/export/async/${job.uuid}/download`" @click="updateJobs" />
            <v-btn disabled icon="mdi-alert" color="error" v-if="job.status === DataExportJobsStatus.failed" />
          </template>

          <v-list-item-subtitle v-if="job.updatedOn">{{ new Date(job.updatedOn).toLocaleString() }}</v-list-item-subtitle>
          <v-list-item-subtitle :class="`mt-2 text-${asyncJobStatus[job.status].color}`">
            <v-progress-circular color="info" indeterminate size="18" width="3" v-if="job.status === DataExportJobsStatus.running" />
            <v-icon :icon="asyncJobStatus[job.status].path" v-else /> {{ asyncJobStatus[job.status].text() }}
          </v-list-item-subtitle>
          <v-list-item-subtitle class="mt-2 text-caption" v-if="job.status === DataExportJobsStatus.completed"><v-icon icon="mdi-paperclip" /> {{ getNumberWithSuffix(job.resultSize, 2, 1024, ' ') }}</v-list-item-subtitle>

          <v-list-item-subtitle class="mt-2 text-caption" v-if="job.status === DataExportJobsStatus.completed && job.datatype === DataExportJobsDatatype.pedigree"><v-icon icon="$helium" />&nbsp;<a target="_blank" :href="`${heliumUrl}?germinateUrl=${encodeURIComponent(getHeliumExportUrl(job.uuid))}`" @click="updateJobs">{{ $t('buttonSendToHelium') }}</a></v-list-item-subtitle>
        </v-list-item>
        <v-divider />
      </template>
    </template>
    <template v-else>
      <v-list-item :title="$t('widgetAsyncImportJobPanelTitle')" />
      <v-divider />
      <template
        v-for="job in importJobs"
        :key="`import-job-${job.uuid}`"
      >
        <v-list-item
          :class="`border-s-lg border-opacity-100 border-${getJobVariant(job)} `"
          :title="dataExportTypes[job.datatype].text()"
        >
          <template #prepend>
            <v-avatar :color="dataExportTypes[job.datatype].color">
              <v-icon :icon="dataExportTypes[job.datatype].path" />
            </v-avatar>
          </template>

          <v-list-item-subtitle v-if="job.updatedOn">{{ new Date(job.updatedOn).toLocaleString() }}</v-list-item-subtitle>
          <v-list-item-subtitle class="mt-2 text-caption" v-if="job.originalFilename"><v-icon icon="mdi-file" /> {{ job.originalFilename }}</v-list-item-subtitle>
          <!-- Status -->
          <template v-if="job.status === DataImportJobsStatus.failed">
            <!-- If there is feedback -->
            <template v-if="job.feedback">
              <!-- Show a button to view the feedback -->
              <v-list-item-subtitle class="mt-2 text-error"><v-icon icon="mdi-alert-circle" />&nbsp;<a href="#" @click.prevent="showFeedback(job)">{{ $t('widgetAsyncJobPanelFeedback') }}</a></v-list-item-subtitle>
            </template>
            <v-list-item-subtitle v-if="store.storeUserIsDataCurator" class="mt-2 text-info"><v-icon icon="mdi-document-alert" />&nbsp;<a href="#" @click.prevent="downloadImportJobLog(job)">{{ $t('widgetAsyncJobPanelDownloadLog') }}</a></v-list-item-subtitle>
          </template>
          <template v-else-if="job.status === DataImportJobsStatus.completed">
            <!-- If there is feedback -->
            <template v-if="job.feedback">
              <v-list-item-subtitle v-if="job.errorStatus === 'ERROR'" class="mt-2 text-error"><v-icon icon="mdi-alert-circle" />&nbsp;<a href="#" @click.prevent="showFeedback(job)">{{ $t('widgetAsyncJobPanelFeedback') }}</a></v-list-item-subtitle>
              <template v-else>
                <v-list-item-subtitle v-if="job.errorStatus === 'WARNING'" class="mt-2 text-warning"><v-icon icon="mdi-alert-circle" />&nbsp;<a href="#" @click.prevent="showFeedback(job)">{{ $t('widgetAsyncJobPanelFeedback') }}</a></v-list-item-subtitle>
                <!-- If it's empty and the configuration allows import (rather than just checking) and it hasn't been imported yet, allow import -->
                <template v-if="job.imported === false">
                  <v-list-item-subtitle v-if="store.storeServerSettings?.dataImportMode === 'IMPORT'" class="mt-2 text-success"><v-icon icon="mdi-check-circle" />&nbsp;<a href="#" @click.prevent="startActualImport(job)">{{ $t('widgetAsyncJobPanelImport') }}</a></v-list-item-subtitle>
                  <v-list-item-subtitle v-else class="mt-2 text-success"><v-icon icon="mdi-check-circle" /> {{ $t('widgetAsyncJobPanelImportDisabled') }}</v-list-item-subtitle>
                </template>
              </template>
            </template>
          </template>
          <v-list-item-subtitle :class="`mt-2 text-${asyncJobStatus[job.status].color}`" v-if="showStandardStatus(job)"><v-icon :icon="asyncJobStatus[job.status].path" /> {{ asyncJobStatus[job.status].text() }}</v-list-item-subtitle>
        </v-list-item>
        <v-divider />
      </template>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { apiPostDatasetAsyncExport } from '@/plugins/api/dataset'
  import { apiPostDataAsyncImport } from '@/plugins/api/misc'
  import { DataExportJobsDatatype, DataExportJobsStatus, DataImportJobsStatus, type DataExportJobs, type DataImportJobs } from '@/plugins/types/germinate'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { coreStore } from '@/stores/app'
  import type { AxiosError } from 'axios'
  import emitter from 'tiny-emitter/instance'
  import { useDisplay } from 'vuetify'
  import { useI18n } from 'vue-i18n'
  import { asyncJobStatus } from '@/plugins/util/types'

  const store = coreStore()
  const { name } = useDisplay()

  const { t } = useI18n()

  const visible = ref(false)
  const activeTab = ref('download')
  const importJobs = ref<DataImportJobs[]>([])
  const exportJobs = ref<DataExportJobs[]>([])

  let timeout: any | undefined = undefined

  interface DataExportType {
    text: Function
    path: string
    color: string
  }

  const dataExportTypes: { [key: string]: DataExportType } = {
    allelefreq: {
      text: () => t('datasetTypeAllelefreq'),
      path: 'mdi-pulse',
      color: getTemplateColor(0),
    },
    climate: {
      text: () => t('datasetTypeClimate'),
      path: 'mdi-chart-sankey',
      color: getTemplateColor(1),
    },
    genotype: {
      text: () => t('datasetTypeGenotype'),
      path: 'mdi-dna',
      color: getTemplateColor(2),
    },
    trial: {
      text: () => t('datasetTypeTrials'),
      path: 'mdi-shovel',
      color: getTemplateColor(3),
    },
    pedigree: {
      text: () => t('datasetTypePedigree'),
      path: 'mdi-family-tree',
      color: getTemplateColor(4),
    },
    unknown: {
      text: () => t('datasetTypeUnknown'),
      path: 'mdi-help-circle',
      color: getTemplateColor(6),
    },
    images: {
      text: () => t('dataTypeImages'),
      path: 'mdi-image-multiple',
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
    // TODO
  }

  function downloadImportJobLog (job: DataImportJobs) {
    // TODO
  }

  function startActualImport (job: DataImportJobs) {
    // TODO
  }

  function toggleSidebar (at: string | undefined) {
    if (!visible.value) {
      visible.value = true
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
      const expJobs = await apiPostDatasetAsyncExport<DataExportJobs[]>(store.storeAsyncJobUuids, undefined, {
        codes: [],
        callback: (error: AxiosError) => {
          if (error && error.status === 403) {
            // Log the user out if we get here
            store.setToken(undefined)
          }
        },
      }).catch(() => null)
      const impJobs = await apiPostDataAsyncImport<DataImportJobs[]>(store.storeAsyncJobUuids, undefined, {
        codes: [],
        callback: () => {
          // We do nothing here. It either works or it doesn't.
        },
      }).catch(() => null)

      const uuids = new Set<string>()

      expJobs?.data.forEach((job: DataExportJobs) => {
        uuids.add(job.uuid)
      })
      impJobs?.data.forEach((job: DataImportJobs) => {
        uuids.add(job.uuid)

        const types: { [key: string]: number } = {}

        if (job.feedback) {
          job.feedback.forEach(f => {
            if (!types[f.type]) {
              types[f.type] = 1
            } else {
              types[f.type]++
            }
          })

          if (types.ERROR > 0) {
            job.errorStatus = 'ERROR'
          } else if (types.WARNING > 0) {
            job.errorStatus = 'WARNING'
          } else {
            job.errorStatus = 'NONE'
          }
        } else {
          job.errorStatus = 'NONE'
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
    if (job.errorStatus === 'ERROR') {
      return 'error'
    } else if (job.errorStatus === 'WARNING') {
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
  })
  onBeforeUnmount(() => {
    emitter.off('toggle-aside', toggleSidebar)

    if (timeout) {
      clearInterval(timeout)
    }
  })
</script>
