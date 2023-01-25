<template>
  <div>
    <Collapse :icon="mdiFilter" :title="$t('widgetGermplasmTableFilterToggle')" :visible="false" :showLoading="false" class="mb-2" @toggle="collapseVisible = !collapseVisible">
      <template v-slot:content>
        <b-row>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3>
            <b-form-group :label="$t('formLabelGermplasmTableFilterIdentifier')" label-for="identifier">
              <b-input-group>
                <b-form-input id="identifier" @keyup.enter="searchByIdentifier" v-model="identifierSearch" />
                <b-input-group-append>
                  <b-button @click="searchByIdentifier"><MdiIcon :path="mdiMagnify" /></b-button>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
          </b-col>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3>
            <b-form-group :label="$t('tableColumnEntityType')" label-for="entity-types">
              <!-- These buttons are for switching between different entity types. They make switching very convenient. -->
              <b-button-group class="flex-wrap" id="entity-types">
                <b-button class="mb-2" @click="onEntityTypeSelected(null)" variant="outline-primary">
                  <MdiIcon :path="mdiCheckAll" /><span> {{$t('buttonAll')}}</span> <b-badge>{{ allGermplasmCount }}</b-badge>
                </b-button>
                <b-button class="mb-2" v-for="entityType in entityTypeOptions"
                        :key="entityType.id"
                        :disabled="entityType.disabled"
                        :variant="entityType.disabled ? 'outline-secondary' : 'outline-primary'"
                        @click="onEntityTypeSelected(entityType)">
                  <MdiIcon :path="entityType.path" /><span> {{ entityType.text() }} <b-badge>{{ getNumberWithSuffix(entityType.count, 2) }}</b-badge></span>
                </b-button>
              </b-button-group>
            </b-form-group>
          </b-col>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3 v-if="locationOptions && locationOptions.length > 2">
            <b-form-group :label="$t('widgetGermplasmTableFilterHasData')" label-for="has-data">
              <b-button-group class="mr-2">
                <b-button class="mb-2 text-dark" variant="outline-secondary" @click="onHasImagesClicked" v-b-tooltip="$t('widgetGermplasmTableFilterHasImages')"><MdiIcon :path="mdiCamera" /></b-button>
              </b-button-group>
              <b-button-group class="flex-wrap" id="has-data">
                <b-button class="mb-2" variant="outline-secondary" @click="onHasTraitDataClicked" v-b-tooltip="datasetTypes.trials.text()" :style="`color: ${datasetTypes.trials.color()};`"><MdiIcon :path="datasetTypes.trials.path" /></b-button>
                <b-button class="mb-2" variant="outline-secondary" @click="onHasGenotypicDataClicked" v-b-tooltip="datasetTypes.genotype.text()" :style="`color: ${datasetTypes.genotype.color()};`"><MdiIcon :path="datasetTypes.genotype.path" /></b-button>
                <b-button class="mb-2" variant="outline-secondary" @click="onHasPedigreeDataClicked" v-b-tooltip="datasetTypes.pedigree.text()" :style="`color: ${datasetTypes.pedigree.color()};`"><MdiIcon :path="datasetTypes.pedigree.path" /></b-button>
                <b-button class="mb-2" variant="outline-secondary" @click="onHasAllelefreqDataClicked" v-b-tooltip="datasetTypes.allelefreq.text()" :style="`color: ${datasetTypes.allelefreq.color()};`"><MdiIcon :path="datasetTypes.allelefreq.path" /></b-button>
              </b-button-group>
            </b-form-group>
          </b-col>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3 v-if="genusOptions && genusOptions.length > 2">
            <b-form-group :label="$t('tableColumnGenus')" label-for="genus">
              <b-form-select id="genus" :options="genusOptions" v-model="selectedGenus" />
            </b-form-group>
          </b-col>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3 v-if="speciesOptions && speciesOptions.length > 2">
            <b-form-group :label="$t('tableColumnSpecies')" label-for="species">
              <b-form-select id="species" :options="speciesOptions" v-model="selectedSpecies" />
            </b-form-group>
          </b-col>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3 v-if="subtaxaOptions && subtaxaOptions.length > 2">
            <b-form-group :label="$t('tableColumnSubtaxa')" label-for="subtaxa">
              <b-form-select id="subtaxa" :options="subtaxaOptions" v-model="selectedSubtaxa" />
            </b-form-group>
          </b-col>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3 v-if="locationOptions && locationOptions.length > 2">
            <b-form-group :label="$t('tableColumnCountryName')" label-for="country">
              <b-form-select id="country" :options="locationOptions" v-model="selectedLocation" />
            </b-form-group>
          </b-col>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3 v-if="biologicalStatusOptions && biologicalStatusOptions.length > 2">
            <b-form-group :label="$t('tableColumnBiologicalStatus')" label-for="biological-status">
              <b-form-select id="biological-status" :options="biologicalStatusOptions" v-model="selectedBiologicalStatus" />
            </b-form-group>
          </b-col>
        </b-row>
      </template>
    </Collapse>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import Collapse from '@/components/util/Collapse'

import { apiGetTaxonomyData, apiGetLocationData, apiGetBiologicalStatusData } from '@/mixins/api/germplasm.js'
import { entityTypes, datasetTypes } from '@/mixins/types.js'
import { getNumberWithSuffix } from '@/mixins/formatting'

import { mdiFilter, mdiCamera, mdiCheckAll, mdiMagnify } from '@mdi/js'

export default {
  components: {
    Collapse,
    MdiIcon
  },
  data: function () {
    return {
      datasetTypes,
      mdiFilter,
      mdiCamera,
      mdiCheckAll,
      mdiMagnify,
      collapseVisible: false,
      identifierSearch: null,
      selectedGenus: null,
      selectedSpecies: null,
      selectedSubtaxa: null,
      selectedLocation: null,
      selectedBiologicalStatus: null,
      biologicalStatus: null,
      locations: null,
      entities: {
        total: 0,
        accession: 0,
        plantplot: 0,
        sample: 0
      },
      taxonomy: {
        genus: null,
        species: null,
        subtaxa: null
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeEntityTypeStats'
    ]),
    allGermplasmCount: function () {
      return getNumberWithSuffix(this.entityTypeOptions.map(o => o.count).reduce((a, b) => a + b), 2)
    },
    genusOptions: function () {
      if (this.taxonomy.genus) {
        return [{
          value: null,
          text: `${this.$t('tableColumnGenus')} (${this.taxonomy.genus.length})`
        }].concat(this.taxonomy.genus.map(g => {
          return {
            value: g.taxonomy,
            text: `${g.taxonomy} (${getNumberWithSuffix(g.count, 2)})`
          }
        }))
      } else {
        return null
      }
    },
    speciesOptions: function () {
      if (this.taxonomy.species) {
        return [{
          value: null,
          text: `${this.$t('tableColumnSpecies')} (${this.taxonomy.species.length})`
        }].concat(this.taxonomy.species.map(g => {
          return {
            value: g.taxonomy,
            text: `${g.taxonomy} (${getNumberWithSuffix(g.count, 2)})`
          }
        }))
      } else {
        return null
      }
    },
    subtaxaOptions: function () {
      if (this.taxonomy.subtaxa) {
        return [{
          value: null,
          text: `${this.$t('tableColumnSubtaxa')} (${this.taxonomy.subtaxa.length})`
        }].concat(this.taxonomy.subtaxa.map(g => {
          return {
            value: g.taxonomy,
            text: `${g.taxonomy} (${getNumberWithSuffix(g.count, 2)})`
          }
        }))
      } else {
        return null
      }
    },
    locationOptions: function () {
      if (this.locations) {
        return [{
          value: null,
          text: this.$t('tableColumnCountryName')
        }].concat(this.locations.filter(g => g.count > 0).map(g => {
          return {
            value: g.key,
            text: `${g.key} (${getNumberWithSuffix(g.count, 2)})`
          }
        }))
      } else {
        return null
      }
    },
    biologicalStatusOptions: function () {
      if (this.biologicalStatus) {
        return [{
          value: null,
          text: this.$t('tableColumnBiologicalStatus')
        }].concat(this.biologicalStatus.filter(g => g.count > 0).map(g => {
          return {
            value: g.key,
            text: `${g.key} (${getNumberWithSuffix(g.count, 2)})`
          }
        }))
      } else {
        return null
      }
    },
    entityTypeOptions: function () {
      return Object.keys(entityTypes).map(e => {
        const stats = this.storeEntityTypeStats.filter(es => es.entityTypeName === e)
        const enabled = stats && stats.length > 0 && stats[0].count > 0
        const count = stats && stats.length > 0 ? stats[0].count : 0

        return {
          id: e,
          icon: entityTypes[e].icon,
          path: entityTypes[e].path,
          disabled: !enabled,
          count: count,
          text: () => entityTypes[e].text()
        }
      })
    }
  },
  watch: {
    collapseVisible: function (newValue) {
      if (newValue) {
        if (!this.taxonomy.genus && !this.taxonomy.species && !this.taxonomy.subtaxa) {
          apiGetTaxonomyData(result => { this.taxonomy = result })
        }
        if (!this.locations) {
          apiGetLocationData(result => { this.locations = result })
        }
        if (!this.biologicalStatus) {
          apiGetBiologicalStatusData(result => { this.biologicalStatus = result })
        }
      }
    },
    selectedGenus: function (newValue) {
      if (newValue) {
        this.$emit('filtering-changed', [{
          column: {
            name: 'genus',
            type: String
          },
          comparator: 'equals',
          operator: 'and',
          values: [newValue]
        }])
        this.$nextTick(() => { this.selectedGenus = null })
      }
    },
    selectedSpecies: function (newValue) {
      if (newValue) {
        this.$emit('filtering-changed', [{
          column: {
            name: 'species',
            type: String
          },
          comparator: 'equals',
          operator: 'and',
          values: [newValue]
        }])
        this.$nextTick(() => { this.selectedSpecies = null })
      }
    },
    selectedSubtaxa: function (newValue) {
      if (newValue) {
        this.$emit('filtering-changed', [{
          column: {
            name: 'subtaxa',
            type: String
          },
          comparator: 'equals',
          operator: 'and',
          values: [newValue]
        }])
        this.$nextTick(() => { this.selectedSubtaxa = null })
      }
    },
    selectedLocation: function (newValue) {
      if (newValue) {
        this.$emit('filtering-changed', [{
          column: {
            name: 'countryName',
            type: String
          },
          comparator: 'equals',
          operator: 'and',
          values: [newValue]
        }])
        this.$nextTick(() => { this.selectedLocation = null })
      }
    },
    selectedBiologicalStatus: function (newValue) {
      if (newValue) {
        this.$emit('filtering-changed', [{
          column: {
            name: 'biologicalStatusName',
            type: String
          },
          comparator: 'equals',
          operator: 'and',
          values: [newValue]
        }])
        this.$nextTick(() => { this.selectedBiologicalStatus = null })
      }
    }
  },
  methods: {
    getNumberWithSuffix,
    searchByIdentifier: function () {
      this.$emit('filtering-changed', [{
        column: {
          name: 'germplasmName',
          type: String
        },
        comparator: 'contains',
        operator: 'or',
        values: [this.identifierSearch]
      }, {
        column: {
          name: 'germplasmNumber',
          type: String
        },
        comparator: 'contains',
        operator: 'or',
        values: [this.identifierSearch]
      }, {
        column: {
          name: 'germplasmGid',
          type: String
        },
        comparator: 'contains',
        operator: 'or',
        values: [this.identifierSearch]
      }, {
        column: {
          name: 'germplasmPuid',
          type: String
        },
        comparator: 'contains',
        operator: 'or',
        values: [this.identifierSearch]
      }, {
        column: {
          name: 'synonyms',
          type: 'json'
        },
        comparator: 'jsonSearch',
        operator: 'or',
        values: [this.identifierSearch]
      }])

      this.identifierSearch = null
    },
    onHasImagesClicked: function () {
      this.$emit('filtering-changed', [{
        column: {
          name: 'imageCount',
          type: Number
        },
        comparator: 'greaterThan',
        operator: 'and',
        values: [0]
      }])
    },
    onHasTraitDataClicked: function () {
      this.$emit('filtering-changed', [{
        column: {
          name: 'hasTrialsData',
          type: Boolean
        },
        comparator: 'equals',
        operator: 'and',
        values: [1]
      }])
    },
    onHasPedigreeDataClicked: function () {
      this.$emit('filtering-changed', [{
        column: {
          name: 'hasPedigreeData',
          type: Boolean
        },
        comparator: 'equals',
        operator: 'and',
        values: [1]
      }])
    },
    onHasGenotypicDataClicked: function () {
      this.$emit('filtering-changed', [{
        column: {
          name: 'hasGenotypicData',
          type: Boolean
        },
        comparator: 'equals',
        operator: 'and',
        values: [1]
      }])
    },
    onHasAllelefreqDataClicked: function () {
      this.$emit('filtering-changed', [{
        column: {
          name: 'hasAllelefreqData',
          type: Boolean
        },
        comparator: 'equals',
        operator: 'and',
        values: [1]
      }])
    },
    onEntityTypeSelected: function (type) {
      this.$emit('filtering-changed', [{
        column: {
          name: 'entityTypeName',
          type: 'entityType'
        },
        comparator: 'equals',
        operator: 'and',
        values: [type ? type.id : null]
      }])
    }
  }
}
</script>

<style>

</style>
