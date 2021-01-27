import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

const localStorage = window.localStorage

let name = process.env.VUE_APP_INSTANCE_NAME

if (!name) {
  name = 'germinate-' + window.location.pathname
}

const essentialKeys = ['token', 'locale', 'baseUrl', 'serverSettings', 'asyncJobUuids', 'asyncJobCount', 'markedIds', 'cookiesAccepted']
const userState = {
  locale: 'en_GB',
  tablePerPage: 10,
  originalTarget: null,
  helpKey: null,
  entityTypeStats: [{
    'Accession': {
      count: 0
    },
    'Plant/Plot': {
      count: 0
    },
    'Sample': {
      count: 0
    }
  }],
  sidebarState: 'sidebar-lg-show',
  mapLayer: 'stadia',
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
    germplasm: ['id', 'entityParentName', 'entityParentGeneralIdentifier', 'institutionId', 'institutionName', 'latitude', 'longitude', 'collDate'],
    germplasmAttributes: [],
    images: [],
    climates: [],
    climateData: ['climateId'],
    compounds: [],
    compoundData: ['compoundId'],
    comments: ['commentForeignId', 'commentTypeId'],
    maps: [],
    markers: [],
    mapDefinitions: [],
    datasets: ['experimentId'],
    datasetAttributes: [],
    experiments: [],
    entities: [],
    groups: ['userId'],
    locations: [],
    pedigrees: [],
    traits: [],
    trialsData: ['traitId'],
    collaborators: []
  },
  asyncJobUuids: [],
  asyncJobCount: 0,
  tableFiltering: null,
  cookiesAccepted: null,
  customChartColors: null,
  darkMode: false
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
    token: (state, getters) => state.token,
    baseUrl: (state, getters) => state.baseUrl,
    serverSettings: (state, getters) => state.serverSettings,
    userId: (state, getters) => state.token ? state.token.id : null,
    locale: (state, getters) => state.userStates[getters.userId].locale,
    tablePerPage: (state, getters) => state.userStates[getters.userId].tablePerPage,
    helpKey: (state, getters) => state.userStates[getters.userId].helpKey,
    markedIds: (state, getters) => state.userStates[getters.userId].markedIds,
    recentIds: (state, getters) => state.userStates[getters.userId].recentIds,
    entityTypeStats: (state, getters) => state.userStates[getters.userId].entityTypeStats,
    hiddenColumns: (state, getters) => state.userStates[getters.userId].hiddenColumns,
    originalTarget: (state, getters) => state.userStates[getters.userId].originalTarget,
    tableFiltering: (state, getters) => state.userStates[getters.userId].tableFiltering,
    asyncJobUuids: (state, getters) => state.userStates[getters.userId].asyncJobUuids,
    asyncJobCount: (state, getters) => state.userStates[getters.userId].asyncJobCount,
    cookiesAccepted: (state, getters) => state.userStates[getters.userId].cookiesAccepted,
    sidebarState: (state, getters) => state.userStates[getters.userId].sidebarState,
    customChartColors: (state, getters) => state.userStates[getters.userId].customChartColors,
    darkMode: (state, getters) => state.userStates[getters.userId].darkMode,
    mapLayer: (state, getters) => state.userStates[getters.userId].mapLayer
  },
  mutations: {
    ON_TOKEN_CHANGED_MUTATION: function (state, newToken) {
      if (newToken && !state.userStates[newToken.id]) {
        // Add the new user to the state, remember to use Vue.set to make it reactive
        Vue.set(state.userStates, newToken.id, JSON.parse(JSON.stringify(userState)))
      }

      if (newToken === null) {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }

      state.token = newToken
    },
    ON_BASE_URL_CHANGED_MUTATION: function (state, newBaseUrl) {
      state.baseUrl = newBaseUrl
    },
    ON_SETTINGS_CHANGED_MUTATION: function (state, newServerSettings) {
      state.serverSettings = newServerSettings

      if (newServerSettings && newServerSettings.googleAnalyticsKey) {
        if (state.userStates[state.token ? state.token.id : null].cookiesAccepted === true) {
          Vue.$ga.enable()
        } else {
          Vue.$ga.disable()
        }
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
    ON_TABLE_FILTERING_CHANGED_MUTATION: function (state, newTableFiltering) {
      state.userStates[state.token ? state.token.id : null].tableFiltering = newTableFiltering
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
          Vue.$ga.enable()
        } else {
          Vue.$ga.disable()
        }
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
    }
  },
  actions: {
    ON_TOKEN_CHANGED: function ({ commit }, token) {
      commit('ON_TOKEN_CHANGED_MUTATION', token)
    },
    ON_LOCALE_CHANGED: function ({ commit }, locale) {
      commit('ON_LOCALE_CHANGED_MUTATION', locale)
    },
    ON_BASE_URL_CHANGED: function ({ commit }, baseUrl) {
      commit('ON_BASE_URL_CHANGED_MUTATION', baseUrl)
    },
    ON_TABLE_PER_PAGE_CHANGED: function ({ commit }, tablePerPage) {
      commit('ON_TABLE_PER_PAGE_CHANGED_MUTATION', tablePerPage)
    },
    ON_MARKED_IDS_ADD: function ({ commit }, payload) {
      commit('ON_MARKED_IDS_ADD_MUTATION', payload)
    },
    ON_MARKED_IDS_REMOVE: function ({ commit }, payload) {
      commit('ON_MARKED_IDS_REMOVE_MUTATION', payload)
    },
    ON_MARKED_IDS_CLEAR: function ({ commit }, type) {
      commit('ON_MARKED_IDS_CLEAR_MUTATION', type)
    },
    ON_RECENT_IDS_PUSH: function ({ commit }, payload) {
      commit('ON_RECENT_IDS_PUSH_MUTATION', payload)
    },
    ON_RECENT_IDS_CLEAR: function ({ commit }, type) {
      commit('ON_RECENT_IDS_CLEAR_MUTATION', type)
    },
    ON_HIDDEN_COLUMNS_ADD: function ({ commit }, payload) {
      commit('ON_HIDDEN_COLUMNS_ADD_MUTATION', payload)
    },
    ON_HIDDEN_COLUMNS_REMOVE: function ({ commit }, payload) {
      commit('ON_HIDDEN_COLUMNS_REMOVE_MUTATION', payload)
    },
    ON_ORIGINAL_TARGET_CHANGED: function ({ commit }, originalTarget) {
      commit('ON_ORIGINAL_TARGET_CHANGED_MUTATION', originalTarget)
    },
    ON_SETTINGS_CHANGED: function ({ commit }, serverSettings) {
      commit('ON_SETTINGS_CHANGED_MUTATION', serverSettings)
    },
    ON_HELP_KEY_CHANGED: function ({ commit }, helpKey) {
      commit('ON_HELP_KEY_CHANGED_MUTATION', helpKey)
    },
    ON_TABLE_FILTERING_CHANGED: function ({ commit }, tableFiltering) {
      commit('ON_TABLE_FILTERING_CHANGED_MUTATION', tableFiltering)
    },
    ON_ENTITY_TYPE_STATS_CHANGED: function ({ commit }, entityTypeStats) {
      commit('ON_ENTITY_TYPE_STATS_CHANGED_MUTATION', entityTypeStats)
    },
    ON_SIDEBAR_STATE_CHANGED: function ({ commit }, sidebarState) {
      commit('ON_SIDEBAR_STATE_CHANGED_MUTATION', sidebarState)
    },
    ON_ASYNC_JOB_COUNT_CHANGED: function ({ commit }, asyncJobCount) {
      commit('ON_ASYNC_JOB_COUNT_CHANGED_MUTATION', asyncJobCount)
    },
    ON_ASYNC_JOB_UUID: function ({ commit }, asyncJobUuids) {
      commit('ON_ASYNC_JOB_UUID_MUTATION', asyncJobUuids)
    },
    ON_ASYNC_JOB_UUID_ADD: function ({ commit }, uuid) {
      commit('ON_ASYNC_JOB_UUID_ADD_MUTATION', uuid)
    },
    ON_ASYNC_JOB_UUID_REMOVE: function ({ commit }, uuid) {
      commit('ON_ASYNC_JOB_UUID_REMOVE_MUTATION', uuid)
    },
    ON_COOKIES_ACCEPTED: function ({ commit }, cookiesAccepted) {
      commit('ON_COOKIES_ACCEPTED_MUTATION', cookiesAccepted)
    },
    ON_CUSTOM_CHART_COLORS_CHANGED: function ({ commit }, customChartColors) {
      commit('ON_CUSTOM_CHART_COLORS_CHANGED_MUTATION', customChartColors)
    },
    ON_DARK_MODE_CHANGED: function ({ commit }, darkMode) {
      commit('ON_DARK_MODE_CHANGED_MUTATION', darkMode)
    },
    ON_MAP_LAYER_CHANGED: function ({ commit }, mapLayer) {
      commit('ON_MAP_LAYER_CHANGED_MUTATION', mapLayer)
    }
  },
  plugins: [
    createPersistedState({
      key: name,
      storage: {
        getItem: key => {
          // Get the value and parse it
          let result = JSON.parse(localStorage.getItem(key))

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
      reducer: (state, paths) => {
        let result = {}
        try {
          result = JSON.parse(JSON.stringify(state))
        } catch (err) {
          console.error(err)
        }

        // Check if GDPR settings are active
        if (result.userStates && result.serverSettings && result.serverSettings.showGdprNotification) {
          // If so, for each user
          Object.keys(result.userStates).forEach(u => {
            let currentUserState = result.userStates[u]

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
