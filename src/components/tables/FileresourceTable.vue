<template>
  <div>
    <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableFileresources} -->
    <BaseTable
      ref="baseTable"
      :get-data="compProps.getData"
      :get-ids="compProps.getIds"
      :download="compProps.download"
      :headers="headers"
      :filter-on="filterOn"
      :show-details="false"
      item-key="fileresourceId"
      table-key="fileresources"
      header-icon="mdi-file-download"
      :header-title="$t('pageDataResourcesTitle')"
      v-bind="$attrs"
    >
      <template #header>
        <v-btn v-if="store.storeUserIsDataCurator" variant="tonal" prepend-icon="mdi-file-plus" @click="addFileresourceModal?.show()">{{ $t('tableButtonAddFileresource') }}</v-btn>
      </template>

      <template #item.fileresourceDescription="{ item, value }">
        <template v-if="item.fileresourceDescription && item.fileresourceDescription.length > 0">
          <span :title="value" v-if="value">{{ truncateAfterWords(value, 10) }}</span>
          <a href="#" class="ms-2 table-icon-link" @click.prevent="showFileresourceModal('tableColumnFileresourceDescription', item.fileresourceDescription)" v-if="isTruncatedAfterWords(value, 10)">
            <v-icon icon="mdi-page-next" />
          </a>
        </template>
      </template>
      <template #item.fileresourcetypeDescription="{ item, value }">
        <template v-if="item.fileresourceDescription && item.fileresourceDescription.length > 0">
          <span :title="value" v-if="value">{{ truncateAfterWords(value, 10) }}</span>
          <a href="#" class="ms-2 table-icon-link" @click.prevent="showFileresourceModal('tableColumnFileresourcetypeDescription', item.fileresourcetypeDescription)" v-if="isTruncatedAfterWords(value, 10)">
            <v-icon icon="mdi-page-next" />
          </a>
        </template>
      </template>

      <!-- Download -->
      <template #item.fileresourceSize="{ item }">
        <div class="d-flex flex-column justify-content-center my-2 align-center">
          <v-btn color="primary" :href="getFileResourceUrl(item)"><v-icon icon="mdi-download" /> {{ $t('buttonDownload') }}</v-btn>
          <small>({{ getNumberWithSuffix(item.fileresourceSize, 2, 1024, ' ') }})</small>
        </div>
      </template>
      <!-- Show datasets -->
      <template #item.datasetIds="{ item }">
        <div class="d-flex align-start h-100 pt-2">
          <v-btn @click="showDatasets(item)" v-if="item.datasetIds && item.datasetIds.length > 0"><v-icon icon="mdi-database" /> {{ $t('buttonShow') }}</v-btn>
        </div>
      </template>

      <!-- Delete resource -->
      <template #item.deleteFileresource="{ item }">
        <div class="d-flex align-start h-100 pt-2">
          <v-btn color="error" @click="deleteResource(item)"><v-icon icon="mdi-delete" /></v-btn>
        </div>
      </template>

      <!-- Pass on all named slots -->
      <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
        <slot :name="slot" v-bind="slotProps" />
      </template>
    </BaseTable>

    <AddFileresourceModal ref="addFileresourceModal" @fileresource-added="baseTable?.refresh()" />
  </div>
</template>

<script setup lang="ts">
  import BaseTable from '@/components/tables/BaseTable.vue'

  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest, type PaginatedResult, type ViewTableFileresources } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { getNumberWithSuffix, isTruncatedAfterWords, truncateAfterWords } from '@/plugins/util/formatting'

  import emitter from 'tiny-emitter/instance'
  import { coreStore } from '@/stores/app'
  import { Pages } from '@/plugins/pages'
  import { apiDeleteFileresource } from '@/plugins/api/dataset'
  import AddFileresourceModal from '@/components/modals/AddFileresourceModal.vue'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableFileresources[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
  }>()

  const addFileresourceModal = useTemplateRef('addFileresourceModal')
  const baseTable = useTemplateRef('baseTable')
  const router = useRouter()
  const store = coreStore()
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers: ExtendedDataTableHeader[] = [{
      key: 'fileresourceId',
      title: t('tableColumnFileresourceId'),
      dataType: 'integer',
    }, {
      key: 'fileresourceDescription',
      title: t('tableColumnFileresourceDescription'),
      dataType: 'string',
    }, {
      key: 'fileresourcetypeId',
      dataType: 'string',
      title: t('tableColumnFileresourcetypeId'),
    }, {
      key: 'fileresourcetypeName',
      dataType: 'string',
      title: t('tableColumnFileresourcetypeName'),
    }, {
      key: 'fileresourcetypeDescription',
      title: t('tableColumnFileresourcetypeDescription'),
      dataType: 'string',
    }, {
      key: 'fileresourceCreatedOn',
      dataType: 'date',
      title: t('tableColumnFileresourceCreatedOn'),
      value: value => value.fileresourceCreatedOn ? new Date(value.fileresourceCreatedOn).toLocaleString() : undefined,
    }, {
      key: 'datasetIds',
      dataType: 'json',
      sortable: false,
      title: t('tableColumnFileresourceDatasets'),
    }, {
      key: 'fileresourceSize',
      dataType: 'string',
      sortable: true,
      align: 'center' as 'end' | 'start' | 'center',
      title: t('tableColumnFileresourceSize'),
    }]

    if (store.storeUserIsDataCurator) {
      headers.push({
        key: 'deleteFileresource',
        dataType: undefined,
        visibleInFilter: false,
        sortable: false,
        title: '',
      })
    }

    return headers
  })

  function deleteResource (fileresource: ViewTableFileresources) {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          apiDeleteFileresource(fileresource.fileresourceId || -1, result => {
            if (result) {
              baseTable.value?.refresh()
              emitter.emit('update-sidebar-menu')
            }
          })
        }
      },
    })
  }

  function getFileResourceUrl (fileresource: ViewTableFileresources) {
    return `${store.storeBaseUrl}fileresource/${fileresource.fileresourceId}/download?token=${store.storeToken ? store.storeToken.token : null}`
  }

  function showDatasets (fileresource: ViewTableFileresources) {
    const filter: FilterGroup[] = [{
      filters: [{
        column: 'fileresourceIds',
        comparator: FilterComparator.contains,
        values: [`${fileresource.fileresourceId}`],
      }],
      operator: FilterOperator.and,
    }]

    router.push({
      path: Pages.datasets.path,
      query: {
        'datasets-filter': JSON.stringify(filter),
      },
    })
  }

  function showFileresourceModal (key: string, value: string) {
    emitter.emit('show-confirm', {
      title: t(key),
      message: value,
      okTitle: t('genericOk'),
      cancelTitle: undefined,
      okOnly: true,
      okVariant: 'primary',
    })
  }

  defineExpose({
    refresh: () => baseTable.value?.refresh(),
  })
</script>

<style scoped>
</style>
