<template>
  <div>
    <h1>{{ $t('pageSearchTitle') }}</h1>
    <hr />
    <b-form @submit.prevent="search">
      <b-row>
        <!-- Search data types -->
        <b-col cols=12 sm=6>
          <b-form-group
            :label="$t('formLabelSearchType')"
            label-for="search-type">
            <b-input-group>
              <b-form-select id="search-type" :options="searchTypes" v-model="searchType" />
            </b-input-group>
          </b-form-group>
        </b-col>
        <!-- Search term and comparator -->
        <b-col cols=12 sm=6>
          <b-form-group
            :label="$t('formLabelSearchTerm')"
            label-for="search-term">
            <b-input-group>
              <b-input-group-prepend>
                <b-dropdown :text="comparators[comparator].text()" class="overflow-dropdown">
                  <b-dropdown-item v-for="(value, name) in comparators"
                                  :key="'search-comparator-' + name"
                                  @click="comparator = name">
                    {{ value.text() }}
                  </b-dropdown-item>
                </b-dropdown>
              </b-input-group-prepend>
              <b-form-input autofocus id="search-term" v-model="tempSearchTerm" trim @focus="$event.target.select()" />
              <b-input-group-append>
                <b-button variant="primary" type="submit"><MdiIcon :path="mdiMagnify" /></b-button>
              </b-input-group-append>

              <b-tooltip target="search-term" triggers="hover" v-if="comparator === 'contains'">
                {{ $t('tooltipSearchWildcard') }}
              </b-tooltip>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-row>
    </b-form>
    <template v-if="showResults">
      <h2>{{ $t('pageSearchResultTitle') }} <small>"{{ searchTerm }}"</small></h2>
      <p class="text-muted">{{ $t('pageSearchResultText') }}</p>

      <!-- Germplasm -->
      <Collapse :icon="mdiSprout" :title="$t('pageSearchResultSectionGermplasm')" :visible="false" class="mb-2" no-body ref="collapseGermplasm" v-if="isSearchType('germplasm')">
        <template v-slot:content="slotProps">
          <GermplasmTable :storeUrlParameters="false" :getData="getGermplasmData" :getIds="getGermplasmIds" :downloadTable="downloadGermplasm" :filterOn="initialFilters['TABLE_COLUMNS_GERMPLASM_SEARCHABLE']" ref="tableGermplasm" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <!-- Germplasm attributes -->
      <Collapse :icon="mdiPlaylistPlus" :title="$t('pageSearchResultSectionGermplasmAttributes')" :visible="false" class="mb-2" no-body ref="collapseGermplasmAttributes"  v-if="isSearchType('germplasmAttributes')">
        <template v-slot:content="slotProps">
          <GermplasmAttributeTable :storeUrlParameters="false" :getData="getGermplasmAttributeData" :downloadTable="downloadGermplasmAttributes" :filterOn="initialFilters['TABLE_COLUMNS_GERMPLASM_ATTRIBUTE_SEARCHABLE']" ref="tableGermplasmAttributes" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <!-- Trials data -->
      <Collapse :icon="mdiShovel" :title="$t('pageSearchResultSectionTrialsData')" :visible="false" class="mb-2" no-body ref="collapseTrials"  v-if="isSearchType('trials')">
        <template v-slot:content="slotProps">
          <TrialsDataTable :storeUrlParameters="false" :getData="getTrialsData" :getIds="getTrialsDataIds" :downloadTable="downloadTrialsData" :filterOn="initialFilters['TABLE_COLUMNS_TRIALS_DATA_SEARCHABLE']" ref="tableTrials" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <!-- Map definition data -->
      <Collapse :icon="mdiDna" :title="$t('pageSearchResultSectionMapDefinitionData')" :visible="false" class="mb-2" no-body ref="collapseMapDefinitionData"  v-if="isSearchType('mapdefinitions')">
        <template v-slot:content="slotProps">
          <MapDefinitionTable :storeUrlParameters="false" :getData="getMapDefinitionData" :getIds="getMapDefinitionIds" :downloadTable="downloadMapDefinitionData" :filterOn="initialFilters['TABLE_COLUMNS_MAP_DEFINITION_SEARCHABLE']" ref="tableMapDefinitionData" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <!-- Datasets -->
      <Collapse :icon="mdiDatabase" :title="$t('pageSearchResultSectionDatasets')" :visible="false" class="mb-2" no-body ref="collapseDatasets"  v-if="isSearchType('datasets')">
        <template v-slot:content="slotProps">
          <DatasetTable :storeUrlParameters="false" :getData="getDatasetData" :downloadTable="downloadDatasets" :filterOn="initialFilters['TABLE_COLUMNS_DATASET_SEARCHABLE']" ref="tableDatasets" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <!-- Dataset attributes -->
      <Collapse :icon="mdiPlaylistPlus" :title="$t('pageSearchResultSectionDatasetAttributes')" :visible="false" class="mb-2" no-body ref="collapseDatasetAttributes"  v-if="isSearchType('datasetAttributes')">
        <template v-slot:content="slotProps">
          <DatasetAttributeTable :storeUrlParameters="false" :getData="getDatasetAttributeData" :downloadTable="downloadDatasetAttributes" :filterOn="initialFilters['TABLE_COLUMNS_DATASET_ATTRIBUTE_SEARCHABLE']" ref="tableDatasetAttributes" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <!-- Pedigree data -->
      <Collapse :icon="mdiSitemap" :title="$t('pageSearchResultSectionPedigreeData')" :visible="false" class="mb-2" no-body ref="collapsePedigree" v-if="isSearchType('pedigrees')">
        <template v-slot:content="slotProps">
          <PedigreeTable :storeUrlParameters="false" :getData="getPedigreeData" :downloadTable="downloadPedigrees" :filterOn="initialFilters['TABLE_COLUMNS_PEDIGREE_SEARCHABLE']" ref="tablePedigree" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <!-- Location data -->
      <Collapse :icon="mdiMap" :title="$t('pageSearchResultSectionLocationData')" :visible="false" class="mb-2" no-body ref="collapseLocationData" v-if="isSearchType('locations')">
        <template v-slot:content="slotProps">
          <LocationTable :storeUrlParameters="false" :getData="getLocationData" :getIds="getLocationIds" :downloadTable="downloadLocations" :filterOn="initialFilters['TABLE_COLUMNS_LOCATION_SEARCHABLE']" ref="tableLocations" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <template v-if="showAdditionalDatasets">
        <DatasetsWithUnacceptedLicense v-on:data-changed="checkNumbers"/>
      </template>
    </template>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import Collapse from '@/components/util/Collapse'
import DatasetTable from '@/components/tables/DatasetTable'
import DatasetAttributeTable from '@/components/tables/DatasetAttributeTable'
import GermplasmTable from '@/components/tables/GermplasmTable'
import GermplasmAttributeTable from '@/components/tables/GermplasmAttributeTable'
import LocationTable from '@/components/tables/LocationTable'
import MapDefinitionTable from '@/components/tables/MapDefinitionTable'
import PedigreeTable from '@/components/tables/PedigreeTable'
import TrialsDataTable from '@/components/tables/TrialsDataTable'
import DatasetsWithUnacceptedLicense from '@/components/util/DatasetsWithUnacceptedLicense'

import { mdiMagnify, mdiSprout, mdiShovel, mdiFlask, mdiDna, mdiDatabase, mdiPlaylistPlus, mdiSitemap, mdiMap } from '@mdi/js'

import ColumnsMixin from '@/const/database-columns.js'
import { apiPostDatasetAttributeExport, apiPostDatasetTable, apiPostDatasetAttributeTable } from '@/mixins/api/dataset.js'
import { apiPostGermplasmTable, apiPostGermplasmTableIds, apiPostGermplasmAttributeTableExport, apiPostGermplasmAttributeTable, apiPostPedigreeTable } from '@/mixins/api/germplasm.js'
import { apiPostMapdefinitionTable, apiPostMapdefinitionTableIds } from '@/mixins/api/genotype.js'
import { apiPostLocationTable, apiPostLocationTableIds } from '@/mixins/api/location.js'
import { apiPostTableExport } from '@/mixins/api/misc.js'
import { apiPostTrialsDataTable, apiPostTrialsDataTableIds } from '@/mixins/api/trait.js'
import { Pages } from '@/mixins/pages'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      mdiMagnify,
      mdiSprout,
      mdiShovel,
      mdiFlask,
      mdiDna,
      mdiDatabase,
      mdiPlaylistPlus,
      mdiSitemap,
      mdiMap,
      tableColumns: ['TABLE_COLUMNS_GERMPLASM_SEARCHABLE', 'TABLE_COLUMNS_GERMPLASM_ATTRIBUTE_SEARCHABLE', 'TABLE_COLUMNS_TRIALS_DATA_SEARCHABLE', 'TABLE_COLUMNS_MAP_DEFINITION_SEARCHABLE', 'TABLE_COLUMNS_DATASET_SEARCHABLE', 'TABLE_COLUMNS_DATASET_ATTRIBUTE_SEARCHABLE', 'TABLE_COLUMNS_PEDIGREE_SEARCHABLE', 'TABLE_COLUMNS_LOCATION_SEARCHABLE'],
      showAdditionalDatasets: true,
      searchTerm: null,
      tempSearchTerm: null,
      showResults: false,
      germplasmFilterColumns: ['germplasmId', 'germplasmName'],
      comparator: 'equals',
      comparators: {
        equals: {
          text: () => this.$t('comparatorsEqual')
        },
        contains: {
          text: () => this.$t('comparatorsContains')
        },
        inSet: {
          text: () => this.$t('comparatorsInSet')
        }
      },
      validComparatorsForType: {
        Boolean: ['equals', 'isNull'],
        dataType: ['equals', 'isNull'],
        locationType: ['equals', 'isNull'],
        entityType: ['equals', 'isNull'],
        json: ['contains', 'isNull'],
        Number: ['equals', 'between', 'lessThan', 'greaterThan', 'lessOrEquals', 'greaterOrEquals', 'inSet', 'isNull'],
        Date: ['equals', 'between', 'lessThan', 'greaterThan', 'lessOrEquals', 'greaterOrEquals', 'isNull']
      },
      searchType: 'all',
      searchTypes: [
        { value: 'all', text: this.$t('pageSearchResultSectionAll') },
        { value: 'germplasm', text: this.$t('pageSearchResultSectionGermplasm') },
        { value: 'germplasmAttributes', text: this.$t('pageSearchResultSectionGermplasmAttributes') },
        { value: 'trials', text: this.$t('pageSearchResultSectionTrialsData') },
        { value: 'mapdefinitions', text: this.$t('pageSearchResultSectionMapDefinitionData') },
        { value: 'datasets', text: this.$t('pageSearchResultSectionDatasets') },
        { value: 'datasetAttributes', text: this.$t('pageSearchResultSectionDatasetAttributes') },
        { value: 'pedigrees', text: this.$t('pageSearchResultSectionPedigreeData') },
        { value: 'locations', text: this.$t('pageSearchResultSectionLocationData') }
      ]
    }
  },
  components: {
    Collapse,
    DatasetTable,
    DatasetAttributeTable,
    DatasetsWithUnacceptedLicense,
    GermplasmTable,
    GermplasmAttributeTable,
    LocationTable,
    MapDefinitionTable,
    MdiIcon,
    PedigreeTable,
    TrialsDataTable
  },
  computed: {
    initialFilters: function () {
      const result = {}

      this.tableColumns.forEach(columnConst => {
        result[columnConst] = ColumnsMixin[columnConst].map(c => {
          let comp = this.comparator
          const validOptions = this.validComparatorsForType[c.type]

          if (validOptions !== undefined && validOptions !== null && validOptions.indexOf(comp) === -1) {
            comp = validOptions[0]
          }

          return {
            column: c,
            comparator: comp,
            operator: 'or',
            values: [this.searchTerm]
          }
        })
      })

      return result
    }
  },
  watch: {
    searchType: function (newValue) {
      this.updateSearchTypeUrl(newValue)
    },
    comparator: function (newValue) {
      this.updateComparatorUrl(newValue)
    }
  },
  methods: {
    updateSearchTypeUrl: async function (newValue) {
      const urlQuery = Object.assign({}, this.$route.query)
      urlQuery.searchType = newValue
      await this.$router.replace({ query: urlQuery })
    },
    updateComparatorUrl: async function (newValue) {
      const urlQuery = Object.assign({}, this.$route.query)
      urlQuery.comparator = newValue
      await this.$router.replace({ query: urlQuery })
    },
    checkNumbers: function (requestData, data) {
      this.showAdditionalDatasets = data && data.count > 0
    },
    isSearchType: function (requested) {
      return this.searchType === 'all' || this.searchType === requested
    },
    // FILTER
    getFilter: function (columnConst) {
      return ColumnsMixin[columnConst].map(c => {
        return {
          column: c,
          comparator: this.comparator,
          operator: 'or',
          values: [this.searchTerm]
        }
      })
    },
    // TRIALS
    getTrialsData: function (data, callback) {
      return apiPostTrialsDataTable(data, callback)
    },
    getTrialsDataIds: function (data, callback) {
      return apiPostTrialsDataTableIds(data, callback)
    },
    downloadTrialsData: function (data, callback) {
      return apiPostTableExport({ filter: data.filter }, 'dataset/data/trial', callback)
    },
    // GERMPLASM
    getGermplasmData: function (data, callback) {
      return apiPostGermplasmTable(data, callback)
    },
    getGermplasmIds: function (data, callback) {
      return apiPostGermplasmTableIds(data, callback)
    },
    downloadGermplasm: function (data, callback) {
      return apiPostTableExport({ filter: data.filter }, 'germplasm', callback)
    },
    // MAPDEFINITIONS
    getMapDefinitionData: function (data, callback) {
      return apiPostMapdefinitionTable(data, callback)
    },
    getMapDefinitionIds: function (data, callback) {
      return apiPostMapdefinitionTableIds(data, callback)
    },
    downloadMapDefinitionData: function (data, callback) {
      return apiPostTableExport({ filter: data.filter }, 'map/mapdefinition', callback)
    },
    // LOCATIONS
    getLocationData: function (data, callback) {
      return apiPostLocationTable(data, callback)
    },
    getLocationIds: function (data, callback) {
      return apiPostLocationTableIds(data, callback)
    },
    downloadLocations: function (data, callback) {
      return apiPostTableExport({ filter: data.filter }, 'location', callback)
    },
    // GERMPLASM ATTRIBUTES
    getGermplasmAttributeData: function (data, callback) {
      return apiPostGermplasmAttributeTable(data, callback)
    },
    downloadGermplasmAttributes: function (data, callback) {
      return apiPostGermplasmAttributeTableExport(data, callback)
    },
    // PEDIGREES
    getPedigreeData: function (data, callback) {
      return apiPostPedigreeTable(data, callback)
    },
    downloadPedigrees: function (data, callback) {
      return apiPostTableExport({ filter: data.filter }, 'pedigree', callback)
    },
    // DATASET ATTRIBUTES
    getDatasetAttributeData: function (data, callback) {
      return apiPostDatasetAttributeTable(null, data, callback)
    },
    downloadDatasetAttributes: function (data, callback) {
      return apiPostDatasetAttributeExport(data, callback)
    },
    // DATASETS
    getDatasetData: function (data, callback) {
      return apiPostDatasetTable(data, callback)
    },
    downloadDatasets: function (data, callback) {
      return apiPostTableExport({ filter: data.filter }, 'dataset', callback)
    },
    // SEARCH
    search: function () {
      this.searchTerm = this.tempSearchTerm

      this.$router.push({ name: Pages.searchQuery, params: { searchTerm: this.tempSearchTerm }, query: this.$route.query })
    },
    runSearch: function () {
      // Trigger result section to show up
      this.showResults = true
      // Refresh all tables
      Object.keys(this.$refs)
        .filter(r => r.startsWith('table'))
        .forEach(t => {
          if (this.$refs[t]) {
            this.$refs[t].refresh()
          }
        })
      // Set loading status for all collapse elements
      Object.keys(this.$refs)
        .filter(r => r.startsWith('collapse'))
        .forEach(t => {
          if (this.$refs[t]) {
            this.$refs[t].setLoading(true)
          }
        })
    }
  },
  mounted: function () {
    this.searchTerm = (this.$route.params && this.$route.params.searchTerm) ? this.$route.params.searchTerm : null
    this.tempSearchTerm = this.searchTerm

    if (this.$route.query && this.$route.query.comparator) {
      this.comparator = this.comparators[this.$route.query.comparator] ? this.$route.query.comparator : 'equals'
    }
    if (this.$route.query && this.$route.query.searchType) {
      const match = this.searchTypes.find(t => t.value === this.$route.query.searchType)

      if (match) {
        this.searchType = this.$route.query.searchType
      }
    }

    if (this.searchTerm && this.searchTerm !== '') {
      this.runSearch()
    }

    emitter.on('license-accepted', this.search)
  },
  beforeDestroy: function () {
    emitter.off('license-accepted', this.search)
  }
}
</script>

<style>

</style>
