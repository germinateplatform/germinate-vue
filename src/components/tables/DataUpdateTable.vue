<template>
  <div>
    <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableImportJobs} -->
    <BaseTable
      ref="baseTable"
      :get-data="compProps.getData"
      :get-ids="compProps.getIds"
      :download="compProps.download"
      :headers="headers"
      :filter-on="filterOn"
      :show-details="false"
      :sort-by="[{ key: 'createdOn', order: 'desc' }]"
      :display-type="compProps.displayType"
      supports-grid-cards
      item-key="id"
      table-key="dataUpdates"
      header-icon="mdi-database-import"
      :header-title="$t('pageNewsLatestDataUploadsTitle')"
      v-bind="$attrs"
    >
      <template #item.datatype="{ item }">
        <v-chip label :color="templateImportTypes[item.datatype].color()" :prepend-icon="templateImportTypes[item.datatype].path">{{ templateImportTypes[item.datatype].text() }}</v-chip>
      </template>

      <template #item.status="{ item }">
        <v-chip label :color="asyncJobStatus[item.status].color" :prepend-icon="asyncJobStatus[item.status].path">{{ asyncJobStatus[item.status].text() }}</v-chip>
      </template>

      <template #item.isUpdate="{ item }">
        <v-chip label class="mr-2" :text="$t('pageDataUploadUpdateOptionUpdate')" color="info" prepend-icon="mdi-refresh" v-if="item.isUpdate" />
        <v-chip label class="mr-2" :text="$t('pageDataUploadUpdateOptionInsert')" color="success" prepend-icon="mdi-database-import" v-else />
      </template>

      <template #item.stats="{ item }">
        <v-chip
          v-for="(value, key) in item.stats"
          :key="`item-stats-${item.id}-${key}`"
          class="me-2 mb-1"
          label
          :prepend-icon="statCategories[key].path"
          :text="`${statCategories[key].text()}: ${getNumberWithSuffix(value, 1)}`"
        />
      </template>

      <template #card-item="{ item }">
        <v-card class="flex-grow-1 d-flex justify-space-between flex-column">
          <template #title>
            <div class="d-flex justify-space-between">
              <span>{{ templateImportTypes[item.datatype].text() }}</span>
              <v-chip label :color="asyncJobStatus[item.status].color" :prepend-icon="asyncJobStatus[item.status].path">{{ asyncJobStatus[item.status].text() }}</v-chip>
            </div>
          </template>
          <template #prepend>
            <v-icon :icon="templateImportTypes[item.datatype].path" :color="templateImportTypes[item.datatype].color()" />
          </template>
          <div class="d-flex flex-column">
            <v-card-subtitle class="text-wrap" v-if="item.createdOn">{{ new Date(item.createdOn).toLocaleDateString() }}</v-card-subtitle>
            <v-card-text class="flex-grow-1">
              <div class="mb-2">
                <v-chip label class="mr-2" :text="$t('pageDataUploadUpdateOptionUpdate')" color="info" prepend-icon="mdi-refresh" v-if="item.isUpdate" />
                <v-chip label class="mr-2" :text="$t('pageDataUploadUpdateOptionInsert')" color="success" prepend-icon="mdi-database-import" v-else />
              </div>
              <div class="mb-2">
                <v-chip
                  v-for="(value, key) in item.stats"
                  :key="`item-stats-${item.id}-${key}`"
                  class="me-2 mb-1"
                  label
                  :prepend-icon="statCategories[key].path"
                  :text="`${statCategories[key].text()}: ${getNumberWithSuffix(value, 1)}`"
                />
              </div>
            </v-card-text>
          </div>

          <template #actions>
            <v-btn
              color="primary"
              v-if="isPageAvailable(Pages.dataResources.name) && item.stats.fileResourceId"
              href="#"
              @click.prevent="redirectToFileresources(item)"
              :text="$t('buttonReadMore')"
            />
          </template>
        </v-card>
      </template>

      <!-- Pass on all named slots -->
      <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
        <slot :name="slot" v-bind="slotProps" />
      </template>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
  import BaseTable, { type DisplayType } from '@/components/tables/BaseTable.vue'

  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import { FilterComparator, FilterOperator, type FilterGroup, type PaginatedRequest, type PaginatedResult, type ViewTableImportJobs } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { templateImportTypes, asyncJobStatus, statCategories } from '@/plugins/util/types'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { isPageAvailable } from '@/plugins/util'
  import { Pages } from '@/plugins/pages'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTableImportJobs[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
    displayType?: DisplayType
  }>()

  const router = useRouter()
  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'id',
      title: t('tableColumnDataUpdateId'),
      dataType: 'integer',
    }, {
      key: 'isUpdate',
      title: t('tableColumnDataUpdateIsUpdate'),
      dataType: 'boolean',
    }, {
      key: 'datatype',
      title: t('tableColumnDataUpdateDataType'),
      dataType: 'templateImportType',
    }, {
      key: 'status',
      title: t('tableColumnDataUpdateStatus'),
      dataType: 'string',
    }, {
      key: 'createdOn',
      dataType: 'date',
      title: t('tableColumnDataUpdateCreatedOn'),
      value: (value: ViewTableImportJobs) => value.createdOn ? new Date(value.createdOn).toLocaleDateString() : undefined,
    }, {
      key: 'stats',
      title: '',
      dataType: undefined,
    }]

    return headers
  })

  function redirectToFileresources (item: ViewTableImportJobs) {
    // Set up the filter
    const filter: FilterGroup[] = [{
      filters: [{
        column: 'fileresourceId',
        comparator: FilterComparator.equals,
        values: [`${item.stats.fileResourceId}`],
      }],
      operator: FilterOperator.and,
    }]
    // Then redirect to the export page
    router.push({
      path: Pages.dataResources.path,
      query: {
        'fileresources-filter': JSON.stringify(filter)
      }
    })
  }

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh(readFilter),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
