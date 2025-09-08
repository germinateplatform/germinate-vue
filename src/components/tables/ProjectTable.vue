<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableProjects} -->
  <BaseTable
    ref="baseTable"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :show-details="false"
    :selection-type="TableSelectionType.all"
    item-key="projectId"
    table-key="projects"
    header-icon="mdi-clipboard-list"
    :header-title="$t('pageProjectsTitle')"
    @selection-changed="selectionChanged"
    v-bind="$attrs"
  >
    <template #header v-if="store.storeUserIsDataCurator">
      <v-btn variant="outlined" :text="$t('buttonAddProject')" prepend-icon="mdi-plus" @click="addItem" />
    </template>

    <!-- Project id link -->
    <template #item.projectId="{ item }">
      <router-link :to="{ path: Pages.getPath(Pages.projectDetails, item.projectId) }">{{ item.projectId }}</router-link>
    </template>
    <!-- Project name link -->
    <template #item.projectName="{ item }">
      <router-link :to="{ path: Pages.getPath(Pages.projectDetails, item.projectId) }">{{ item.projectName }}</router-link>
    </template>
    <!-- Project description link -->
    <template #item.projectDescription="{ item }">
      <router-link :to="{ path: Pages.getPath(Pages.projectDetails, item.projectId) }">{{ item.projectDescription }}</router-link>
    </template>
    <!-- Project datasets -->
    <template #item.datasets="{ item }">
      <span v-if="item.datasets">{{ getNumberWithSuffix(item.datasets.length, 1) }}</span>
    </template>
    <template #item.projectExternalUrl="{ item }">
      <a :href="item.projectExternalUrl" target="_blank" rel="noopener noreferrer" v-if="item.projectExternalUrl">{{ item.projectExternalUrl }}</a>
    </template>
    <!-- Project image/logo -->
    <template #item.projectImageId="{ item }">
      <v-img :src="getSrc(item, 'small')" class="table-image py-2" alt="Image" />
    </template>

    <template #item.projectActions="{ item }" v-if="store.storeUserIsDataCurator">
      <v-icon class="mx-1" color="info" icon="mdi-pencil" @click="editItem(item)" />
      <v-icon class="mx-1" color="error" icon="mdi-delete" @click="deleteItem(item)" />
    </template>

    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>
  </BaseTable>

  <!-- @vue-generic {typeof import('@/plugins/types/ExtendedViewTableProjects')} -->
  <GenericAddEditFormModal
    title="modalTitleAddProject"
    :item="selectedProject"
    :notify="onSendProject"
    :fields="projectFields"
    @items-changed="baseTable?.refresh()"
    ref="projectModal"
    v-if="selectedProject"
  />
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTableProjects } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  // import AddEditProjectModal from '@/components/modals/AddEditProjectModal.vue'
  import GenericAddEditFormModal from '@/components/modals/GenericAddEditFormModal.vue'
  import { coreStore } from '@/stores/app'
  import type { ExtendedViewTableProjects } from '@/plugins/types/ExtendedViewTableProjects'
  import { apiPatchProject, apiPostProject, apiDeleteProject } from '@/plugins/api/project'
  import { Pages } from '@/plugins/pages'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { getImageUrlById } from '@/plugins/util/image'

  import emitter from 'tiny-emitter/instance'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableProjects[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
  }>()

  const store = coreStore()
  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()
  const selectedProject = ref<ViewTableProjects>()
  const projectModal = useTemplateRef('projectModal')

  const projectFields = [{
    key: 'projectName',
    title: 'formLabelProjectName',
    type: 'text' as const,
    required: true,
    width: 1,
    valid: (value: string) => value !== undefined && value !== null && value.trim().length > 0,
  }, {
    key: 'projectDescription',
    title: 'formLabelProjectDescription',
    type: 'textarea' as const,
    required: false,
    width: 1,
  }, {
    key: 'projectPageContent',
    title: 'formLabelProjectPageContent',
    type: 'markdown' as const,
    required: false,
    width: 2,
  }, {
    key: 'projectStartDate',
    title: 'formLabelProjectStartDate',
    type: 'date' as const,
    required: false,
    width: 1,
  }, {
    key: 'projectEndDate',
    title: 'formLabelProjectEndDate',
    type: 'date' as const,
    required: false,
    width: 1,
  }, {
    key: 'projectExternalUrl',
    title: 'formLabelProjectExternalUrl',
    type: 'text' as const,
    inputType: 'url',
    required: false,
    width: 1,
  }, {
    key: 'file',
    title: 'pageDataUploadFilePlaceholder',
    type: 'file' as const,
    required: false,
    width: 1,
    accepts: '.jpeg, .png, .jpg',
  }]

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'projectId',
      title: t('tableColumnProjectId'),
      dataType: 'integer',
    }, {
      key: 'projectName',
      title: t('tableColumnProjectName'),
      dataType: 'string',
    }, {
      key: 'projectDescription',
      dataType: 'string',
      title: t('tableColumnProjectDescription'),
    }, {
      key: 'projectExternalUrl',
      dataType: 'string',
      title: t('tableColumnProjectUrl'),
    }, {
      key: 'projectImageId',
      dataType: undefined,
      sortable: false,
      title: t('tableColumnProjectImage'),
    }, {
      key: 'datasets',
      dataType: undefined,
      sortable: false,
      class: 'text-right',
      title: t('tableColumnProjectDatasets'),
    }, {
      key: 'projectStartDate',
      dataType: 'date',
      title: t('tableColumnProjectStartDate'),
      value: (item: ViewTableProjects) => (item && item.projectStartDate) ? new Date(item.projectStartDate).toLocaleDateString() : '',
    }, {
      key: 'projectEndDate',
      dataType: 'date',
      title: t('tableColumnProjectEndDate'),
      value: (item: ViewTableProjects) => (item && item.projectEndDate) ? new Date(item.projectEndDate).toLocaleDateString() : '',
    }, {
      key: 'projectActions',
      title: '',
      align: 'end' as 'start' | 'end' | 'center',
      visibleInFilter: false,
      dataType: undefined,
    }]

    return headers
  })

  function getSrc (item: ViewTableProjects, size: string) {
    if (!item || !item.projectImageId) {
      return
    }

    return getImageUrlById(item.projectImageId, {
      type: 'projects',
      size: size,
      token: store.storeToken ? store.storeToken.imageToken : '',
    })
  }

  function addItem () {
    selectedProject.value = {}

    nextTick(() => projectModal.value?.show())
  }

  function editItem (project: ViewTableProjects) {
    selectedProject.value = project

    nextTick(() => projectModal.value?.show())
  }

  function deleteItem (project: ViewTableProjects) {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          apiDeleteProject(project.projectId || -1, result => {
            if (result) {
              baseTable.value?.refresh()
              emitter.emit('update-sidebar-menu')
            }
          })
        }
      },
    })
  }

  function selectionChanged (ids: number[]) {
    store.setSelectedProjects(ids)
  }

  function onSendProject (item: ExtendedViewTableProjects) {
    const formData = new FormData()
    formData.append('name', item.projectName || '')
    if (item.projectDescription && item.projectDescription !== '') {
      formData.append('description', item.projectDescription)
    }
    if (item.projectPageContent && item.projectPageContent !== '') {
      formData.append('pageContent', item.projectPageContent)
    }
    if (item.projectStartDate) {
      formData.append('startDate', item.projectStartDate)
    }
    if (item.projectEndDate) {
      formData.append('endDate', item.projectEndDate)
    }
    if (item.projectExternalUrl && item.projectExternalUrl !== '') {
      formData.append('externalUrl', item.projectExternalUrl)
    }

    if (item.file) {
      formData.append('image', item.file)
    }

    console.log(formData)

    return new Promise<boolean>(resolve => {
      if (selectedProject.value?.projectId) {
        apiPatchProject(selectedProject.value?.projectId, formData, () => {
          resolve(true)
        })
      } else {
        apiPostProject(formData, () => {
          resolve(true)
        })
      }
    })
  }

  defineExpose({
    refresh: () => baseTable.value?.refresh(),
  })

  onMounted(() => {
    baseTable.value?.setSelection(store.storeSelectedProjects || [])
  })
</script>

<style scoped>
</style>

<style scoped>
.table-image {
  max-height: 150px;
  object-fit: contain;
}
</style>
