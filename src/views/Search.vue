<template>
  <div>
    <h1>{{ $t('pageSearchTitle') }}</h1>
    <b-form @submit.prevent="search">
      <b-row>
        <!-- Search data types -->
        <b-col xs=12 sm=6>
          <b-form-group
            :label="$t('formLabelSearchType')"
            label-for="search-type">
            <b-input-group>
              <b-form-select id="search-type" :options="searchTypes" v-model="searchType" />
            </b-input-group>
          </b-form-group>
        </b-col>
        <!-- Search term and comparator -->
        <b-col xs=12 sm=6>
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
                <b-button variant="primary" type="submit"><i class="mdi mdi-18px mdi-magnify" /></b-button>
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
      <Collapse icon="mdi-sprout" :title="$t('pageSearchResultSectionGermplasm')" :visible="false" class="mb-2" no-body ref="collapseGermplasm" v-if="isSearchType('germplasm')">
        <template v-slot:default="slotProps">
          <GermplasmTable :getData="getGermplasmData" :getIds="getGermplasmIds" :downloadTable="downloadGermplasm" :filterOn="getFilter('TABLE_COLUMNS_GERMPLASM_SEARCHABLE')" ref="tableGermplasm" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <!-- Germplasm attributes -->
      <Collapse icon="mdi-playlist-plus" :title="$t('pageSearchResultSectionGermplasmAttributes')" :visible="false" class="mb-2" no-body ref="collapseGermplasmAttributes"  v-if="isSearchType('germplasmAttributes')">
        <template v-slot:default="slotProps">
          <GermplasmAttributeTable :getData="getGermplasmAttributeData" :downloadTable="downloadGermplasmAttributes" :filterOn="getFilter('TABLE_COLUMNS_GERMPLASM_ATTRIBUTE_SEARCHABLE')" ref="tableGermplasmAttributes" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <!-- Trials data -->
      <Collapse icon="mdi-shovel" :title="$t('pageSearchResultSectionTrialsData')" :visible="false" class="mb-2" no-body ref="collapseTrials"  v-if="isSearchType('trials')">
        <template v-slot:default="slotProps">
          <TrialsDataTable :getData="getTrialsData" :getIds="getTrialsDataIds" :downloadTable="downloadTrialsData" :filterOn="getFilter('TABLE_COLUMNS_TRIALS_DATA_SEARCHABLE')" ref="tableTrials" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <!-- Chemical compound data -->
      <Collapse icon="mdi-flask" :title="$t('pageSearchResultSectionCompoundData')" :visible="false" class="mb-2" no-body ref="collapseCompoundData" v-if="isSearchType('compounds')">
        <template v-slot:default="slotProps">
          <CompoundDataTable :getData="getCompoundData" :downloadTable="downloadCompoundData" :filterOn="getFilter('TABLE_COLUMNS_COMPOUND_DATA_SEARCHABLE')" ref="tableCompoundData" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <!-- Map definition data -->
      <Collapse icon="mdi-dna" :title="$t('pageSearchResultSectionMapDefinitionData')" :visible="false" class="mb-2" no-body ref="collapseMapDefinitionData"  v-if="isSearchType('mapdefinitions')">
        <template v-slot:default="slotProps">
          <MapDefinitionTable :getData="getMapDefinitionData" :getIds="getMapDefinitionIds" :downloadTable="downloadMapDefinitionData" :filterOn="getFilter('TABLE_COLUMNS_MAP_DEFINITION_SEARCHABLE')" ref="tableMapDefinitionData" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <!-- Datasets -->
      <Collapse icon="mdi-database" :title="$t('pageSearchResultSectionDatasets')" :visible="false" class="mb-2" no-body ref="collapseDatasets"  v-if="isSearchType('datasets')">
        <template v-slot:default="slotProps">
          <DatasetTable :getData="getDatasetData" :downloadTable="downloadDatasets" :filterOn="getFilter('TABLE_COLUMNS_DATASET_SEARCHABLE')" ref="tableDatasets" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <!-- Dataset attributes -->
      <Collapse icon="mdi-playlist-plus" :title="$t('pageSearchResultSectionDatasetAttributes')" :visible="false" class="mb-2" no-body ref="collapseDatasetAttributes"  v-if="isSearchType('datasetAttributes')">
        <template v-slot:default="slotProps">
          <DatasetAttributeTable :getData="getDatasetAttributeData" :downloadTable="downloadDatasetAttributes" :filterOn="getFilter('TABLE_COLUMNS_DATASET_ATTRIBUTE_SEARCHABLE')" ref="tableDatasetAttributes" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <!-- Pedigree data -->
      <Collapse icon="mdi-sitemap" :title="$t('pageSearchResultSectionPedigreeData')" :visible="false" class="mb-2" no-body ref="collapsePedigree" v-if="isSearchType('pedigrees')">
        <template v-slot:default="slotProps">
          <PedigreeTable :getData="getPedigreeData" :downloadTable="downloadPedigrees" :filterOn="getFilter('TABLE_COLUMNS_PEDIGREE_SEARCHABLE')" ref="tablePedigree" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <!-- Location data -->
      <Collapse icon="mdi-map" :title="$t('pageSearchResultSectionLocationData')" :visible="false" class="mb-2" no-body ref="collapseLocationData" v-if="isSearchType('locations')">
        <template v-slot:default="slotProps">
          <LocationTable :getData="getLocationData" :getIds="getLocationIds" :downloadTable="downloadLocations" :filterOn="getFilter('TABLE_COLUMNS_LOCATION_SEARCHABLE')" ref="tableLocations" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <template v-if="showAdditionalDatasets">
        <DatasetsWithUnacceptedLicense v-on:license-accepted="search" v-on:data-changed="checkNumbers"/>
      </template>
    </template>
  </div>
</template>

<script>
import Collapse from '@/components/util/Collapse'
import CompoundDataTable from '@/components/tables/CompoundDataTable'
import DatasetTable from '@/components/tables/DatasetTable'
import DatasetAttributeTable from '@/components/tables/DatasetAttributeTable'
import GermplasmTable from '@/components/tables/GermplasmTable'
import GermplasmAttributeTable from '@/components/tables/GermplasmAttributeTable'
import LocationTable from '@/components/tables/LocationTable'
import MapDefinitionTable from '@/components/tables/MapDefinitionTable'
import PedigreeTable from '@/components/tables/PedigreeTable'
import TrialsDataTable from '@/components/tables/TrialsDataTable'
import DatasetsWithUnacceptedLicense from '@/components/util/DatasetsWithUnacceptedLicense'

import ColumnsMixin from '@/const/database-columns.js'
import compoundApi from '@/mixins/api/compound.js'
import datasetApi from '@/mixins/api/dataset.js'
import germplasmApi from '@/mixins/api/germplasm.js'
import genotypeApi from '@/mixins/api/genotype.js'
import locationApi from '@/mixins/api/location.js'
import miscApi from '@/mixins/api/misc.js'
import traitApi from '@/mixins/api/trait.js'

export default {
  data: function () {
    return {
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
      searchType: 'all',
      searchTypes: [
        { value: 'all', text: this.$t('pageSearchResultSectionAll') },
        { value: 'germplasm', text: this.$t('pageSearchResultSectionGermplasm') },
        { value: 'germplasmAttributes', text: this.$t('pageSearchResultSectionGermplasmAttributes') },
        { value: 'trials', text: this.$t('pageSearchResultSectionTrialsData') },
        { value: 'compounds', text: this.$t('pageSearchResultSectionCompoundData') },
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
    CompoundDataTable,
    DatasetTable,
    DatasetAttributeTable,
    DatasetsWithUnacceptedLicense,
    GermplasmTable,
    GermplasmAttributeTable,
    LocationTable,
    MapDefinitionTable,
    PedigreeTable,
    TrialsDataTable
  },
  mixins: [ compoundApi, datasetApi, germplasmApi, genotypeApi, locationApi, miscApi, traitApi ],
  methods: {
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
      return this.apiPostTrialsDataTable(data, callback)
    },
    getTrialsDataIds: function (data, callback) {
      return this.apiPostTrialsDataTableIds(data, callback)
    },
    downloadTrialsData: function (data, callback) {
      return this.apiPostTableExport(data, 'dataset/data/trial', callback)
    },
    // COMPOUNDS
    getCompoundData: function (data, callback) {
      return this.apiPostCompoundDataTable(data, callback)
    },
    getCompoundDataIds: function (data, callback) {
      return this.apiPostCompoundDataTableIds(data, callback)
    },
    downloadCompoundData: function (data, callback) {
      return this.apiPostTableExport(data, 'dataset/data/compound', callback)
    },
    // GERMPLASM
    getGermplasmData: function (data, callback) {
      return this.apiPostGermplasmTable(data, callback)
    },
    getGermplasmIds: function (data, callback) {
      return this.apiPostGermplasmTableIds(data, callback)
    },
    downloadGermplasm: function (data, callback) {
      return this.apiPostTableExport(data, 'germplasm', callback)
    },
    // MAPDEFINITIONS
    getMapDefinitionData: function (data, callback) {
      return this.apiPostMapdefinitionTable(data, callback)
    },
    getMapDefinitionIds: function (data, callback) {
      return this.apiPostMapdefinitionTableIds(data, callback)
    },
    downloadMapDefinitionData: function (data, callback) {
      return this.apiPostTableExport(data, 'map/mapdefinition', callback)
    },
    // LOCATIONS
    getLocationData: function (data, callback) {
      return this.apiPostLocationTable(data, callback)
    },
    getLocationIds: function (data, callback) {
      return this.apiPostLocationTableIds(data, callback)
    },
    downloadLocations: function (data, callback) {
      return this.apiPostTableExport(data, 'location', callback)
    },
    // GERMPLASM ATTRIBUTES
    getGermplasmAttributeData: function (data, callback) {
      return this.apiPostGermplasmAttributeTable(null, data, callback)
    },
    downloadGermplasmAttributes: function (data, callback) {
      return this.apiPostGermplasmAttributeTableExport(null, data, callback)
    },
    // PEDIGREES
    getPedigreeData: function (data, callback) {
      return this.apiPostPedigreeTable(data, callback)
    },
    downloadPedigrees: function (data, callback) {
      return this.apiPostTableExport(data, 'pedigree', callback)
    },
    // DATASET ATTRIBUTES
    getDatasetAttributeData: function (data, callback) {
      return this.apiPostDatasetAttributeTable(null, data, callback)
    },
    downloadDatasetAttributes: function (data, callback) {
      return this.apiPostDatasetAttributeExport(data, callback)
    },
    // DATASETS
    getDatasetData: function (data, callback) {
      return this.apiPostDatasetTable(data, callback)
    },
    downloadDatasets: function (data, callback) {
      return this.apiPostTableExport(data, 'dataset', callback)
    },
    // SEARCH
    search: function () {
      this.searchTerm = this.tempSearchTerm

      this.$nextTick(() => {
        // Trigger result section to show up
        this.showResults = true
        // Refresh all tables
        Object.keys(this.$refs)
          .filter(r => r.startsWith('table'))
          .forEach(t => this.$refs[t].refresh())
        // Set loading status for all collapse elements
        Object.keys(this.$refs)
          .filter(r => r.startsWith('collapse'))
          .forEach(t => this.$refs[t].setLoading(true))
        // Change window URL to reflect new search term
        window.history.replaceState({}, null, this.$router.resolve({ name: 'search-query', params: { searchTerm: this.searchTerm } }).href)
      })
    }
  },
  mounted: function () {
    this.searchTerm = this.$route.params.searchTerm
    this.tempSearchTerm = this.searchTerm
  }
}
</script>

<style>

</style>
