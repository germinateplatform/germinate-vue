<template>
  <div>
    <h1>Data uploader</h1>
    <b-alert variant="danger" :show="error !== null">{{ error }}</b-alert>
    <b-form-file
      v-model="file"
      :state="Boolean(file)"
      placeholder="Choose a file or drop it here..."
      accept=".xlsx"
      drop-placeholder="Drop file here..." />
    <div class="mt-3">Selected file: {{ file ? file.name : '' }}</div>

    <b-button variant="success" v-if="file" @click="onSubmit"><i class="mdi mdi-18px fix-alignment mdi-upload" /> Upload</b-button>
    <p class="text-muted" v-if="status">{{ status }}</p>

    <template v-if="response && response.length">
      <hr />
      <h2>Status report</h2>
      <p class="text-warning">This table only shows the first error of each type. Please note that there may be many more errors in your file.</p>
      <b-table :fields="columns"
               :items="response"
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
          <span>{{ statusOptions[data.item.status]() }}</span>
        </template>
      </b-table>
    </template>
  </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus.js'
import miscApi from '@/mixins/api/misc.js'

export default {
  data: function () {
    return {
      file: null,
      uuid: null,
      response: [],
      timer: '',
      error: null,
      status: null,
      statusOptions: {
        OK: () => this.$t('importStatusOk'),
        GENERIC_DUPLICATE_COLUMN: () => this.$t('importStatusGenericDuplicateColumn'),
        GENERIC_IO_ERROR: () => this.$t('importStatusGenericIOError'),
        GENERIC_MISSING_EXCEL_SHEET: () => this.$t('importStatusGenericMissingExcelSheet'),
        GENERIC_MISSING_COLUMN: () => this.$t('importStatusGenericMissingColumn'),
        GENERIC_MISSING_DB_ITEM_UPDATE: () => this.$t('importStatusMissingDbItemUpdate'),
        MCPD_DUPLICATE_ACCENUMB: () => this.$t('importStatusMcpdDuplicateAccenumb'),
        MCPD_INVALID_COUNTRY_CODE: () => this.$t('importStatusMcpdInvalidCountryCode'),
        MCPD_INVALID_DATE: () => this.$t('importStatusMcpdInvalidDate'),
        MCPD_MISSING_FIELD: () => this.$t('importStatusMcpdMissingField'),
        MCPD_INVALID_SAMPSTAT: () => this.$t('importStatusMcpdInvalidSampstat'),
        MCPD_INVALID_COLLSRC: () => this.$t('importStatusMcpdInvalidCollsrc'),
        MCPD_INVALID_STORAGE: () => this.$t('importStatusMcpdInvalidStorage'),
        MCPD_INVALID_NUMBER: () => this.$t('importStatusMcpdInvalidNumber'),
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
  mixins: [ miscApi ],
  methods: {
    getIconAndVariant: function (status) {
      if (status === 'OK') {
        return 'text-success mdi-check-circle-outline'
      } else {
        return 'text-danger mdi-alert-circle-outline'
      }
    },
    checkStatus: function () {
      this.apiGetDataUploadStatus(this.uuid, result => {
        if (result) {
          EventBus.$emit('show-loading', false)
          clearInterval(this.timer)

          this.response = result
          this.status = null
        }
      }, error => {
        EventBus.$emit('show-loading', false)
        clearInterval(this.timer)
        this.status = null
        this.error = error
      })
    },
    onSubmit: function () {
      let formData = new FormData()
      formData.append('fileToUpload', this.file)

      this.status = 'Uploading file...'
      EventBus.$emit('show-loading', true)
      this.apiPostDataUpload(formData, result => {
        this.uuid = result
        this.status = 'Checking file, don\'t leave this page...'
        this.timer = setInterval(this.checkStatus, 1000)
      })
    }
  },
  beforeDestroy: function () {
    clearTimeout(this.timer)
  }
}
</script>

<style>

</style>
