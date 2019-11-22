<template>
  <div class="aside-scroll">
    <b-tabs>
      <b-tab @click="updateAsyncJobs">
        <template slot="title">
          <i class="mdi mdi-18px mdi-refresh"></i>
        </template>
      </b-tab>
    </b-tabs>
    <b-list-group class="list-group-accent">
      <b-list-group-item class="list-group-item-accent-secondary bg-light text-center font-weight-bold text-muted text-uppercase small">
        {{ $t('widgetAsyncJobPanelTitle') }}
      </b-list-group-item>
      <b-list-group-item v-for="job in asyncJobs"
                          :key="job.id"
                          :class="`list-group-item-accent-${status[job.status].color} list-group-item-divider`">
        <a href="#" class="text-muted" @click.prevent="deleteJob(job)" :title="$t('buttonDelete')"><i class="mdi mdi-close float-right"></i></a>
        <div><strong>{{ getExperimentType(job.experimentTypeId) }}</strong></div>
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
          <i class="mdi fix-alignment mdi-download" />&nbsp;<a :href="`${baseUrl}dataset/export/async/${job.uuid}/download`" @click="updateAsyncJobs">Download</a>
        </div>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
  name: 'DefaultAside',
  data: function () {
    return {
      asyncJobs: null,
      isUpdating: false,
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
  methods: {
    deleteJob: function (job) {
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
    getExperimentType: function (experimentTypeId) {
      var match = Object.keys(this.experimentTypes).filter(k => {
        return this.experimentTypes[k].id === experimentTypeId
      })

      if (match && match.length > 0) {
        return this.experimentTypes[match[0]].text()
      } else {
        return 'UNKNOWN DATASET TYPE'
      }
    },
    updateInternal: function () {
      this.$nextTick(() => {
        this.apiPostDatasetAsyncExport(this.asyncJobUuids, result => {
          this.asyncJobs = result

          this.$store.dispatch('ON_ASYNC_JOB_COUNT_CHANGED', result.length)
          this.$store.dispatch('ON_ASYNC_JOB_UUID', this.asyncJobs.map(a => a.uuid))
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
</style>
