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
    header-icon="mdi-book-open-variant"
    :header-title="$t('pagePublicationsTitle')"
    :supports-grid-cards="true"
    v-bind="$attrs"
  >
    <template #header v-if="store.storeUserIsAuthenticated">
      <v-btn variant="outlined" :text="$t('buttonAddPublication')" prepend-icon="mdi-plus" @click="addItem" />
    </template>

    <template #item.publicationName="{ item }">
      <template v-if="item.publicationFallbackCache">
        <span v-html="item.publicationFallbackCache.title" />
      </template>
    </template>
    <template #item.publicationJournal="{ item }">
      <span v-if="item.publicationFallbackCache">{{ item.publicationFallbackCache['container-title'] }}</span>
    </template>
    <template #item.publicationDoi="{ item }">
      <span><a rel="noopener noreferrer" :href="item.publicationDoi">{{ item.publicationDoi }}</a> <v-icon icon="mdi-open-in-new" /></span>
    </template>
    <template #item.publicationDetails="{ item }">
      <v-chip label class="me-2 mt-1" v-if="item.isDatabasePub" :color="publicationTypes.database.color()" :prepend-icon="publicationTypes.database.path">{{ publicationTypes.database.text() }}</v-chip>
      <v-chip label class="me-2 mt-1" v-if="item.germplasmIds && item.germplasmIds.length > 0" :color="publicationTypes.germplasm.color()" :prepend-icon="publicationTypes.germplasm.path">{{ publicationTypes.germplasm.text() }} ({{ item.germplasmIds.length }})</v-chip>
      <v-chip label class="me-2 mt-1" v-if="item.datasetIds && item.datasetIds.length > 0" :color="publicationTypes.dataset.color()" :prepend-icon="publicationTypes.dataset.path">{{ publicationTypes.dataset.text() }} ({{ item.datasetIds.length }})</v-chip>
      <v-chip label class="me-2 mt-1" v-if="item.experimentIds && item.experimentIds.length > 0" :color="publicationTypes.experiment.color()" :prepend-icon="publicationTypes.experiment.path">{{ publicationTypes.experiment.text() }} ({{ item.experimentIds.length }})</v-chip>
      <v-chip label class="me-2 mt-1" v-if="item.groupIds && item.groupIds.length > 0" :color="publicationTypes.group.color()" :prepend-icon="publicationTypes.group.path">{{ publicationTypes.group.text() }} ({{ item.groupIds.length }})</v-chip>
    </template>

    <template #card-item="{ item }">
      <v-card v-if="item.lookupDetails" class="d-flex flex-column">
        <v-card-text>
          <div>{{ item.lookupDetails.container }}</div>

          <p class="text-h5 font-weight-black">{{ item.lookupDetails.title }}</p>

          <p v-if="item.lookupDetails.date">
            {{ item.lookupDetails.date }}
          </p>

          <div class="text-medium-emphasis">
            <span v-html="item.lookupDetails.fullReference" />
          </div>

          <v-chip label class="me-2 mt-1" v-if="item.isDatabasePub" :color="publicationTypes.database.color()" :prepend-icon="publicationTypes.database.path">{{ publicationTypes.database.text() }}</v-chip>
          <v-chip label class="me-2 mt-1" v-if="item.germplasmIds && item.germplasmIds.length > 0" :color="publicationTypes.germplasm.color()" :prepend-icon="publicationTypes.germplasm.path">{{ publicationTypes.germplasm.text() }} ({{ item.germplasmIds.length }})</v-chip>
          <v-chip label class="me-2 mt-1" v-if="item.datasetIds && item.datasetIds.length > 0" :color="publicationTypes.dataset.color()" :prepend-icon="publicationTypes.dataset.path">{{ publicationTypes.dataset.text() }} ({{ item.datasetIds.length }})</v-chip>
          <v-chip label class="me-2 mt-1" v-if="item.experimentIds && item.experimentIds.length > 0" :color="publicationTypes.experiment.color()" :prepend-icon="publicationTypes.experiment.path">{{ publicationTypes.experiment.text() }} ({{ item.experimentIds.length }})</v-chip>
          <v-chip label class="me-2 mt-1" v-if="item.groupIds && item.groupIds.length > 0" :color="publicationTypes.group.color()" :prepend-icon="publicationTypes.group.path">{{ publicationTypes.group.text() }} ({{ item.groupIds.length }})</v-chip>
        </v-card-text>

        <v-card-actions v-if="item.lookupDetails.URL">
          <v-btn
            color="primary"
            :href="item.lookupDetails.URL"
            :text="$t('buttonReadMore')"
          />

          <!-- <v-spacer />

          <v-btn
            v-if="canDelete && store.storeUserIsDataCurator"
            @click="emit('delete')"
            color="error"
            :text="$t('buttonDelete')"
          /> -->
        </v-card-actions>
      </v-card>
    </template>

    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>
  </BaseTable>
</template>

<script setup lang="ts">
  import BaseTable, { type DisplayType } from '@/components/tables/BaseTable.vue'

  import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, PaginatedRequest, PaginatedResult, ViewTablePublications } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { publicationTypes } from '@/plugins/util/types'
  import { coreStore } from '@/stores/app'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ViewTablePublications[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    selectionType?: TableSelectionType
    displayType?: DisplayType
  }>()

  const store = coreStore()
  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'projectIds',
      dataType: 'json',
      visibleInTable: false,
      title: t('tableColumnProjectId'),
    }, {
      key: 'germplasmIds',
      dataType: 'json',
      visibleInTable: false,
      title: t('tableColumnGermplasmId'),
    }, {
      key: 'groupIds',
      dataType: 'json',
      visibleInTable: false,
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
      value: (value: ViewTablePublications) => value.createdOn ? new Date(value.createdOn).toLocaleDateString() : undefined,
    }]

    return headers
  })

  function addItem () {
    // TODO
  }

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh(readFilter),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
