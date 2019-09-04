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

    <b-button variant="success" v-if="file" @click="onSubmit" :disabled="running">
      <b-spinner variant="light" type="grow" small v-if="running" />
      Upload
    </b-button>

    <template v-if="response && response.length">
      <hr />
      <h2>Status report</h2>
      <p class="text-warning">This table only shows the first error of each type. Please note that there may be many more errors in your file.</p>
      <v-client-table :data="response" :columns="columns" :options="options">
        <i slot="icon" slot-scope="props" :class="`mdi mdi-18px ${getIconAndVariant(props.row.status)}`" />
        <span slot="status" slot-scope="props">{{ statusOptions[props.row.status]() }}</span>
      </v-client-table>
    </template>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      file: null,
      running: false,
      uuid: null,
      response: [],
      timer: '',
      error: null,
      columns: ['icon', 'status', 'rowIndex', 'message'],
      options: {
        skin: 'table table-striped table-hover',
        texts: this.getPaginationTexts(),
        filterable: [],
        perPage: Number.MAX_SAFE_INTEGER,
        perPageValues: [],
        pagination: {
          chunk: Number.MAX_SAFE_INTEGER
        },
        orderBy: {
          column: 'rowIndex',
          ascending: true
        },
        headings: {
          icon: ''
        }
      },
      statusOptions: {
        OK: () => this.$t('importStatusOk'),
        GENERIC_IO_ERROR: () => this.$t('importStatusGeneticIOError'),
        GENERIC_MISSING_EXCEL_SHEET: () => this.$t('importStatusGenericMissingExcelSheet'),
        GENERIC_MISSING_COLUMN: () => this.$t('importStatusGenericMissingColumn'),
        MCPD_DUPLICATE_ACCENUMB: () => this.$t('importStatusMcpdDuplicateAccenumb'),
        MCPD_INVALID_COUNTRY_CODE: () => this.$t('importStatusMcpdInvalidCountryCode'),
        MCPD_INVALID_DATE: () => this.$t('importStatusMcpdInvalidDate'),
        MCPD_MISSING_FIELD: () => this.$t('importStatusMcpdMissingField'),
        MCPD_INVALID_SAMPSTAT: () => this.$t('importStatusMcpdInvalidSampstat'),
        MCPD_INVALID_COLLSRC: () => this.$t('importStatusMcpdInvalidCollsrc'),
        MCPD_INVALID_STORAGE: () => this.$t('importStatusMcpdInvalidStorage'),
        MCPD_INVALID_NUMBER: () => this.$t('importStatusMcpdInvalidNumber'),
        MCPD_INVALID_ENTITY_TYPE: () => this.$t('importStatusMcpdInvalidEntityType'),
        MCPD_INVALID_ENTITY_PARENT_ACCENUMB: () => this.$t('importStatusMcpdInvalidEntityParentAccenumb')
      }
    }
  },
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
          this.running = false
          clearInterval(this.timer)

          this.response = result
        }
      }, error => {
        this.running = false
        clearInterval(this.timer)
        this.error = error
      })
    },
    onSubmit: function () {
      let formData = new FormData()
      formData.append('fileToUpload', this.file)

      this.running = true
      this.apiPostDataUpload(formData, result => {
        this.uuid = result
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
