<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageProjectsSelectedTitle') }}</h1>
    <v-divider class="mb-3" />

    <template v-if="project">
      <v-row class="mb-3">
        <v-col cols="12" lg="6">
          <v-card>
            <v-img
              height="200px"
              :src="projectSrc"
              contain
              v-if="project.projectImageId"
            />
            <v-card-title>{{ project.projectName }}</v-card-title>
            <v-card-subtitle v-if="project.projectDescription">{{ project.projectDescription }}</v-card-subtitle>
          </v-card>
        </v-col>
        <v-col cols="12" lg="6">
          <!-- Banner buttons -->
          <v-row v-if="projectStats">
            <v-col cols="12" md="6" lg="12" xl="6" v-for="banner in banners" :key="`project-banner-${banner.index}`">
              <v-card :color="getTemplateColor(banner.index)">
                <div class="d-flex flex-no-wrap justify-space-between">
                  <div>
                    <v-card-title class="text-h5">
                      <template v-if="banner.numericValue !== undefined">{{ getNumberWithSuffix(banner.numericValue, 1) }}</template>
                      <template v-else-if="banner.textValue">{{ banner.textValue }}</template>
                    </v-card-title>

                    <v-card-subtitle>{{ $t(banner.title) }}</v-card-subtitle>
                  </div>

                  <v-avatar
                    class="ma-3"
                    rounded="0"
                    size="64"
                  >
                    <v-icon size="64">{{ banner.icon }}</v-icon>
                  </v-avatar>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-card class="mb-3" v-if="project.projectPageContent">
        <template #text>
          <Markdown :source="project.projectPageContent" />
        </template>
      </v-card>

      <v-card :title="$t('pageProjectsDatasetsTitle')" :subtitle="$t('pageProjectsDatasetsSubtitle')">
        <template #text>
          <DatasetTable :get-data="getDatasetData" :filter-on="datasetFilter" />
        </template>
      </v-card>

      <v-card :title="$t('pageProjectsGroupsTitle')" :subtitle="$t('pageProjectsGroupsSubtitle')">
        <template #text>
          <GroupTable :get-data="getGroupData" :filter-on="genericFilter" />
        </template>
      </v-card>
    </template>
  </v-container>
</template>

<script setup lang="ts">
  import DatasetTable from '@/components/tables/DatasetTable.vue'
  import GroupTable from '@/components/tables/GroupTable.vue'
  import { apiPostDatasetTable } from '@/plugins/api/dataset'
  import { apiPostGroupTable } from '@/plugins/api/group'
  import { apiGetProjectStats, apiPostProjectTable } from '@/plugins/api/project'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest, type PaginatedResult, type ProjectStats, type ViewTableProjects } from '@/plugins/types/germinate'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { getImageUrlById } from '@/plugins/util/image'
  import { coreStore } from '@/stores/app'
  import Markdown from 'vue3-markdown-it'

  const route = useRoute('/projects/[id]')
  const router = useRouter()
  const store = coreStore()

  const projectId = ref<number>()
  const project = ref<ViewTableProjects>()
  const projectStats = ref<ProjectStats>()

  const projectSrc = computed(() => {
    if (project.value) {
      return getImageUrlById(project.value.projectImageId || -1, {
        type: 'projects',
        size: 'large',
        token: store.storeToken ? store.storeToken.imageToken : '',
      })
    } else return undefined
  })

  const banners = computed(() => {
    if (project.value && projectStats.value) {
      const result = []

      let i = 0
      if (project.value.projectStartDate) {
        result.push({ index: i++, title: 'pageProjectsPublicationStartDate', icon: 'mdi-calendar-arrow-right', textValue: new Date(project.value.projectStartDate).toLocaleDateString() })
      }
      if (project.value.projectEndDate) {
        result.push({ index: i++, title: 'pageProjectsPublicationEndDate', icon: 'mdi-calendar-arrow-left', textValue: new Date(project.value.projectEndDate).toLocaleDateString() })
      }
      result.push({ index: i++, title: 'pageProjectsDatasetsTitle', icon: 'mdi-database', numericValue: projectStats.value.datasetCount })
      result.push({ index: i++, title: 'pageProjectsPublicationsTitle', icon: 'mdi-newspaper-variant', numericValue: projectStats.value.publicationCount })
      result.push({ index: i++, title: 'pageProjectsGroupsTitle', icon: 'mdi-group', numericValue: projectStats.value.groupCount })
      result.push({ index: i++, title: 'pageProjectsCollaboratorsTitle', icon: 'mdi-account-multiple', numericValue: projectStats.value.collaboratorCount })

      return result
    } else {
      return []
    }
  })

  const datasetFilter: ComputedRef<FilterGroup[]> = computed(() => {
    if (projectId.value) {
      return [{
        filters: [{
          column: 'projectId',
          comparator: FilterComparator.equals,
          values: [`${projectId.value}`],
          canBeChanged: false,
        }],
        operator: FilterOperator.and,
      }]
    } else {
      return []
    }
  })

  const genericFilter: ComputedRef<FilterGroup[]> = computed(() => {
    if (projectId.value) {
      return [{
        filters: [{
          column: 'projectIds',
          comparator: FilterComparator.arrayContains,
          values: [`${projectId.value}`],
          canBeChanged: false,
        }],
        operator: FilterOperator.and,
      }]
    } else {
      return []
    }
  })

  function getDatasetData (data: PaginatedRequest) {
    return apiPostDatasetTable(data)
  }

  function getGroupData (data: PaginatedRequest) {
    return apiPostGroupTable(data)
  }

  onBeforeMount(() => {
    if (route.params && route.params.id) {
      projectId.value = +route.params.id

      if (projectId.value) {
        const queryParams = {
          page: 1,
          limit: 1,
          prevCount: -1,
          filters: [{
            filters: [{
              column: 'projectId',
              comparator: FilterComparator.equals,
              values: [`${projectId.value}`],
            }],
            operator: FilterOperator.and,
          }],
        }
        apiPostProjectTable<PaginatedResult<ViewTableProjects[]>>(queryParams, result => {
          if (result && result.data && result.data.length > 0) {
            project.value = result.data[0]
          }
        })

        apiGetProjectStats<ProjectStats>(projectId.value, result => {
          projectStats.value = result
        })
      } else {
        router.push(Pages.projects.path)
      }
    }
  })
</script>
