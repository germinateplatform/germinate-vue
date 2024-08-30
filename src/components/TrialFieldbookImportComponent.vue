<template>
  <div>
    <!-- File input -->
    <b-form-group label-for="fieldbook-input"
                :label="$t('formLabelTrialCreationFieldbookFile')"
                :state="formValidated"
                :invalid-feedback="formFeedback">
      <b-form-textarea id="fieldbook-input"
                      @keydown.tab.prevent="tabber($event)"
                      rows=6
                      wrap="off"
                      required
                      :state="formValidated"
                      accept=".csv, .tsv, .txt"
                      v-model="input" />
      <!-- Variety names file loading -->
      <b-form-file type="file" :placeholder="$t('pageDataUploadFilePlaceholder')" :state="Boolean(inputFile)" accept=".csv, .tsv, .txt" v-model="inputFile" />
    </b-form-group>

    <b-button variant="primary" @click="readColumns"><MdiIcon :path="mdiTableHeadersEye" /> {{ $t('buttonReadColumns') }}</b-button>

    <div class="mt-3" v-if="fileColumns && fileColumns.length > 0">
      <p>{{ $t('modalTextFielDBookColumnMapping') }}</p>
      <b-row>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelFielDBookRow')" :description="$t('formDescriptionFielDBookRow')" label-for="row">
            <b-form-select id="row" v-model="columnMapping.row" :options="fileColumns" />
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelFielDBookColumn')" :description="$t('formDescriptionFielDBookColumn')" label-for="column">
            <b-form-select id="column" v-model="columnMapping.column" :options="fileColumns" />
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelFielDBookGermplasm')" :description="$t('formDescriptionFielDBookGermplasm')" label-for="germplasm">
            <b-form-select id="germplasm" v-model="columnMapping.germplasm" :options="fileColumns" />
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelFielDBookRep')" :description="$t('formDescriptionFielDBookRep')" label-for="rep">
            <b-form-select id="rep" v-model="columnMapping.rep" :options="fileColumns" />
          </b-form-group>
        </b-col>
      </b-row>

      <b-button variant="primary" @click="loadInput"><MdiIcon :path="mdiDatabaseImport" /> {{ $t('buttonLoadData') }}</b-button>
    </div>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import { mdiTableHeadersEye, mdiDatabaseImport } from '@mdi/js'
import { tsvParse, csvParse, autoType } from 'd3-dsv'

export default {
  components: {
    MdiIcon
  },
  data: function () {
    return {
      mdiTableHeadersEye,
      mdiDatabaseImport,
      formValidated: null,
      formFeedback: null,
      input: null,
      inputFile: null,
      parsedData: null,
      fileColumns: [],
      columnMapping: {
        row: null,
        column: null,
        germplasm: null,
        rep: null
      }
    }
  },
  watch: {
    input: function () {
      this.reset(false)
    },
    inputFile: function (newValue) {
      if (newValue) {
        this.loadInputFile()
      }
    }
  },
  computed: {
    columnsMapped: function () {
      return this.columnMapping.row !== null && this.columnMapping.column !== null && this.columnMapping.germplasm !== null
    }
  },
  methods: {
    readColumns: function () {
      this.parsedData = null
      this.formValidated = null
      this.formFeedback = null
      this.fileColumns = []
      this.columnMapping = {
        row: null,
        column: null,
        germplasm: null,
        rep: null
      }

      if (!this.input || this.input.length < 1) {
        this.formValidated = false
        this.formFeedback = this.$t('formFeedbackFielDBookMissingData')
        return
      }

      const csv = csvParse(this.input, autoType)
      const tsv = tsvParse(this.input, autoType)

      if (csv.columns.length > 1 && !csv.columns[0].includes('\t')) {
        this.parsedData = csv
      } else {
        this.parsedData = tsv
      }

      const tempColumns = this.parsedData.columns.map(v => {
        return {
          value: v,
          text: v
        }
      })
      tempColumns.unshift({
        value: null,
        text: this.$t('formSelectOptionUnmapped')
      })
      this.fileColumns = tempColumns

      if (this.fileColumns.length > 1) {
        // Naive naming
        if (this.parsedData.columns.includes('Row')) {
          this.columnMapping.row = 'Row'
        }
        if (this.parsedData.columns.includes('Column')) {
          this.columnMapping.column = 'Column'
        }
        if (this.parsedData.columns.includes('Rep')) {
          this.columnMapping.rep = 'Rep'
        }
        if (this.parsedData.columns.includes('Germplasm')) {
          this.columnMapping.germplasm = 'Germplasm'
        }
        // FielDHub specific naming
        if (this.parsedData.columns.includes('ROW')) {
          this.columnMapping.row = 'ROW'
        }
        if (this.parsedData.columns.includes('COLUMN')) {
          this.columnMapping.column = 'COLUMN'
        }
        if (this.parsedData.columns.includes('REP')) {
          this.columnMapping.rep = 'REP'
        }
        if (this.parsedData.columns.includes('TREATMENT')) {
          this.columnMapping.germplasm = 'TREATMENT'
        }
      } else {
        this.formValidated = false
        this.formFeedback = this.$t('formFeedbackFielDBookMissingData')
      }
    },
    tabber: function (event) {
      const text = this.input
      const originalSelectionStart = event.target.selectionStart
      const textStart = text.slice(0, originalSelectionStart)
      const textEnd = text.slice(originalSelectionStart)

      this.input = `${textStart}\t${textEnd}`
      event.target.value = this.input // required to make the cursor stay in place.
      event.target.selectionEnd = event.target.selectionStart = originalSelectionStart + 1
    },
    loadInput: function () {
      const parts = []

      for (let i = 0; i < this.parsedData.length; i++) {
        const r = this.parsedData[i]

        const row = r[this.columnMapping.row]
        const column = r[this.columnMapping.column]
        const germplasm = r[this.columnMapping.germplasm]
        const rep = r[this.columnMapping.rep]

        if (!germplasm || germplasm === '') {
          this.formValidated = false
          this.formFeedback = this.$t('formFeedbackFielDBookMissingGermplasm', { line: i + 1 })
          return
        }
        if (row === undefined || row === null || row === '' || !(typeof row === 'number')) {
          this.formValidated = false
          this.formFeedback = this.$t('formFeedbackFielDBookMissingInvalidRow', { line: i + 1 })
          return
        }
        if (column === undefined || column === null || column === '' || !(typeof column === 'number')) {
          this.formValidated = false
          this.formFeedback = this.$t('formFeedbackFielDBookMissingInvalidColumn', { line: i + 1 })
          return
        }
        if (row < 1 || row > this.rows || column < 1 || column > this.columns) {
          this.formValidated = false
          this.formFeedback = this.$t('formFeedbackFielDBookInvalidDimensions', { line: i + 1, row: row, column: column })
          return
        }

        parts.push({
          row: row,
          column: column,
          germplasm,
          rep
        })
      }

      this.$emit('change', parts)
      this.reset()
    },
    loadInputFile: function () {
      const reader = new FileReader()
      reader.onload = event => {
        this.input = event.target.result.replace(/\r/g, '')
        this.inputFile = null
      }
      reader.readAsText(this.inputFile)
    },
    reset: function (clearInput = true) {
      if (clearInput) {
        this.input = null
      }
      this.inputFile = null
      this.formValidated = null
      this.formFeedback = null
      this.parsedData = null
      this.fileColumns = []
      this.columnMapping = {
        row: null,
        column: null,
        germplasm: null,
        rep: null
      }
    }
  }
}
</script>

<style>

</style>
