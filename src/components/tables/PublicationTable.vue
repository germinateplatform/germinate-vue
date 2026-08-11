<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ViewTablePublications} -->
  <BaseTable
    ref="baseTable"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :show-details="false"
    :display-type="compProps.displayType"
    item-key="publicationId"
    table-key="publications"
    :sort-by="[{ key: 'createdOn', order: 'desc' }]"
    :header-icon="mdiBookOpenVariant"
    :header-title="$t('pagePublicationsTitle')"
    :supports-grid-cards="true"
    v-bind="$attrs"
  >
    <template #header v-if="store.storeUserIsAuthenticated">
      <v-btn variant="outlined" :text="$t('buttonAddPublication')" :prepend-icon="mdiPlus" @click="addItem" />
    </template>

    <template #item.publicationName="{ item }">
      <template v-if="item.publicationFallbackCache">
        <router-link :to="Pages.getPath(Pages.publicationDetails, item.publicationId)"><span v-html="item.publicationFallbackCache.title" /></router-link>
      </template>
    </template>
    <template #item.publicationJournal="{ item }">
      <v-chip label color="muted" variant="tonal" :prepend-icon="mdiNewspaper" v-if="item.publicationFallbackCache">{{ item.publicationFallbackCache['container-title'] }}</v-chip>
    </template>
    <template #item.publicationDoi="{ item }">
      <span><a rel="noopener noreferrer" :href="item.publicationDoi">{{ item.publicationDoi }}</a> <v-icon :icon="mdiOpenInNew" /></span>
    </template>
    <template #item.publicationDetails="{ item }">
      <v-chip label class="me-2 mt-1" v-if="item.isDatabasePub" :color="publicationTypes.database.color()" :prepend-icon="publicationTypes.database.path">{{ publicationTypes.database.text() }}</v-chip>
      <v-chip label class="me-2 mt-1" v-if="item.germplasmIds && item.germplasmIds.length > 0" :color="publicationTypes.germplasm.color()" :prepend-icon="publicationTypes.germplasm.path">{{ publicationTypes.germplasm.text() }} ({{ item.germplasmIds.length }})</v-chip>
      <v-chip label class="me-2 mt-1" v-if="item.datasetIds && item.datasetIds.length > 0" :color="publicationTypes.dataset.color()" :prepend-icon="publicationTypes.dataset.path">{{ publicationTypes.dataset.text() }} ({{ item.datasetIds.length }})</v-chip>
      <v-chip label class="me-2 mt-1" v-if="item.experimentIds && item.experimentIds.length > 0" :color="publicationTypes.experiment.color()" :prepend-icon="publicationTypes.experiment.path">{{ publicationTypes.experiment.text() }} ({{ item.experimentIds.length }})</v-chip>
      <v-chip label class="me-2 mt-1" v-if="item.groupIds && item.groupIds.length > 0" :color="publicationTypes.group.color()" :prepend-icon="publicationTypes.group.path">{{ publicationTypes.group.text() }} ({{ item.groupIds.length }})</v-chip>
    </template>

    <template #item.actions="{ item }">
      <v-btn-group variant="tonal">
        <v-btn size="x-small" color="error" :icon="mdiDelete" v-tooltip:top="$t('buttonDelete')" @click="deletePublication(item)" v-if="store.storeUserIsDataCurator" />
      </v-btn-group>
    </template>

    <template #card-item="{ item }">
      <PublicationCard :publication="item" @delete="deletePublication(item)" />
    </template>

    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>
  </BaseTable>

  <!-- @vue-generic {PublicationDoi} -->
  <GenericAddEditFormModal
    title="modalTitlePublicationAddNew"
    v-model="newPublication"
    :disable-save="!newPublication.previewHtml"
    :fields="publicationFields"
    :notify="sendNewPublication"
    ref="addPublicationModal"
  >
    <template #additional-fields="{ item }">
      <v-btn class="mt-3" @click="checkDoi" :prepend-icon="mdiMagnify" :text="$t('buttonUpdate')" />
      <div class="mt-5" v-if="item.previewHtml">
        <div v-html="item.previewHtml" />
        <v-chip class="mt-2" v-if="item.date" label :prepend-icon="mdiCalendar" :text="item.date.toLocaleDateString()" />
      </div>

      <v-alert class="mt-5" variant="tonal" :icon="mdiAlarm" color="warning" :text="item.error" v-if="item.error" />
    </template>
  </GenericAddEditFormModal>
</template>

<script setup lang="ts">
  import BaseTable, { type DisplayType } from '@/components/tables/BaseTable.vue'

  // @ts-ignore
  import { Cite } from '@citation-js/core'
  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import type { AxiosResponse } from 'axios'
  import { PublicationdataReferenceType, type FilterGroup, type PaginatedRequest, type PaginatedResult, type ViewTablePublications } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { publicationTypes } from '@/plugins/util/types'
  import { coreStore } from '@/stores/app'
  import { mdiAlarm, mdiBookOpenVariant, mdiCalendar, mdiDelete, mdiMagnify, mdiNewspaper, mdiOpenInNew, mdiPlus } from '@mdi/js'
  import { Pages } from '@/plugins/pages'
  import { apiDeletePublicationReference, apiPutPublication, apiPutPublicationReference } from '@/plugins/api/publication'

  import emitter from 'tiny-emitter/instance'

  export interface PublicationDoi {
    doi?: string
    previewHtml?: string
    json?: string
    date?: Date
    error?: string
  }

  const newPublication = ref<PublicationDoi>({})

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTablePublications[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
    displayType?: DisplayType
    publicationReferenceType?: PublicationdataReferenceType
    publicationReferenceId?: number
  }>()

  const store = coreStore()
  const addPublicationModal = useTemplateRef('addPublicationModal')
  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  const publicationFields = computed(() => {
    return [{
      key: 'doi',
      title: 'formLabelPublicationDOI',
      type: 'text' as const,
      required: true,
      width: 2,
    }]
  })

  function checkDoi () {
    Cite.async((newPublication.value.doi || '').trim())
      .then((citation: any) => {
        if (citation && citation.data && citation.data.length > 0) {
          const html = citation.format('bibliography', { format: 'html', template: 'apa' })

          let date: Date | undefined

          if (citation.data[0].created && citation.data[0].created['date-time']) {
            date = new Date(citation.data[0].created['date-time'])
          }

          newPublication.value.date = date
          newPublication.value.previewHtml = html
          newPublication.value.json = JSON.stringify(citation.data[0])
          newPublication.value.error = undefined
        } else {
          newPublication.value.error = t('errorMessagePublicationNotFound')
        }
      })
      .catch(() => {
        newPublication.value.error = t('errorMessagePublicationNotFound')
      })
  }

  function deletePublication (publication: ViewTablePublications) {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          apiDeletePublicationReference(publication.publicationId, compProps.publicationReferenceType || PublicationdataReferenceType.database, compProps.publicationReferenceId, result => {
            baseTable.value?.refresh()
          })
        }
      },
    })
  }

  function sendNewPublication () {
    return new Promise<boolean>(resolve => {
      apiPutPublication({
        doi: newPublication.value.doi || '',
        fallbackCache: newPublication.value.json,
        createdOn: newPublication.value.date,
      }, publicationId => {
        apiPutPublicationReference(publicationId, {
          publicationId: publicationId,
          referenceType: compProps.publicationReferenceType || PublicationdataReferenceType.database,
          foreignId: compProps.publicationReferenceId,
        }, () => {
          resolve(true)
          baseTable.value?.refresh()
        }).catch(() => resolve(false))
      }).catch(() => resolve(false))
    })
  }

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers: ExtendedDataTableHeader[] = [{
      key: 'projectIds',
      dataType: 'json',
      visibleInTable: false,
      title: t('tableColumnProjectId'),
    }, {
      key: 'germplasmIds',
      dataType: 'json',
      visibleInTable: false,
      visibleInFilter: true,
      title: t('tableColumnGermplasmId'),
    }, {
      key: 'groupIds',
      dataType: 'json',
      visibleInTable: false,
      visibleInFilter: true,
      title: t('tableColumnGroupId'),
    }, {
      key: 'isDatabasePub',
      dataType: 'boolean',
      visibleInTable: false,
      title: t('tableColumnPublicationIsDatabasePub'),
    }, {
      key: 'publicationId',
      dataType: 'integer',
      title: t('tableColumnPublicationId'),
    }, {
      key: 'publicationName',
      dataType: undefined,
      sortable: false,
      title: t('tableColumnPublicationName'),
    }, {
      key: 'publicationDoi',
      dataType: 'string',
      title: t('tableColumnPublicationDoi'),
    }, {
      key: 'publicationJournal',
      dataType: undefined,
      sortable: false,
      title: t('tableColumnPublicationJournal'),
    }, {
      key: 'publicationDetails',
      dataType: undefined,
      sortable: false,
      title: t('tableColumnPublicationDetails'),
    }, {
      key: 'createdOn',
      dataType: 'date',
      title: t('tableColumnPublicationCreatedOn'),
      // @ts-expect-error
      value: (value: ViewTablePublications) => value.createdOn ? new Date(value.createdOn).toLocaleDateString() : undefined,
    }]

    if (store.storeUserIsDataCurator) {
      headers.push({
        key: 'actions',
        dataType: undefined,
        title: '',
      })
    }

    return headers
  })

  function addItem () {
    newPublication.value = {}
    nextTick(() => {
      addPublicationModal.value?.show()
    })
  }

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
