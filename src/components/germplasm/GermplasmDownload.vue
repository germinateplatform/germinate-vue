<template>
  <div>
    <h2 class="mt-3">{{ $t('pageGermplasmDownloadTitle') }}</h2>
    <b-row>
      <b-col lg=6 class="mb-3">
        <b-card class="h-100">
          <b-card-title>
            <MdiIcon :path="mdiPassport" className="text-primary" /> {{ $t('pageGermplasmDownloadTabGermplasmTitle') }}
          </b-card-title>
          <b-card-sub-title class="mb-2">{{ $t('pageGermplasmDownloadTabGermplasmSubtitle') }}</b-card-sub-title>
          <b-card-text>{{ $t('pageGermplasmDownloadTabGermplasmText') }}</b-card-text>
          <!-- Germplasm selection options (groups, marked items, all) -->
          <b-form-radio-group
            class="d-block mb-3"
            v-model="passportSelection"
            :options="selectionOptions"
            button-variant="outline-primary"
            buttons />

          <!-- Germplasm groups -->
          <b-form-select
            class="mb-3"
            v-model="passportGroup"
            :options="groups"
            v-if="passportSelection === 'group'" />

          <!-- Export attributes? -->
          <b-form-checkbox class="mb-3" v-model="passportIncludeAttributes" switch>{{ $t('pageGermplasmDownloadTabIncludeAttributes') }}</b-form-checkbox>

          <template v-slot:footer>
            <b-button variant="primary" @click="downloadGermplasm"><MdiIcon :path="mdiDownload" /> {{ $t('buttonDownload') }}</b-button>
          </template>
        </b-card>
      </b-col>
      <b-col lg=6 v-if="hasPedigreeData" class="mb-3">
        <b-card class="h-100">
          <b-card-title>
            <MdiIcon :path="mdiFamilyTree" :rotate="180" className="text-primary" /> {{ $t('pageGermplasmDownloadTabPedigreeTitle') }}
          </b-card-title>
          <b-card-sub-title class="mb-2">{{ $t('pageGermplasmDownloadTabPedigreeSubtitle') }}</b-card-sub-title>

          <b-card-text>{{ $t('pageGermplasmDownloadTabPedigreeText') }}</b-card-text>
          <!-- Germplasm selection options (groups, marked items, all) -->
          <b-form-radio-group
            class="d-block mb-3"
            v-model="pedigreeSelection"
            :options="selectionOptions"
            button-variant="outline-primary"
            buttons />

          <!-- Germplasm groups -->
          <b-form-select
            class="mb-3"
            v-model="pedigreeGroup"
            :options="groups"
            v-if="pedigreeSelection === 'group'" />

          <!-- Export attributes? -->
          <b-form-checkbox class="mb-3" v-model="pedigreeIncludeAttributes" switch>{{ $t('pageGermplasmDownloadTabPedigreeIncludeAttributes') }}</b-form-checkbox>

          <b-form-group :label="$t('tableColumnDatasetName')" label-for="dataset">
            <b-form-select :options="datasetOptions" v-model="pedigreeDataset" id="dataset">
              <template #first>
                <b-form-select-option :value="null" disabled>{{ $t('formLabelPedigreeChartDatasetSelect') }}</b-form-select-option>
              </template>
            </b-form-select>
          </b-form-group>

          <template v-slot:footer>
            <b-button variant="primary" @click="downloadPedigree" :disabled="!pedigreeDataset"><MdiIcon :path="mdiDownload" /> {{ $t('buttonDownload') }}</b-button>
          </template>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import groupApi from '@/mixins/api/group'
import datasetApi from '@/mixins/api/dataset'
import germplasmApi from '@/mixins/api/germplasm'
import formattingMixin from '@/mixins/formatting'
import utilMixin from '@/mixins/util'

import MdiIcon from '@/components/icons/MdiIcon'

import { mdiPassport, mdiDownload, mdiFamilyTree } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    MdiIcon
  },
  data: function () {
    return {
      mdiPassport,
      mdiDownload,
      mdiFamilyTree,
      selectionOptions: [],
      passportSelection: 'all',
      passportIncludeAttributes: false,
      passportGroup: null,
      pedigreeSelection: 'all',
      pedigreeGroup: null,
      pedigreeDatasets: [],
      pedigreeDataset: null,
      groups: null,
      hasPedigreeData: false,
      pedigreeIncludeAttributes: false
    }
  },
  computed: {
    ...mapGetters([
      'storeLocale',
      'storeMarkedGermplasm'
    ]),
    datasetOptions: function () {
      if (this.pedigreeDatasets) {
        return this.pedigreeDatasets.map(d => {
          return {
            value: d,
            text: d.datasetName
          }
        })
      } else {
        return []
      }
    }
  },
  watch: {
    storeMarkedGermplasm: function () {
      this.updateSelectionOptions()
    },
    storeLocale: function () {
      this.updateSelectionOptions()
    }
  },
  mixins: [datasetApi, groupApi, germplasmApi, formattingMixin, utilMixin],
  methods: {
    updateSelectionOptions: function () {
      this.selectionOptions = [{
        text: this.$t('pageGermplasmDownloadSelectAll'),
        value: 'all'
      }, {
        text: this.$t('pageGermplasmDownloadSelectMarked', { count: this.storeMarkedGermplasm.length }),
        value: 'marked',
        disabled: this.storeMarkedGermplasm.length < 1
      }, {
        text: this.$t('pageGermplasmDownloadSelectGroup'),
        value: 'group',
        disabled: !this.groups || this.groups.length < 1
      }]

      // Reset selection to "All" if there aren't any marked items
      if (this.passportSelection === 'marked' && this.storeMarkedGermplasm.length < 1) {
        this.passportSelection = 'all'
      }
      if (this.pedigreeSelection === 'marked' && this.storeMarkedGermplasm.length < 1) {
        this.pedigreeSelection = 'all'
      }
    },
    downloadGermplasm: function () {
      emitter.emit('show-loading', true)
      const request = {
        individualIds: this.passportSelection === 'marked' ? this.storeMarkedGermplasm : null,
        groupIds: this.passportSelection === 'group' ? [this.passportGroup] : null,
        includeAttributes: this.passportIncludeAttributes
      }

      this.apiExportPassport(request, result => {
        this.downloadBlob({
          blob: result,
          filename: `germplasm-${this.getDateTimeString()}`,
          extension: 'zip'
        })
        emitter.emit('show-loading', false)
      })
    },
    downloadPedigree: function () {
      emitter.emit('show-loading', true)
      const request = {
        yIds: this.pedigreeSelection === 'marked' ? this.storeMarkedGermplasm : null,
        yGroupIds: this.pedigreeSelection === 'group' ? [this.pedigreeGroup] : null,
        includeAttributes: this.pedigreeIncludeAttributes,
        datasetIds: [this.pedigreeDataset.datasetId]
      }

      emitter.emit('show-loading', true)
      this.$gtag.event('export', 'async', 'pedigree', request.datasetIds.join('-'))
      this.apiPostPedigreeDatasetExport(request, result => {
        result.forEach(r => this.$store.commit('ON_ASYNC_JOB_UUID_ADD_MUTATION', r.uuid))

        // Show the sidebar
        emitter.emit('toggle-aside', 'download')
        emitter.emit('show-loading', false)
      })
    }
  },
  mounted: function () {
    this.updateSelectionOptions()

    // Get germplasm groups
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

    // Check if there's pedigree data. Only get one row to keep load on server low.
    const pedigreeQuery = {
      page: 1,
      limit: 1
    }
    this.apiPostPedigreeTable(pedigreeQuery, result => {
      if (result && result.count) {
        this.hasPedigreeData = result.count > 0
      }
    })

    this.apiPostDatasetTable({
      filter: [{
        column: 'datasetType',
        comparator: 'equals',
        operator: 'and',
        values: ['pedigree']
      }]
    }, result => {
      if (result && result.data) {
        this.pedigreeDatasets = result.data

        if (result.data.length > 0) {
          this.pedigreeDataset = result.data.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn))[0]
        } else {
          this.pedigreeDataset = null
        }
      }
    })
  }
}
</script>

<style>

</style>
