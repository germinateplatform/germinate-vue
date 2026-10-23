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
          <!-- Has data of type and Conservation share one column of the grid, side by side -->
          <b-col cols=12 sm=6 md=6 lg=4 xl=3 v-if="locationOptions && locationOptions.length > 2">
            <div class="filter-pair">
              <!-- One group of toggles, in sync with the table: pressed while the table has that filter, a click on a pressed one removes it -->
              <b-form-group :label="$t('widgetGermplasmTableFilterHasData')" label-for="has-data">
                <b-button-group class="flex-wrap" id="has-data">
                  <b-button v-for="button in hasDataButtons"
                            :key="button.column"
                            class="mb-2 has-data-button"
                            variant="outline-secondary"
                            :pressed="isColumnFiltered(button.column)"
                            :style="isColumnFiltered(button.column) ? `background-color: ${button.color}; border-color: ${button.color}; color: ${getHighContrastTextColor(button.color)};` : `color: ${button.color};`"
                            @click="toggleHasData(button, $event)"
                            v-b-tooltip="button.title">
                    <MdiIcon :path="button.icon" />
                  </b-button>
                </b-button-group>
              </b-form-group>
              <!-- Conservation: ex-situ or in-situ (the IN-SITU attribute is 1), never both; none pressed is no filter -->
              <b-form-group label="Conservation" label-for="conservation">
                <b-button-group id="conservation" class="mb-2 conservation-buttons">
                  <b-button v-for="option in conservationOptions"
                            :key="option.value"
                            variant="outline-secondary"
                            :pressed="activeConservation === option.value"
                            :class="{ selected: activeConservation === option.value }"
                            @click="toggleConservation(option.value, $event)">
                    {{ option.text }}
                  </b-button>
                </b-button-group>
              </b-form-group>
            </div>
          </b-col>
          <!-- Clearing the genus also clears species and subtaxa, which follow it -->
          <!-- Searchable lists, always shown: "<values> <count>" while empty, each value with its number of germplasm. Choosing one filters the table. -->
          <b-col cols=12 sm=6 md=6 lg=4 xl=3>
            <b-form-group :label="$t('tableColumnGenus')" label-for="typeahead-input-genus">
              <GermplasmFilterSelect id="genus" :loading="isFacetLoading('genus')" :options="genusOptions || []" :value="getActiveValue('genus')" placeholder="Genera" italicNames @select="selectedGenus = $event" @clear="$emit('filtering-removed', ['genus', 'species', 'subtaxa'])" />
            </b-form-group>
          </b-col>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3>
            <b-form-group :label="$t('tableColumnSpecies')" label-for="typeahead-input-species">
              <GermplasmFilterSelect id="species" :loading="isFacetLoading('species')" :options="speciesOptions || []" :value="getActiveValue('species')" placeholder="Species" italicNames @select="selectedSpecies = $event" @clear="$emit('filtering-removed', 'species')" />
            </b-form-group>
          </b-col>
          <b-col cols=12 sm=6 md=6 lg=4 xl=3>
            <b-form-group :label="$t('tableColumnSubtaxa')" label-for="typeahead-input-subtaxa">
              <GermplasmFilterSelect id="subtaxa" :loading="isFacetLoading('subtaxa')" :options="subtaxaOptions || []" :value="getActiveValue('subtaxa')" placeholder="Subtaxa" italicNames @select="selectedSubtaxa = $event" @clear="$emit('filtering-removed', 'subtaxa')" />
            </b-form-group>
          </b-col>
          <!-- Countries with their flag, like the countries of the passport editing -->
          <b-col cols=12 sm=6 md=6 lg=4 xl=3>
            <b-form-group :label="$t('tableColumnCountryName')" label-for="typeahead-input-country">
              <GermplasmFilterSelect id="country" :loading="isFacetLoading('countryName')" :options="countryOptions || []" :value="getActiveValue('countryName')" placeholder="Countries" @select="selectedLocation = $event" @clear="$emit('filtering-removed', 'countryName')" />
            </b-form-group>
          </b-col>
          <!-- Biological statuses with their SAMPSTAT code, like in the passport editing -->
          <b-col cols=12 sm=6 md=6 lg=4 xl=3>
            <b-form-group :label="$t('tableColumnBiologicalStatus')" label-for="typeahead-input-biological-status">
              <GermplasmFilterSelect id="biological-status" :loading="isFacetLoading('biologicalStatusName')" :options="biologicalStatusOptions || []" :value="getActiveValue('biologicalStatusName')" placeholder="Biological statuses" @select="selectedBiologicalStatus = $event" @clear="$emit('filtering-removed', 'biologicalStatusName')" />
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

import GermplasmFilterSelect from '@/components/tables/GermplasmFilterSelect'
import { MCPD_SAMPSTAT } from '@/mixins/mcpd'
import { CODE_DOMAINS } from '@/mixins/mcpd-update'

import { apiGetTaxonomyData, apiGetLocationData, apiGetBiologicalStatusData, apiPostGermplasmTable } from '@/mixins/api/germplasm.js'
import { CONSERVATION_COLUMN, isConservationFilter, toConservationOption } from '@/mixins/conservation'
import { apiGetCountries } from '@/mixins/api/location.js'
import { entityTypes, datasetTypes } from '@/mixins/types'
import { getNumberWithSuffix } from '@/mixins/formatting'
import { getHighContrastTextColor } from '@/mixins/colors'

import { mdiFilter, mdiCamera, mdiMagnify } from '@mdi/js'

// { key or taxonomy, count } of the statistics endpoints -> { value, name, count }, only values with germplasm and a name,
// in alphabetical order
const toFilterOptions = (items, nameKey) => (items || [])
  .filter(item => item.count > 0 && item[nameKey] !== null && item[nameKey] !== undefined && `${item[nameKey]}`.trim() !== '')
  .map(item => ({ value: item[nameKey], name: `${item[nameKey]}`, count: item.count }))
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))

// SAMPSTAT code of a biological status name of the database. Compared up to the first bracket, without case, as some
// database names differ from MCPD in their details (e.g. "Cytogenic stocks" for 422).
const SAMPSTAT_NAME_ALIASES = { 'cytogenic stocks': 422 }
const getSampstatCode = name => {
  const short = value => `${value}`.split(' (')[0].trim().toLowerCase()
  const wanted = short(name)
  const code = Object.keys(MCPD_SAMPSTAT).find(c => short(MCPD_SAMPSTAT[c]) === wanted)
  if (code !== undefined) {
    return parseInt(code)
  }
  return SAMPSTAT_NAME_ALIASES[wanted] !== undefined ? SAMPSTAT_NAME_ALIASES[wanted] : null
}

// Columns of the searchable lists, counted on the table
const FACET_COLUMNS = ['genus', 'species', 'subtaxa', 'countryName', 'biologicalStatusName']
// Lists whose values follow the genus filter
const GENUS_DEPENDENT_COLUMNS = ['species', 'subtaxa']
// Count requests sent at the same time
const FACET_REQUESTS = 6

export default {
  components: {
    Collapse,
    GermplasmFilterSelect,
    MdiIcon
  },
  props: {
    // Filters the table currently uses: the searchable lists show their value
    activeFilters: {
      type: Array,
      default: () => []
    }
  },
  data: function () {
    return {
      datasetTypes,
      mdiFilter,
      mdiCamera,
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
      // Country list of the database, for the flags of the country filter
      countries: null,
      // Number of germplasm of the table for each value of each list, with the filters it uses now. Keyed by column.
      facetCounts: {},
      // Lists being counted, keyed by column
      facetLoading: {},
      conservationOptions: [{ value: 'Ex-situ', text: 'Ex-situ' }, { value: 'In-situ', text: 'In-situ' }],
      // Latest count run (older ones are dropped) and the delay before counting
      facetRun: 0,
      facetTimer: null,
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
    // Options of the searchable lists (see GermplasmFilterSelect): the values the table has germplasm for, with the
    // filters it uses now (see updateFacetCounts). So with a genus filter, species and subtaxa follow it.
    genusOptions: function () {
      return this.getFacetOptions('genus')
    },
    speciesOptions: function () {
      return this.getFacetOptions('species')
    },
    subtaxaOptions: function () {
      return this.getFacetOptions('subtaxa')
    },
    // "Has data of type" toggles: images first, then the data types, each with the column of its filter
    hasDataButtons: function () {
      return [
        { column: 'imageCount', icon: mdiCamera, title: this.$t('widgetGermplasmTableFilterHasImages'), color: '#495057', add: this.onHasImagesClicked },
        { column: 'hasTrialsData', icon: datasetTypes.trials.path, title: datasetTypes.trials.text(), color: datasetTypes.trials.color() || '#495057', add: this.onHasTraitDataClicked },
        { column: 'hasGenotypicData', icon: datasetTypes.genotype.path, title: datasetTypes.genotype.text(), color: datasetTypes.genotype.color() || '#495057', add: this.onHasGenotypicDataClicked },
        { column: 'hasPedigreeData', icon: datasetTypes.pedigree.path, title: datasetTypes.pedigree.text(), color: datasetTypes.pedigree.color() || '#495057', add: this.onHasPedigreeDataClicked },
        { column: 'hasAllelefreqData', icon: datasetTypes.allelefreq.path, title: datasetTypes.allelefreq.text(), color: datasetTypes.allelefreq.color() || '#495057', add: this.onHasAllelefreqDataClicked }
      ]
    },
    // Conservation option the table is filtered by ("In-situ" or "Ex-situ"), also when it comes with the URL
    activeConservation: function () {
      const filter = (this.activeFilters || []).find(f => isConservationFilter(f))
      return filter ? toConservationOption(filter.values ? filter.values[0] : null) : null
    },
    // Genus the table is filtered by, null when it isn't
    activeGenus: function () {
      return this.getActiveValue('genus')
    },
    // Countries, with their flag (from the 2-letter code of the country list)
    countryOptions: function () {
      const options = this.getFacetOptions('countryName')
      if (!options) {
        return null
      }
      return options.map(option => {
        const country = (this.countries || []).find(c => c.countryName === option.name)
        return { ...option, flag: country && country.countryCode2 ? country.countryCode2.toLowerCase() : null }
      })
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
    // Shown with the names of the passport editing ("Inbred line"); the table is still filtered by the database name
    biologicalStatusOptions: function () {
      const options = this.getFacetOptions('biologicalStatusName')
      if (!options) {
        return null
      }
      return options
        .map(option => {
          const code = getSampstatCode(option.value)
          const item = code !== null ? CODE_DOMAINS.sampstat.find(i => i.code === code) : null
          return { ...option, name: item ? item.name : option.name }
        })
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
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
        if (!this.countries) {
          apiGetCountries(result => { this.countries = result || [] })
        }
        if (!this.biologicalStatus) {
          apiGetBiologicalStatusData(result => { this.biologicalStatus = result })
        }
        this.scheduleFacetCounts()
      }
    },
    // Species and subtaxa are counted again when the genus filter changes; all lists once the possible values are known
    activeGenus: function () {
      this.scheduleFacetCounts()
    },
    taxonomy: function () {
      this.scheduleFacetCounts()
    },
    locations: function () {
      this.scheduleFacetCounts()
    },
    biologicalStatus: function () {
      this.scheduleFacetCounts()
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
    getHighContrastTextColor,
    // The table has a filter on this column
    isColumnFiltered: function (column) {
      return (this.activeFilters || []).some(f => (f.column && typeof f.column === 'object' ? f.column.name : f.column) === column)
    },
    // Has data of type: adds the filter, or removes it when the table has it already. Unpressed, the button loses the
    // focus and its tooltip.
    toggleHasData: function (button, event) {
      if (this.isColumnFiltered(button.column)) {
        this.$emit('filtering-removed', button.column)
        if (event && event.currentTarget) {
          event.currentTarget.blur()
        }
        this.$root.$emit('bv::hide::tooltip')
      } else {
        button.add()
      }
    },
    // Text of the filter badge above the table for the filters of these common filters, null for the usual one
    getFilterLabel: function (filter) {
      if (isConservationFilter(filter)) {
        const option = toConservationOption(filter.values ? filter.values[0] : null)
        return `'Conservation' equals '${option || (filter.values ? filter.values[0] : '')}'`
      }
      return null
    },
    // Conservation: a click on the pressed option removes the filter, on the other one filters by it (replacing the
    // former). The filter stays short ("conservation equals In-situ", also in the URL); the requests to the server turn
    // it into germplasm ids (see conservation.js).
    toggleConservation: function (option, event) {
      if (this.activeConservation === option) {
        this.$emit('filtering-removed', CONSERVATION_COLUMN)
        if (event && event.currentTarget) {
          event.currentTarget.blur()
        }
        return
      }

      this.$emit('filtering-changed', [{
        column: {
          name: CONSERVATION_COLUMN,
          type: CONSERVATION_COLUMN
        },
        comparator: 'equals',
        operator: 'and',
        values: [option]
      }])
    },
    // Still counting a list, or not counted yet
    isFacetLoading: function (column) {
      return !!this.facetLoading[column] || !this.facetCounts[column]
    },
    // { value, name, count } of a list, values the table has germplasm for, in alphabetical order. Null until counted.
    getFacetOptions: function (column) {
      const counts = this.facetCounts[column]
      if (!counts) {
        return null
      }
      return Object.keys(counts)
        .filter(name => counts[name] > 0)
        .map(name => ({ value: name, name, count: counts[name] }))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    },
    // Values that may be in a list: those the statistics know of (their own counts don't match the table, e.g. they
    // count taxonomies no listed germplasm uses, so they are only used to know which values to count)
    getFacetCandidates: function (column) {
      const source = {
        genus: [this.taxonomy.genus, 'taxonomy'],
        species: [this.taxonomy.species, 'taxonomy'],
        subtaxa: [this.taxonomy.subtaxa, 'taxonomy'],
        countryName: [this.locations, 'key'],
        biologicalStatusName: [this.biologicalStatus, 'key']
      }[column]
      if (!source || !source[0]) {
        return null
      }
      return toFilterOptions(source[0], source[1]).map(option => option.name)
    },
    scheduleFacetCounts: function () {
      if (!this.collapseVisible) {
        return
      }
      clearTimeout(this.facetTimer)
      this.facetTimer = setTimeout(() => this.updateFacetCounts(), 300)
    },
    // Each list counts its values on the germplasm table itself (asking only for the count), so it only offers values
    // the table has germplasm for. Species and subtaxa are counted within the filtered genus, the others on all
    // germplasm. At most FACET_REQUESTS requests at a time.
    updateFacetCounts: function () {
      const run = ++this.facetRun
      const genus = this.activeGenus
      const genusFilter = genus !== null ? [{ column: 'genus', comparator: 'equals', operator: 'and', values: [genus] }] : []

      const tasks = []
      const results = {}
      // The genus only changes the species and subtaxa: the other lists are counted once
      FACET_COLUMNS.filter(column => GENUS_DEPENDENT_COLUMNS.includes(column) || !this.facetCounts[column]).forEach(column => {
        const candidates = this.getFacetCandidates(column)
        if (!candidates) {
          return
        }
        results[column] = {}
        this.facetLoading = { ...this.facetLoading, [column]: true }
        const others = GENUS_DEPENDENT_COLUMNS.includes(column) ? genusFilter : []
        candidates.forEach(name => {
          tasks.push(() => new Promise(resolve => {
            const query = {
              page: 1,
              limit: 1,
              filter: others.concat([{ column, comparator: 'equals', operator: 'and', values: [name] }])
            }
            apiPostGermplasmTable(query, result => {
              results[column][name] = result && result.count ? result.count : 0
              resolve()
            }, { codes: [], callback: () => { results[column][name] = 0; resolve() } })
          }))
        })
      })

      let next = 0
      const worker = () => {
        if (run !== this.facetRun || next >= tasks.length) {
          return Promise.resolve()
        }
        const task = tasks[next++]
        return task().then(worker)
      }
      Promise.all(Array.from({ length: Math.min(FACET_REQUESTS, tasks.length) }, worker)).then(() => {
        // Only the latest count is shown
        if (run === this.facetRun) {
          this.facetCounts = { ...this.facetCounts, ...results }
          const loading = { ...this.facetLoading }
          Object.keys(results).forEach(column => { loading[column] = false })
          this.facetLoading = loading
        }
      })
    },
    // Value of the "equals" filter the table uses on this column, null when it uses none
    getActiveValue: function (column) {
      const filter = (this.activeFilters || []).find(f => {
        const name = f.column && typeof f.column === 'object' ? f.column.name : f.column
        return name === column && f.comparator === 'equals'
      })
      return filter && filter.values && filter.values.length > 0 ? filter.values[0] : null
    },
    searchByIdentifier: function () {
      if (!this.identifierSearch || this.identifierSearch === '') {
        return
      }

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

<style scoped>
/* Has data of type and Conservation in two equal sub-columns of one column, each at the start of its own */
.filter-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 1rem;
  align-items: start;
}
/* Conservation: the chosen option filled in the green of the custom pages */
.conservation-buttons .btn {
  min-width: 4.5rem;
}
.conservation-buttons .btn.selected,
.conservation-buttons .btn.selected:hover {
  border-color: #3b6b35;
  background: #3b6b35;
  color: #ffffff;
  font-weight: 600;
  font-style: italic;
}
</style>
