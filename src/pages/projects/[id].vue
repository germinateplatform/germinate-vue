<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageProjectsSelectedTitle') }}</h1>
    <v-divider class="mb-3" />

    <template v-if="project">
      <v-row class="mb-3 card-icon-avatar">
        <v-col cols="12" lg="6">
          <v-card>
            <v-img
              height="200px"
              class="ma-5"
              :src="projectSrc"
              contain
              v-if="project.projectImageId"
            />
            <v-card-title>{{ project.projectName }}</v-card-title>
            <v-card-text v-if="project.projectDescription">{{ project.projectDescription }}</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" lg="6">
          <!-- Banner buttons -->
          <v-row v-if="projectStats">
            <v-col cols="12" md="6" lg="12" xl="6" v-for="banner in banners" :key="`project-banner-${banner.index}`">
              <v-card :color="getTemplateColor(banner.index)">
                <div class="d-flex flex-no-wrap justify-space-between">
                  <div>
                    <v-card-title class="text-headline-small">
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

      <v-card class="mb-5" v-if="project.projectPageContent">
        <template #text>
          <Markdown :source="project.projectPageContent" />
        </template>
      </v-card>

      <v-card class="mb-5" :title="$t('pageProjectsExperimentsTitle')" :subtitle="$t('pageProjectsExperimentsSubtitle')">
        <template #append v-if="store.storeUserIsDataCurator">
          <v-btn @click="addNew('experiment')" variant="tonal" :text="$t('buttonAddNewToProject')" :prepend-icon="mdiPlusBox" />
        </template>
        <ExperimentTable disabled disable-forced-project-filter :get-data="getExperimentData" :filter-on="experimentFilter" ref="experimentTable">
          <template #item.actions="{ item }">
            <v-btn-group variant="tonal">
              <v-btn size="x-small" color="error" :icon="mdiDelete" @click="removeItem(item.experimentId, 'experiment')" />
            </v-btn-group>
          </template>
        </ExperimentTable>
      </v-card>

      <v-card class="mb-5" :title="$t('pageProjectsDatasetsTitle')" :subtitle="$t('pageProjectsDatasetsSubtitle')">
        <DatasetTable disabled :get-data="getDatasetData" :filter-on="datasetFilter" ref="datasetTable" />
      </v-card>

      <v-card :title="$t('pageProjectsGroupsTitle')" :subtitle="$t('pageProjectsGroupsSubtitle')">
        <template #append v-if="store.storeUserIsDataCurator">
          <v-btn @click="addNew('group')" variant="tonal" :text="$t('buttonAddNewToProject')" :prepend-icon="mdiPlusBox" />
        </template>
        <GroupTable disabled disable-forced-project-filter :get-data="getGroupData" :filter-on="genericFilter" ref="groupTable">
          <template #item.groupActions="{ item }">
            <v-btn-group variant="tonal">
              <v-btn size="x-small" color="error" :icon="mdiDelete" @click="removeItem(item.groupId, 'group')" />
            </v-btn-group>
          </template>
        </GroupTable>
      </v-card>
    </template>

    <v-bottom-sheet
      v-model="bottomSheetVisible"
      inset
      scrollable
      max-height="75vh"
    >
      <v-card
        class="pb-10"
      >
        <v-card-title class="d-flex justify-space-between align-center  ">
          <div>
            <v-btn variant="text" v-tooltip:top="$t('buttonCancel')" :icon="mdiClose" @click="bottomSheetVisible = false" />
            <span>{{ $t('buttonAddNewToProject') }}</span>
          </div>
          <v-btn :text="$t('buttonSave')" color="primary" variant="tonal" :disabled="!selectedIds || selectedIds.length === 0" @click="addToProject" />
        </v-card-title>
        <v-card-text>
          <ExperimentTable disable-forced-project-filter disabled :get-data="getExperimentData" :get-ids="getExperimentIds" :selection-type="TableSelectionType.all" v-if="addType === 'experiment'" @selection-changed="(ids: number[]) => { selectedIds = ids }" />
          <GroupTable disable-forced-project-filter disabled :get-data="getGroupData" :get-ids="getGroupIds" :selection-type="TableSelectionType.all" v-else-if="addType === 'group'" @selection-changed="(ids: number[]) => { selectedIds = ids }" />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>

<route lang="yaml">
name: projectDetails
</route>

<script setup lang="ts">
  import DatasetTable from '@/components/tables/DatasetTable.vue'
  import GroupTable from '@/components/tables/GroupTable.vue'
  import { apiPostDatasetTable, apiPostExperimentTable, apiPostExperimentTableIds } from '@/plugins/api/dataset'
  import { apiPostGroupTable, apiPostGroupTableIds } from '@/plugins/api/group'
  import { apiDeleteProjectExperiment, apiDeleteProjectGroup, apiGetProjectStats, apiPostProjectExperiments, apiPostProjectGroups, apiPostProjectTable } from '@/plugins/api/project'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest, type ProjectStats, type ViewTableProjects } from '@/plugins/types/germinate'
  import { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import { getTemplateColor } from '@/plugins/util/colors'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { getImageUrlById } from '@/plugins/util/image'
  import { coreStore } from '@/stores/app'
  import { mdiAccountMultiple, mdiCalendarArrowLeft, mdiCalendarArrowRight, mdiClose, mdiDatabase, mdiDelete, mdiGroup, mdiNewspaperVariant, mdiPlusBox } from '@mdi/js'
  import Markdown from 'vue3-markdown-it'

  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  const route = useRoute('projectDetails')
  const router = useRouter()
  const store = coreStore()
  const { t } = useI18n()

  const experimentTable = useTemplateRef('experimentTable')
  const datasetTable = useTemplateRef('datasetTable')
  const groupTable = useTemplateRef('groupTable')

  const projectId = ref<number>()
  const project = ref<ViewTableProjects>()
  const projectStats = ref<ProjectStats>()

  const bottomSheetVisible = ref(false)
  const addType = ref<'group' | 'experiment'>()
  const selectedIds = ref<number[]>([])

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
        result.push({ index: i++, title: 'pageProjectsPublicationStartDate', icon: mdiCalendarArrowRight, textValue: new Date(project.value.projectStartDate).toLocaleDateString() })
      }
      if (project.value.projectEndDate) {
        result.push({ index: i++, title: 'pageProjectsPublicationEndDate', icon: mdiCalendarArrowLeft, textValue: new Date(project.value.projectEndDate).toLocaleDateString() })
      }
      result.push(
        { index: i++, title: 'pageProjectsDatasetsTitle', icon: mdiDatabase, numericValue: projectStats.value.datasetCount },
        { index: i++, title: 'pageProjectsPublicationsTitle', icon: mdiNewspaperVariant, numericValue: projectStats.value.publicationCount },
        { index: i++, title: 'pageProjectsGroupsTitle', icon: mdiGroup, numericValue: projectStats.value.groupCount },
        { index: i++, title: 'pageProjectsCollaboratorsTitle', icon: mdiAccountMultiple, numericValue: projectStats.value.collaboratorCount },
      )

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

  const experimentFilter: ComputedRef<FilterGroup[]> = computed(() => {
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

  function getExperimentData (data: PaginatedRequest) {
    return apiPostExperimentTable(data)
  }

  function getExperimentIds (data: PaginatedRequest) {
    return apiPostExperimentTableIds(data)
  }

  function addToProject () {
    if (!project.value) {
      return
    }

    switch (addType.value) {
      case 'experiment':
        apiPostProjectExperiments(project.value.projectId || -1, selectedIds.value, () => {
          experimentTable.value?.refresh()
          datasetTable.value?.refresh()
          bottomSheetVisible.value = false
        })
        break
      case 'group':
        apiPostProjectGroups(project.value.projectId || -1, selectedIds.value, () => {
          groupTable.value?.refresh()
          bottomSheetVisible.value = false
        })
        break
    }
  }

  function removeItem (item: number, type: 'experiment' | 'group') {
    const p = project.value

    if (!p) {
      return
    }

    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          switch (type) {
            case 'experiment':
              apiDeleteProjectExperiment(p.projectId || -1, item, () => {
                experimentTable.value?.refresh()
                datasetTable.value?.refresh()
              })
              break
            case 'group':
              apiDeleteProjectGroup(p.projectId || -1, item, () => {
                groupTable.value?.refresh()
              })
              break
          }
        }
      },
    })
  }

  function getDatasetData (data: PaginatedRequest) {
    return apiPostDatasetTable(data)
  }

  function getGroupData (data: PaginatedRequest) {
    return apiPostGroupTable(data)
  }

  function getGroupIds (data: PaginatedRequest) {
    return apiPostGroupTableIds(data)
  }

  function addNew (type: 'experiment' | 'group') {
    addType.value = type

    nextTick(() => {
      bottomSheetVisible.value = true
    })
  }

  watch(bottomSheetVisible, async newValue => {
    if (newValue === false) {
      selectedIds.value = []
      addType.value = undefined
    }
  })

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
        apiPostProjectTable(queryParams, result => {
          if (result && result.data && result.data.length > 0) {
            project.value = result.data[0]
          }
        })

        apiGetProjectStats(projectId.value, result => {
          projectStats.value = result
        })
      } else {
        router.push(Pages.projects.path)
      }
    }
  })
</script>
