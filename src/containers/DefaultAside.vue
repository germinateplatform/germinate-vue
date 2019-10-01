<template>
  <b-tabs>
    <b-tab>
      <template slot="title">
        <i class="mdi mdi-18px mdi-format-list-bulleted"></i>
      </template>
      <b-list-group class="list-group-accent">
        <b-list-group-item class="list-group-item-accent-secondary bg-light text-center font-weight-bold text-muted text-uppercase small">
          Data export jobs
        </b-list-group-item>
        <b-list-group-item v-for="job in asyncJobs"
                           :key="job.id"
                           :class="`list-group-item-accent-${status[job.status].color} list-group-item-divider`">
          <div><strong>Genotypic data</strong></div>
          <div>Dataset: {{ job.metadata.datasetIds }}</div>
          <span class="text-muted mr-3">
            <i class="mdi fix-alignment mdi-calendar-clock"></i><small> {{ job.updatedOn | toDate }}</small>
          </span>
          <span :class="`text-${status[job.status].color}`">
            <i :class="`mdi fix-alignment mdi-${status[job.status].icon}`"></i><small> {{ status[job.status].text() }}</small>
          </span>
        </b-list-group-item>
        <!-- <b-list-group-item class="list-group-item-accent-info list-group-item-divider">
          <div><strong>Genotypic data</strong></div>
          <div>Dataset: 3, 4</div>
          <small class="text-muted mr-3">
            <i class="mdi mdi-calendar-clock"></i> 13:04
          </small>
          <small class="text-muted">
            <i class="mdi mdi-progress-clock"></i> Running
          </small>
        </b-list-group-item>
        <b-list-group-item class="list-group-item-accent-success list-group-item-divider">
          <div><strong>Genotypic data</strong></div>
          <div>Dataset: 5, 6, 7</div>
          <small class="text-muted mr-3">
            <i class="mdi mdi-calendar-clock"></i> 13:04
          </small>
          <small class="text-muted">
            <i class="mdi mdi-progress-check"></i> Complete
          </small>
          <div>
            <small>
              <a href="#"><i class="mdi mdi-download"/> Download <small>(45.9 MB)</small></a>
            </small>
          </div>
        </b-list-group-item>
        <b-list-group-item class="list-group-item-accent-danger list-group-item-divider">
          <div><strong>Genotypic data</strong></div>
          <div>Dataset: 5, 6, 7</div>
          <small class="text-muted mr-3">
            <i class="mdi mdi-calendar-clock"></i> 13:04
          </small>
          <small class="text-muted">
            <i class="mdi mdi-progress-close"></i> Failed
          </small>
          <div>
            <small>
              <a href="#"><i class="mdi mdi-file-alert-outline"/> Download error log</a>
            </small>
          </div>
        </b-list-group-item> -->
      </b-list-group>
    </b-tab>
    <b-tab>
      <template slot="title">
        <i class="mdi mdi-18px mdi-help-circle-outline"></i>
      </template>
      <div class="p-3">
        CONTENT
      </div>
    </b-tab>
  </b-tabs>
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
    updateAsyncJobs: function () {
      this.apiPostDatasetAsyncExport(this.asyncJobUuids, result => {
        result.forEach(r => {
          r.metadata = JSON.parse(r.metadata)// TODO: remove
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
