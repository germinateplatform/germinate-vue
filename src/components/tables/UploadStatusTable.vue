<template>
  <div v-if="job">
    <p>{{ $t('widgetImportStatusText') }}</p>
    <b-table :fields="columns"
              :items="job.feedback"
              striped
              responsive
              hover
              outlined
              show-empty
              sort-by="rowIndex">
      <!-- Import status icon -->
      <template v-slot:cell(icon)="data">
        <span v-if="data.item.status === 'OK'"><span class="text-success"><MdiIcon :path="mdiCheckCircleOutline" /></span></span>
        <span v-else><span class="text-danger"><MdiIcon :path="mdiAlertCircleOutline" /></span></span>
      </template>
      <!-- Import status message -->
      <template v-slot:cell(status)="data">
        <span v-if="statusOptions[data.item.status]">{{ statusOptions[data.item.status]() }}</span>
      </template>
    </b-table>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'

import { mdiCheckCircleOutline, mdiAlertCircleOutline } from '@mdi/js'

export default {
  components: {
    MdiIcon
  },
  props: {
    job: {
      type: Object,
      default: null
    }
  },
  data: function () {
    return {
      mdiCheckCircleOutline,
      mdiAlertCircleOutline,
      statusOptions: {
        GENERIC_INVALID_MARKER: () => this.$t('importStatusGenericInvalidMarker'),
        GENERIC_INVALID_LOCATION: () => this.$t('importStatusGenericInvalidLocation'),
        GROUP_INVALID_GROUP_VISIBILITY: () => this.$t('importStatusGroupInvalidGroupVisibility'),
        GROUP_INVALID_CELL_VALUE: () => this.$t('importStatusGroupInvalidCellValue'),
        GROUP_HEADER_MISMATCH: () => this.$t('importStatusGroupHeaderMismatch'),
        GENOTYPE_MISSING_ROW: () => this.$t('importStatusGenotypeMissingRow'),
        GENOTYPE_HEADER_LENGTH_MISMATCH: () => this.$t('importStatusGenotypeHeaderLenghtMismatch'),
        GENERIC_MISSING_REQUIRED_VALUE: () => this.$t('importStatusGenericMissingValue'),
        GENERIC_MISSING_COUNTRY: () => this.$t('importStatusGenericMissingCountry'),
        GENERIC_VALUE_TOO_LONG: () => this.$t('importStatusValueTooLong'),
        GENERIC_INVALID_COUNTRY_CODE: () => this.$t('importStatusMcpdInvalidCountryCode'),
        GENERIC_INVALID_DATATYPE: () => this.$t('importStatusInvalidDataType'),
        GENERIC_INVALID_DATE: () => this.$t('importStatusMcpdInvalidDate'),
        TRIALS_INVALID_TRAIT_DATATYPE: () => this.$t('importStatusTrialsInvalidDataType'),
        TRIALS_INVALID_TRAIT_CATEGORIES: () => this.$t('importStatusTrialsInvalidCategories'),
        TRIALS_MISSING_TRAIT_DECLARATION: () => this.$t('importStatusTrialsMissingTraitDeclaration'),
        CLIMATE_MISSING_CLIMATE_DECLARATION: () => this.$t('importStatusTrialsMissingClimateDeclaration'),
        GENERIC_INVALID_GERMPLASM: () => this.$t('importStatusGenericInvalidGermplasm'),
        TRIALS_DATA_DATE_HEADER_MISMATCH: () => this.$t('importStatusTrialsSheetHeaderMismatch'),
        TRIALS_DATA_DATE_IDENTIFIER_MISMATCH: () => this.$t('importStatusTrialsIdentifierMismatch'),
        TRIALS_DATA_VIOLATES_RESTRICTION: () => this.$t('importStatusTrialsRestrictionViolation'),
        TRIALS_DATA_REP_MISSING: () => this.$t('importStatusTrialsDataRepMissing'),
        GENERIC_DUPLICATE_COLUMN: () => this.$t('importStatusGenericDuplicateColumn'),
        GENERIC_IO_ERROR: () => this.$t('importStatusGenericIOError'),
        GENERIC_MISSING_EXCEL_SHEET: () => this.$t('importStatusGenericMissingExcelSheet'),
        GENERIC_MISSING_COLUMN: () => this.$t('importStatusGenericMissingColumn'),
        GENERIC_MISSING_DB_ITEM_UPDATE: () => this.$t('importStatusMissingDbItemUpdate'),
        MCPD_DUPLICATE_ACCENUMB: () => this.$t('importStatusMcpdDuplicateAccenumb'),
        MCPD_MISSING_FIELD: () => this.$t('importStatusMcpdMissingField'),
        MCPD_INVALID_SAMPSTAT: () => this.$t('importStatusMcpdInvalidSampstat'),
        MCPD_INVALID_COLLSRC: () => this.$t('importStatusMcpdInvalidCollsrc'),
        MCPD_INVALID_MLSSTATUS: () => this.$t('importStatusMcpdInvalidMlsStatus'),
        MCPD_INVALID_STORAGE: () => this.$t('importStatusMcpdInvalidStorage'),
        GENERIC_INVALID_NUMBER: () => this.$t('importStatusMcpdInvalidNumber'),
        MCPD_INVALID_ENTITY_TYPE: () => this.$t('importStatusMcpdInvalidEntityType'),
        MCPD_INVALID_ENTITY_PARENT_ACCENUMB: () => this.$t('importStatusMcpdInvalidEntityParentAccenumb'),
        MCPD_MISSING_ACCENUMB: () => this.$t('importStatusMcpdMissingAccenumb'),
        GENERIC_DUPLICATE_VALUE: () => this.$t('importStatusGenericDuplicateValue'),
        GENERIC_INVALID_REFERENCE: () => this.$t('importStatusGenericInvalidReference'),
        MCPD_INVALID_DMS: () => this.$t('importStatusMcpdInvalidDms'),
        GENOTYPE_HAPMAP_INCORRECT_HEADER: () => this.$t('importStatusGenotypeHapmapIncorrectHeader'),
        GENOTYPE_HAPMAP_INCORRECT_ROW_LENGTH: () => this.$t('importStatusGenotypeHapmapIncorrectRowLength'),
        IMAGE_TEMPLATE_MISSING: () => this.$t('importStatusImageTemplateMissing'),
        IMAGE_IMAGE_MISSING: () => this.$t('importStatusImageImageMissing'),
        IMAGE_DEFINITION_MISSING: () => this.$t('importStatusImageDefinitionMissing'),
        SHAPEFILE_MISSING_SHP: () => this.$t('importStatusShapefileMissingShp'),
        SHAPEFILE_MISSING_FIELD: () => this.$t('importStatusShapefileMissingField'),
        SHAPEFILE_INVALID_ACCENUMB: () => this.$t('importStatusShapefileInvalidAccenumb'),
        SHAPEFILE_ROW_COL_GERMPLASM_CONFLICT: () => this.$t('importStatusShapefileRowColGermplasmConflict'),
        SHAPEFILE_DUPLICATE_ROW_COL: () => this.$t('importStatusShapefileDuplicateRowCol'),
        SHAPEFILE_WARNING_MISSING_ACCENUMB: () => this.$t('importStatusShapefileWarningMissingAccenumb')
      }
    }
  },
  computed: {
    columns: function () {
      return [
        {
          key: 'icon',
          label: ''
        }, {
          key: 'status'
        }, {
          key: 'rowIndex'
        }, {
          key: 'message'
        }, {
          key: 'type'
        }
      ]
    }
  }
}
</script>

<style>

</style>
