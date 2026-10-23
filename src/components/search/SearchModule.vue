<template>
  <!-- The search of the home page, shared with the Search page (any change shows on both). "custom-page" brings the
       colour tokens and font of the custom pages (and the crop colours used by the results). -->
  <div :class="['custom-page', 'search-module', { 'search-module-inline': inline }]">
  <section class="home-search-section">
    <!-- Searching datasets or genotypic maps: a typeahead (see home-typeahead-search.js) -->
    <div class="home-search-wrap" @focusout="onSearchWrapFocusOut">
    <form class="home-search" @submit.prevent="onSearch">
      <div class="home-search-field" ref="searchField">
        <!-- Nothing found for the text typed (typeahead or results): the broom clears the text, in the place of the search icon -->
        <button type="button" class="home-search-icon home-search-clear" v-if="showClearText" title="Clear the search" aria-label="Clear the text of the search" @mousedown.prevent @click="clearSearchText">
          <MdiIcon :path="icons.broom" :size="20" />
        </button>
        <!-- Two chips or more: the broom (it clears them all) in the place of the search icon -->
        <button type="button" class="home-search-icon home-search-clear" v-else-if="selectedChipCount > 1" title="Clear all" aria-label="Clear all the values chosen" @mousedown.prevent @click="clearAllChoices">
          <MdiIcon :path="icons.broom" :size="20" />
        </button>
        <span class="home-search-icon" v-else><MdiIcon :path="icons.search" :size="20" /></span>
        <!-- Countries chosen (locations by country): flag and code, x takes one away -->
        <span class="home-search-chips" v-if="isCountrySearch && selectedCountries.length > 0">
          <span class="home-search-chip" v-for="country in selectedCountries" :key="'search-country-' + country.id" :title="country.countryName">
            <span :class="`fi fi-${country.countryCode2.toLowerCase()}`" /> {{ country.countryCode3 || country.countryCode2 }}
            <button type="button" class="home-search-chip-remove" :aria-label="`Remove ${country.countryName}`" @mousedown.prevent @click="removeCountry(country)">&times;</button>
          </span>
        </span>
        <!-- Types of storage chosen: code and name, x takes one away -->
        <span class="home-search-chips" v-if="isStorageSearch && selectedStorage.length > 0">
          <span class="home-search-chip" v-for="type in selectedStorageOptions" :key="'search-storage-' + type.code" :title="`${type.code} - ${type.name}`">
            <span class="home-code-badge">{{ type.code }}</span>
            <span class="home-search-chip-text">{{ type.name }}</span>
            <button type="button" class="home-search-chip-remove" :aria-label="`Remove ${type.name}`" @mousedown.prevent @click="removeStorage(type.code)">&times;</button>
          </span>
        </span>
        <!-- Biological statuses chosen: code and name, x takes one away -->
        <span class="home-search-chips" v-if="isBioStatusSearch && selectedBioStatus.length > 0">
          <span class="home-search-chip" v-for="status in selectedBioStatusOptions" :key="'search-biostatus-' + status.value" :title="status.code !== null ? `${status.code} - ${status.name}` : status.name">
            <span class="home-code-badge" v-if="status.code !== null">{{ status.code }}</span>
            <span class="home-search-chip-text">{{ status.name }}</span>
            <button type="button" class="home-search-chip-remove" :aria-label="`Remove ${status.name}`" @mousedown.prevent @click="removeBioStatus(status.value)">&times;</button>
          </span>
        </span>
        <!-- Kinds of data chosen (germplasm with data of type): icon and name, x takes one away -->
        <span class="home-search-chips" v-if="isHasDataSearch && selectedHasData.length > 0">
          <span class="home-search-chip" v-for="option in selectedHasDataOptions" :key="'search-hasdata-' + option.key" :title="option.text">
            <span class="home-search-chip-icon" :style="{ color: option.color }"><MdiIcon :path="option.path" :size="14" /></span>
            <span class="home-search-chip-text">{{ option.text }}</span>
            <button type="button" class="home-search-chip-remove" :aria-label="`Remove ${option.text}`" @mousedown.prevent @click="removeHasData(option.key)">&times;</button>
          </span>
        </span>
        <!-- Genera or species chosen: in italics (a genus with a capital), long names cut, x takes one away -->
        <span class="home-search-chips" v-if="isTaxonSearch && selectedTaxa.length > 0">
          <span class="home-search-chip" v-for="name in selectedTaxa" :key="'search-taxon-' + name" :title="taxonRank === 'genus' ? capitalize(name) : name">
            <span class="home-search-chip-text"><em>{{ taxonRank === 'genus' ? capitalize(name) : name }}</em></span>
            <button type="button" class="home-search-chip-remove" :aria-label="`Remove ${name}`" @mousedown.prevent @click="removeTaxon(name)">&times;</button>
          </span>
        </span>
        <input type="search"
               ref="searchInput"
               class="home-search-input"
               :value="searchInputValue"
               :readonly="isOptionSearch || isGeofenceSearch || isPdciSearch || isHasDataSearch || isBioStatusSearch || isStorageSearch"
               :disabled="isFixedSearch"
               :inputmode="isNumberSearch ? 'numeric' : null"
               :placeholder="searchInputPlaceholder"
               aria-label="Search term"
               autocomplete="off"
               :role="hasTypeahead ? 'combobox' : null"
               :aria-expanded="hasTypeahead ? (typeaheadPanelOpen ? 'true' : 'false') : null"
               :aria-controls="hasTypeahead ? 'home-typeahead' : null"
               @input="onSearchInput"
               @click="onSearchFieldClick"
               @keydown="onSearchKeydown" />
      </div>
      <!-- What to search by -->
      <div class="home-search-select" v-if="hasTypeahead">
        <select v-model="typeaheadField" aria-label="Search by">
          <option v-for="field in typeaheadFields" :key="'typeahead-field-' + field.value" :value="field.value">{{ field.text }}</option>
        </select>
        <MdiIcon :path="icons.chevronDown" :size="18" />
      </div>
      <!-- Parent or child of a pedigree: what the germplasm is searched by -->
      <div class="home-search-select" v-if="isRelativeSearch">
        <select v-model="relativeSearchBy" aria-label="Search the germplasm by">
          <option v-for="option in relativeSearchByOptions" :key="'relative-by-' + option.value" :value="option.value">{{ option.text }}</option>
        </select>
        <MdiIcon :path="icons.chevronDown" :size="18" />
      </div>
      <!-- Institution: what it is searched by -->
      <div class="home-search-select" v-if="isInstitutionSearch">
        <select v-model="institutionSearchBy" aria-label="Search the institution by">
          <option v-for="option in institutionSearchByOptions" :key="'institution-by-' + option.value" :value="option.value">{{ option.text }}</option>
        </select>
        <MdiIcon :path="icons.chevronDown" :size="18" />
      </div>
      <!-- A number (marker count, data points, elevation): how it is compared -->
      <div class="home-search-select" v-if="isNumberSearch">
        <select v-model="numberComparator" aria-label="Compare the number">
          <option v-for="comparator in numberComparators" :key="'typeahead-comparator-' + comparator.value" :value="comparator.value">{{ comparator.text }}</option>
        </select>
        <MdiIcon :path="icons.chevronDown" :size="18" />
      </div>
      <!-- Search page only, searching everything: how the text is compared (as on the legacy search page) -->
      <div class="home-search-select" v-if="inline && searchScope === 'all'">
        <select v-model="allComparator" aria-label="Compare the text">
          <option v-for="comparator in allComparators" :key="'all-comparator-' + comparator.value" :value="comparator.value">{{ comparator.text() }}</option>
        </select>
        <MdiIcon :path="icons.chevronDown" :size="18" />
      </div>
      <div class="home-search-select">
        <select v-model="searchScope" aria-label="Search scope">
          <option v-for="scope in sortedSearchScopes" :key="'search-scope-option-' + scope.value" :value="scope.value">{{ scope.text }}</option>
        </select>
        <MdiIcon :path="icons.chevronDown" :size="18" />
      </div>
      <button type="submit" class="home-search-button" :disabled="!canSubmitSearch"><MdiIcon :path="icons.search" :size="18" /> Search</button>
    </form>

    <!-- Results, 5 at a time, as wide as the search field. Clicks keep the focus in the field (mousedown). -->
    <div class="home-typeahead" id="home-typeahead" role="listbox" v-if="showTypeaheadPanel" :style="typeaheadPanelWidth ? { width: typeaheadPanelWidth + 'px' } : null">
      <!-- A list to choose from: dataset types, location types -->
      <template v-if="isOptionSearch">
        <button type="button"
                v-for="(option, index) in optionList"
                :key="'typeahead-option-' + option.key"
                role="option"
                :aria-selected="selectedOption === option.key ? 'true' : 'false'"
                :class="['home-typeahead-item', 'home-typeahead-type', { active: index === typeaheadHighlight, selected: selectedOption === option.key }]"
                @mousedown.prevent
                @click="chooseOption(option)">
          <!-- A letter (relationship types) or an icon -->
          <span class="home-code-badge home-code-badge-list home-typeahead-letter" v-if="option.badge">{{ option.badge }}</span>
          <span class="home-typeahead-icon" :style="getColorStyle(option.color)" v-else><MdiIcon :path="option.path" :size="18" /></span>
          <span class="home-typeahead-name">{{ option.text }}</span>
        </button>
      </template>
      <!-- Countries (several can be chosen): flag, name and code, those chosen ticked -->
      <div class="home-typeahead-countries" v-else-if="isCountrySearch">
        <div class="home-typeahead-message home-typeahead-empty" v-if="countryOptions.length === 0">
          <NoResultsIcon :width="34" className="home-typeahead-empty-icon" /> No countries found
        </div>
        <button type="button"
                v-for="(country, index) in countryOptions"
                :key="'typeahead-country-' + country.id"
                role="option"
                :aria-selected="country.selected ? 'true' : 'false'"
                :class="['home-typeahead-item', 'home-typeahead-country', { active: index === typeaheadHighlight, selected: country.selected }]"
                @mousedown.prevent
                @click="toggleCountry(country)">
          <span :class="`fi fi-${country.countryCode2.toLowerCase()}`" />
          <span class="home-typeahead-name">{{ country.countryName }}</span>
          <span class="home-typeahead-country-code">{{ country.countryCode3 || country.countryCode2 }}</span>
          <MdiIcon :path="icons.check" :size="16" :className="country.selected ? 'home-typeahead-check' : 'home-typeahead-check hidden'" />
        </button>
      </div>
      <!-- Genera or species (several can be chosen): icon of the group, the name in italics, at the right the group of a genus
           or the genera of a species, a tick for those chosen. Only shown once something typed matches. -->
      <div class="home-typeahead-countries" v-else-if="isTaxonSearch">
        <button type="button"
                v-for="(genus, index) in taxonOptions"
                :key="'typeahead-taxon-' + genus.name"
                role="option"
                :aria-selected="genus.selected ? 'true' : 'false'"
                :class="['home-typeahead-item', 'home-typeahead-genus', { active: index === typeaheadHighlight, selected: genus.selected }]"
                @mousedown.prevent
                @click="toggleTaxon(genus)">
          <span class="home-typeahead-icon" :style="genus.iconStyle" :title="genus.group ? genus.group.name : null"><MdiIcon :path="genus.icon" :size="18" /></span>
          <span class="home-typeahead-name home-typeahead-genus-name" :title="genus.text">{{ genus.text }}</span>
          <span :class="['home-typeahead-group', genus.group.className]" v-if="genus.group" :title="genus.group.name">{{ genus.group.name }}</span>
          <span class="home-typeahead-genera" v-else-if="genus.genera.length > 0" :title="genus.genera.join(', ')">
            <span class="home-typeahead-count" v-for="name in genus.genera.slice(0, 3)" :key="'species-genus-' + name"><em>{{ name }}</em></span>
            <span class="home-typeahead-count" v-if="genus.genera.length > 3">+{{ genus.genera.length - 3 }}</span>
          </span>
          <span v-else />
          <MdiIcon :path="icons.check" :size="16" :className="genus.selected ? 'home-typeahead-check' : 'home-typeahead-check hidden'" />
        </button>
      </div>
      <!-- Types of storage in use (several can be chosen), in code order: STORAGE code, name, a tick for those chosen -->
      <div class="home-typeahead-countries" v-else-if="isStorageSearch">
        <div class="home-typeahead-message" v-if="storageTypes.length === 0">Loading ...</div>
        <button type="button"
                v-for="(type, index) in storageOptions"
                :key="'typeahead-storage-' + type.code"
                role="option"
                :aria-selected="type.selected ? 'true' : 'false'"
                :class="['home-typeahead-item', 'home-typeahead-hasdata', { active: index === typeaheadHighlight, selected: type.selected }]"
                @mousedown.prevent
                @click="toggleStorage(type)">
          <span class="home-code-badge home-code-badge-list">{{ type.code }}</span>
          <span class="home-typeahead-name" :title="type.name">{{ type.name }}</span>
          <MdiIcon :path="icons.check" :size="16" :className="type.selected ? 'home-typeahead-check' : 'home-typeahead-check hidden'" />
        </button>
      </div>
      <!-- Biological statuses of the database (several can be chosen), in code order: SAMPSTAT code, name, a tick for those chosen -->
      <div class="home-typeahead-countries" v-else-if="isBioStatusSearch">
        <div class="home-typeahead-message" v-if="bioStatuses.length === 0">Loading ...</div>
        <button type="button"
                v-for="(status, index) in bioStatusOptions"
                :key="'typeahead-biostatus-' + status.value"
                role="option"
                :aria-selected="status.selected ? 'true' : 'false'"
                :class="['home-typeahead-item', 'home-typeahead-hasdata', { active: index === typeaheadHighlight, selected: status.selected }]"
                @mousedown.prevent
                @click="toggleBioStatus(status)">
          <span class="home-code-badge home-code-badge-list">{{ status.code !== null ? status.code : '—' }}</span>
          <span class="home-typeahead-name" :title="status.name">{{ status.name }}</span>
          <MdiIcon :path="icons.check" :size="16" :className="status.selected ? 'home-typeahead-check' : 'home-typeahead-check hidden'" />
        </button>
      </div>
      <!-- Kinds of data (several can be chosen): the icon of the germplasm list's toggle and the name, a tick for those chosen -->
      <div v-else-if="isHasDataSearch">
        <button type="button"
                v-for="(option, index) in hasDataOptions"
                :key="'typeahead-hasdata-' + option.key"
                role="option"
                :aria-selected="option.selected ? 'true' : 'false'"
                :class="['home-typeahead-item', 'home-typeahead-hasdata', { active: index === typeaheadHighlight, selected: option.selected }]"
                @mousedown.prevent
                @click="toggleHasData(option)">
          <span class="home-typeahead-icon" :style="getColorStyle(option.color)"><MdiIcon :path="option.path" :size="18" /></span>
          <span class="home-typeahead-name">{{ option.text }}</span>
          <MdiIcon :path="icons.check" :size="16" :className="option.selected ? 'home-typeahead-check' : 'home-typeahead-check hidden'" />
        </button>
      </div>
      <!-- PDCI: the range searched (0 to 10), applied with the Search button -->
      <div class="home-typeahead-pdci" v-else-if="isPdciSearch">
        <div class="home-typeahead-pdci-values">
          <span>Minimum <strong>{{ pdciRange[0].toFixed(1) }}</strong></span>
          <span>Maximum <strong>{{ pdciRange[1].toFixed(1) }}</strong></span>
        </div>
        <div class="home-typeahead-pdci-sliders">
          <div class="home-typeahead-pdci-track" :style="{ left: (pdciRange[0] / pdciLimits.max * 100) + '%', right: (100 - pdciRange[1] / pdciLimits.max * 100) + '%' }" />
          <input type="range" :min="pdciLimits.min" :max="pdciLimits.max" :step="pdciLimits.step" :value="pdciRange[0]" aria-label="Minimum PDCI" @input="setPdciRange(0, $event.target.value)" />
          <input type="range" :min="pdciLimits.min" :max="pdciLimits.max" :step="pdciLimits.step" :value="pdciRange[1]" aria-label="Maximum PDCI" @input="setPdciRange(1, $event.target.value)" />
        </div>
        <div class="home-typeahead-pdci-scale"><span v-for="mark in 11" :key="'pdci-mark-' + mark">{{ mark - 1 }}</span></div>
      </div>
      <template v-else>
        <!-- Geofencing: an area drawn on the map, the locations with coordinates inside it listed below -->
        <div class="home-geofence" v-if="isGeofenceSearch">
          <div class="home-geofence-hint">Draw an area on the map: click its corners, then the first one again to close it. Use the tools on the right to change or delete it.</div>
          <LocationMap class="home-geofence-map"
                       selectionMode="polygon"
                       :locations="[]"
                       baseLayer="osm"
                       :initialZoom="2"
                       :showLinks="false"
                       @map-loaded="onGeofenceMapLoaded"
                       @polygons-changed="onGeofenceChanged"
                       ref="geofenceMap" />
        </div>
        <!-- FAO WIEWS can be slow: a spinner while it answers -->
        <div class="home-typeahead-message home-typeahead-loading" v-if="typeaheadLoading && typeaheadItems.length === 0">
          <MdiIcon :path="icons.reload" :size="18" className="home-typeahead-spin" /> {{ isInstitutionSearch ? 'Searching FAO WIEWS ...' : 'Searching ...' }}
        </div>
        <div class="home-typeahead-message" v-else-if="typeaheadError">{{ typeaheadError }}</div>
        <div class="home-typeahead-message home-typeahead-empty" v-else-if="typeaheadItems.length === 0 && !(isGeofenceSearch && (geofencePolygons.length === 0 || !geofenceListsResults))">
          <NoResultsIcon :width="34" className="home-typeahead-empty-icon" /> {{ typeaheadScope.notFound }}
        </div>
        <div v-for="(item, index) in typeaheadItems"
             :key="'typeahead-result-' + item.id"
             role="option"
             :aria-selected="index === typeaheadHighlight ? 'true' : 'false'"
             :class="['home-typeahead-item', { active: index === typeaheadHighlight, loading: typeaheadLoading, 'has-badges': item.badges.length > 0, 'home-typeahead-germplasm': item.germplasm, 'home-typeahead-institution': item.institution || item.person || item.datasetInstitution }]"
             @mousedown.prevent
             @click="openTypeaheadItem(item)">
          <span class="home-typeahead-icon" :style="item.iconStyle" :title="item.iconTitle"><MdiIcon :path="item.icon" :size="18" /></span>
          <!-- A FAO WIEWS institute (code, name below) or a collaborator (name, institute below), the flag of its country -->
          <template v-if="item.institution || item.person || item.datasetInstitution">
            <span class="home-typeahead-germplasm-text">
              <span class="home-typeahead-accenumb"><span v-for="(part, k) in item.codeParts" :key="k" :class="{ 'home-typeahead-mark': part.match }">{{ part.text }}</span></span>
              <span class="home-typeahead-institution-name"><span v-for="(part, k) in item.nameParts" :key="k" :class="{ 'home-typeahead-mark': part.match }">{{ part.text }}</span></span>
            </span>
            <span :class="`fi fi-${item.flag} home-typeahead-flag`" v-if="item.flag" :title="item.country" />
          </template>
          <template v-else-if="item.germplasm">
            <span class="home-typeahead-germplasm-text">
              <span class="home-typeahead-accession">
                <span class="home-typeahead-accenumb"><span v-for="(part, k) in item.numberParts" :key="k" :class="{ 'home-typeahead-mark': part.match }">{{ part.text }}</span></span>
                <span class="home-typeahead-accename" v-if="item.accessionNameParts.length > 0"><span v-for="(part, k) in item.accessionNameParts" :key="k" :class="{ 'home-typeahead-mark': part.match }">{{ part.text }}</span></span>
              </span>
              <span class="home-typeahead-taxonomy" v-if="item.taxonomy">{{ item.taxonomy }}</span>
            </span>
            <!-- The group of the germplasm -->
            <span :class="['home-typeahead-group', item.group.className]" v-if="item.group" :title="item.group.name">{{ item.group.name }}</span>
            <!-- Marks the germplasm, like the checkbox of the germplasm table -->
            <label class="home-typeahead-markbox" :title="isGermplasmMarked(item.id) ? 'Marked: click to unmark' : 'Mark this germplasm'" @click.stop>
              <input type="checkbox" :checked="isGermplasmMarked(item.id)" :aria-label="`Mark ${item.record.germplasmName}`" @change="setGermplasmMarked(item.id, $event.target.checked)" />
            </label>
          </template>
          <template v-else>
          <span class="home-typeahead-name">
            <!-- Private or hidden datasets (only found by those allowed to see them) -->
            <span class="home-typeahead-state" v-if="item.state" :title="item.state.text" :aria-label="item.state.text"><MdiIcon :path="item.state.path" :size="14" /></span>
            <span v-for="(part, k) in item.nameParts" :key="k" :class="{ 'home-typeahead-mark': part.match }">{{ part.text }}</span>
          </span>
          <span class="home-typeahead-text"><span v-for="(part, k) in item.textParts" :key="k" :class="{ 'home-typeahead-mark': part.match }">{{ part.text }}</span></span>
          <!-- Counts (markers, data points; green when they are what is searched) and the data type of a trait -->
          <span class="home-typeahead-badges" v-if="item.badges.length > 0">
            <span v-for="(badge, k) in item.badges" :key="k" :class="['home-typeahead-count', { matched: badge.matched, typed: !!badge.icon || !!badge.flag, plain: badge.plainBadge }]" :style="badge.style" :title="badge.title">
              <MdiIcon v-if="badge.icon" :path="badge.icon" :size="13" />
              <span v-if="badge.flag" :class="`fi fi-${badge.flag}`" />
              {{ badge.text }}
            </span>
          </span>
          </template>
        </div>
      </template>
      <!-- More than 5 -->
      <div class="home-typeahead-pager" v-if="typeaheadPageCount > 1">
        <button type="button" class="home-typeahead-page" :disabled="typeaheadPage <= 1" @mousedown.prevent @click="goTypeaheadPage(-1)" aria-label="Previous results">
          <MdiIcon :path="icons.chevronLeft" :size="18" />
        </button>
        <span class="home-typeahead-pages">{{ typeaheadPage }} / {{ typeaheadPageCount }}</span>
        <button type="button" class="home-typeahead-page" :disabled="typeaheadPage >= typeaheadPageCount" @mousedown.prevent @click="goTypeaheadPage(1)" aria-label="Next results">
          <MdiIcon :path="icons.chevronRight" :size="18" />
        </button>
      </div>
    </div>
    </div>

    <div class="home-chips">
      <span class="home-chips-label">Search within:</span>
      <button type="button"
              v-for="scope in sortedSearchScopes"
              :key="'search-scope-chip-' + scope.value"
              :class="['home-chip', { active: searchScope === scope.value }]"
              :aria-pressed="searchScope === scope.value"
              @click="searchScope = scope.value">
        {{ scope.text }}
      </button>
    </div>
  </section>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import NoResultsIcon from '@/components/icons/NoResultsIcon'
import homeTypeaheadSearch, { SEARCH_MIN_CHARS } from '@/mixins/home-typeahead-search'
import { Pages } from '@/mixins/pages'
import { mdiMagnify, mdiChevronDown, mdiChevronLeft, mdiChevronRight, mdiCheck, mdiRefresh, mdiBroom } from '@mdi/js'

// Search scopes ("all" searches everything). Values of the scopes with a typeahead are those of TYPEAHEAD_SCOPES
// (home-typeahead-search.js).
const SEARCH_SCOPES = [
  { value: 'all', text: 'All' },
  { value: 'datasets', text: 'Datasets' },
  // "Germplasm data" on the legacy search page
  { value: 'germplasm', text: 'Germplasms' },
  { value: 'trials', text: 'Traits' },
  // Only searched by the typeahead (not a type of the legacy search page)
  { value: 'climates', text: 'Climates' },
  { value: 'locations', text: 'Locations' },
  // "Map definition data" on the legacy search page
  { value: 'mapdefinitions', text: 'Genotypic map' },
  // No page of its own: from the home page its results show on the Search page
  { value: 'pedigrees', text: 'Pedigrees' }
]

/**
 * The search (scope, typeahead, filters of each scope).
 *
 * - On the home page (default): a search opens the page of its table (or the Search page for "All").
 * - "inline" (the Search page): a search is emitted as "search" ({ scope, tableName, filter, polygons, crumbs, term })
 *   and the page shows the results itself.
 *
 * Emits "field-click" when the search field is clicked (the home page collapses its flagship crops then).
 */
export default {
  mixins: [homeTypeaheadSearch],
  components: {
    MdiIcon,
    NoResultsIcon,
    // Only loaded for Geofencing
    LocationMap: () => import(/* webpackChunkName: "location-map" */ '@/components/map/LocationMap')
  },
  props: {
    inline: {
      type: Boolean,
      default: false
    },
    // Search started at once (inline): the term and the scope
    initialTerm: {
      type: String,
      default: null
    },
    initialScope: {
      type: String,
      default: null
    },
    // A state of the module to show at once (a search from the home page, see getModuleState)
    initialState: {
      type: Object,
      default: null
    },
    // The page found nothing for the last search (the Search page's results)
    noResults: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      searchTerm: null,
      // The text of the last search run (for the Search page's "nothing found")
      lastSearchTerm: null,
      // Where to search. Shared by the dropdown and the "Search within" chips so both always show the same selection.
      searchScope: 'all',
      searchScopes: SEARCH_SCOPES,
      // Search page, everything: how the text is compared (In set: several values separated by commas)
      allComparator: 'contains',
      allComparators: [
        { value: 'equals', text: () => this.$t('comparatorsEqual') },
        { value: 'contains', text: () => this.$t('comparatorsContains') },
        { value: 'inSet', text: () => this.$t('comparatorsInSet') }
      ],
      icons: {
        search: mdiMagnify,
        chevronDown: mdiChevronDown,
        chevronLeft: mdiChevronLeft,
        chevronRight: mdiChevronRight,
        check: mdiCheck,
        reload: mdiRefresh,
        broom: mdiBroom
      }
    }
  },
  computed: {
    // Nothing found for the text in the field (typeahead or the page's results): the broom clears it
    showClearText: function () {
      // The page's results: only while the text is the one searched
      return !!this.searchTerm && this.searchTerm.trim() !== '' && (this.typeaheadNothingFound || (this.noResults && this.searchTerm === this.lastSearchTerm))
    },
    // All first, the other scopes in alphabetical order (scope dropdown and "Search within" chips)
    sortedSearchScopes: function () {
      const all = this.searchScopes.filter(scope => scope.value === 'all')
      const others = this.searchScopes.filter(scope => scope.value !== 'all').sort((a, b) => a.text.localeCompare(b.text, undefined, { sensitivity: 'base' }))
      return all.concat(others)
    }
  },
  methods: {
    // Only the text (the chips and the fields chosen stay); the search icon is back
    clearSearchText: function () {
      this.searchTerm = ''
      this.scheduleTypeahead(0)
      this.closeTypeaheadPanel()
      this.$nextTick(() => this.$refs.searchInput && this.$refs.searchInput.focus())
    },
    onSearchFieldClick: function () {
      this.$emit('field-click')
      this.onSearchInputActivate()
    },
    onSearch: function () {
      this.lastSearchTerm = this.searchTerm
      // Scopes with a typeahead: their table, filtered by the field chosen
      if (this.hasTypeahead) {
        this.submitTypeaheadSearch()
        return
      }
      const term = this.searchTerm ? this.searchTerm.trim() : ''

      if (term.length < SEARCH_MIN_CHARS) {
        return
      }

      // All: the Search page searches every table
      if (this.inline) {
        const comparator = this.allComparators.find(c => c.value === this.allComparator)
        this.$emit('search', { scope: 'all', term, comparator: this.allComparator, crumbs: ['All', comparator ? comparator.text() : null, `"${term}"`].filter(crumb => crumb) })
        return
      }

      this.$router.push({ name: Pages.searchQuery, params: { searchTerm: term } })
    }
  },
  mounted: function () {
    if (this.initialScope && this.searchScopes.some(scope => scope.value === this.initialScope)) {
      this.searchScope = this.initialScope
    }
    // A search of the home page: the same field, text and choices (after the scope's change was handled)
    if (this.initialState) {
      this.$nextTick(() => this.applyModuleState(this.initialState))
    }
    if (this.initialTerm) {
      // After the scope's change (which clears the text) was handled
      this.$nextTick(() => {
        this.searchTerm = this.initialTerm
        // The Search page opened with a term (e.g. "All" from the home page): the search runs at once
        if (this.inline && this.searchScope === 'all') {
          this.onSearch()
        }
      })
    }
  }
}
</script>

<style scoped>
/* Colour tokens of the home page (the same values as there), so the module looks the same anywhere */
.search-module {
  --home-green: #3b6b35;
  --home-green-hover: #2a4f26;
  --home-green-soft: #eaf2e6;
  --home-dot: #6aa84f;
  --home-button: #3b6b35;
  --home-button-hover: #2f5a2a;
  --home-on-button: #ffffff;
  --home-text: #1f2120;
  --home-text-subtle: #4a4d4b;
  --home-muted: #6b6f6c;
  --home-placeholder: #8a8d8a;
  --home-border: #e2e3df;
  --home-surface: #ffffff;
  --home-surface-hover: #fafaf8;
  --home-shadow: rgba(0, 0, 0, 0.06);

  --home-wheat-bg: #fdf6e3; --home-wheat-border: #f0d68f; --home-wheat-fg: #c9a227;
  --home-barley-bg: #fbf2e8; --home-barley-border: #e9cba9; --home-barley-fg: #b5844e;
  --home-pea-bg: #edf7ee; --home-pea-border: #a9d6ae; --home-pea-fg: #3f9a4a;
  --home-lettuce-bg: #edf6f0; --home-lettuce-border: #9fcbaa; --home-lettuce-fg: #4b8f5c;
  --home-brassica-bg: #eef1fa; --home-brassica-border: #b6c0e4; --home-brassica-fg: #6b7fc4;

  --home-badge-bg: #eaf2e6; --home-badge-fg: #3b6b35;
  --home-neutral-bg: #f0f1ee;
  --home-badge-neutral-bg: #e7e8e5; --home-badge-neutral-fg: #5c605d;
  --home-news-updates-bg: #e6f0fb; --home-news-updates-fg: #2c6aa8;
  --home-news-data-bg: #fdf3d6; --home-news-data-fg: #946f0c;

  font-family: 'DM Sans', -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--home-text);
}
body.dark-mode .search-module {
  color-scheme: dark;

  color-scheme: dark;

  --home-green: #8cc47e;
  --home-green-hover: #a8d69c;
  --home-green-soft: rgba(106, 168, 79, 0.16);
  --home-dot: #8cc47e;
  --home-button: #4a7f42;
  --home-button-hover: #578f4e;
  --home-on-button: #ffffff;
  --home-text: #e8e6e3;
  --home-text-subtle: #c4beb5;
  --home-muted: #a39d93;
  --home-placeholder: #8c867d;
  --home-border: rgb(62, 67, 70);
  --home-surface: rgb(31, 34, 35);
  --home-surface-hover: rgb(38, 42, 43);
  --home-shadow: rgba(0, 0, 0, 0.4);

  --home-wheat-bg: rgba(201, 162, 39, 0.12); --home-wheat-border: rgba(201, 162, 39, 0.4); --home-wheat-fg: #e3c158;
  --home-barley-bg: rgba(181, 132, 78, 0.14); --home-barley-border: rgba(181, 132, 78, 0.45); --home-barley-fg: #d9a874;
  --home-pea-bg: rgba(63, 154, 74, 0.14); --home-pea-border: rgba(63, 154, 74, 0.45); --home-pea-fg: #7cc785;
  --home-lettuce-bg: rgba(75, 143, 92, 0.14); --home-lettuce-border: rgba(75, 143, 92, 0.45); --home-lettuce-fg: #86c296;
  --home-brassica-bg: rgba(107, 127, 196, 0.15); --home-brassica-border: rgba(107, 127, 196, 0.45); --home-brassica-fg: #a3b3ea;

  --home-badge-bg: rgba(106, 168, 79, 0.18); --home-badge-fg: #9fd18f;
  --home-neutral-bg: rgba(255, 255, 255, 0.06);
  --home-badge-neutral-bg: rgba(255, 255, 255, 0.1); --home-badge-neutral-fg: #c4beb5;
  --home-news-updates-bg: rgba(80, 150, 220, 0.18); --home-news-updates-fg: #9cc6f0;
  --home-news-data-bg: rgba(201, 162, 39, 0.18); --home-news-data-fg: #e3c158;
}

/* Search */
.home-search-section {
  margin-top: 2.5rem;
}
/* Each part has its own outline: only the text field grows (several lines of chips), the dropdowns and the button
   keep their height */
.home-search {
  display: flex;
  align-items: flex-start;
}
/* The results of the typeahead open below the search, over the page */
.home-search-wrap {
  position: relative;
}
/* The chips chosen and the text field wrap onto more lines; the icon stays at the top left */
.home-search-field {
  position: relative;
  min-height: 64px;
  background: var(--home-surface);
  border: 1px solid var(--home-border);
  border-radius: 10px 0 0 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  align-content: center;
  flex: 1;
  min-width: 0;
  padding: 9px 0 9px 3.4rem;
}
/* Countries chosen, before the text typed */
.home-search-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  padding-left: 0.5rem;
}
.home-search-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.3rem 0.15rem 0.5rem;
  border: 1px solid var(--home-border);
  border-radius: 999px;
  background: var(--home-neutral-bg);
  font-size: 0.85rem;
  white-space: nowrap;
}
/* SAMPSTAT code: the badge of the codes of the passport editing */
.home-code-badge {
  display: inline-block;
  min-width: 2.4rem;
  padding: 0.05rem 0.35rem;
  border-radius: 6px;
  background: var(--home-badge-bg);
  color: var(--home-badge-fg);
  font-size: 0.78rem;
  font-weight: 600;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
/* A letter (relationship types) in the place of an icon */
.home-typeahead-letter {
  min-width: 2.25rem;
}
.home-code-badge-list {
  min-width: 2.8rem;
  padding: 0.15rem 0.4rem;
  font-size: 0.82rem;
}
.home-search-chip-icon {
  display: inline-flex;
}
/* A long genus is cut */
.home-search-chip-text {
  max-width: 9rem;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* The broom in the place of the search icon: the same look, a button */
.home-search-clear {
  border: none;
  background: transparent;
  cursor: pointer;
}
.home-search-clear:hover {
  color: var(--home-text);
}
.home-search-chip-remove {
  padding: 0 0.25rem;
  border: none;
  background: transparent;
  color: var(--home-muted);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
}
.home-search-chip-remove:hover {
  color: var(--home-text);
}
.home-search-input:disabled {
  cursor: not-allowed;
}
.home-search-icon {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  height: 62px;
  padding: 0 0.5rem 0 1.4rem;
  color: var(--home-muted);
}
/* After the chips; on a line of its own when there is no room left beside them */
.home-search-input {
  flex: 1 1 14rem;
  min-width: 14rem;
  height: 44px;
  border: none;
  outline: none;
  padding: 0 0.75rem;
  font-size: 1.1rem;
  color: var(--home-text);
  background: transparent;
}
.home-search-input::placeholder {
  color: var(--home-placeholder);
}
/* The text field's right edge separates it from the first dropdown */
.home-search-select {
  position: relative;
  display: flex;
  align-items: center;
  height: 64px;
  background: var(--home-surface);
  border: 1px solid var(--home-border);
  border-left: none;
  color: var(--home-text);
}
.home-search-select select {
  appearance: none;
  border: none;
  outline: none;
  background: transparent;
  height: 100%;
  padding: 0 3rem 0 1.5rem;
  font-size: 0.95rem;
  color: inherit;
  cursor: pointer;
}
.home-search-select >>> .mdi-icon-wrapper {
  position: absolute;
  right: 1.25rem;
  pointer-events: none;
  color: var(--home-muted);
}
.home-search-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 64px;
  padding: 0 2rem;
  border: none;
  border-radius: 0 10px 10px 0;
  background: var(--home-button);
  color: var(--home-on-button);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
}
.home-search-button:hover {
  background: var(--home-button-hover);
}
.home-search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.home-search-button:disabled:hover {
  background: var(--home-button);
}

/* Typeahead of the dataset search */
.home-typeahead {
  position: absolute;
  top: calc(100% - 1px);
  left: 0;
  z-index: 20;
  max-width: 100%;
  background: var(--home-surface);
  border: 1px solid var(--home-border);
  border-radius: 0 0 10px 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.home-typeahead-item {
  display: grid;
  grid-template-columns: auto minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-bottom: 1px solid var(--home-border);
  background: transparent;
  color: var(--home-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.home-typeahead-item:hover,
.home-typeahead-item.active {
  background: var(--home-neutral-bg);
}
/* Previous results stay (dimmed) until the new ones arrive */
.home-typeahead-item.loading {
  opacity: 0.6;
}
.home-typeahead-type {
  grid-template-columns: auto minmax(0, 1fr);
}
.home-typeahead-type.selected .home-typeahead-name {
  color: var(--home-green);
}
.home-typeahead-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 8px;
}
.home-typeahead-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  color: var(--home-muted);
}
.home-typeahead-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.9rem;
  color: var(--home-muted);
}
/* With badges: a fourth column for them */
.home-typeahead-item.has-badges {
  grid-template-columns: auto minmax(0, 0.9fr) minmax(0, 1.1fr) auto;
}
.home-typeahead-count {
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: var(--home-badge-neutral-bg);
  color: var(--home-badge-neutral-fg);
  font-size: 0.8rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
/* Germplasm: accession number (stronger) and name, taxonomy below, the checkbox at the right */
.home-typeahead-item.home-typeahead-germplasm {
  grid-template-columns: auto minmax(0, 1fr) auto auto;
}
/* A FAO WIEWS institute: code, name below, the flag at the right */
.home-typeahead-item.home-typeahead-institution {
  grid-template-columns: auto minmax(0, 1fr) auto;
}
.home-typeahead-institution-name {
  margin-top: 0.1rem;
  font-size: 0.85rem;
  color: var(--home-muted);
  overflow-wrap: anywhere;
}
.home-typeahead-flag {
  font-size: 1.15rem;
  border-radius: 2px;
}
.home-typeahead-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.home-typeahead-spin {
  animation: home-typeahead-spin 1s linear infinite;
}
@keyframes home-typeahead-spin {
  to {
    transform: rotate(360deg);
  }
}
/* Its group: a rounded badge in the colours of the crop (cp-crop-* of custom-page.css) */
.home-typeahead-group {
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0.15rem 0.6rem;
  border: 1px solid;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}
.home-typeahead-germplasm-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.home-typeahead-accession {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  column-gap: 0.6rem;
}
.home-typeahead-accenumb {
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--home-text);
  overflow-wrap: anywhere;
}
.home-typeahead-accename {
  color: var(--home-muted);
  overflow-wrap: anywhere;
}
.home-typeahead-taxonomy {
  margin-top: 0.1rem;
  font-size: 0.8rem;
  font-style: italic;
  color: var(--home-muted);
}
.home-typeahead-markbox {
  display: inline-flex;
  align-items: center;
  margin: 0;
  padding: 0.35rem;
  cursor: pointer;
}
.home-typeahead-markbox input {
  width: 1.05rem;
  height: 1.05rem;
  accent-color: var(--home-green);
  cursor: pointer;
}
/* PDCI range: two sliders on one track */
.home-typeahead-pdci {
  padding: 0.9rem 1.25rem 1rem;
}
.home-typeahead-pdci-values {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--home-muted);
}
.home-typeahead-pdci-values strong {
  color: var(--home-text);
  font-variant-numeric: tabular-nums;
}
.home-typeahead-pdci-sliders {
  position: relative;
  height: 2rem;
  margin-top: 0.4rem;
}
.home-typeahead-pdci-sliders::before,
.home-typeahead-pdci-track {
  content: '';
  position: absolute;
  top: 50%;
  height: 4px;
  margin-top: -2px;
  border-radius: 2px;
}
.home-typeahead-pdci-sliders::before {
  left: 0;
  right: 0;
  background: var(--home-border);
}
.home-typeahead-pdci-track {
  background: var(--home-green);
}
.home-typeahead-pdci-sliders input[type=range] {
  position: absolute;
  inset: 0;
  width: 100%;
  margin: 0;
  background: transparent;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
}
.home-typeahead-pdci-sliders input[type=range]::-webkit-slider-thumb {
  width: 18px;
  height: 18px;
  border: 2px solid var(--home-green);
  border-radius: 50%;
  background: var(--home-surface);
  pointer-events: auto;
  cursor: pointer;
  -webkit-appearance: none;
}
.home-typeahead-pdci-sliders input[type=range]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: 2px solid var(--home-green);
  border-radius: 50%;
  background: var(--home-surface);
  pointer-events: auto;
  cursor: pointer;
}
.home-typeahead-pdci-scale {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--home-muted);
  font-variant-numeric: tabular-nums;
}
/* Geofencing: the map in the results, above the locations found */
.home-geofence {
  border-bottom: 1px solid var(--home-border);
}
.home-geofence-hint {
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  color: var(--home-muted);
}
.home-geofence-map >>> .location-map {
  height: 340px !important;
}
/* Countries: the whole list, scrolled */
.home-typeahead-countries {
  max-height: 18rem;
  overflow-y: auto;
}
.home-typeahead-country {
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  padding-top: 0.55rem;
  padding-bottom: 0.55rem;
}
.home-typeahead-country.selected .home-typeahead-name {
  color: var(--home-green);
}
.home-typeahead-country-code {
  font-size: 0.8rem;
  color: var(--home-muted);
  font-variant-numeric: tabular-nums;
}
/* Kinds of data: icon, name, tick */
.home-typeahead-hasdata {
  grid-template-columns: auto minmax(0, 1fr) auto;
}
.home-typeahead-hasdata.selected .home-typeahead-name {
  color: var(--home-green);
}
/* Genus: icon, name (italics, cut when long), group, tick */
.home-typeahead-genus {
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  padding-top: 0.55rem;
  padding-bottom: 0.55rem;
}
.home-typeahead-genus-name {
  font-style: italic;
}
/* The genera of a species */
.home-typeahead-genera {
  display: inline-flex;
  gap: 0.3rem;
  max-width: 16rem;
  overflow: hidden;
}
.home-typeahead-genus.selected .home-typeahead-genus-name {
  color: var(--home-green);
}
.home-typeahead-check {
  color: var(--home-green);
}
.home-typeahead-check.hidden {
  visibility: hidden;
}
/* Country of a location: flag and code, without a background */
.home-typeahead-count.plain {
  background: transparent;
  color: var(--home-muted);
  padding-right: 0;
}
.home-typeahead-badges {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
/* A badge with an icon (data type): in its own colour */
.home-typeahead-count.typed {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.home-typeahead-count.matched {
  background: var(--home-badge-bg);
  color: var(--home-badge-fg);
}
/* State of a private or hidden dataset, before its name */
.home-typeahead-state {
  display: inline-flex;
  vertical-align: -0.1em;
  margin-right: 0.35rem;
  color: var(--home-muted);
}
/* The text found (or the marker count searched) */
.home-typeahead-mark {
  background: #fff176;
  color: #1f2120;
}
.home-typeahead-message {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--home-border);
  color: var(--home-muted);
  font-size: 0.9rem;
}
/* Nothing found: icon and a slightly larger text */
.home-typeahead-empty {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.05rem;
}
/* The "no results" illustration of the Search page, small, in its light green */
.home-typeahead-empty-icon {
  flex-shrink: 0;
  height: auto;
  color: #8aa886;
}
body.dark-mode .home-typeahead-empty-icon {
  color: #6f8f6b;
}
.home-typeahead-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.2rem 0.5rem;
}
.home-typeahead-page {
  display: inline-flex;
  padding: 0.2rem;
  border: none;
  background: transparent;
  color: var(--home-muted);
  cursor: pointer;
}
.home-typeahead-page:hover:not(:disabled) {
  color: var(--home-text);
}
.home-typeahead-page:disabled {
  opacity: 0.35;
  cursor: default;
}
.home-typeahead-pages {
  font-size: 0.8rem;
  color: var(--home-muted);
  font-variant-numeric: tabular-nums;
}

.home-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.9rem;
}
.home-chips-label {
  font-size: 0.85rem;
  color: var(--home-muted);
}
.home-chip {
  padding: 0.25rem 0.9rem;
  border: 1px solid var(--home-border);
  border-radius: 999px;
  background: var(--home-surface);
  font-size: 0.85rem;
  color: var(--home-text-subtle);
  cursor: pointer;
}
.home-chip.active {
  background: var(--home-green-soft);
  border-color: var(--home-green);
  color: var(--home-green);
}

</style>
