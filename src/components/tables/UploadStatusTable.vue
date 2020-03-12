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
      <template v-slot:cell(icon)="data">
        <i :class="`mdi mdi-18px ${getIconAndVariant(data.item.status)}`" />
      </template>
      <template v-slot:cell(status)="data">
        <span v-if="statusOptions[data.item.status]">{{ statusOptions[data.item.status]() }}</span>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  props: {
    job: {
      type: Object,
      default: null
    }
  },
  data: function () {
    return {
      statusOptions: {
        GENERIC_MISSING_REQUIRED_VALUE: () => this.$t('importStatusGenericMissingValue'),
        GENERIC_VALUE_TOO_LONG: () => this.$t('importStatusValueTooLong'),
        GENERIC_INVALID_COUNTRY_CODE: () => this.$t('importStatusMcpdInvalidCountryCode'),
        GENERIC_INVALID_DATE: () => this.$t('importStatusMcpdInvalidDate'),
        TRIALS_INVALID_TRAIT_DATATYPE: () => this.$t('importStatusTrialsInvalidDataType'),
        TRIALS_MISSING_TRAIT_DECLARATION: () => this.$t('importStatusTrialsMissingTraitDeclaration'),
        TRIALS_INVALID_GERMPLASM: () => this.$t('importStatusTrialsInvalidGermplasm'),
        TRIALS_DATA_DATE_HEADER_MISMATCH: () => this.$t('importStatusTrialsSheetHeaderMismatch'),
        TRIALS_DATA_DATE_IDENTIFIER_MISMATCH: () => this.$t('importStatusTrialsIdentifierMismatch'),
        GENERIC_DUPLICATE_COLUMN: () => this.$t('importStatusGenericDuplicateColumn'),
        GENERIC_IO_ERROR: () => this.$t('importStatusGenericIOError'),
        GENERIC_MISSING_EXCEL_SHEET: () => this.$t('importStatusGenericMissingExcelSheet'),
        GENERIC_MISSING_COLUMN: () => this.$t('importStatusGenericMissingColumn'),
        GENERIC_MISSING_DB_ITEM_UPDATE: () => this.$t('importStatusMissingDbItemUpdate'),
        MCPD_DUPLICATE_ACCENUMB: () => this.$t('importStatusMcpdDuplicateAccenumb'),
        MCPD_MISSING_FIELD: () => this.$t('importStatusMcpdMissingField'),
        MCPD_INVALID_SAMPSTAT: () => this.$t('importStatusMcpdInvalidSampstat'),
        MCPD_INVALID_COLLSRC: () => this.$t('importStatusMcpdInvalidCollsrc'),
        MCPD_INVALID_STORAGE: () => this.$t('importStatusMcpdInvalidStorage'),
        GENERIC_INVALID_NUMBER: () => this.$t('importStatusMcpdInvalidNumber'),
        MCPD_INVALID_ENTITY_TYPE: () => this.$t('importStatusMcpdInvalidEntityType'),
        MCPD_INVALID_ENTITY_PARENT_ACCENUMB: () => this.$t('importStatusMcpdInvalidEntityParentAccenumb'),
        MCPD_MISSING_ACCENUMB: () => this.$t('importStatusMcpdMissingAccenumb')
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
        }
      ]
    }
  },
  methods: {
    getIconAndVariant: function (status) {
      if (status === 'OK') {
        return 'text-success mdi-check-circle-outline'
      } else {
        return 'text-danger mdi-alert-circle-outline'
      }
    }
  }
}
</script>

<style>

</style>
