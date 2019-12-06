<template>
  <div>
    <h2 class="mt-3">Advanced download</h2>
    <b-row>
      <b-col lg=6>
        <b-card class="h-100">
          <b-card-title>
            <i class="mdi mdi-passport mdi-18px text-primary" /> Passport data
          </b-card-title>
          <b-card-sub-title class="mb-2">Export passport data for germplasm selections</b-card-sub-title>

          <b-card-text>Please select which part of the data to export. This can either be the whole collection, your marked items or a group of germplasm.</b-card-text>
          <b-form-radio-group
            class="d-block mb-3"
            v-model="passportSelection"
            :options="selectionOptions"
            buttons />

          <b-form-select
            class="mb-3"
            v-model="passportGroup"
            :options="groups"
            v-if="passportSelection === 'group'" />

          <b-form-checkbox class="mb-3" v-model="passportIncludeAttributes" switch>Include attributes?</b-form-checkbox>

          <template v-slot:footer>
            <b-button variant="primary" @click="downloadGermplasm"><i class="mdi mdi-18px fix-alignment mdi-download"/> Download</b-button>
          </template>
        </b-card>
      </b-col>
      <b-col lg=6>
        <b-card class="h-100">
          <b-card-title>
            <i class="mdi mdi-sitemap mdi-18px text-primary" /> Pedigree data
          </b-card-title>
          <b-card-sub-title class="mb-2">Export pedigree data for germplasm selections</b-card-sub-title>

          <b-card-text>Please select which part of the data to export. This can either be the whole collection, your marked items or a group of germplasm.</b-card-text>
          <b-form-radio-group
            class="d-block mb-3"
            v-model="pedigreeSelection"
            :options="selectionOptions"
            buttons />

          <b-form-select
            class="mb-3"
            v-model="pedigreeGroup"
            :options="groups"
            v-if="pedigreeSelection === 'group'" />

          <template v-slot:footer>
            <b-button variant="primary" @click="downloadPedigree"><i class="mdi mdi-18px fix-alignment mdi-download"/> Download</b-button>
          </template>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus.js'

export default {
  data: function () {
    return {
      selectionOptions: [],
      passportSelection: 'all',
      passportIncludeAttributes: false,
      passportGroup: null,
      pedigreeSelection: 'all',
      pedigreeGroup: null,
      groups: null
    }
  },
  watch: {
    markedIds: {
      handler: function (newValue, oldValue) {
        this.updateSelectionOptions()
      },
      deep: true
    }
  },
  methods: {
    updateSelectionOptions: function () {
      this.selectionOptions = [{
        text: 'All germplasm',
        value: 'all'
      }, {
        text: `Marked items (${this.markedIds.germplasm.length})`,
        value: 'marked',
        disabled: this.markedIds.germplasm.length < 1
      }, {
        text: 'Group',
        value: 'group',
        disabled: !this.groups || this.groups.length < 1
      }]

      // Reset selection to "All" if there aren't any marked items
      if (this.passportSelection === 'marked' && this.markedIds.germplasm.length < 1) {
        this.passportSelection = 'all'
      }
      if (this.pedigreeSelection === 'marked' && this.markedIds.germplasm.length < 1) {
        this.pedigreeSelection = 'all'
      }
    },
    downloadGermplasm: function () {
      EventBus.$emit('show-loading', true)
      const request = {
        individualIds: this.passportSelection === 'marked' ? this.markedIds.germplasm : null,
        groupIds: this.passportSelection === 'group' ? [this.passportGroup] : null,
        includeAttributes: this.passportIncludeAttributes
      }

      this.apiExportPassport(request, result => {
        this.downloadBlob({
          blob: result,
          filename: 'germplasm',
          extension: 'zip'
        })
        EventBus.$emit('show-loading', false)
      })
    },
    downloadPedigree: function () {
      EventBus.$emit('show-loading', true)
      const request = {
        individualIds: this.pedigreeSelection === 'marked' ? this.markedIds.germplasm : null,
        groupIds: this.pedigreeSelection === 'group' ? [this.pedigreeGroup] : null
      }
      this.apiPostPedigreeExport(request, result => {
        this.downloadBlob({
          blob: result,
          filename: 'pedigree',
          extension: 'helium'
        })
        EventBus.$emit('show-loading', false)
      }, {
        codes: [404],
        callback: () => {
          // Do nothing here, it just means there is no data.
        }
      })
    }
  },
  mounted: function () {
    this.updateSelectionOptions()

    const query = {
      page: 1,
      limit: this.JAVA_MAX_INTEGER,
      filter: [{
        column: 'groupType',
        comparator: 'equals',
        operator: 'and',
        values: ['germinatebase']
      }]
    }
    this.apiPostGroupTable(query, result => {
      this.groups = result.data.map(g => {
        return {
          value: g.groupId,
          text: `${g.groupName} (${g.count})`
        }
      })
      if (this.groups && this.groups.length > 0) {
        this.pedigreeGroup = this.groups[0].value
        this.passportGroup = this.groups[0].value
      }
      this.updateSelectionOptions()
    })
  }
}
</script>

<style>

</style>
