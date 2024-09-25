<template>
  <div>
    <h1>{{ $t('pageProjectsTitle') }}</h1>
    <hr />

    <p>{{ $t('pageProjectsText') }}</p>

    <!-- Table showing all projects -->
    <ProjectTable ref="projectsTable"
                  :getData="getProjectData"
                  :getIds="getProjectIds"
                  selectable
                  @selection-changed="projectsSelected"
                  @project-selected="onProjectSelected" />

    <!-- Project details -->
    <div v-if="project" ref="projectDetails">
      <hr />
      <!-- Name -->
      <h2>{{ project.projectName }}</h2>
      <!-- Description -->
      <template v-if="project.projectDescription">
        <h3>{{ $t('pageProjectsDescriptionTitle') }}</h3>
        <p>{{ project.projectDescription }}</p>

        <b-card class="mb-3" v-if="project.projectPageContent">
          <VueMarkdown :source="project.projectPageContent" />
        </b-card>

        <b-row>
          <b-col class="mb-3" cols="12" md=6>
            <b-card class="h-100" :title="$t('pageProjectsDatasetsTitle')" :sub-title="$t('pageProjectsDatasetsTitle')">
              <DatasetTable :getData="getDatasetData" :filterOn="datasetFilter" />
            </b-card>
          </b-col>
          <b-col class="mb-3" cols="12" md=6>
            <b-card class="h-100" :title="$t('pageProjectsGroupsTitle')" :sub-title="$t('pageProjectsGroupsTitle')">
              <GroupTable :getData="getGroupData" :filterOn="groupFilter" />
            </b-card>
          </b-col>
        </b-row>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import VueMarkdown from '@adapttive/vue-markdown'
import ProjectTable from '@/components/tables/ProjectTable'
import DatasetTable from '@/components/tables/DatasetTable'
import GroupTable from '@/components/tables/GroupTable'
import { apiPostProjectTable, apiPostProjectTableIds } from '@/mixins/api/project'
import { apiPostDatasetTable } from '@/mixins/api/dataset'
import { apiPostGroupTable } from '@/mixins/api/group'

export default {
  data: function () {
    return {
      project: null,
      projectId: null
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeServerSettings',
      'storeSelectedProjects'
    ]),
    datasetFilter: function () {
      if (this.projectId) {
        return [{
          column: {
            name: 'projectId',
            type: Number
          },
          comparator: 'equals',
          operator: 'and',
          values: [this.projectId],
          canBeChanged: false
        }]
      } else {
        return []
      }
    },
    groupFilter: function () {
      if (this.projectId) {
        return [{
          column: {
            name: 'projectIds',
            type: Number
          },
          comparator: 'arrayContains',
          operator: 'and',
          values: [this.projectId],
          canBeChanged: false
        }]
      } else {
        return []
      }
    }
  },
  watch: {
    storeToken: function () {
      // On login/logout, deselect the current project
      this.project = null
      this.projectId = null
    },
    storeSelectedProjects: function (newValue) {
      if (this.$refs.projectsTable) {
        this.$refs.projectsTable.setSelectedItems(newValue || [])
      }
    }
  },
  components: {
    ProjectTable,
    DatasetTable,
    GroupTable,
    VueMarkdown
  },
  methods: {
    projectsSelected: function (params) {
      this.$store.dispatch('setSelectedProjects', params || [])
    },
    getProjectData: function (data, callback) {
      return apiPostProjectTable(data, callback)
    },
    getProjectIds: function (data, callback) {
      return apiPostProjectTableIds(data, callback)
    },
    getDatasetData: function (data, callback) {
      return apiPostDatasetTable(data, callback)
    },
    getGroupData: function (data, callback) {
      return apiPostGroupTable(data, callback)
    },
    onProjectSelected: function (projectId) {
      this.projectId = projectId

      if (this.projectId) {
        const queryParams = {
          page: 1,
          limit: 1,
          prevCount: -1,
          filter: [{
            column: 'projectId',
            comparator: 'equals',
            operator: 'and',
            values: [this.projectId]
          }]
        }
        apiPostProjectTable(queryParams, result => {
          if (result && result.data && result.data.length > 0) {
            // Update the URL to reflect the newly selected project
            this.$router.push({ name: 'project-details', params: { projectId: this.projectId }, query: this.$router.currentRoute.query })
            this.project = result.data[0]
          }
        })
      }
    }
  },
  mounted: function () {
    if (this.storeSelectedProjects) {
      this.$refs.projectsTable.setSelectedItems(this.storeSelectedProjects)
    }

    this.onProjectSelected(this.$route.params.projectId)
  }
}
</script>

<style>

</style>
