<template>
  <template v-if="compProps.dataset">
    <h2>{{ $t('modalTitleDatasetAttributes') }}</h2>
    <p>{{ $t('modalTextDatasetAttributes') }}</p>
    <!-- Dataset attribute table -->
    <DatasetAttributeTable :get-data="getAttributeData" :download="downloadAttributesTable" />

    <!-- Dublin core -->
    <div v-if="compProps.dataset.dublinCore" class="mt-3">
      <h2>{{ $t('modalTitleDatasetDublinCore') }}</h2>
      <p>{{ $t('modalTextDatasetDublinCore') }}</p>

      <v-list border class="my-4">
        <v-list-item :title="$t('dublinCoreTitle')" v-if="compProps.dataset.dublinCore.title && compProps.dataset.dublinCore.title.length > 0 && compProps.dataset.dublinCore.title[0] !== null">
          <template #subtitle>
            <span v-html="compProps.dataset.dublinCore.title.join(', ')" />
          </template>
        </v-list-item>
        <v-list-item :title="$t('dublinCoreCreator')" v-if="compProps.dataset.dublinCore.creator && compProps.dataset.dublinCore.creator.length > 0 && compProps.dataset.dublinCore.creator[0] !== null">
          <template #subtitle>
            <span v-html="compProps.dataset.dublinCore.creator.join(', ')" />
          </template>
        </v-list-item>
        <v-list-item :title="$t('dublinCoreSubject')" v-if="compProps.dataset.dublinCore.subject && compProps.dataset.dublinCore.subject.length > 0 && compProps.dataset.dublinCore.subject[0] !== null">
          <template #subtitle>
            <span v-html="compProps.dataset.dublinCore.subject.join(', ')" />
          </template>
        </v-list-item>
        <v-list-item :title="$t('dublinCoreDescription')" v-if="compProps.dataset.dublinCore.description && compProps.dataset.dublinCore.description.length > 0 && compProps.dataset.dublinCore.description[0] !== null">
          <template #subtitle>
            <span v-html="compProps.dataset.dublinCore.description.join(', ')" />
          </template>
        </v-list-item>
        <v-list-item :title="$t('dublinCorePublisher')" v-if="compProps.dataset.dublinCore.publisher && compProps.dataset.dublinCore.publisher.length > 0 && compProps.dataset.dublinCore.publisher[0] !== null">
          <template #subtitle>
            <span v-html="compProps.dataset.dublinCore.publisher.join(', ')" />
          </template>
        </v-list-item>
        <v-list-item :title="$t('dublinCoreContributor')" v-if="compProps.dataset.dublinCore.contributor && compProps.dataset.dublinCore.contributor.length > 0 && compProps.dataset.dublinCore.contributor[0] !== null">
          <template #subtitle>
            <span v-html="compProps.dataset.dublinCore.contributor.join(', ')" />
          </template>
        </v-list-item>
        <v-list-item :title="$t('dublinCoreDate')" v-if="compProps.dataset.dublinCore.date && compProps.dataset.dublinCore.date.length > 0 && compProps.dataset.dublinCore.date[0] !== null">
          <template #subtitle>
            <span v-html="compProps.dataset.dublinCore.date.join(', ')" />
          </template>
        </v-list-item>
        <v-list-item :title="$t('dublinCoreType')" v-if="compProps.dataset.dublinCore.type && compProps.dataset.dublinCore.type.length > 0 && compProps.dataset.dublinCore.type[0] !== null">
          <template #subtitle>
            <span v-html="compProps.dataset.dublinCore.type.join(', ')" />
          </template>
        </v-list-item>
        <v-list-item :title="$t('dublinCoreFormat')" v-if="compProps.dataset.dublinCore.format && compProps.dataset.dublinCore.format.length > 0 && compProps.dataset.dublinCore.format[0] !== null">
          <template #subtitle>
            <span v-html="compProps.dataset.dublinCore.format.join(', ')" />
          </template>
        </v-list-item>
        <v-list-item :title="$t('dublinCoreIdentifier')" v-if="compProps.dataset.dublinCore.identifier && compProps.dataset.dublinCore.identifier.length > 0 && compProps.dataset.dublinCore.identifier[0] !== null">
          <template #subtitle>
            <span v-html="compProps.dataset.dublinCore.identifier.join(', ')" />
          </template>
        </v-list-item>
        <v-list-item :title="$t('dublinCoreSource')" v-if="compProps.dataset.dublinCore.source && compProps.dataset.dublinCore.source.length > 0 && compProps.dataset.dublinCore.source[0] !== null">
          <template #subtitle>
            <span v-html="compProps.dataset.dublinCore.source.join(', ')" />
          </template>
        </v-list-item>
        <v-list-item :title="$t('dublinCoreLanguage')" v-if="compProps.dataset.dublinCore.language && compProps.dataset.dublinCore.language.length > 0 && compProps.dataset.dublinCore.language[0] !== null">
          <template #subtitle>
            <span v-html="compProps.dataset.dublinCore.language.join(', ')" />
          </template>
        </v-list-item>
        <v-list-item :title="$t('dublinCoreRelation')" v-if="compProps.dataset.dublinCore.relation && compProps.dataset.dublinCore.relation.length > 0 && compProps.dataset.dublinCore.relation[0] !== null">
          <template #subtitle>
            <span v-html="compProps.dataset.dublinCore.relation.join(', ')" />
          </template>
        </v-list-item>
        <v-list-item :title="$t('dublinCoreCoverage')" v-if="compProps.dataset.dublinCore.coverage && compProps.dataset.dublinCore.coverage.length > 0 && compProps.dataset.dublinCore.coverage[0] !== null">
          <template #subtitle>
            <span v-html="compProps.dataset.dublinCore.coverage.join(', ')" />
          </template>
        </v-list-item>
        <v-list-item :title="$t('dublinCoreRights')" v-if="compProps.dataset.dublinCore.rights && compProps.dataset.dublinCore.rights.length > 0 && compProps.dataset.dublinCore.rights[0] !== null">
          <template #subtitle>
            <span v-html="compProps.dataset.dublinCore.rights.join(', ')" />
          </template>
        </v-list-item>
      </v-list>
      <v-btn prepend-icon="mdi-download" color="primary" @click="downloadAttributes" :text="$t('buttonDownload')" />
    </div>
  </template>
</template>

<script setup lang="ts">
  import type { PaginatedRequest, ViewTableDatasets } from '@/plugins/types/germinate'
  import { downloadBlob } from '@/plugins/util'
  import DatasetAttributeTable from '@/components/tables/DatasetAttributeTable.vue'
  import { apiPostDatasetAttributeTable, apiPostDatasetAttributeTableExport } from '@/plugins/api/dataset';

  const compProps = defineProps<{
    dataset: ViewTableDatasets
  }>()

  function getAttributeData (data: PaginatedRequest) {
    return apiPostDatasetAttributeTable(compProps.dataset.datasetId, data)
  }

  function downloadAttributesTable (data: PaginatedRequest) {
    return apiPostDatasetAttributeTableExport(compProps.dataset.datasetId, data)
  }

  function downloadAttributes () {
    downloadBlob({
      blob: new Blob([JSON.stringify(compProps.dataset.dublinCore)], { type: 'text/html' }),
      filename: `dataset-${compProps.dataset.datasetId}-dublin-core`,
      extension: 'json',
    })
  }
</script>
