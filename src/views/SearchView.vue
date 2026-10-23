<template>
  <div class="custom-page search-page">
    <!-- The search, centred: the same module as on the home page (SearchModule), its results shown here -->
    <div class="search-page-top">
      <h1 class="search-page-title">Search</h1>
      <SearchModule inline
                    :initialTerm="initialTerm"
                    :initialScope="initialScope"
                    :initialState="initialState"
                    :key="'search-module-' + ($route.params.searchTerm || '')"
                    :noResults="!!search && countsLoaded && visibleTabs.length === 0"
                    @search="onSearch" />
    </div>

    <!-- Results: only once a search was run. All the width of the page, a tab per table. -->
    <div class="search-page-results" v-if="search">
      <!-- Nothing found (counted first): the illustration and the message, centred -->
      <div class="search-page-empty" v-if="countsLoaded && visibleTabs.length === 0">
        <NoResultsIcon :width="200" className="search-page-empty-icon" />
        <h2 class="search-page-empty-title">No data found</h2>
        <!-- What was searched -->
        <SearchCrumbs class="search-page-empty-crumbs" :crumbs="search.crumbs" />
        <p class="search-page-empty-text">Your search keywords returned no results.</p>
      </div>
      <b-tabs v-else class="search-page-tabs" nav-class="search-page-tabs-nav" content-class="search-page-tabs-content" :key="'search-tabs-' + search.id">
        <b-tab v-for="tab in visibleTabs" :key="'search-tab-' + search.id + '-' + tab.key" lazy>
          <template #title>
            <!-- Long names are cut (the whole name on hover) -->
            <span class="search-page-tab-title" :title="tab.title">{{ tab.title }}</span>
            <!-- How many were found: only when searching everything -->
            <span class="search-page-count" v-if="search.all" :title="(search.counts[tab.key] || 0).toLocaleString()">{{ getCountText(search.counts[tab.key]) }}</span>
          </template>

          <!-- What was searched: the filter icon, then the scope, the field and the values (a chevron when it doesn't fit) -->
          <SearchCrumbs :crumbs="search.crumbs" />

          <!-- AJAX: the tables keep their state to themselves (not in the URL, which would start the search again) -->
          <component :is="tab.component" :getData="tab.getData" :getIds="tab.getIds" :storeUrlParameters="false" v-bind="tab.extra" />
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import NoResultsIcon from '@/components/icons/NoResultsIcon'
import SearchModule from '@/components/search/SearchModule'
import SearchCrumbs from '@/components/search/SearchCrumbs'
import GermplasmTable from '@/components/tables/GermplasmTable'
import DatasetTable from '@/components/tables/DatasetTable'
import TraitTable from '@/components/tables/TraitTable'
import ClimateTable from '@/components/tables/ClimateTable'
import LocationTable from '@/components/tables/LocationTable'
import MapTable from '@/components/tables/MapTable'
import GermplasmAttributeTable from '@/components/tables/GermplasmAttributeTable'
import TrialsDataTable from '@/components/tables/TrialsDataTable'
import MapDefinitionTable from '@/components/tables/MapDefinitionTable'
import DatasetAttributeTable from '@/components/tables/DatasetAttributeTable'
import PedigreeResults from '@/components/search/PedigreeResults'
import ColumnsMixin from '@/const/database-columns.js'
import { apiPostGermplasmTable, apiPostGermplasmTableIds, apiPostGermplasmPolygonTable, apiPostGermplasmPolygonTableIds, apiPostGermplasmAttributeTable, apiPostPedigreeTable } from '@/mixins/api/germplasm'
import { apiPostDatasetTable, apiPostDatasetAttributeTable } from '@/mixins/api/dataset'
import { apiPostTraitTable, apiPostTraitTableIds, apiPostTrialsDataTable, apiPostTrialsDataTableIds } from '@/mixins/api/trait'
import { apiPostClimateTable } from '@/mixins/api/climate'
import { apiPostLocationTable, apiPostLocationTableIds, apiPostLocationPolygonTable, apiPostLocationPolygonTableIds } from '@/mixins/api/location'
import { apiPostMapsTable, apiPostMapdefinitionTable, apiPostMapdefinitionTableIds } from '@/mixins/api/genotype'
import { mdiDatabaseRemoveOutline } from '@mdi/js'
import { getNumberWithSuffix } from '@/mixins/formatting'

// The tables of the results, keyed by the table name of the search scopes (see home-typeahead-search.js), in the order
// of their tabs. Searching everything ("all"), the text is looked for in their searchable columns: those of the legacy
// search page for its tables ("searchable", database-columns.js), "allColumns" for the others. "allOnly": only a table
// of the search of everything (no scope of the search module).
const TABLES = [
  { key: 'germplasm', title: 'Germplasm', component: GermplasmTable, api: apiPostGermplasmTable, idsApi: apiPostGermplasmTableIds, polygonApi: apiPostGermplasmPolygonTable, polygonIdsApi: apiPostGermplasmPolygonTableIds, searchable: 'TABLE_COLUMNS_GERMPLASM_SEARCHABLE' },
  { key: 'germplasmAttributes', title: 'Germplasm attributes', component: GermplasmAttributeTable, api: apiPostGermplasmAttributeTable, searchable: 'TABLE_COLUMNS_GERMPLASM_ATTRIBUTE_SEARCHABLE', allOnly: true },
  { key: 'trialsData', title: 'Trials data', component: TrialsDataTable, api: apiPostTrialsDataTable, idsApi: apiPostTrialsDataTableIds, searchable: 'TABLE_COLUMNS_TRIALS_DATA_SEARCHABLE', allOnly: true },
  { key: 'mapDefinitions', title: 'Map definitions', component: MapDefinitionTable, api: apiPostMapdefinitionTable, idsApi: apiPostMapdefinitionTableIds, searchable: 'TABLE_COLUMNS_MAP_DEFINITION_SEARCHABLE', allOnly: true },
  { key: 'datasets', title: 'Datasets', component: DatasetTable, api: apiPostDatasetTable, searchable: 'TABLE_COLUMNS_DATASET_SEARCHABLE' },
  { key: 'datasetAttributes', title: 'Dataset attributes', component: DatasetAttributeTable, api: (data, onSuccess, onError) => apiPostDatasetAttributeTable(null, data, onSuccess, onError), searchable: 'TABLE_COLUMNS_DATASET_ATTRIBUTE_SEARCHABLE', allOnly: true },
  // As on the germplasm page: the pedigree definitions of the datasets found, then the pedigrees (parents and progeny)
  { key: 'pedigrees', title: 'Pedigrees', component: PedigreeResults, api: apiPostPedigreeTable, searchable: 'TABLE_COLUMNS_PEDIGREE_SEARCHABLE', passFilter: true },
  { key: 'locations', title: 'Locations', component: LocationTable, api: apiPostLocationTable, idsApi: apiPostLocationTableIds, polygonApi: apiPostLocationPolygonTable, polygonIdsApi: apiPostLocationPolygonTableIds, searchable: 'TABLE_COLUMNS_LOCATION_SEARCHABLE' },
  { key: 'traits', title: 'Traits', component: TraitTable, api: apiPostTraitTable, idsApi: apiPostTraitTableIds, allColumns: ['traitName', 'traitNameShort', 'traitDescription'] },
  { key: 'climates', title: 'Climates', component: ClimateTable, api: apiPostClimateTable, allColumns: ['climateName', 'climateNameShort', 'climateDescription'] },
  { key: 'maps', title: 'Genotypic maps', component: MapTable, api: apiPostMapsTable, allColumns: ['mapName', 'mapDescription'] }
]

// Comparators each type of column takes (as on the legacy search page); other types (text) take any of them
const VALID_COMPARATORS_FOR_TYPE = {
  Boolean: ['equals', 'isNull'],
  dataType: ['equals', 'isNull'],
  locationType: ['equals', 'isNull'],
  entityType: ['equals', 'isNull'],
  json: ['contains', 'isNull'],
  Number: ['equals', 'between', 'lessThan', 'greaterThan', 'lessOrEquals', 'greaterOrEquals', 'inSet', 'isNull'],
  Date: ['equals', 'between', 'lessThan', 'greaterThan', 'lessOrEquals', 'greaterOrEquals', 'isNull']
}

// Searching everything, as the legacy search page: the text in every searchable column of the table, with the
// comparator chosen (Equal, Contains, In set), or the first one the column's type takes when it doesn't take it (e.g.
// In set on a number stays In set, Contains on a number becomes Equal). In set: the server splits the text on commas.
const getAllFilter = (table, term, comparator = 'contains') => {
  const columns = table.searchable
    ? ColumnsMixin[table.searchable]
    : table.allColumns.map(name => ({ name, type: String }))
  // Numbers in the text: the whole text (Equal), or the values separated by commas (In set)
  const isNumber = value => /^-?\d+(\.\d+)?$/.test(value)
  const numbers = comparator === 'inSet'
    ? term.split(',').map(v => v.trim()).filter(isNumber)
    : (isNumber(term.trim()) ? [term.trim()] : [])

  return columns
    .map(c => {
      const valid = VALID_COMPARATORS_FOR_TYPE[c.type]
      const columnComparator = valid && !valid.includes(comparator) ? valid[0] : comparator
      // A number column only with a number: the database turns a text into 0 (so "abc" would find every 0)
      if (c.type === Number) {
        return numbers.length > 0 ? { column: c.name, comparator: columnComparator, operator: 'or', values: columnComparator === 'inSet' ? [numbers.join(',')] : [numbers[0]] } : null
      }
      return { column: c.name, comparator: columnComparator, operator: 'or', values: [term] }
    })
    .filter(filter => filter)
}

// The filter of a table with the request of its page: the search's filter comes on top of those set in the table
const withSearch = (data, search) => {
  const request = { ...data, filter: (data.filter || []).concat(search.filter || []) }
  if (search.polygons) {
    request.polygons = search.polygons
  }
  return request
}

export default {
  mounted: function () {
    this.runSearchFromRoute()
  },
  components: {
    MdiIcon,
    NoResultsIcon,
    SearchModule,
    SearchCrumbs
  },
  data: function () {
    return {
      // The search shown: { id, all, crumbs, tables: { key: { filter, polygons } }, counts: { key: count } }
      search: null,
      searchCount: 0,
      countsLoaded: false,
      icons: {
        empty: mdiDatabaseRemoveOutline
      }
    }
  },
  computed: {
    // Opened with a term (/search/{term}, e.g. "All" from the home page or the header), and the scope of the legacy
    // "searchType" when it is one of the module
    initialTerm: function () {
      return (this.$route.params && this.$route.params.searchTerm) || null
    },
    // The module's state of a search of the home page (field, text, choices)
    initialState: function () {
      try {
        return this.$route.query && this.$route.query.searchState ? JSON.parse(this.$route.query.searchState) : null
      } catch (e) {
        return null
      }
    },
    initialScope: function () {
      return (this.$route.query && (this.$route.query.searchScope || this.$route.query.searchType)) || null
    },
    // The tabs of the search: its table, or (everything) those with results
    visibleTabs: function () {
      if (!this.search) {
        return []
      }
      return TABLES
        .filter(table => this.search.tables[table.key])
        // Once counted, only the tables with results (one scope: shown while it is counted)
        .filter(table => this.countsLoaded ? (this.search.counts[table.key] || 0) > 0 : !this.search.all)
        .map(table => {
          const search = this.search.tables[table.key]
          const api = search.polygons ? table.polygonApi : table.api
          const idsApi = search.polygons ? table.polygonIdsApi : table.idsApi
          return {
            key: table.key,
            title: table.title,
            component: table.component,
            // Datasets: details shown at once (a collaborator chosen: the collaborators)
            // Datasets: details shown at once; pedigrees: the search's filter (for their definitions)
            extra: Object.assign({}, search.openDetails ? { openDetails: search.openDetails } : {}, table.passFilter ? { searchFilter: search.filter || [] } : {}),
            getData: (data, callback) => api(withSearch(data, search), callback),
            getIds: idsApi ? (data, callback) => idsApi(withSearch(data, search), callback) : null
          }
        })
    }
  },
  methods: {
    onSearch: function (event) {
      this.searchCount++
      this.countsLoaded = false
      // Everything: every table, with the text in its main columns
      if (event.scope === 'all') {
        const tables = TABLES.reduce((all, table) => ({
          ...all,
          [table.key]: { filter: getAllFilter(table, event.term, event.comparator) }
        }), {})
        this.search = { id: this.searchCount, all: true, crumbs: event.crumbs, tables, counts: {} }
        this.loadCounts()
        return
      }
      // One scope: its table
      this.search = {
        id: this.searchCount,
        all: false,
        crumbs: event.crumbs,
        tables: { [event.tableName]: { filter: event.filter || [], polygons: event.polygons || null, openDetails: event.openDetails || null } },
        counts: {}
      }
      // Counted too, to tell when nothing was found
      this.loadCounts()
    },
    // A count of a tab: short (1.2K) above a thousand
    getCountText: function (count) {
      return getNumberWithSuffix(count || 0, 1)
    },
    // Opened with a search of a scope without a page of its own (pedigrees, from the home page): its results at once
    runSearchFromRoute: function () {
      const query = this.$route.query || {}
      if (!query.searchTable || !query.searchFilter) {
        return
      }
      try {
        this.onSearch({
          scope: query.searchScope,
          tableName: query.searchTable,
          filter: JSON.parse(query.searchFilter),
          crumbs: query.searchCrumbs ? JSON.parse(query.searchCrumbs) : [query.searchScope]
        })
      } catch (e) {
        // A filter that can't be read: no search
      }
    },
    // How many each table has (searching everything): the tabs without any are not shown
    loadCounts: function () {
      const search = this.search
      // The tables of the search (an area drawn: their polygon search)
      Promise.all(TABLES.filter(table => search.tables[table.key]).map(table => new Promise(resolve => {
        const tableSearch = search.tables[table.key]
        const api = tableSearch.polygons ? table.polygonApi : table.api
        api(withSearch({ page: 1, limit: 1, prevCount: -1 }, tableSearch), result => resolve([table.key, (result && result.count) || 0]), { codes: [], callback: () => resolve([table.key, 0]) })
      }))).then(counts => {
        // A newer search meanwhile: that one counts
        if (this.search !== search) {
          return
        }
        this.search = { ...search, counts: counts.reduce((all, [key, count]) => ({ ...all, [key]: count }), {}) }
        this.countsLoaded = true
      })
    }
  }
}
</script>

<style src="@/assets/custom-page.css"></style>
<style scoped>
/* Results over the whole width, with a small space at the sides */
.search-page {
  padding: 0.5rem 0.5rem 3rem;
}
/* The search in the middle, as wide as on the home page */
.search-page-top {
  max-width: 1300px;
  margin: 0 auto 3.5rem;
}
.search-page-title {
  margin: 1.5rem 0 1.25rem;
  font-size: 3.2rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--cp-text);
}
.search-page-top >>> .home-search-section {
  margin-top: 0;
}
/* Tabs like those of the germplasm page (rounded top corners) */
.search-page-tabs >>> .search-page-tabs-nav {
  flex-wrap: wrap;
  border-bottom: 1px solid var(--cp-border);
}
.search-page-tabs >>> .search-page-tabs-nav .nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.25rem;
  border: 1px solid transparent;
  border-radius: 10px 10px 0 0;
  color: var(--cp-muted);
  font-weight: 600;
}
.search-page-tabs >>> .search-page-tabs-nav .nav-link:hover,
.search-page-tabs >>> .search-page-tabs-nav .nav-link:focus {
  border-color: transparent;
  color: var(--cp-text);
}
.search-page-tabs >>> .search-page-tabs-nav .nav-link.active {
  border-color: var(--cp-border) var(--cp-border) var(--cp-surface);
  background: var(--cp-surface);
  color: var(--cp-text);
}
/* Name of a tab: cut with "..." when long (many tabs) */
.search-page-tab-title {
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Count of a tab: a rounded badge in green, grey like the text of a tab that isn't selected */
.search-page-tabs >>> .nav-link:not(.active) .search-page-count {
  border-color: var(--cp-border);
  background: var(--cp-neutral-bg);
  color: var(--cp-muted);
}
.search-page-count {
  padding: 0 0.5rem;
  border: 1px solid var(--cp-green);
  border-radius: 999px;
  background: var(--cp-green-soft);
  color: var(--cp-green);
  font-size: 0.8rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
/* Nothing found: illustration, title and text, centred */
.search-page-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 4.5rem auto 3rem;
  text-align: center;
}
.search-page-empty-icon {
  max-width: 60vw;
  height: auto;
  color: #8aa886;
}
body.dark-mode .search-page-empty-icon {
  color: #6f8f6b;
}
.search-page-empty-title {
  margin: 1.75rem 0 0.4rem;
  font-size: 2.6rem;
  font-weight: 500;
  color: var(--cp-text);
}
/* The breadcrumb, centred under the title */
.search-page-empty-crumbs {
  justify-content: center;
  max-width: 100%;
  margin: 0.5rem 0 0.75rem;
}
.search-page-empty-crumbs >>> .search-crumbs-line {
  flex: 0 1 auto;
}
.search-page-empty-text {
  margin: 0;
  font-size: 1.1rem;
  color: var(--cp-muted);
}
</style>
