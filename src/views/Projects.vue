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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ProjectTable from '@/components/tables/ProjectTable'
import { apiPostProjectTable, apiPostProjectTableIds } from '@/mixins/api/project'

export default {
  data: function () {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeSelectedProjects'
    ])
  },
  watch: {
    storeSelectedProjects: function (newValue) {
      if (this.$refs.projectsTable) {
        this.$refs.projectsTable.setSelectedItems(newValue || [])
      }
    }
  },
  components: {
    ProjectTable
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
    onProjectSelected: function (projectId) {
      if (projectId) {
        this.$router.push({ name: 'project-details', params: { projectId: projectId } })
      }
    }
  },
  mounted: function () {
    if (this.storeSelectedProjects) {
      this.$refs.projectsTable.setSelectedItems(this.storeSelectedProjects)
    }
  }
}
</script>

<style scoped>

</style>
