import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import { setOptions, bootstrap } from 'vue-gtag'

Vue.use(Vuex)

const localStorage = window.localStorage

let name = process.env.VUE_APP_INSTANCE_NAME

if (!name) {
  name = 'germinate-' + window.location.pathname
}

const essentialKeys = ['token', 'locale', 'baseUrl', 'serverSettings', 'asyncJobUuids', 'asyncJobCount', 'markedIds', 'cookiesAccepted', 'selectedProjects']
const userState = {
  appState: 'production',
  uniqueClientId: null,
  locale: 'en_GB',
  tablePerPage: 10,
  originalTarget: null,
  helpKey: null,
  entityTypeStats: [{
    Accession: {
      count: 0
    },
    'Plant/Plot': {
      count: 0
    },
    Sample: {
      count: 0
    }
  }],
  sidebarState: 'sidebar-lg-show',
  asyncSidebarTabIndex: 0,
  mapLayer: 'theme',
  markedIds: {
    germplasm: [],
    markers: [],
    locations: []
  },
  recentIds: {
    germplasm: [],
    markers: []
  },
  hiddenColumns: {
    germplasm: [],
    germplasmAttributes: [],
    images: [],
    climates: [],
    climateData: [],
    comments: [],
    fileresources: [],
    maps: [],
    markers: [],
    mapDefinitions: [],
    datasets: [],
    datasetAttributes: [],
    experiments: [],
    entities: [],
    groups: [],
    institutions: [],
    institutiondatasets: [],
    locations: [],
    pedigrees: [],
    pedigreedefinitions: [],
    traits: [],
    traitAttributes: [],
    trialsData: [],
    collaborators: [],
    publications: [],
    projects: []
  },
  asyncJobUuids: [],
  asyncJobCount: 0,
  cookiesAccepted: null,
  customChartColors: null,
  darkMode: false,
  changelogVersionNumber: null,
  activeStory: null,
  selectedProjects: []
}

const storeState = {
  state: {
    token: null,
    serverSettings: null,
    baseUrl: null,
    userStates: {
      null: JSON.parse(JSON.stringify(userState))
    }
  },
  getters: {
    storeUserId: (state) => state.token ? state.token.id : null,
    storeCookiesAccepted: (state, getters) => state.userStates[getters.storeUserId].cookiesAccepted,
    storeDarkMode: (state, getters) => state.userStates[getters.storeUserId].darkMode,
    storeMarkedIds: (state, getters) => state.userStates[getters.storeUserId].markedIds,
    storeMarkedGermplasm: (state, getters) => state.userStates[getters.storeUserId].markedIds.germplasm,
    storeMarkedMarkers: (state, getters) => state.userStates[getters.storeUserId].markedIds.markers,
    storeMarkedLocations: (state, getters) => state.userStates[getters.storeUserId].markedIds.locations,
    storeToken: (state) => state.token,
    storeBaseUrl: (state) => state.baseUrl,
    storeHelpKey: (state, getters) => state.userStates[getters.storeUserId].helpKey,
    storeServerSettings: (state) => state.serverSettings,
    storeLocale: (state, getters) => state.userStates[getters.storeUserId].locale,
    storeRecentIds: (state, getters) => state.userStates[getters.storeUserId].recentIds,
    storeEntityTypeStats: (state, getters) => state.userStates[getters.storeUserId].entityTypeStats,
    storeHiddenColumns: (state, getters) => state.userStates[getters.storeUserId].hiddenColumns,
    storeTablePerPage: (state, getters) => state.userStates[getters.storeUserId].tablePerPage,
    storeCustomChartColors: (state, getters) => state.userStates[getters.storeUserId].customChartColors,
    storeAsyncJobUuids: (state, getters) => state.userStates[getters.storeUserId].asyncJobUuids,
    storeAsyncJobCount: (state, getters) => state.userStates[getters.storeUserId].asyncJobCount,
    storeOriginalTarget: (state, getters) => state.userStates[getters.storeUserId].originalTarget,
    storeAsyncSidebarTabIndex: (state, getters) => state.userStates[getters.storeUserId].asyncSidebarTabIndex,
    storeMapLayer: (state, getters) => state.userStates[getters.storeUserId].mapLayer,
    storeAppState: (state, getters) => state.appState,
    storeChangelogVersionNumber: (state, getters) => state.userStates[getters.storeUserId].changelogVersionNumber,
    storeActiveStory: (state) => state.activeStory,
    storeSelectedProjects: (state, getters) => state.userStates[getters.storeUserId].selectedProjects
  },
  mutations: {
    ON_APP_STATE_CHANGED_MUTATION: function (state, newAppState) {
      state.appState = newAppState
    },
    ON_TOKEN_CHANGED_MUTATION: function (state, newToken) {
      if (newToken && !state.userStates[newToken.id]) {
        // Add the new user to the state, remember to use Vue.set to make it reactive
        Vue.set(state.userStates, newToken.id, JSON.parse(JSON.stringify(userState)))
        state.activeStory = null
      }

      if (newToken === null) {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        state.activeStory = null
      }

      state.token = newToken
    },
    ON_UNIQUE_CLIENT_ID_CHANGED_MUTATION: function (state, newUniqueClientId) {
      state.uniqueClientId = newUniqueClientId
    },
    ON_ACTIVE_STORY_CHANGED_MUTATION: function (state, payload) {
      if (payload) {
        const s = JSON.parse(JSON.stringify(payload.story))
        s.storySteps.sort((a, b) => a.storyIndex - b.storyIndex)
        state.activeStory = {
          story: s,
          index: payload.index || 0,
          isEdit: payload.isEdit
        }
      } else {
        state.activeStory = null
      }
    },
    ON_ACTIVE_STORY_INDEX_CHANGED_MUTATION: function (state, newActiveStoryIndex) {
      state.activeStory.index = newActiveStoryIndex
    },
    ON_BASE_URL_CHANGED_MUTATION: function (state, newBaseUrl) {
      state.baseUrl = newBaseUrl
    },
    ON_SETTINGS_CHANGED_MUTATION: function (state, newServerSettings) {
      state.serverSettings = newServerSettings

      if (newServerSettings && newServerSettings.googleAnalyticsKey) {
        if (state.userStates[state.token ? state.token.id : null].cookiesAccepted === true) {
          setOptions({
            config: { id: newServerSettings.googleAnalyticsKey },
            enabled: true
          })
        } else {
          setOptions({
            config: { id: newServerSettings.googleAnalyticsKey },
            enabled: false
          })
        }

        bootstrap()
      }
    },
    ON_LOCALE_CHANGED_MUTATION: function (state, newLocale) {
      state.userStates[state.token ? state.token.id : null].locale = newLocale
    },
    ON_TABLE_PER_PAGE_CHANGED_MUTATION: function (state, newTablePerPage) {
      state.userStates[state.token ? state.token.id : null].tablePerPage = newTablePerPage
    },
    ON_MARKED_IDS_ADD_MUTATION: function (state, { type, ids }) {
      ids.forEach(id => {
        if (state.userStates[state.token ? state.token.id : null].markedIds[type].indexOf(id) === -1) {
          state.userStates[state.token ? state.token.id : null].markedIds[type].push(id)
        }
      })
    },
    ON_MARKED_IDS_REMOVE_MUTATION: function (state, { type, ids }) {
      ids.forEach(id => {
        const index = state.userStates[state.token ? state.token.id : null].markedIds[type].indexOf(id)
        if (index !== -1) {
          state.userStates[state.token ? state.token.id : null].markedIds[type].splice(index, 1)
        }
      })
    },
    ON_MARKED_IDS_CLEAR_MUTATION: function (state, type) {
      state.userStates[state.token ? state.token.id : null].markedIds[type] = []
    },
    ON_RECENT_IDS_PUSH_MUTATION: function (state, { type, id }) {
      // If it's not on the list yet, add it.
      if (state.userStates[state.token ? state.token.id : null].recentIds[type].indexOf(id) === -1) {
        state.userStates[state.token ? state.token.id : null].recentIds[type].push(id)
      }

      // If there are more than we want to store
      if (state.userStates[state.token ? state.token.id : null].recentIds[type].length > 10) {
        // Remove the oldest element (first)
        state.userStates[state.token ? state.token.id : null].recentIds[type].shift()
      }
    },
    ON_RECENT_IDS_CLEAR_MUTATION: function (state, type) {
      state.userStates[state.token ? state.token.id : null].recentIds[type] = []
    },
    ON_HIDDEN_COLUMNS_SET_MUTATION: function (state, { type, columns }) {
      // Only overwrite with the settings received from the server if the array either doesn't exist or is empty
      if (!state.userStates[state.token ? state.token.id : null].hiddenColumns[type] || state.userStates[state.token ? state.token.id : null].hiddenColumns[type].length < 1) {
        Vue.set(state.userStates[state.token ? state.token.id : null].hiddenColumns, type, columns)
      }
    },
    ON_HIDDEN_COLUMNS_ADD_MUTATION: function (state, { type, columns }) {
      columns.forEach(id => {
        if (state.userStates[state.token ? state.token.id : null].hiddenColumns[type].indexOf(id) === -1) {
          state.userStates[state.token ? state.token.id : null].hiddenColumns[type].push(id)
        }
      })
    },
    ON_HIDDEN_COLUMNS_REMOVE_MUTATION: function (state, { type, columns }) {
      columns.forEach(id => {
        const index = state.userStates[state.token ? state.token.id : null].hiddenColumns[type].indexOf(id)
        if (index !== -1) {
          state.userStates[state.token ? state.token.id : null].hiddenColumns[type].splice(index, 1)
        }
      })
    },
    ON_ORIGINAL_TARGET_CHANGED_MUTATION: function (state, newOriginalTarget) {
      state.userStates[state.token ? state.token.id : null].originalTarget = newOriginalTarget
    },
    ON_HELP_KEY_CHANGED_MUTATION: function (state, newHelpKey) {
      state.userStates[state.token ? state.token.id : null].helpKey = newHelpKey
    },
    ON_ENTITY_TYPE_STATS_CHANGED_MUTATION: function (state, newEntityTypeStats) {
      state.userStates[state.token ? state.token.id : null].entityTypeStats = newEntityTypeStats
    },
    ON_ASYNC_JOB_COUNT_CHANGED_MUTATION: function (state, newAsyncJobCount) {
      state.userStates[state.token ? state.token.id : null].asyncJobCount = newAsyncJobCount
    },
    ON_SIDEBAR_STATE_CHANGED_MUTATION: function (state, newSidebarState) {
      state.userStates[state.token ? state.token.id : null].sidebarState = newSidebarState
    },
    ON_ASYNC_SIDEBAR_TAB_INDEX_CHANGED_MUTATION: function (state, newAsyncSidebarTabIndex) {
      state.userStates[state.token ? state.token.id : null].asyncSidebarTabIndex = newAsyncSidebarTabIndex
    },
    ON_CHANGELOG_VERSION_NUMBER_CHANGED_MUTATION: function (state, newChangelogVersionNumber) {
      if (state.userStates[state.token ? state.token.id : null].changelogVersionNumber === undefined) {
        Vue.set(state.userStates[state.token ? state.token.id : null], 'changelogVersionNumber', newChangelogVersionNumber)
      } else {
        state.userStates[state.token ? state.token.id : null].changelogVersionNumber = newChangelogVersionNumber
      }
    },
    ON_ASYNC_JOB_UUID_MUTATION: function (state, newAsyncJobUuids) {
      if (!state.token) {
        state.userStates[state.token ? state.token.id : null].asyncJobUuids = newAsyncJobUuids
      }
    },
    ON_ASYNC_JOB_UUID_ADD_MUTATION: function (state, uuid) {
      if (!state.token) {
        if (state.userStates[state.token ? state.token.id : null].asyncJobUuids.indexOf(uuid) === -1) {
          state.userStates[state.token ? state.token.id : null].asyncJobUuids.push(uuid)
        }
      }
    },
    ON_ASYNC_JOB_UUID_REMOVE_MUTATION: function (state, uuid) {
      if (!state.token) {
        const index = state.userStates[state.token ? state.token.id : null].asyncJobUuids.indexOf(uuid)

        if (index !== -1) {
          state.userStates[state.token ? state.token.id : null].asyncJobUuids.splice(index, 1)
        }
      }
    },
    ON_COOKIES_ACCEPTED_MUTATION: function (state, newCookiesAccepted) {
      state.userStates[state.token ? state.token.id : null].cookiesAccepted = newCookiesAccepted

      if (state.serverSettings && state.serverSettings.googleAnalyticsKey) {
        if (newCookiesAccepted === true) {
          setOptions({
            enabled: true
          })
        } else {
          setOptions({
            enabled: false
          })
        }

        bootstrap()
      }
    },
    ON_CUSTOM_CHART_COLORS_CHANGED_MUTATION: function (state, newCustomChartColors) {
      state.userStates[state.token ? state.token.id : null].customChartColors = newCustomChartColors
    },
    ON_DARK_MODE_CHANGED_MUTATION: function (state, newDarkMode) {
      state.userStates[state.token ? state.token.id : null].darkMode = newDarkMode
    },
    ON_MAP_LAYER_CHANGED_MUTATION: function (state, newMapLayer) {
      state.userStates[state.token ? state.token.id : null].mapLayer = newMapLayer
    },
    ON_SELECTED_PROJECTS_CHANGED_MUTATION: function (state, newSelectedProjects) {
      if (state.userStates[state.token ? state.token.id : null].selectedProjects === undefined) {
        Vue.set(state.userStates[state.token ? state.token.id : null], 'selectedProjects', newSelectedProjects)
      } else {
        state.userStates[state.token ? state.token.id : null].selectedProjects = newSelectedProjects
      }
    }
  },
  actions: {
    setAppState: function ({ commit }, appState) {
      commit('ON_APP_STATE_CHANGED_MUTATION', appState)
    },
    setToken: function ({ commit }, token) {
      commit('ON_TOKEN_CHANGED_MUTATION', token)
    },
    setLocale: function ({ commit }, locale) {
      commit('ON_LOCALE_CHANGED_MUTATION', locale)
    },
    setUniqueClientId: function ({ commit }, uniqueClientId) {
      commit('ON_UNIQUE_CLIENT_ID_CHANGED_MUTATION', uniqueClientId)
    },
    setActiveStory: function ({ commit }, payload) {
      commit('ON_ACTIVE_STORY_CHANGED_MUTATION', payload)
    },
    setActiveStoryIndex: function ({ commit }, storyIndex) {
      commit('ON_ACTIVE_STORY_INDEX_CHANGED_MUTATION', storyIndex)
    },
    setBaseUrl: function ({ commit }, baseUrl) {
      commit('ON_BASE_URL_CHANGED_MUTATION', baseUrl)
    },
    setTablePerPage: function ({ commit }, tablePerPage) {
      commit('ON_TABLE_PER_PAGE_CHANGED_MUTATION', tablePerPage)
    },
    addMarkedIds: function ({ commit }, payload) {
      commit('ON_MARKED_IDS_ADD_MUTATION', payload)
    },
    removeMarkedIds: function ({ commit }, payload) {
      commit('ON_MARKED_IDS_REMOVE_MUTATION', payload)
    },
    clearMarkedIds: function ({ commit }, type) {
      commit('ON_MARKED_IDS_CLEAR_MUTATION', type)
    },
    pushRecentIds: function ({ commit }, payload) {
      commit('ON_RECENT_IDS_PUSH_MUTATION', payload)
    },
    clearRecentIds: function ({ commit }, type) {
      commit('ON_RECENT_IDS_CLEAR_MUTATION', type)
    },
    setHiddenColumns: function ({ commit }, payload) {
      commit('ON_HIDDEN_COLUMNS_SET_MUTATION', payload)
    },
    addHiddenColumns: function ({ commit }, payload) {
      commit('ON_HIDDEN_COLUMNS_ADD_MUTATION', payload)
    },
    removeHiddenColumns: function ({ commit }, payload) {
      commit('ON_HIDDEN_COLUMNS_REMOVE_MUTATION', payload)
    },
    setOriginalTarget: function ({ commit }, originalTarget) {
      commit('ON_ORIGINAL_TARGET_CHANGED_MUTATION', originalTarget)
    },
    setServerSettings: function ({ commit }, serverSettings) {
      commit('ON_SETTINGS_CHANGED_MUTATION', serverSettings)

      if (serverSettings && serverSettings.hiddenColumns) {
        // Overwrite current hidden columns with server defaults. This will only take place the first time Germinate loads,
        // because afterwards we can't tell whether the current hidden columns are user-specified or server-specified
        if (serverSettings.hiddenColumns.germplasm) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'germplasm', columns: serverSettings.hiddenColumns.germplasm })
        }
        if (serverSettings.hiddenColumns.germplasmAttributes) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'germplasmAttributes', columns: serverSettings.hiddenColumns.germplasmAttributes })
        }
        if (serverSettings.hiddenColumns.images) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'images', columns: serverSettings.hiddenColumns.images })
        }
        if (serverSettings.hiddenColumns.climates) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'climates', columns: serverSettings.hiddenColumns.climates })
        }
        if (serverSettings.hiddenColumns.climateData) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'climateData', columns: serverSettings.hiddenColumns.climateData })
        }
        if (serverSettings.hiddenColumns.comments) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'comments', columns: serverSettings.hiddenColumns.comments })
        }
        if (serverSettings.hiddenColumns.fileresources) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'fileresources', columns: serverSettings.hiddenColumns.fileresources })
        }
        if (serverSettings.hiddenColumns.maps) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'maps', columns: serverSettings.hiddenColumns.maps })
        }
        if (serverSettings.hiddenColumns.markers) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'markers', columns: serverSettings.hiddenColumns.markers })
        }
        if (serverSettings.hiddenColumns.mapDefinitions) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'mapDefinitions', columns: serverSettings.hiddenColumns.mapDefinitions })
        }
        if (serverSettings.hiddenColumns.datasets) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'datasets', columns: serverSettings.hiddenColumns.datasets })
        }
        if (serverSettings.hiddenColumns.datasetAttributes) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'datasetAttributes', columns: serverSettings.hiddenColumns.datasetAttributes })
        }
        if (serverSettings.hiddenColumns.experiments) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'experiments', columns: serverSettings.hiddenColumns.experiments })
        }
        if (serverSettings.hiddenColumns.entities) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'entities', columns: serverSettings.hiddenColumns.entities })
        }
        if (serverSettings.hiddenColumns.groups) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'groups', columns: serverSettings.hiddenColumns.groups })
        }
        if (serverSettings.hiddenColumns.institutions) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'institutions', columns: serverSettings.hiddenColumns.institutions })
        }
        if (serverSettings.hiddenColumns.locations) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'locations', columns: serverSettings.hiddenColumns.locations })
        }
        if (serverSettings.hiddenColumns.pedigrees) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'pedigrees', columns: serverSettings.hiddenColumns.pedigrees })
        }
        if (serverSettings.hiddenColumns.pedigreedefinitions) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'pedigreedefinitions', columns: serverSettings.hiddenColumns.pedigreedefinitions })
        }
        if (serverSettings.hiddenColumns.traitAttributes) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'traitAttributes', columns: serverSettings.hiddenColumns.traitAttributes })
        }
        if (serverSettings.hiddenColumns.traits) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'traits', columns: serverSettings.hiddenColumns.traits })
        }
        if (serverSettings.hiddenColumns.trialsData) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'trialsData', columns: serverSettings.hiddenColumns.trialsData })
        }
        if (serverSettings.hiddenColumns.collaborators) {
          commit('ON_HIDDEN_COLUMNS_SET_MUTATION', { type: 'collaborators', columns: serverSettings.hiddenColumns.collaborators })
        }
      }
    },
    setHelpKey: function ({ commit }, helpKey) {
      commit('ON_HELP_KEY_CHANGED_MUTATION', helpKey)
    },
    setEntityTypeStats: function ({ commit }, entityTypeStats) {
      commit('ON_ENTITY_TYPE_STATS_CHANGED_MUTATION', entityTypeStats)
    },
    setSidebarState: function ({ commit }, sidebarState) {
      commit('ON_SIDEBAR_STATE_CHANGED_MUTATION', sidebarState)
    },
    setAsyncJobCount: function ({ commit }, asyncJobCount) {
      commit('ON_ASYNC_JOB_COUNT_CHANGED_MUTATION', asyncJobCount)
    },
    setAsyncJobUuid: function ({ commit }, asyncJobUuids) {
      commit('ON_ASYNC_JOB_UUID_MUTATION', asyncJobUuids)
    },
    addAsyncUuid: function ({ commit }, uuid) {
      commit('ON_ASYNC_JOB_UUID_ADD_MUTATION', uuid)
    },
    removeAsyncUuid: function ({ commit }, uuid) {
      commit('ON_ASYNC_JOB_UUID_REMOVE_MUTATION', uuid)
    },
    setCookiesAccepted: function ({ commit }, cookiesAccepted) {
      commit('ON_COOKIES_ACCEPTED_MUTATION', cookiesAccepted)
    },
    setCustomChartColors: function ({ commit }, customChartColors) {
      commit('ON_CUSTOM_CHART_COLORS_CHANGED_MUTATION', customChartColors)
    },
    setDarkMode: function ({ commit }, darkMode) {
      commit('ON_DARK_MODE_CHANGED_MUTATION', darkMode)
    },
    setMapLayer: function ({ commit }, mapLayer) {
      commit('ON_MAP_LAYER_CHANGED_MUTATION', mapLayer)
    },
    setAsyncSidebarTabIndex: function ({ commit }, asyncSidebarTabIndex) {
      commit('ON_ASYNC_SIDEBAR_TAB_INDEX_CHANGED_MUTATION', asyncSidebarTabIndex)
    },
    setChangelogVersionNumber: function ({ commit }, changelogVersionNumber) {
      commit('ON_CHANGELOG_VERSION_NUMBER_CHANGED_MUTATION', changelogVersionNumber)
    },
    setSelectedProjects: function ({ commit }, selectedProjects) {
      commit('ON_SELECTED_PROJECTS_CHANGED_MUTATION', selectedProjects)
    }
  },
  plugins: [
    createPersistedState({
      key: name,
      storage: {
        getItem: key => {
          // Get the value and parse it
          const result = JSON.parse(localStorage.getItem(key))

          // If it exists and there is user state data
          if (result && result.userStates) {
            // Then for each user state, set the defaults for those fields that aren't stored (because of declined cookies (GDPR))
            Object.keys(result.userStates).forEach(us => {
              result.userStates[us] = Object.assign(JSON.parse(JSON.stringify(userState)), result.userStates[us])

              Object.keys(userState.hiddenColumns).forEach(hd => {
                if (!result.userStates[us].hiddenColumns[hd]) {
                  result.userStates[us].hiddenColumns[hd] = userState.hiddenColumns[hd]
                }
              })
            })
          }

          return JSON.stringify(result)
        },
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: key => localStorage.removeItem(key)
      },
      reducer: (state) => {
        let result = {}
        try {
          result = JSON.parse(JSON.stringify(state))
        } catch (err) {
          console.error(err)
        }

        result.activeStory = null

        // Check if GDPR settings are active
        if (result.userStates && result.serverSettings && result.serverSettings.showGdprNotification) {
          // If so, for each user
          Object.keys(result.userStates).forEach(u => {
            const currentUserState = result.userStates[u]

            // If they haven't accepted cookies, remove the keys that aren't flagged as "essential cookies"
            if (currentUserState.cookiesAccepted !== true) {
              Object.keys(currentUserState).forEach(k => {
                if (essentialKeys.indexOf(k) === -1) {
                  delete currentUserState[k]
                }
              })
            }
          })
        }

        return result
      }
    })
  ]
}

const store = new Vuex.Store(storeState)

export default store
