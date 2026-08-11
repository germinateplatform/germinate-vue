<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableStoriesEnriched} -->
  <BaseTable
    ref="baseTable"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :show-details="false"
    :display-type="compProps.displayType"
    item-key="storyId"
    table-key="stories"
    :sort-by="[{ key: 'storyCreatedOn', order: 'desc' }]"
    :header-icon="mdiBookOpenPageVariant"
    :header-title="$t('pageStoriesTitle')"
    :supports-grid-cards="true"
    v-bind="$attrs"
    @data-changed="checkIfStoryNeedsToBeShown"
  >
    <template #header v-if="store.storeUserIsAuthenticated">
      <v-btn variant="outlined" :text="$t('buttonAddStory')" :prepend-icon="mdiPlus" @click="createStory" />
    </template>

    <template #item.storySteps="{ item }">
      <v-chip label variant="tonal" :color="((item.storySteps || []).length > 0) ? 'primary' : 'tonal'" :text="(item.storySteps || []).length" :prepend-icon="mdiFormatListNumbered" />
    </template>

    <template #item.storyDescription="{ item }">
      <ShowFullCell :content="item.storyDescription" title="tableColumnStoryDesciption" v-if="item.storyDescription && item.storyDescription.length > 0" />
    </template>

    <template #item.actions="{ item }">
      <v-btn-group variant="tonal">
        <v-btn size="x-small" color="primary" :disabled="item.storySteps.length === 0 && !store.storeUserIsDataCurator" :icon="mdiFileEye" @click="startStory(item)" />
        <v-btn size="x-small" color="warning" :icon="mdiSquareEditOutline" @click="editStory(item)" v-if="store.storeUserIsDataCurator" />
        <v-btn size="x-small" color="error" :icon="mdiDelete" @click="deleteStory(item)" v-if="store.storeUserIsDataCurator" />
      </v-btn-group>
    </template>

    <template #card-item="{ item }">
      <StoryCard
        :story="item"
        @edit="editStory(item)"
        @edit-steps="editStorySteps(item)"
        @delete="deleteStory(item)"
        @select="startStory(item)"
      />
    </template>

    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>
  </BaseTable>

  <!-- @vue-generic {import('@/plugins/types/client').ExtendedViewTableStoriesEnriched} -->
  <GenericAddEditFormModal
    :title="newStory.storyId === -1 ? 'modalTitleStoryAddNew' : 'modalTitleStoryEdit'"
    v-model="newStory"
    :fields="storyFields"
    :notify="sendNewStory"
    ref="addStoryModal"
  >
    <template #additional-fields="{ item }">
      <v-row>
        <v-col cols="12">
          <v-autocomplete
            :items="publications"
            v-model="item.publicationId"
            :label="$t('tableColumnStoryPublication')"
            item-value="publicationId"
            :item-title="item => item.publicationFallbackCache?.title || item.publicationDoi"
            hide-details
            clearable
            v-if="publications"
          />
        </v-col>
        <template v-if="item.storyId !== -1">
          <v-col cols="6">
            <v-switch
              v-model="item.storyVisibility"
              color="primary"
              hide-details
              :label="$t('formLabelStoryVisibility')"
            />
          </v-col>
          <v-col cols="6">
            <v-switch
              v-model="item.storyFeatured"
              color="primary"
              hide-details
              :label="$t('formLabelStoryFeatured')"
            />
          </v-col>
        </template>
      </v-row>
    </template>
  </GenericAddEditFormModal>

  <StoryPreviewModal
    :story="selectedStory"
    :is-edit="selectedStoryIsEdit"
    v-if="selectedStory"
    ref="storyPreviewModal"
    @updated="refresh"
  />

  <DatasetAcceptLicenseModal
    :story="selectedStory"
    v-if="selectedStory"
    ref="datasetAcceptLicenseModal"
    @accepted="licenseAccepted"
  />
</template>

<script setup lang="ts">
  import BaseTable, { type DisplayType } from '@/components/tables/BaseTable.vue'

  // @ts-ignore
  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader, ExtendedViewTableStoriesEnriched } from '@/plugins/types/client'
  import type { AxiosResponse } from 'axios'
  import type { ViewTablePublications, FilterGroup, PaginatedRequest, PaginatedResult, ViewTableStoriesEnriched } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { coreStore } from '@/stores/app'
  import { mdiBookOpenPageVariant, mdiDelete, mdiFormatListNumbered, mdiSquareEditOutline, mdiFileEye, mdiPlus } from '@mdi/js'

  import emitter from 'tiny-emitter/instance'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { lookupDoiInformation } from '@/plugins/util'
  import type { FieldConfig } from '@/components/modals/GenericAddEditFormModal.vue'
  import { apiDeleteStoryById, apiPatchStory, apiPostStoryUpload } from '@/plugins/api/story'
  import { apiPostPublicationsTable } from '@/plugins/api/publication'

  const newStory = ref<ExtendedViewTableStoriesEnriched>({
    storyId: -1,
    storyName: '',
    storyDescription: '',
    storySteps: [],
  })
  const storyToShowAgain = ref<number>()
  const selectedStory = ref<ViewTableStoriesEnriched>()
  const selectedStoryIsEdit = ref(false)

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableStoriesEnriched[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
    displayType?: DisplayType
  }>()

  const store = coreStore()
  const storyPreviewModal = useTemplateRef('storyPreviewModal')
  const datasetAcceptLicenseModal = useTemplateRef('datasetAcceptLicenseModal')
  const addStoryModal = useTemplateRef('addStoryModal')
  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()
  const publications = ref<ViewTablePublications[]>([])

  const storyFields = computed(() => {
    const result: FieldConfig<ExtendedViewTableStoriesEnriched>[] = [{
      key: 'storyName',
      title: 'tableColumnStoryName',
      type: 'text' as const,
      required: true,
      width: 1,
    }, {
      key: 'storyCreatedOn',
      title: 'tableColumnStoryCreatedOn',
      type: 'dateobject' as const,
      required: true,
      width: 1,
    }, {
      key: 'storyDescription',
      title: 'tableColumnStoryDesciption',
      type: 'textarea' as const,
      required: true,
      width: 2,
    }]

    if (newStory.value.storyId === -1) {
      result.push({
        key: 'file',
        title: 'tableColumnStoryImage',
        type: 'file' as const,
        required: false,
        width: 2,
        accepts: '.jpeg, .png, .jpg',
      })
    }

    return result
  })

  function startStory (story: ViewTableStoriesEnriched) {
    selectedStoryIsEdit.value = false
    if (story.canAccess === true) {
      selectedStory.value = story
      nextTick(() => storyPreviewModal.value?.show())
    } else if (story.storyRequirements?.datasetIds && story.storyRequirements?.datasetIds.length > 0) {
      selectedStory.value = story
      nextTick(() => datasetAcceptLicenseModal.value?.show())
    }
  }

  function editStorySteps (story: ViewTableStoriesEnriched) {
    selectedStoryIsEdit.value = true
    selectedStory.value = story

    nextTick(() => storyPreviewModal.value?.show())
  }

  function editStory (story: ViewTableStoriesEnriched) {
    newStory.value = story

    nextTick(() => addStoryModal.value?.show())
  }

  function deleteStory (story: ViewTableStoriesEnriched) {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          apiDeleteStoryById(story.storyId || -1, () => {
            baseTable.value?.refresh()
          }, {
            codes: [404],
            callback: () => {
              // Do nothing here, it just means there is nothing to delete
            },
          })
        }
      },
    })
  }

  function checkIfStoryNeedsToBeShown (query: any, data: PaginatedResult<ViewTableStoriesEnriched[]>) {
    if (storyToShowAgain.value) {
      const match = (data.data || []).find(s => s.storyId === storyToShowAgain.value)
      if (match) {
        startStory(match)
      }
      storyToShowAgain.value = undefined
    }
  }

  function licenseAccepted () {
    storyToShowAgain.value = selectedStory.value?.storyId
    selectedStory.value = undefined

    refresh()
  }

  function refresh () {
    baseTable.value?.refresh()
  }

  function sendNewStory () {
    return new Promise<boolean>(resolve => {
      if (newStory.value.storyId === -1) {
        const formData = new FormData()
        formData.append('storyName', newStory.value.storyName)
        formData.append('storyDescription', newStory.value.storyDescription)
        formData.append('storyCreatedOn', (newStory.value.storyCreatedOn || new Date()).toISOString())
        if (newStory.value.publicationId) {
          formData.append('publicationId', `${newStory.value.publicationId}`)
        }
        formData.append('storyVisibility', `${newStory.value.storyVisibility}`)
        formData.append('storyFeatured', `${newStory.value.storyFeatured}`)

        if (newStory.value.file) {
          formData.append('image', newStory.value.file)
        }

        apiPostStoryUpload(formData, () => {
          baseTable.value?.refresh()
          resolve(true)
        }).catch(() => resolve(false))
      } else {
        apiPatchStory(newStory.value.storyId, {
          storyId: newStory.value.storyId,
          storyName: newStory.value.storyName,
          storyDescription: newStory.value.storyDescription,
          storySteps: [], // We don't send the steps here
          publicationId: newStory.value.publicationId,
          storyFeatured: newStory.value.storyFeatured,
          storyCreatedOn: newStory.value.storyCreatedOn,
          storyVisibility: newStory.value.storyVisibility,
        }, result => {
          resolve(result)
          baseTable.value?.refresh()
        }).catch(() => resolve(false))
      }
    })
  }

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'projectId',
      dataType: 'integer',
      visibleInTable: false,
      title: t('tableColumnProjectId'),
    }, {
      key: 'storyId',
      dataType: 'integer',
      title: t('tableColumnStoryId'),
    }, {
      key: 'storyName',
      dataType: 'string',
      title: t('tableColumnStoryName'),
      preferredSearchColumn: true,
    }, {
      key: 'storyDescription',
      dataType: 'string',
      title: t('tableColumnStoryDesciption'),
    }, {
      key: 'storySteps',
      dataType: 'json',
      visibleInFilter: false,
      title: t('tableColumnStoryStepCount'),
    }, {
      key: 'storyCreatedOn',
      dataType: 'date',
      title: t('tableColumnStoryCreatedOn'),
      value: (value: ViewTableStoriesEnriched) => value.storyCreatedOn ? new Date(value.storyCreatedOn).toLocaleDateString() : undefined,
    }, {
      key: 'storyFeatured',
      title: t('tableColumnStoryVisibleOnDashboard'),
      dataType: 'boolean',
      visibleInTable: false,
    }, {
      key: 'actions',
      dataType: undefined,
      title: '',
      sortable: false,
      visibleInFilter: false,
      align: 'end',
    }]

    return headers
  })

  function createStory () {
    newStory.value = {
      storyId: -1,
      storyName: '',
      storyDescription: '',
      storySteps: [],
    }
    nextTick(() => {
      addStoryModal.value?.show()
    })
  }

  onMounted(() => {
    apiPostPublicationsTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
    }, result => {
      if (result && result.data && result.data.length > 0) {
        result.data.forEach(p => {
          p.lookupDetails = lookupDoiInformation(p)
          try {
            p.publicationFallbackCache = JSON.parse(p.publicationFallbackCache || '')
          } catch {
            //
          }
        })

        publications.value = result.data
      }
    })
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
    createStory,
  })
</script>

<style scoped>
</style>
