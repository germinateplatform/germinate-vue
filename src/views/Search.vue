<template>
  <div>
    <h1>Search</h1>
    <b-form @submit.prevent="search">
      <b-row>
        <b-col xs=12 sm=6>
          <b-form-group
            label="Select the type of data to search for"
            label-for="search-type">
            <b-input-group>
              <b-form-select id="search-type" :options="searchTypes" v-model="searchType" />
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col xs=12 sm=6>
          <b-form-group
            label="Enter a search term"
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
              <b-form-input autofocus id="search-term" v-model="searchTerm" trim @focus="$event.target.select()" />
              <b-input-group-append>
                <b-button variant="primary" type="submit"><i class="mdi mdi-18px mdi-magnify" /></b-button>
              </b-input-group-append>

              <b-tooltip target="search-term" triggers="hover" v-if="comparator === 'like'">
                Use "%" as a wildcard character, e.g. "%KINGDOM%".
              </b-tooltip>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-row>
    </b-form>
    <template v-if="showResults">
      <Collapse title="Germplasm data" :visible="false" class="mb-3" no-body>
        <template v-slot:default="slotProps">
          <GermplasmTable :getData="getGermplasmData" :getIds="getGermplasmIds" :downloadTable="downloadGermplasm" :filterOn="getGermplasmFilter()" ref="germplasmTable" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <Collapse title="Germplasm attribute data" :visible="false" class="mb-3" no-body>
        <template v-slot:default="slotProps">
          <GermplasmAttributeTable :getData="getGermplasmAttributeData" :downloadTable="downloadGermplasmAttributes" :filterOn="getGermplasmAttributeFilter()" ref="germplasmAttributeTable" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <Collapse title="Datasets" :visible="false" class="mb-3" no-body>
        <template v-slot:default="slotProps">
          <DatasetTable :getData="getDatasetData" :downloadTable="downloadDatasets" :filterOn="getDatasetFilter()" ref="datasetTable" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>

      <Collapse title="Dataset attributes" :visible="false" class="mb-3" no-body>
        <template v-slot:default="slotProps">
          <DatasetAttributeTable :getData="getDatasetAttributeData" :downloadTable="downloadDatasetAttributes" :filterOn="getDatasetAttributeFilter()" ref="datasetAttributeTable" v-on:data-changed="slotProps.update"/>
        </template>
      </Collapse>
    </template>
  </div>
</template>

<script>
import Collapse from '@/components/util/Collapse'
import DatasetTable from '@/components/tables/DatasetTable'
import DatasetAttributeTable from '@/components/tables/DatasetAttributeTable'
import GermplasmTable from '@/components/tables/GermplasmTable'
import GermplasmAttributeTable from '@/components/tables/GermplasmAttributeTable'
import ColumnsMixin from '@/mixins/database-columns.js'

export default {
  data: function () {
    return {
      searchTerm: null,
      showResults: false,
      germplasmFilterColumns: ['germplasmId', 'germplasmName'],
      comparator: 'equals',
      comparators: {
        equals: {
          text: () => this.$t('comparatorsEqual')
        },
        like: {
          text: () => this.$t('comparatorsLike')
        },
        inSet: {
          text: () => this.$t('comparatorsInSet')
        }
      },
      searchType: 'all',
      searchTypes: [
        { value: 'all', text: 'All data' },
        { value: 'germplasm', text: 'Germplasm data' }
      ]
    }
  },
  components: {
    Collapse,
    DatasetTable,
    DatasetAttributeTable,
    GermplasmTable,
    GermplasmAttributeTable
  },
  methods: {
    getGermplasmData: function (data, callback) {
      return this.apiPostGermplasmTable(data, callback)
    },
    getGermplasmIds: function (data, callback) {
      return this.apiPostGermplasmTableIds(data, callback)
    },
    getGermplasmFilter: function () {
      return ColumnsMixin.TABLE_COLUMNS_GERMPLASM_SEARCHABLE.map(c => {
        return {
          column: c,
          comparator: this.comparator,
          operator: 'or',
          values: [this.searchTerm]
        }
      })
    },
    downloadGermplasm: function (data, callback) {
      return this.apiPostTableExport(data, 'germplasm', callback)
    },
    getGermplasmAttributeData: function (data, callback) {
      return this.apiPostGermplasmAttributeTable(null, data, callback)
    },
    getGermplasmAttributeFilter: function () {
      return ColumnsMixin.TABLE_COLUMNS_GERMPLASM_ATTRIBUTE_SEARCHABLE.map(c => {
        return {
          column: c,
          comparator: this.comparator,
          operator: 'or',
          values: [this.searchTerm]
        }
      })
    },
    downloadGermplasmAttributes: function (data, callback) {
      return this.apiPostGermplasmAttributeTableExport(null, data, callback)
    },
    getDatasetAttributeData: function (data, callback) {
      return this.apiPostDatasetAttributeTable(null, data, callback)
    },
    getDatasetAttributeFilter: function () {
      return ColumnsMixin.TABLE_COLUMNS_DATASET_ATTRIBUTE_SEARCHABLE.map(c => {
        return {
          column: c,
          comparator: this.comparator,
          operator: 'or',
          values: [this.searchTerm]
        }
      })
    },
    downloadDatasetAttributes: function (data, callback) {
      return this.apiPostDatasetAttributeTableExport(null, data, callback)
    },
    getDatasetData: function (data, callback) {
      return this.apiPostDatasetTable(data, callback)
    },
    getDatasetFilter: function () {
      return ColumnsMixin.TABLE_COLUMNS_DATASET_SEARCHABLE.map(c => {
        return {
          column: c,
          comparator: this.comparator,
          operator: 'or',
          values: [this.searchTerm]
        }
      })
    },
    downloadDatasets: function (data, callback) {
      return this.apiPostTableExport(data, 'dataset', callback)
    },
    search: function () {
      console.log(this.searchTerm)
      this.showResults = true
      Object.keys(this.$refs).forEach(t => this.$refs[t].refresh())
      window.history.replaceState({}, null, `#/search/${this.searchTerm}`)
    }
  },
  mounted: function () {
    this.searchTerm = this.$route.params.searchTerm
  }
}
</script>

<style>

</style>
