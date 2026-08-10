<template>
  <div>
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
      :header-icon="mdiClipboardList"
      :header-title="$t('pageProjectsTitle')"
      :display-type="compProps.displayType"
      @selection-changed="selectionChanged"
      :supports-grid-cards="true"
      v-bind="$attrs"
    >
      <template #header v-if="store.storeUserIsDataCurator">
        <v-btn variant="outlined" :text="$t('buttonAddProject')" :prepend-icon="mdiPlus" @click="addItem" />
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
        <v-img :src="getSrc(item, 'small')" class="table-image py-2" alt="Image" v-if="item.projectImageId" />
      </template>

      <template #item.projectActions="{ item }" v-if="store.storeUserIsDataCurator">
        <v-icon class="mx-1" color="info" :icon="mdiPencil" @click="editItem(item)" />
        <v-icon class="mx-1" color="error" :icon="mdiDelete" @click="deleteItem(item)" />
      </template>

      <template #card-item="{ item }">
        <v-card class="flex-grow-1">
          <v-img height="200" contain class="ma-2" :src="getSrc(item, 'small')" v-if="item.projectImageId" />
          <v-card-title>
            <!-- Germplasm -->
            <router-link :to="Pages.getPath(Pages.projectDetails, item.projectId)">{{ item.projectName }}</router-link>
          </v-card-title>
          <v-card-subtitle class="text-wrap" v-if="item.projectStartDate || item.projectEndDate" v-tooltip:top="getProjectDateRange(item)">{{ getYearRange(item) }}</v-card-subtitle>
          <!-- <v-card-text>
            <v-chip label :color="imageTypes[item.imageRefTable].color()" :prepend-icon="imageTypes[item.imageRefTable].path">{{ imageTypes[item.imageRefTable].text() }}</v-chip>
          </v-card-text> -->
          <v-card-text>{{ item.projectDescription }}</v-card-text>

          <v-card-text v-if="item.datasets && item.datasets.length > 0">
            <v-chip label variant="tonal" size="small" color="primary" :text="$t('tableColumnProjectDatasets')">
              <template #append><v-avatar class="ms-2" :text="item.datasets.length" /></template>
            </v-chip>
          </v-card-text>

          <v-card-actions>
            <v-menu v-if="store.storeUserIsDataCurator">
              <template #activator="{ props }">
                <v-btn variant="tonal" :append-icon="mdiMenuDown" v-bind="props"><v-icon :icon="mdiCog" /></v-btn>
              </template>

              <v-list slim>
                <v-list-item :prepend-icon="mdiPencil" @click="editItem(item)" :title="$t('buttonEdit')" />
                <v-list-item base-color="error" :prepend-icon="mdiDelete" @click="deleteItem(item)" :title="$t('buttonDelete')" />
              </v-list>
            </v-menu>
            <v-spacer />
            <v-btn v-if="item.projectExternalUrl" variant="tonal" :href="item.projectExternalUrl" target="_blank" :text="$t('formLabelProjectExternalUrl')" :prepend-icon="mdiOpenInNew" />
          </v-card-actions>
        </v-card>
      </template>

      <!-- Pass on all named slots -->
      <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
        <slot :name="slot" v-bind="slotProps" />
      </template>
    </BaseTable>

    <!-- @vue-generic {import('@/plugins/types/client').ExtendedViewTableProjects} -->
    <GenericAddEditFormModal
      title="modalTitleAddProject"
      v-model="selectedProject"
      :notify="onSendProject"
      :fields="projectFields"
      @items-changed="baseTable?.refresh()"
      ref="projectModal"
      v-if="selectedProject"
    />
  </div>
</template>

<script setup lang="ts">
  import BaseTable, { type DisplayType } from '@/components/tables/BaseTable.vue'

  import { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader, ExtendedViewTableProjects } from '@/plugins/types/client'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTableProjects } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  // import AddEditProjectModal from '@/components/modals/AddEditProjectModal.vue'
  import GenericAddEditFormModal from '@/components/modals/GenericAddEditFormModal.vue'
  import { coreStore } from '@/stores/app'
  import { apiPatchProject, apiPostProject, apiDeleteProject } from '@/plugins/api/project'
  import { Pages } from '@/plugins/pages'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { getImageUrlById } from '@/plugins/util/image'

  import emitter from 'tiny-emitter/instance'
  import { mdiClipboardList, mdiCog, mdiDelete, mdiMenuDown, mdiOpenInNew, mdiPencil, mdiPlus } from '@mdi/js'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableProjects[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
    displayType?: DisplayType
  }>()

  const store = coreStore()
  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()
  const selectedProject = ref<ExtendedViewTableProjects>()
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
    const headers: ExtendedDataTableHeader[] = [{
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
      align: 'end' as 'start' | 'end' | 'center',
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
    }]

    if (store.storeUserIsDataCurator) {
      headers.push({
        key: 'projectActions',
        title: '',
        align: 'end' as 'start' | 'end' | 'center',
        visibleInFilter: false,
        dataType: undefined,
      })
    }

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

  function getProjectDateRange (item: ViewTableProjects) {
    const candidates = [item.projectStartDate ? new Date(item.projectStartDate).toLocaleDateString() : undefined, item.projectEndDate ? new Date(item.projectEndDate).toLocaleDateString() : undefined]

    return candidates[0] === candidates[1] ? candidates[0] : candidates.filter(y => y !== undefined).join(' - ')
  }

  function getYearRange (item: ViewTableProjects) {
    const candidates = [item.projectStartDate ? new Date(item.projectStartDate).getFullYear() : undefined, item.projectEndDate ? new Date(item.projectEndDate).getFullYear() : undefined]

    return candidates[0] === candidates[1] ? candidates[0] : candidates.filter(y => y !== undefined).join(' - ')
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

  function onSendProject () {
    return new Promise<boolean>(resolve => {
      if (selectedProject.value) {
        const formData = new FormData()
        formData.append('name', selectedProject.value.projectName || '')
        if (selectedProject.value.projectDescription && selectedProject.value.projectDescription !== '') {
          formData.append('description', selectedProject.value.projectDescription)
        }
        if (selectedProject.value.projectPageContent && selectedProject.value.projectPageContent !== '') {
          formData.append('pageContent', selectedProject.value.projectPageContent)
        }
        if (selectedProject.value.projectStartDate) {
          formData.append('startDate', selectedProject.value.projectStartDate)
        }
        if (selectedProject.value.projectEndDate) {
          formData.append('endDate', selectedProject.value.projectEndDate)
        }
        if (selectedProject.value.projectExternalUrl && selectedProject.value.projectExternalUrl !== '') {
          formData.append('externalUrl', selectedProject.value.projectExternalUrl)
        }

        if (selectedProject.value.file) {
          formData.append('image', selectedProject.value.file)
        }

        if (selectedProject.value?.projectId) {
          apiPatchProject(selectedProject.value?.projectId, formData, () => resolve(true))
        } else {
          apiPostProject(formData, () => resolve(true))
        }
      } else {
        resolve(false)
      }
    })
  }

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
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
