<template>
  <v-container fluid v-if="publication && displayData">
    <PageHeaderBreadcrumbs :items="breadcrumbs" :icon="mdiNewspaper" />
    <v-divider class="mb-3" />

    <PublicationCard :publication="publication" @delete="deletePublication" />

    <v-card :title="$t('pagePublicationGermplasmTitle')" :subtitle="$t('pagePublicationGermplasmSubtitle')" class="mt-5" v-if="store.storeUserIsDataCurator || (publication.germplasmIds || []).length > 0">
      <template #append v-if="store.storeUserIsDataCurator">
        <v-btn @click="addNew(PublicationdataReferenceType.germplasm)" variant="tonal" :text="$t('buttonAddNewToPublication')" :prepend-icon="mdiPlusBox" />
      </template>
      <GermplasmTable disabled disable-forced-project-filter show-custom-actions :can-create-new="false" :get-ids="getPublicationGermplasmIds" :get-data="getPublicationGermplasmData" ref="germplasmTable">
        <template #item.custom-actions="{ item }">
          <v-btn-group variant="tonal">
            <v-btn size="x-small" color="error" :icon="mdiDelete" @click="removeItem(item.germplasmId, PublicationdataReferenceType.germplasm)" />
          </v-btn-group>
        </template>
      </GermplasmTable>
    </v-card>

    <v-card :title="$t('pagePublicationDatasetsTitle')" :subtitle="$t('pagePublicationDatasetsSubtitle')" class="mt-5" v-if="store.storeUserIsDataCurator || (publication.datasetIds || []).length > 0">
      <template #append v-if="store.storeUserIsDataCurator">
        <v-btn @click="addNew(PublicationdataReferenceType.dataset)" variant="tonal" :text="$t('buttonAddNewToPublication')" :prepend-icon="mdiPlusBox" />
      </template>
      <DatasetTable disabled disable-forced-project-filter :can-create-new="false" :get-data="getPublicationDatasetData" ref="datasetTable">
        <template #item.datasetDetails="{ item }">
          <v-btn-group variant="tonal">
            <v-btn size="x-small" color="error" :icon="mdiDelete" @click="removeItem(item.datasetId, PublicationdataReferenceType.dataset)" />
          </v-btn-group>
        </template>
      </DatasetTable>
    </v-card>

    <v-card :title="$t('pagePublicationExperimentsTitle')" :subtitle="$t('pagePublicationExperimentsSubtitle')" class="mt-5" v-if="store.storeUserIsDataCurator || (publication.datasetIds || []).length > 0">
      <template #append v-if="store.storeUserIsDataCurator">
        <v-btn @click="addNew(PublicationdataReferenceType.experiment)" variant="tonal" :text="$t('buttonAddNewToPublication')" :prepend-icon="mdiPlusBox" />
      </template>
      <ExperimentTable disabled disable-forced-project-filter :can-create-new="false" show-custom-actions :get-data="getPublicationExperimentData" ref="experimentTable">
        <template #item.custom-actions="{ item }">
          <v-btn-group variant="tonal">
            <v-btn size="x-small" color="error" :icon="mdiDelete" @click="removeItem(item.experimentId, PublicationdataReferenceType.experiment)" />
          </v-btn-group>
        </template>
      </ExperimentTable>
    </v-card>

    <v-card :title="$t('pagePublicationGroupsTitle')" :subtitle="$t('pagePublicationGroupsSubtitle')" class="mt-5" v-if="store.storeUserIsDataCurator || (publication.groupIds || []).length > 0">
      <template #append v-if="store.storeUserIsDataCurator">
        <v-btn @click="addNew(PublicationdataReferenceType.group)" variant="tonal" :text="$t('buttonAddNewToPublication')" :prepend-icon="mdiPlusBox" />
      </template>
      <GroupTable disabled disable-forced-project-filter :can-create-new="false" :get-data="getPublicationGroupData" ref="groupTable">
        <template #item.groupActions="{ item }">
          <v-btn-group variant="tonal">
            <v-btn size="x-small" color="error" :icon="mdiDelete" @click="removeItem(item.groupId, PublicationdataReferenceType.group)" />
          </v-btn-group>
        </template>
      </GroupTable>
    </v-card>

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
            <span>{{ $t('buttonAddNewToPublication') }}</span>
          </div>
          <v-btn :text="$t('buttonSave')" color="primary" variant="tonal" :disabled="!selectedIds || selectedIds.length === 0" @click="addToPublication" />
        </v-card-title>
        <v-card-text>
          <GermplasmTable disable-forced-project-filter :get-data="getGermplasmData" :get-ids="getGermplasmIds" :selection-type="TableSelectionType.all" v-if="addType === 'germplasm'" @selection-changed="(ids: number[]) => { selectedIds = ids }" />
          <DatasetTable disable-forced-project-filter disabled :get-data="getDatasetData" :get-ids="getDatasetIds" :selection-type="TableSelectionType.all" v-if="addType === 'dataset'" @selection-changed="(ids: number[]) => { selectedIds = ids }" />
          <ExperimentTable disable-forced-project-filter disabled :get-data="getExperimentData" :get-ids="getExperimentIds" :selection-type="TableSelectionType.all" v-if="addType === 'experiment'" @selection-changed="(ids: number[]) => { selectedIds = ids }" />
          <GroupTable disable-forced-project-filter disabled :get-data="getGroupData" :get-ids="getGroupIds" :selection-type="TableSelectionType.all" v-else-if="addType === 'group'" @selection-changed="(ids: number[]) => { selectedIds = ids }" />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>

<route lang="yaml">
name: publicationDetails
</route>

<script setup lang="ts">
  import { apiPostDatasetTable, apiPostDatasetTableIds, apiPostExperimentTable, apiPostExperimentTableIds, apiPostPublicationDatasetTable, apiPostPublicationExperimentTable } from '@/plugins/api/dataset'
  import { apiPostGermplasmTable, apiPostGermplasmTableIds, apiPostPublicationGermplasmTable, apiPostPublicationGermplasmTableIds } from '@/plugins/api/germplasm'
  import { apiPostGroupTable, apiPostGroupTableIds, apiPostPublicationGroupTable } from '@/plugins/api/group'
  import { apiDeletePublication, apiDeletePublicationReference, apiDeletePublicationReferenceDatabase, apiPostPublicationsTable, apiPutPublicationReferences } from '@/plugins/api/publication'
  import { Pages } from '@/plugins/pages'
  import { FilterComparator, FilterOperator, PublicationdataReferenceType, type PaginatedRequest, type PublicationDoiLookupDetails, type ViewTablePublications } from '@/plugins/types/germinate'
  import { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import { getPublicationData } from '@/plugins/util/formatting'
  import { mdiClose, mdiDelete, mdiNewspaper, mdiPlusBox } from '@mdi/js'

  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  const route = useRoute('publicationDetails')
  const router = useRouter()
  const store = useCoreStore()
  const { t } = useI18n()

  const bottomSheetVisible = ref(false)
  const addType = ref<PublicationdataReferenceType>()
  const selectedIds = ref<number[]>([])

  const groupTable = useTemplateRef('groupTable')
  const datasetTable = useTemplateRef('datasetTable')
  const experimentTable = useTemplateRef('experimentTable')
  const germplasmTable = useTemplateRef('germplasmTable')

  const publicationId = ref<number>()
  const publication = ref<ViewTablePublications>()

  const breadcrumbs = computed(() => {
    if (publication.value && displayData.value) {
      return [{
        title: t('pagePublicationsTitle'),
        to: Pages.publications.path,
      }, {
        title: displayData.value.title,
        to: Pages.getPath(Pages.publicationDetails, `${publicationId.value}`),
      }]
    } else {
      return []
    }
  })

  const displayData = computed(() => {
    if (publication.value) {
      return getPublicationData(publication.value)
    } else {
      return undefined
    }
  })

  function getPublicationGermplasmData (data: PaginatedRequest) {
    return apiPostPublicationGermplasmTable(publicationId.value || -1, data)
  }

  function getPublicationGermplasmIds (data: PaginatedRequest) {
    return apiPostPublicationGermplasmTableIds(publicationId.value || -1, data)
  }

  function getPublicationDatasetData (data: PaginatedRequest) {
    return apiPostPublicationDatasetTable(publicationId.value || -1, data)
  }

  function getPublicationExperimentData (data: PaginatedRequest) {
    return apiPostPublicationExperimentTable(publicationId.value || -1, data)
  }

  function getPublicationGroupData (data: PaginatedRequest) {
    return apiPostPublicationGroupTable(publicationId.value || -1, data)
  }

  // Methods for the bottom sheet tables
  function getDatasetData (data: PaginatedRequest) {
    return apiPostDatasetTable(data)
  }

  function getDatasetIds (data: PaginatedRequest) {
    return apiPostDatasetTableIds(data)
  }

  function getGroupData (data: PaginatedRequest) {
    return apiPostGroupTable(data)
  }

  function getGroupIds (data: PaginatedRequest) {
    return apiPostGroupTableIds(data)
  }

  function getGermplasmData (data: PaginatedRequest) {
    return apiPostGermplasmTable(data)
  }

  function getGermplasmIds (data: PaginatedRequest) {
    return apiPostGermplasmTableIds(data)
  }

  function getExperimentData (data: PaginatedRequest) {
    return apiPostExperimentTable(data)
  }

  function getExperimentIds (data: PaginatedRequest) {
    return apiPostExperimentTableIds(data)
  }

  function addToPublication () {
    if (!publication.value) {
      return
    }

    apiPutPublicationReferences(publicationId.value || -1, selectedIds.value.map(id => {
      return {
        foreignId: id,
        publicationId: publicationId.value || -1,
        referenceType: addType.value,
      }
    }), () => {
      update()

      switch (addType.value) {
        case PublicationdataReferenceType.group:
          groupTable.value?.refresh()
          break
        case PublicationdataReferenceType.dataset:
          datasetTable.value?.refresh()
          break
        case PublicationdataReferenceType.experiment:
          experimentTable.value?.refresh()
          break
        case PublicationdataReferenceType.germplasm:
          germplasmTable.value?.refresh()
          break
      }

      bottomSheetVisible.value = false
      selectedIds.value = []
    })
  }

  function deletePublication () {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          apiDeletePublication(publicationId.value || -1, deleted => {
            if (deleted) {
              router.push(Pages.publications.name)
            }
          })
        }
      },
    })
  }

  function addNew (type: PublicationdataReferenceType) {
    addType.value = type

    nextTick(() => {
      selectedIds.value = []
      bottomSheetVisible.value = true
    })
  }

  function removeItem (item: number, type: PublicationdataReferenceType) {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          switch (type) {
            case PublicationdataReferenceType.database:
              apiDeletePublicationReferenceDatabase(publicationId.value || -1, () => update())
              break
            default:
              apiDeletePublicationReference(publicationId.value || -1, type, item, () => {
                switch (type) {
                  case PublicationdataReferenceType.group:
                    groupTable.value?.refresh()
                    break
                  case PublicationdataReferenceType.dataset:
                    datasetTable.value?.refresh()
                    break
                  case PublicationdataReferenceType.experiment:
                    experimentTable.value?.refresh()
                    break
                  case PublicationdataReferenceType.germplasm:
                    germplasmTable.value?.refresh()
                    break
                }

                update()
              })
              break
          }
        }
      },
    })
  }

  function update () {
    const queryParams = {
      page: 1,
      limit: 1,
      prevCount: -1,
      filters: [{
        filters: [{
          column: 'publicationId',
          comparator: FilterComparator.equals,
          values: [`${publicationId.value}`],
        }],
        operator: FilterOperator.and,
      }],
    }
    apiPostPublicationsTable(queryParams, result => {
      if (result && result.data && result.data.length > 0) {
        publication.value = result.data[0]
        try {
          publication.value.publicationFallbackCache = JSON.parse(publication.value.publicationFallbackCache)
        } catch {
          //
        }
      }
    })
  }

  onBeforeMount(() => {
    if (route.params && route.params.id) {
      publicationId.value = +route.params.id

      if (publicationId.value) {
        update()
      } else {
        router.push(Pages.publications.path)
      }
    }
  })
</script>
