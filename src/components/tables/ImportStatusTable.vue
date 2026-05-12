<template>
  <!-- @vue-generic {import('@/plugins/types/germinate').ImportResult} -->
  <BaseTable
    ref="baseTable"
    :get-data="compProps.getData"
    :get-ids="compProps.getIds"
    :download="compProps.download"
    :headers="headers"
    :filter-on="filterOn"
    :show-details="false"
    :display-type="compProps.displayType"
    item-key="id"
    table-key="importFeedback"
    :header-icon="mdiListStatus"
    :header-title="$t('widgetImportStatusTitle')"
    v-bind="$attrs"
  >
    <template #item.type="{ item }">
      <v-chip
        label
        :prepend-icon="item.type === 'ERROR' ? mdiAlert : mdiInformation"
        :text="$t(item.type === 'ERROR' ? 'genericError' : 'genericWarning')"
        :color="$t(item.type === 'ERROR' ? 'error' : 'warning')"
      />
    </template>
    <template #item.status="{ item }">
      {{ statusMessages[item.status] || 'N/A' }}
    </template>

    <!-- Pass on all named slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
      <slot :name="slot" v-bind="slotProps" />
    </template>
  </BaseTable>
</template>

<script setup lang="ts">
  import BaseTable, { type DisplayType } from '@/components/tables/BaseTable.vue'

  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { AxiosResponse } from 'axios'
  import type { FilterGroup, ImportResult, PaginatedRequest, PaginatedResult } from '@/plugins/types/germinate'
  import { useI18n } from 'vue-i18n'
  import { mdiAlert, mdiInformation, mdiListStatus } from '@mdi/js'

  const compProps = defineProps<{
    getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<ImportResult[]>>> }
    getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
    download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
    filterOn?: FilterGroup[]
    displayType?: DisplayType
  }>()

  const baseTable = useTemplateRef('baseTable')
  const { t } = useI18n()

  // @ts-ignore
  const headers: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    const headers = [{
      key: 'type',
      dataType: 'importStatus',
      title: t('tableColumnImportJobType'),
      visibleInFilter: false,
    }, {
      key: 'rowIndex',
      dataType: 'integer',
      title: t('tableColumnImportJobRowIndex'),
      visibleInFilter: false,
    }, {
      key: 'status',
      dataType: 'string',
      title: t('tableColumnImportJobStatus'),
      visibleInFilter: false,
    }, {
      key: 'message',
      dataType: 'string',
      title: t('tableColumnImportJobMessage'),
      visibleInFilter: false,
    }]

    return headers
  })

  const statusMessages: ComputedRef<{ [key: string]: string }> = computed(() => {
    return {
      GENERIC_INVALID_MARKER: t('importStatusGenericInvalidMarker'),
      GENERIC_INVALID_LOCATION: t('importStatusGenericInvalidLocation'),
      GROUP_INVALID_GROUP_VISIBILITY: t('importStatusGroupInvalidGroupVisibility'),
      GROUP_INVALID_CELL_VALUE: t('importStatusGroupInvalidCellValue'),
      GROUP_HEADER_MISMATCH: t('importStatusGroupHeaderMismatch'),
      GENOTYPE_MISSING_ROW: t('importStatusGenotypeMissingRow'),
      GENOTYPE_HEADER_LENGTH_MISMATCH: t('importStatusGenotypeHeaderLenghtMismatch'),
      GENERIC_MISSING_REQUIRED_VALUE: t('importStatusGenericMissingValue'),
      GENERIC_MISSING_COUNTRY: t('importStatusGenericMissingCountry'),
      GENERIC_VALUE_TOO_LONG: t('importStatusValueTooLong'),
      GENERIC_INVALID_COUNTRY_CODE: t('importStatusMcpdInvalidCountryCode'),
      GENERIC_INVALID_DATATYPE: t('importStatusInvalidDataType'),
      GENERIC_INVALID_DATE: t('importStatusMcpdInvalidDate'),
      GENERIC_DISPLAY_NAME_USED_BUT_NOT_UNIQUE: t('importStatusGenericDisplayNameUsedButNotUnique'),
      TRIALS_INVALID_TRAIT_DATATYPE: t('importStatusTrialsInvalidDataType'),
      TRIALS_INVALID_TRAIT_CATEGORIES: t('importStatusTrialsInvalidCategories'),
      TRIALS_MISSING_TRAIT_DECLARATION: t('importStatusTrialsMissingTraitDeclaration'),
      CLIMATE_MISSING_CLIMATE_DECLARATION: t('importStatusTrialsMissingClimateDeclaration'),
      CLIMATE_MISSING_LOCATION_DECLARATION: t('importStatusTrialsMissingClimateLocationDeclaration'),
      GENERIC_INVALID_GERMPLASM: t('importStatusGenericInvalidGermplasm'),
      TRIALS_DATA_DATE_HEADER_MISMATCH: t('importStatusTrialsSheetHeaderMismatch'),
      TRIALS_DATA_DATE_IDENTIFIER_MISMATCH: t('importStatusTrialsIdentifierMismatch'),
      TRIALS_DATA_VIOLATES_RESTRICTION: t('importStatusTrialsRestrictionViolation'),
      TRIALS_DATA_REP_MISSING: t('importStatusTrialsDataRepMissing'),
      TRIALS_ROW_COL_MISMATCH: t('importStatusTrialsRowColMismatch'),
      GENERIC_DUPLICATE_COLUMN: t('importStatusGenericDuplicateColumn'),
      GENERIC_IO_ERROR: t('importStatusGenericIOError'),
      GENERIC_MISSING_EXCEL_SHEET: t('importStatusGenericMissingExcelSheet'),
      GENERIC_MISSING_COLUMN: t('importStatusGenericMissingColumn'),
      GENERIC_MISSING_DB_ITEM_UPDATE: t('importStatusMissingDbItemUpdate'),
      MCPD_DUPLICATE_ACCENUMB: t('importStatusMcpdDuplicateAccenumb'),
      MCPD_MISSING_FIELD: t('importStatusMcpdMissingField'),
      MCPD_INVALID_SAMPSTAT: t('importStatusMcpdInvalidSampstat'),
      MCPD_INVALID_COLLSRC: t('importStatusMcpdInvalidCollsrc'),
      MCPD_INVALID_MLSSTATUS: t('importStatusMcpdInvalidMlsStatus'),
      MCPD_INVALID_STORAGE: t('importStatusMcpdInvalidStorage'),
      GENERIC_INVALID_NUMBER: t('importStatusMcpdInvalidNumber'),
      MCPD_INVALID_ENTITY_TYPE: t('importStatusMcpdInvalidEntityType'),
      MCPD_INVALID_ENTITY_PARENT_ACCENUMB: t('importStatusMcpdInvalidEntityParentAccenumb'),
      MCPD_MISSING_ACCENUMB: t('importStatusMcpdMissingAccenumb'),
      GENERIC_DUPLICATE_VALUE: t('importStatusGenericDuplicateValue'),
      GENERIC_INVALID_REFERENCE: t('importStatusGenericInvalidReference'),
      MCPD_INVALID_DMS: t('importStatusMcpdInvalidDms'),
      GENOTYPE_HAPMAP_INCORRECT_HEADER: t('importStatusGenotypeHapmapIncorrectHeader'),
      GENOTYPE_HAPMAP_INCORRECT_ROW_LENGTH: t('importStatusGenotypeHapmapIncorrectRowLength'),
      IMAGE_TEMPLATE_MISSING: t('importStatusImageTemplateMissing'),
      IMAGE_IMAGE_MISSING: t('importStatusImageImageMissing'),
      IMAGE_DEFINITION_MISSING: t('importStatusImageDefinitionMissing'),
      SHAPEFILE_MISSING_SHP: t('importStatusShapefileMissingShp'),
      SHAPEFILE_MISSING_FIELD: t('importStatusShapefileMissingField'),
      SHAPEFILE_INVALID_ACCENUMB: t('importStatusShapefileInvalidAccenumb'),
      SHAPEFILE_ROW_COL_GERMPLASM_CONFLICT: t('importStatusShapefileRowColGermplasmConflict'),
      SHAPEFILE_DUPLICATE_ROW_COL: t('importStatusShapefileDuplicateRowCol'),
      SHAPEFILE_WARNING_MISSING_ACCENUMB: t('importStatusShapefileWarningMissingAccenumb'),
    }
  })

  defineExpose({
    refresh: (readFilter?: boolean) => baseTable.value?.refresh({ readFilter }),
    getSelection: () => baseTable.value?.getSelection(),
  })
</script>

<style scoped>
</style>
