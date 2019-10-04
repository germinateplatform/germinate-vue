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
        Data export jobs
      </b-list-group-item>
      <b-list-group-item v-for="job in asyncJobs"
                          :key="job.id"
                          :class="`list-group-item-accent-${status[job.status].color} list-group-item-divider`">
        <a href="#" class="text-muted" @click.prevent="deleteJob(job)" :title="$t('buttonDelete')"><i class="mdi mdi-close float-right"></i></a>
        <div><strong>{{ getExperimentType(job.experimentTypeId) }}</strong></div>
        <div v-if="job.metadata">Dataset: {{ job.metadata.datasetIds }}</div>
        <span class="text-muted mr-3">
          <i class="mdi fix-alignment mdi-calendar-clock"></i><small> {{ job.updatedOn | toDate }}</small>
        </span>
        <span :class="`text-${status[job.status].color}`">
          <i :class="`mdi fix-alignment mdi-${status[job.status].icon}`"></i><small> {{ status[job.status].text() }}</small>
        </span>
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
      status: {
        running: {
          color: 'info',
          icon: 'progress-wrench',
          text: () => 'Running'// TODO
        },
        failed: {
          color: 'danger',
          icon: 'alert',
          text: () => 'Failed'// TODO
        },
        completed: {
          color: 'success',
          icon: 'check-circle',
          text: () => 'Completed'// TODO
        },
        waiting: {
          color: 'info',
          icon: 'pause-circle',
          text: () => 'Waiting'// TODO
        }
      }
    }
  },
  methods: {
    deleteJob: function (job) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
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
    updateAsyncJobs: function () {
      this.apiPostDatasetAsyncExport(this.asyncJobUuids, result => {
        result.forEach(r => {
          if (r.metadata) {
            r.metadata = JSON.parse(r.metadata)// TODO: remove
          }
        })
        this.asyncJobs = result
      })
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
