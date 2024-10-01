<template>
  <!-- Project details -->
  <div v-if="project" ref="projectDetails">
    <h1>{{ $t('pageProjectsSelectedTitle') }}</h1>

    <b-row>
      <b-col :cols=12 :lg=6>
        <b-card no-body class="project-card mb-3">
          <!-- Image -->
          <b-card-img-lazy top :src="getSrc()" alt="Image" class="rounded-0" v-if="project.projectImageId" />
          <b-card-body class="d-flex flex-column bg-dark">
            <!-- Name -->
            <b-card-title :class="{ 'text-light': true, 'mb-0': !project.projectDescription }">{{ project.projectName }}</b-card-title>
            <!-- Description -->
            <b-card-text class="text-light" v-if="project.projectDescription">{{ project.projectDescription }}</b-card-text>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col :cols=12 :lg=6>
        <!-- Banner buttons -->
        <b-row v-if="projectStats">
          <b-col cols=12 md=6 lg=12 class="mb-3 col-xxxl-6" v-for="banner in banners" :key="`project-banner-${banner.index}`">
            <BannerCard :templateColorIndex="banner.index" :title="banner.title" :numericValue="banner.numericValue" :textValue="banner.textValue" :link="banner.link" :iconPath="banner.icon" />
          </b-col>
        </b-row>
      </b-col>
    </b-row>

    <b-card class="mb-3" v-if="project.projectPageContent">
      <VueMarkdown :source="project.projectPageContent" />
    </b-card>

    <b-row>
      <b-col class="mb-3" cols="12">
        <b-card class="h-100" :title="$t('pageProjectsDatasetsTitle')" :sub-title="$t('pageProjectsDatasetsSubtitle')">
          <DatasetTable :getData="getDatasetData" :filterOn="datasetFilter" />
        </b-card>
      </b-col>
      <b-col class="mb-3" cols="12">
        <b-card class="h-100" :title="$t('pageProjectsGroupsTitle')" :sub-title="$t('pageProjectsGroupsSubtitle')">
          <GroupTable :getData="getGroupData" :filterOn="genericFilter" />
        </b-card>
      </b-col>
      <b-col class="mb-3" cols="12">
        <b-card class="h-100" :title="$t('pageProjectsPublicationsTitle')" :sub-title="$t('pageProjectsPublicationsSubtitle')">
          <PublicationTable :getData="getPublicationData" :filterOn="genericFilter" />
        </b-card>
      </b-col>
      <b-col class="mb-3" cols="12">
        <b-card class="h-100" :title="$t('pageProjectsCollaboratorsTitle')" :sub-title="$t('pageProjectsCollaboratorsSubtitle')">
          <CollaboratorTable :getData="getCollaboratorData" :filterOn="genericFilter" />
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import VueMarkdown from '@adapttive/vue-markdown'
import DatasetTable from '@/components/tables/DatasetTable'
import GroupTable from '@/components/tables/GroupTable'
import PublicationTable from '@/components/tables/PublicationTable'
import CollaboratorTable from '@/components/tables/CollaboratorTable.vue'
import BannerCard from '@/components/util/BannerCard'
import { apiGetProjectStats, apiPostProjectTable } from '@/mixins/api/project'
import { apiPostCollaboratorsTable, apiPostDatasetTable } from '@/mixins/api/dataset'
import { apiPostGroupTable } from '@/mixins/api/group'
import { getImageUrlById } from '@/mixins/image'
import { apiPostPublicationsTable } from '@/mixins/api/misc'
import { mdiCalendarArrowRight, mdiCalendarArrowLeft, mdiDatabase, mdiGroup, mdiNewspaperVariant, mdiAccountMultiple } from '@mdi/js'

export default {
  data: function () {
    return {
      project: null,
      projectId: null,
      projectStats: null
    }
  },
  computed: {
    ...mapGetters([
      'storeServerSettings'
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
    genericFilter: function () {
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
    },
    banners: function () {
      if (this.project && this.projectStats) {
        const result = []

        let i = 0
        if (this.project.projectStartDate) {
          result.push({ index: i++, title: 'pageProjectsPublicationStartDate', icon: mdiCalendarArrowRight, textValue: new Date(this.project.projectStartDate).toLocaleDateString() })
        }
        if (this.project.projectEndDate) {
          result.push({ index: i++, title: 'pageProjectsPublicationEndDate', icon: mdiCalendarArrowLeft, textValue: new Date(this.project.projectEndDate).toLocaleDateString() })
        }
        result.push({ index: i++, title: 'pageProjectsDatasetsTitle', icon: mdiDatabase, numericValue: this.projectStats.datasetCount })
        result.push({ index: i++, title: 'pageProjectsPublicationsTitle', icon: mdiNewspaperVariant, numericValue: this.projectStats.publicationCount })
        result.push({ index: i++, title: 'pageProjectsGroupsTitle', icon: mdiGroup, numericValue: this.projectStats.groupCount })
        result.push({ index: i++, title: 'pageProjectsCollaboratorsTitle', icon: mdiAccountMultiple, numericValue: this.projectStats.collaboratorCount })

        return result
      } else {
        return []
      }
    }
  },
  components: {
    BannerCard,
    CollaboratorTable,
    DatasetTable,
    PublicationTable,
    GroupTable,
    VueMarkdown
  },
  methods: {
    getSrc: function () {
      return getImageUrlById(this.project.projectImageId, {
        type: 'projects',
        size: 'large',
        token: this.storeToken ? this.storeToken.imageToken : ''
      })
    },
    projectsSelected: function (params) {
      this.$store.dispatch('setSelectedProjects', params || [])
    },
    getDatasetData: function (data, callback) {
      return apiPostDatasetTable(data, callback)
    },
    getGroupData: function (data, callback) {
      return apiPostGroupTable(data, callback)
    },
    getCollaboratorData: function (data, callback) {
      return apiPostCollaboratorsTable(data, callback)
    },
    getPublicationData: function (data) {
      return apiPostPublicationsTable(data, (result) => {
        if (result && result.data && result.data.length > 0) {
          result.data.forEach(p => {
            try {
              p.publicationFallbackCache = JSON.parse(p.publicationFallbackCache)
            } catch (err) {
              //
            }
          })
        }
      })
    },
    onProjectSelected: function (projectId) {
      this.projectId = projectId
      this.project = null

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
            this.project = result.data[0]
          }
        })

        apiGetProjectStats(this.projectId, result => {
          this.projectStats = result
        })
      } else {
        this.$router.push({ name: 'projects' })
        this.project = null
      }
    }
  },
  mounted: function () {
    if (this.$route && this.$route.params) {
      this.onProjectSelected(this.$route.params.projectId)
    }
  }
}
</script>

<style scoped>
.project-image {
  max-height: 200px;
}
</style>

<style>
.project-card .card-img-top {
  width: 100%;
  height: 250px;
  object-fit: contain;
  padding: 2em;
}
</style>
