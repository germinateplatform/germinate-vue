<template>
  <div class="home">
    <!-- Hero -->
    <section class="home-hero">
      <div class="home-eyebrow"><span class="home-eyebrow-dot" /> Research data platform</div>
      <h1 class="home-title">Explore Crop Datasets</h1>
      <p class="home-lead">
        Browse and search experimental data, accessions, traits, and publications across
        five flagship crops. Built for plant researchers and breeders.
      </p>
    </section>

    <!-- Flagship crops -->
    <section class="home-section">
      <div class="home-section-header">
        <h2 class="home-section-title">Flagship crops</h2>
        <router-link :to="viewAllCropsLink" class="home-link">View all crops <MdiIcon :path="icons.arrow" /></router-link>
      </div>

      <div class="home-crops">
        <div v-for="crop in crops" :key="crop.key" :class="['home-crop-card', { disabled: isCropDisabled(crop) }]" :aria-disabled="isCropDisabled(crop)">
          <div :class="['home-crop-icon', `home-crop-${crop.key}`]"><MdiIcon :path="crop.icon" :size="26" /></div>
          <div class="home-crop-name">{{ crop.name }}</div>
          <div class="home-crop-count">{{ getCropCountText(crop) }}</div>
          <router-link v-if="getCropGroup(crop)" :to="getCropLink(crop)" :class="['home-crop-link', { disabled: isCropDisabled(crop) }]" :tabindex="isCropDisabled(crop) ? -1 : null">Explore <MdiIcon :path="icons.arrow" /></router-link>
          <span v-else :class="['home-crop-link', { disabled: cropGroups !== null }]">Explore <MdiIcon :path="icons.arrow" /></span>
        </div>
      </div>
    </section>

    <!-- Search -->
    <section class="home-search-section">
      <form class="home-search" @submit.prevent="onSearch">
        <span class="home-search-icon"><MdiIcon :path="icons.search" :size="20" /></span>
        <input type="search" class="home-search-input" v-model="searchTerm" aria-label="Search term" placeholder="Search datasets, accessions, traits, locations, pedigrees..." />
        <div class="home-search-select">
          <select v-model="searchScope" aria-label="Search scope">
            <option v-for="scope in searchScopes" :key="'search-scope-option-' + scope.value" :value="scope.value">{{ scope.text }}</option>
          </select>
          <MdiIcon :path="icons.chevronDown" :size="18" />
        </div>
        <button type="submit" class="home-search-button" :disabled="!searchTerm || !searchTerm.trim()"><MdiIcon :path="icons.search" :size="18" /> Search</button>
      </form>

      <div class="home-chips">
        <span class="home-chips-label">Search within:</span>
        <button type="button"
                v-for="scope in searchScopes"
                :key="'search-scope-chip-' + scope.value"
                :class="['home-chip', { active: searchScope === scope.value }]"
                :aria-pressed="searchScope === scope.value"
                @click="searchScope = scope.value">
          {{ scope.text }}
        </button>
      </div>
    </section>

    <!-- Stats -->
    <section class="home-stats">
      <div v-for="total in totalTypes" :key="'stat-' + total.key" :class="['home-stat', { disabled: isTotalEmpty(total.key) }]" :aria-disabled="isTotalEmpty(total.key)">
        <span class="home-stat-icon"><MdiIcon :path="total.icon" :size="20" /></span>
        <div>
          <div class="home-stat-value">{{ getTotalText(total.key) }}</div>
          <div class="home-stat-label">{{ pluralise(totals[total.key], total.label) }}</div>
        </div>
      </div>
    </section>

    <!-- Recent publications and latest news + Quick access -->
    <section :class="['home-panels', { 'home-panels-single': !showMainColumn }]">
      <div class="home-main" v-if="showMainColumn">
        <!-- Hidden when "Publications" is not a visible dashboard section in the Germinate settings, or when there are none -->
        <div class="home-panel" v-if="showPublicationPanel">
          <div class="home-panel-header">
            <h3 class="home-panel-title">Recent publications</h3>
            <router-link :to="{ name: Pages.publications }"
                         :class="['home-link', 'home-link-small', { disabled: isTotalEmpty('publications') }]"
                         :tabindex="isTotalEmpty('publications') ? -1 : null">View all <MdiIcon :path="icons.arrow" /></router-link>
          </div>

          <div class="home-recent-item" v-for="publication in recentPublications" :key="'recent-publication-' + publication.id">
            <!-- Opens the DOI in a new window -->
            <a v-if="publication.url" :href="publication.url" target="_blank" rel="noopener noreferrer" class="home-recent-icon home-recent-link" :title="publication.url">
              <MdiIcon :path="icons.openInNew" :size="16" />
            </a>
            <span v-else class="home-recent-icon home-recent-link disabled"><MdiIcon :path="icons.openInNew" :size="16" /></span>
            <div class="home-recent-body">
              <div class="home-recent-title" :title="publication.title">{{ publication.title }}</div>
              <div class="home-recent-meta" v-if="publication.journal">{{ publication.journal }}</div>
              <!-- Takes the publication off the home page: removes its links to the database and to accessions -->
              <b-button v-if="canAddContent" variant="link" class="home-recent-delete text-danger" @click="deleteRecentPublication(publication)">{{ $t('buttonDelete') }}</b-button>
            </div>
            <div class="home-recent-side">
              <span class="home-badge home-badge-source">{{ publication.source }}</span>
              <span class="home-recent-date">{{ publication.date }}</span>
            </div>
          </div>
        </div>

        <!-- Hidden when "News" is not a visible dashboard section in the Germinate settings, or when there are none. "Related project" news are not part of it. -->
        <div class="home-panel" v-if="showNewsPanel">
          <div class="home-panel-header">
            <div class="home-panel-heading">
              <h3 class="home-panel-title">Latest news</h3>
              <span class="home-count-badge" :title="newsTotal + ' ' + pluralise(newsTotal, ['news item', 'news items'])">{{ newsTotal.toLocaleString() }}</span>
            </div>
            <div class="home-pager" v-if="newsPageCount > 1">
              <button type="button" class="home-pager-button" :disabled="newsPage <= 1" @click="loadNews(newsPage - 1)" aria-label="Previous news">
                <MdiIcon :path="icons.chevronLeft" :size="22" />
              </button>
              <button type="button" class="home-pager-button" :disabled="newsPage >= newsPageCount" @click="loadNews(newsPage + 1)" aria-label="Next news">
                <MdiIcon :path="icons.chevronRight" :size="22" />
              </button>
            </div>
          </div>

          <button type="button" class="home-recent-item home-news-item" v-for="newsItem in news" :key="'news-' + newsItem.newsId" @click="showNewsDetails(newsItem)">
            <span :class="['home-recent-icon', 'home-recent-link', 'home-news-icon-' + getNewsType(newsItem).key]"><MdiIcon :path="getNewsType(newsItem).icon" :size="16" /></span>
            <div class="home-recent-body">
              <div class="home-news-head">
                <div class="home-recent-title" :title="newsItem.newsTitle">{{ newsItem.newsTitle }}</div>
                <span class="home-recent-date home-news-date" v-if="newsItem.createdOn" :title="formatDate(newsItem.createdOn)"><MdiIcon :path="icons.calendarClock" :size="13" /> {{ formatTimeAgo(newsItem.createdOn) }}</span>
              </div>
              <div class="home-recent-meta"><span :class="['home-badge', 'home-news-badge-' + getNewsType(newsItem).key]">{{ $t(getNewsType(newsItem).i18n) }}</span></div>
            </div>
          </button>

          <!-- News details, same as on the original home page -->
          <b-modal ref="newsModal" :title="selectedNews ? selectedNews.newsTitle : ''" scrollable size="xl" ok-only :ok-title="$t('buttonClose')">
            <template v-if="selectedNews">
              <div v-html="selectedNews.newsContent" />
              <b-button-group class="mt-3">
                <b-button v-if="selectedNews.newsHyperlink && selectedNews.newsHyperlink.lastIndexOf('#', 0) !== 0" :href="selectedNews.newsHyperlink" target="_blank" rel="noopener noreferrer">{{ $t('pageNewsReadMore') }} <MdiIcon :path="icons.openInNew" /></b-button>
                <b-button v-if="canAddContent" @click="deleteNewsItem(selectedNews.newsId)" variant="danger"><MdiIcon :path="icons.delete" /> {{ $t('buttonDelete') }}</b-button>
              </b-button-group>
            </template>
          </b-modal>
        </div>
      </div>

      <div class="home-side">
        <div class="home-panel">
          <div class="home-panel-header">
            <h3 class="home-panel-title">Quick access</h3>
          </div>

          <router-link v-for="total in totalTypes"
                       :key="'quick-' + total.key"
                       :to="{ name: total.quick.page }"
                       :class="['home-quick-item', { disabled: isTotalEmpty(total.key) }]"
                       :aria-disabled="isTotalEmpty(total.key)"
                       :tabindex="isTotalEmpty(total.key) ? -1 : null">
            <span class="home-stat-icon"><MdiIcon :path="total.quick.icon || total.icon" :size="18" /></span>
            <span class="home-quick-label">{{ total.quick.label }}</span>
            <span class="home-quick-count">{{ getTotalText(total.key) }}<template v-if="total.quick.unit && totals[total.key] !== null"> {{ pluralise(totals[total.key], total.quick.unit) }}</template></span>
            <span class="home-quick-chevron"><MdiIcon :path="icons.chevronRight" :size="20" /></span>
          </router-link>
        </div>

        <!-- Add content. Only for data curators and above, same as the add buttons on the original home page. -->
        <div class="home-panel" v-if="canAddContent">
          <div class="home-panel-header">
            <h3 class="home-panel-title">Add</h3>
          </div>

          <div class="home-add-actions">
            <button type="button" class="home-add-action" @click="$refs.addPublicationModal.show()" v-if="showPublicationSection">
              <span class="home-stat-icon"><MdiIcon :path="icons.publication" :size="18" /></span>
              <span>Publication</span>
            </button>
            <button type="button" class="home-add-action" @click="$refs.addStoryModal.show()" v-if="showDataStorySection">
              <span class="home-stat-icon"><MdiIcon :path="icons.addStory" :size="18" /></span>
              <span>Data story</span>
            </button>
            <button type="button" class="home-add-action" @click="$refs.addNewsModal.show()">
              <span class="home-stat-icon"><MdiIcon :path="icons.addNews" :size="18" /></span>
              <span>News item</span>
            </button>
          </div>

          <AddPublicationModal ref="addPublicationModal" @publication-added="onPublicationAdded" />
          <AddStoryModal ref="addStoryModal" />
          <AddNewsModal ref="addNewsModal" @news-added="loadNews(1)" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import AddPublicationModal from '@/components/modals/AddPublicationModal'
import AddStoryModal from '@/components/modals/AddStoryModal'
import AddNewsModal from '@/components/modals/AddNewsModal'

import { mdiArrowRight, mdiMagnify, mdiChevronDown, mdiChevronRight, mdiDatabase, mdiSprout, mdiMapMarkerOutline, mdiTagOutline, mdiBookOpenVariant, mdiMapOutline, mdiWeatherSnowyRainy, mdiCommentPlusOutline, mdiNewBox, mdiOpenInNew, mdiChevronLeft, mdiCalendarClock, mdiDelete, mdiRefresh, mdiNewspaper } from '@mdi/js'
import { Pages } from '@/mixins/pages'
import { FLAGSHIP_CROPS } from '@/mixins/crops'
import { apiPostGroupTable } from '@/mixins/api/group'
import { apiPostGermplasmTable } from '@/mixins/api/germplasm'
import { apiPostPublicationsTable, apiPostNewsTable, apiDeleteNews, apiDeletePublicationReference } from '@/mixins/api/misc'
import { apiPostLocationTable } from '@/mixins/api/location'
import { apiPostDatasetTable } from '@/mixins/api/dataset'
import { apiPostTraitTable } from '@/mixins/api/trait'
import { apiPostClimateTable } from '@/mixins/api/climate'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'
import { userIsAtLeast, USER_TYPE_DATA_CURATOR } from '@/mixins/api/auth'

const emitter = require('tiny-emitter/instance')

const NEWS_PER_PAGE = 5

// News types shown in "Latest news". "Projects" (related projects) are handled separately.
const NEWS_TYPES = {
  Data: { key: 'data', icon: mdiDatabase, i18n: 'widgetNewsTypeDataChanges' },
  Updates: { key: 'updates', icon: mdiRefresh, i18n: 'widgetNewsTypeGeneralUpdates' },
  General: { key: 'general', icon: mdiNewspaper, i18n: 'widgetNewsTypeGeneralNews' }
}

// Used to turn a date into "20 seconds ago", "3 hours ago", ...
const TIME_DIVISIONS = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' }
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "12 Jan 2023"
const formatDate = value => {
  const date = value ? new Date(value) : null

  if (!date || isNaN(date.getTime())) {
    return ''
  }

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

// CSL fields can be a plain value or a list, and titles can contain markup like <i>
const getCslText = value => {
  const text = Array.isArray(value) ? value[0] : value
  return text ? `${text}`.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null
}

// Flattens a publication from the API, reading the citation details from its "publicationFallbackCache" JSON
const toRecentPublication = publication => {
  let cache = {}

  try {
    cache = publication.publicationFallbackCache ? JSON.parse(publication.publicationFallbackCache) : {}
  } catch (e) {
    cache = {}
  }

  const doi = publication.publicationDoi
  let url = cache.URL || null

  if (doi) {
    url = doi.startsWith('http') ? doi : `https://doi.org/${doi}`
  }

  return {
    id: publication.publicationId,
    // Accessions the publication is linked to, removed together with it from the home page
    germplasmIds: publication.germplasmIds || [],
    title: getCslText(cache.title) || doi,
    journal: getCslText(cache['container-title']),
    source: cache.source || 'N/A',
    url: url,
    date: formatDate(publication.createdOn)
  }
}

// Germplasm groups represent the crops
const cropGroupFilter = [{
  column: 'groupType',
  operator: 'and',
  comparator: 'equals',
  values: ['germinatebase']
}]

// Asks a table endpoint for a single row and resolves with the total number of rows, which comes back in "count"
const fetchTotal = (apiCall, filter = null) => new Promise(resolve => {
  const query = {
    page: 1,
    limit: 1,
    prevCount: -1
  }

  if (filter) {
    query.filter = filter
  }

  apiCall(query, result => resolve((result && result.count) || 0))
})

// Publications linked to the database, which are the ones the home page shows
const databasePublicationFilter = [{
  column: 'isDatabasePub',
  comparator: 'equals',
  operator: 'and',
  values: [1]
}]

const isExternalFilter = isExternal => [{
  column: 'isExternal',
  comparator: 'equals',
  operator: 'and',
  values: [isExternal]
}]

// Totals shown in the statistics and in the quick access panel, in display order.
// "label" and "quick.unit" are [singular, plural]. "quick.icon" overrides the icon in the quick access panel.
const TOTALS = [{
  key: 'datasets',
  icon: mdiDatabase,
  label: ['Dataset', 'Datasets'],
  quick: { label: 'Browse all datasets', page: Pages.datasets },
  // Same as the datasets page: internal and external datasets are queried separately and summed up
  load: () => Promise.all([0, 1].map(isExternal => fetchTotal(apiPostDatasetTable, isExternalFilter(isExternal))))
    .then(counts => counts.reduce((a, b) => a + b, 0))
}, {
  key: 'accessions',
  icon: mdiSprout,
  label: ['Accession', 'Accessions'],
  quick: { label: 'Accession library', page: Pages.germplasm },
  load: () => fetchTotal(apiPostGermplasmTable)
}, {
  key: 'locations',
  icon: mdiMapMarkerOutline,
  label: ['Location', 'Locations'],
  quick: { label: 'Explore by location', page: Pages.locations, icon: mdiMapOutline, unit: ['site', 'sites'] },
  load: () => fetchTotal(apiPostLocationTable)
}, {
  key: 'traits',
  icon: mdiTagOutline,
  label: ['Trait measured', 'Traits measured'],
  quick: { label: 'Trait ontology browser', page: Pages.traits },
  load: () => fetchTotal(apiPostTraitTable)
}, {
  key: 'climates',
  icon: mdiWeatherSnowyRainy,
  label: ['Climate', 'Climates'],
  quick: { label: 'Climate data', page: Pages.climates },
  load: () => fetchTotal(apiPostClimateTable)
}, {
  key: 'publications',
  icon: mdiBookOpenVariant,
  label: ['Publication', 'Publications'],
  quick: { label: 'Publications index', page: Pages.publications },
  // Same publications as the "Recent publications" list: the ones linked to the database
  load: () => fetchTotal(apiPostPublicationsTable, databasePublicationFilter)
}]

export default {
  components: {
    MdiIcon,
    AddPublicationModal,
    AddStoryModal,
    AddNewsModal
  },
  data: function () {
    return {
      // Flagship crops. "groupName" is the name of the matching germplasm group in Germinate.
      crops: FLAGSHIP_CROPS,
      // Germplasm groups (with their member count), keyed by lower-case group name. Null until loaded.
      cropGroups: null,
      // Latest publications for the "Recent publications" panel. Null until loaded.
      recentPublications: null,
      // Current page of "Latest news". Null until loaded.
      news: null,
      newsTotal: 0,
      newsPage: 1,
      selectedNews: null,
      Pages,
      totalTypes: TOTALS,
      // Loaded totals, keyed by TOTALS key. Null until loaded.
      totals: TOTALS.reduce((result, total) => ({ ...result, [total.key]: null }), {}),
      searchTerm: null,
      // Where to search. Shared by the dropdown and the "Search within" chips so both always show the same selection.
      // Values are the "searchType" of the Germinate search page, "all" searches everything.
      searchScope: 'all',
      searchScopes: [
        { value: 'all', text: 'All' },
        { value: 'datasets', text: 'Datasets' },
        { value: 'germplasm', text: 'Accessions' },
        { value: 'trials', text: 'Traits' },
        { value: 'locations', text: 'Locations' },
        { value: 'pedigrees', text: 'Pedigrees' }
      ],
      // Icon paths used directly in the template
      icons: {
        arrow: mdiArrowRight,
        search: mdiMagnify,
        chevronDown: mdiChevronDown,
        chevronRight: mdiChevronRight,
        openInNew: mdiOpenInNew,
        chevronLeft: mdiChevronLeft,
        calendarClock: mdiCalendarClock,
        delete: mdiDelete,
        publication: mdiBookOpenVariant,
        addStory: mdiCommentPlusOutline,
        addNews: mdiNewBox
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeLocale',
      'storeServerSettings',
      'storeToken'
    ]),
    // Same rules as the original home page: sections follow "Visible dashboard sections" in the Germinate settings
    showPublicationSection: function () {
      return this.isDashboardSectionVisible('publications')
    },
    showDataStorySection: function () {
      return this.isDashboardSectionVisible('datastories')
    },
    showNewsSection: function () {
      return this.isDashboardSectionVisible('news')
    },
    // Panels only show when their section is enabled and they have content
    showPublicationPanel: function () {
      return this.showPublicationSection && !!this.recentPublications && this.recentPublications.length > 0
    },
    showNewsPanel: function () {
      return this.showNewsSection && !!this.news && this.news.length > 0
    },
    // Still waiting for publications or news: keep the column so the layout does not jump once they arrive
    mainColumnLoading: function () {
      return (this.showPublicationSection && this.recentPublications === null) || (this.showNewsSection && this.news === null)
    },
    showMainColumn: function () {
      return this.showPublicationPanel || this.showNewsPanel || this.mainColumnLoading
    },
    newsPageCount: function () {
      return Math.ceil(this.newsTotal / NEWS_PER_PAGE)
    },
    timeFormatter: function () {
      return new Intl.RelativeTimeFormat((this.storeLocale || 'en_GB').split('_')[0], { numeric: 'always' })
    },
    // Adding publications, data stories and news requires at least data curator rights
    canAddContent: function () {
      return !!this.storeToken && userIsAtLeast(this.storeToken.userType, USER_TYPE_DATA_CURATOR)
    },
    // Groups page filtered to germplasm groups, i.e. the crops
    viewAllCropsLink: function () {
      return {
        name: Pages.groups,
        query: {
          'groups-filter': JSON.stringify(cropGroupFilter)
        }
      }
    }
  },
  watch: {
    // The server settings can arrive after the page was mounted
    showPublicationSection: function (newValue) {
      if (newValue && this.recentPublications === null) {
        this.loadRecentPublications()
      }
    },
    showNewsSection: function (newValue) {
      if (newValue && this.news === null) {
        this.loadNews(1)
      }
    }
  },
  methods: {
    // Everything is visible when the server does not restrict the dashboard sections
    isDashboardSectionVisible: function (section) {
      if (this.storeServerSettings && this.storeServerSettings.dashboardSections) {
        return this.storeServerSettings.dashboardSections.includes(section)
      } else {
        return true
      }
    },
    // Picks the singular or plural form from [singular, plural]
    pluralise: function (count, forms) {
      return count === 1 ? forms[0] : forms[1]
    },
    getTotalText: function (key) {
      const count = this.totals[key]
      return count === null ? '…' : count.toLocaleString()
    },
    // Totals of zero disable their statistic and quick access entry
    isTotalEmpty: function (key) {
      return this.totals[key] === 0
    },
    loadTotal: function (key) {
      const total = TOTALS.find(t => t.key === key)

      total.load().then(count => {
        this.totals[total.key] = count
      })
    },
    loadTotals: function () {
      TOTALS.forEach(total => this.loadTotal(total.key))
    },
    getCropGroup: function (crop) {
      return this.cropGroups ? this.cropGroups[crop.groupName.toLowerCase()] : null
    },
    getCropCount: function (crop) {
      if (this.cropGroups === null) {
        return null
      }

      const group = this.getCropGroup(crop)
      return group ? (group.count || 0) : 0
    },
    // Group details page, scrolled to the group members (the accessions)
    getCropLink: function (crop) {
      const group = this.getCropGroup(crop)

      return {
        name: Pages.groupDetails,
        params: { groupId: group.groupId },
        hash: '#group-members'
      }
    },
    getCropCountText: function (crop) {
      const count = this.getCropCount(crop)

      if (count === null) {
        return '…'
      }

      return `${count.toLocaleString()} ${this.pluralise(count, ['accession', 'accessions'])}`
    },
    // Crops without accessions (or without a matching group) are disabled once the counts are loaded
    isCropDisabled: function (crop) {
      return this.getCropCount(crop) === 0
    },
    formatDate,
    getNewsType: function (newsItem) {
      return NEWS_TYPES[newsItem.newstypeName] || NEWS_TYPES.General
    },
    formatTimeAgo: function (date) {
      let duration = (new Date(date) - new Date()) / 1000

      for (let i = 0; i < TIME_DIVISIONS.length; i++) {
        const division = TIME_DIVISIONS[i]
        if (Math.abs(duration) < division.amount) {
          return this.timeFormatter.format(Math.round(duration), division.name)
        }
        duration /= division.amount
      }
    },
    loadNews: function (page) {
      const query = {
        page: page,
        limit: NEWS_PER_PAGE,
        prevCount: -1,
        orderBy: 'createdOn',
        ascending: 0,
        filter: [{
          column: 'newstypeName',
          comparator: 'inSet',
          operator: 'and',
          values: Object.keys(NEWS_TYPES)
        }]
      }

      apiPostNewsTable(query, result => {
        this.news = (result && result.data) ? result.data : []
        this.newsTotal = (result && result.count) || 0
        this.newsPage = page

        // The last item of the last page was deleted: go back one page
        if (this.news.length === 0 && page > 1) {
          this.loadNews(page - 1)
        }
      })
    },
    showNewsDetails: function (newsItem) {
      this.selectedNews = JSON.parse(JSON.stringify(newsItem))
      this.$nextTick(() => this.$refs.newsModal.show())
    },
    deleteNewsItem: function (id) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            apiDeleteNews(id, result => {
              if (result) {
                this.$refs.newsModal.hide()
                this.loadNews(this.newsPage)
              }
            })
          }
        })
    },
    // Opens the Germinate search page: /search/{term}, plus ?searchType={scope} unless searching everything
    onSearch: function () {
      const term = this.searchTerm ? this.searchTerm.trim() : ''

      if (term === '') {
        return
      }

      this.$router.push({
        name: Pages.searchQuery,
        params: { searchTerm: term },
        query: this.searchScope === 'all' ? {} : { searchType: this.searchScope }
      })
    },
    // Publications linked to the database, like the publications section of the original home page
    loadRecentPublications: function () {
      const query = {
        page: 1,
        limit: 5,
        orderBy: 'createdOn',
        ascending: 0,
        filter: databasePublicationFilter
      }

      apiPostPublicationsTable(query, result => {
        this.recentPublications = (result && result.data) ? result.data.map(toRecentPublication) : []
      })
    },
    // Germinate cannot delete a publication itself, so this removes its links to the database (which takes it off this
    // list) and to accessions. Links to datasets, groups and experiments are not known here and are kept.
    deleteRecentPublication: function (publication) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (!value) {
            return
          }

          const references = [
            ['database', null],
            ...publication.germplasmIds.map(id => ['germplasm', id])
          ]

          Promise.all(references.map(([type, id]) => new Promise(resolve => {
            apiDeletePublicationReference(publication.id, type, id, resolve, { codes: [], callback: resolve })
          }))).then(() => {
            this.loadTotal('publications')
            this.loadRecentPublications()
            // The sidebar badges count publications too
            emitter.emit('update-sidebar-menu')
          })
        })
    },
    // A publication added from the "Add" panel shows up in the total and in the recent list
    onPublicationAdded: function () {
      this.loadTotal('publications')
      this.loadRecentPublications()
      emitter.emit('update-sidebar-menu')
    },
    loadCropGroups: function () {
      const query = {
        page: 1,
        limit: MAX_JAVA_INTEGER,
        filter: cropGroupFilter
      }

      apiPostGroupTable(query, result => {
        const groups = {}

        if (result && result.data) {
          result.data.forEach(group => {
            groups[group.groupName.toLowerCase()] = group
          })
        }

        this.cropGroups = groups
      })
    }
  },
  mounted: function () {
    this.loadCropGroups()
    this.loadTotals()
    if (this.showPublicationSection) {
      this.loadRecentPublications()
    }
    if (this.showNewsSection) {
      this.loadNews(1)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

/* Light palette. Every colour used on the page is a token here and is redefined for dark mode below. */
.home {
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

  max-width: 1240px;
  margin: 0 auto;
  padding: 0.5rem 0 3rem;
  font-family: 'DM Sans', -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--home-text);
}

.home a {
  text-decoration: none;
}

/* Dark palette, aligned with src/assets/dark-mode.scss (page background rgb(24, 26, 27), borders rgb(62, 67, 70)) */
body.dark-mode .home {
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

/* Hero */
.home-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--home-muted);
}
.home-eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--home-dot);
}
.home-title {
  font-size: 2.9rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  margin: 0.75rem 0 1rem;
}
.home-lead {
  max-width: 780px;
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--home-muted);
  margin: 0;
}

/* Sections */
.home-section {
  margin-top: 3.5rem;
}
.home-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}
.home-section-title {
  font-size: 1.6rem;
  font-weight: 500;
  margin: 0;
}
.home-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 500;
  color: var(--home-green);
}
.home-link:hover {
  color: var(--home-green-hover);
}
.home-link-small {
  font-size: 0.85rem;
}

/* Crops */
.home-crops {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.25rem;
}
.home-crop-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.75rem 1rem;
  background: var(--home-surface);
  border: 1px solid var(--home-border);
  border-radius: 12px;
  transition: box-shadow 0.15s, transform 0.15s;
}
.home-crop-card:hover {
  box-shadow: 0 6px 20px var(--home-shadow);
  transform: translateY(-2px);
}
.home-crop-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid;
}
.home-crop-name {
  font-size: 1.3rem;
  font-weight: 500;
  margin-top: 1.1rem;
}
.home-crop-count {
  font-size: 0.85rem;
  color: var(--home-muted);
  margin-top: 0.3rem;
}
.home-crop-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 1.1rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--home-green);
}

/* Crop without accessions: the card and everything inside it is greyed out and not interactive */
.home-crop-card.disabled {
  opacity: 0.5;
  filter: grayscale(1);
  cursor: not-allowed;
}
.home-crop-card.disabled:hover {
  box-shadow: none;
  transform: none;
}
.home-crop-link.disabled {
  pointer-events: none;
}

.home-crop-wheat { background: var(--home-wheat-bg); border-color: var(--home-wheat-border); color: var(--home-wheat-fg); }
.home-crop-barley { background: var(--home-barley-bg); border-color: var(--home-barley-border); color: var(--home-barley-fg); }
.home-crop-pea { background: var(--home-pea-bg); border-color: var(--home-pea-border); color: var(--home-pea-fg); }
.home-crop-lettuce { background: var(--home-lettuce-bg); border-color: var(--home-lettuce-border); color: var(--home-lettuce-fg); }
.home-crop-brassica { background: var(--home-brassica-bg); border-color: var(--home-brassica-border); color: var(--home-brassica-fg); }

/* Search */
.home-search-section {
  margin-top: 2.5rem;
}
.home-search {
  display: flex;
  align-items: stretch;
  height: 64px;
  background: var(--home-surface);
  border: 1px solid var(--home-border);
  border-radius: 10px;
  overflow: hidden;
}
.home-search-icon {
  display: flex;
  align-items: center;
  padding: 0 0.5rem 0 1.4rem;
  color: var(--home-muted);
}
.home-search-input {
  flex: 1;
  min-width: 0;
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
.home-search-select {
  position: relative;
  display: flex;
  align-items: center;
  border-left: 1px solid var(--home-border);
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
  padding: 0 2rem;
  border: none;
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

/* Stats */
.home-stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  margin-top: 2.75rem;
  background: var(--home-surface);
  border: 1px solid var(--home-border);
  border-radius: 12px;
}
.home-stat {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1.4rem 1.5rem;
}
.home-stat + .home-stat {
  border-left: 1px solid var(--home-border);
}
.home-stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--home-green-soft);
  color: var(--home-green);
}
.home-stat-value {
  font-size: 1.3rem;
  font-weight: 500;
  line-height: 1.2;
}
.home-stat-label {
  font-size: 0.85rem;
  color: var(--home-muted);
}

/* Statistic without data: icon and content greyed out */
.home-stat.disabled {
  opacity: 0.5;
  filter: grayscale(1);
  cursor: not-allowed;
}

/* Panels */
.home-side {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}
/* Buttons share the row equally, however many of them are visible */
.home-add-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem 1.75rem;
}
.home-add-action {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  border: 1px solid var(--home-border);
  border-radius: 10px;
  background: var(--home-surface);
  color: var(--home-text);
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.home-add-action:hover {
  background: var(--home-surface-hover);
  border-color: var(--home-green);
}
.home-panels {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.75rem;
  margin-top: 2.75rem;
  align-items: start;
}
/* Without the publications panel the side column takes the full width */
.home-panels-single {
  grid-template-columns: 1fr;
}
.home-panel {
  background: var(--home-surface);
  border: 1px solid var(--home-border);
  border-radius: 12px;
  overflow: hidden;
}
.home-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.4rem 1.75rem;
  border-bottom: 1px solid var(--home-border);
}
.home-panel-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

.home-recent-item {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  padding: 1.1rem 1.75rem;
}
.home-recent-item + .home-recent-item {
  border-top: 1px solid var(--home-border);
}
.home-recent-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
.home-recent-body {
  flex: 1;
  min-width: 0;
}
.home-recent-title {
  font-size: 0.98rem;
  color: var(--home-text);
  /* Long titles are cut with "..." (the full title is in the tooltip) */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.home-recent-delete {
  padding: 0;
  margin-top: 0.2rem;
  border: none;
  font-size: 0.82rem;
  line-height: 1.3;
}
.home-recent-meta {
  margin-top: 0.2rem;
  font-size: 0.82rem;
  color: var(--home-muted);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.home-recent-link {
  background: var(--home-neutral-bg);
  color: var(--home-muted);
  transition: color 0.15s;
}
.home-recent-link:hover {
  color: var(--home-text);
}
.home-recent-link.disabled {
  opacity: 0.5;
}
/* Left column: publications and news stacked */
.home-main {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  min-width: 0;
}

/* News rows are buttons that open the details */
.home-news-item {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  font: inherit;
  cursor: pointer;
}
.home-news-item + .home-news-item {
  border-top: 1px solid var(--home-border);
}
.home-news-item:hover {
  background: var(--home-surface-hover);
}
.home-news-item:hover .home-recent-link {
  color: var(--home-text);
}
.home-news-item .home-recent-meta {
  margin-top: 0.35rem;
}
/* Title (cut with "...") and date share the first line */
.home-news-head {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  min-width: 0;
}
.home-news-head .home-recent-title {
  flex: 1 1 auto;
  min-width: 0;
}
.home-news-date {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  white-space: nowrap;
}
/* Icon colours per news type (general news keeps the neutral grey) */
.home-news-icon-updates,
.home-news-item:hover .home-news-icon-updates {
  background: var(--home-news-updates-bg);
  color: var(--home-news-updates-fg);
}
.home-news-icon-data,
.home-news-item:hover .home-news-icon-data {
  background: var(--home-news-data-bg);
  color: var(--home-news-data-fg);
}

/* Title with a count next to it, same look as the active "Search within" chip */
.home-panel-heading {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}
.home-count-badge {
  padding: 0.05rem 0.6rem;
  border: 1px solid var(--home-green);
  border-radius: 999px;
  background: var(--home-green-soft);
  color: var(--home-green);
  font-size: 0.8rem;
  font-weight: 500;
}

/* Previous / next chevrons in the panel header */
.home-pager {
  display: flex;
  gap: 0.25rem;
}
.home-pager-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--home-text);
  cursor: pointer;
}
.home-pager-button:hover:not(:disabled) {
  background: var(--home-surface-hover);
}
.home-pager-button:disabled {
  color: var(--home-muted);
  opacity: 0.4;
  cursor: not-allowed;
}
.home-link.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.home-recent-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  gap: 0.35rem;
}
.home-recent-date {
  font-size: 0.82rem;
  color: var(--home-muted);
}
.home-badge {
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 500;
}
.home-badge-source { background: var(--home-badge-bg); color: var(--home-badge-fg); }
/* News type badges use the same colours as their icon */
.home-news-badge-general { background: var(--home-badge-neutral-bg); color: var(--home-badge-neutral-fg); }
.home-news-badge-updates { background: var(--home-news-updates-bg); color: var(--home-news-updates-fg); }
.home-news-badge-data { background: var(--home-news-data-bg); color: var(--home-news-data-fg); }

.home-quick-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.75rem;
  color: var(--home-text);
}
.home-quick-item + .home-quick-item {
  border-top: 1px solid var(--home-border);
}
.home-quick-item.disabled {
  opacity: 0.5;
  filter: grayscale(1);
  pointer-events: none;
}
.home-quick-item:hover {
  background: var(--home-surface-hover);
  color: var(--home-text);
}
.home-quick-label {
  flex: 1;
  font-size: 0.98rem;
}
.home-quick-count {
  font-size: 0.85rem;
  color: var(--home-muted);
}
.home-quick-chevron {
  color: var(--home-text-subtle);
}

/* Responsive */
@media (max-width: 1199px) {
  .home-crops {
    grid-template-columns: repeat(3, 1fr);
  }
  .home-stats {
    grid-template-columns: repeat(3, 1fr);
  }
  .home-stat:nth-child(4) {
    border-left: none;
  }
  .home-stat:nth-child(n + 4) {
    border-top: 1px solid var(--home-border);
  }
}
@media (max-width: 991px) {
  .home-panels {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 767px) {
  .home-title {
    font-size: 2.1rem;
  }
  .home-lead {
    font-size: 1.05rem;
  }
  .home-crops {
    grid-template-columns: repeat(2, 1fr);
  }
  .home-stats {
    grid-template-columns: 1fr;
  }
  .home-stat + .home-stat {
    border-left: none;
    border-top: 1px solid var(--home-border);
  }
  .home-search {
    flex-wrap: wrap;
    height: auto;
  }
  .home-search-input {
    height: 56px;
  }
  .home-search-select {
    height: 48px;
    flex: 1;
    border-left: none;
    border-top: 1px solid var(--home-border);
  }
  .home-search-button {
    height: 48px;
    justify-content: center;
  }
  .home-recent-item {
    flex-wrap: wrap;
  }
  .home-recent-side {
    flex-direction: row;
    align-items: center;
    width: 100%;
    padding-left: calc(32px + 1.1rem);
  }
}
</style>
