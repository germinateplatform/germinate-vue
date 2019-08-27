import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

var name = process.env.VUE_APP_INSTANCE_NAME

if (!name) {
  name = 'germinate'
}

const store = new Vuex.Store({
  state: {
    token: null,
    locale: 'en_GB',
    baseUrl: null,
    tablePerPage: 10,
    originalTarget: null,
    settings: null,
    markedIds: {
      germplasm: [],
      markers: [],
      locations: []
    },
    hiddenColumns: {
      germplasm: [],
      maps: [],
      markers: [],
      datasets: []
    }
  },
  getters: {
    token: state => state.token,
    locale: state => state.locale,
    baseUrl: state => state.baseUrl,
    tablePerPage: state => state.tablePerPage,
    markedIds: state => state.markedIds,
    hiddenColumns: state => state.hiddenColumns,
    originalTarget: state => state.originalTarget,
    settings: state => state.settings
  },
  mutations: {
    ON_TOKEN_CHANGED_MUTATION: function (state, newToken) {
      state.token = newToken
    },
    ON_LOCALE_CHANGED_MUTATION: function (state, newLocale) {
      state.locale = newLocale
    },
    ON_BASE_URL_CHANGED_MUTATION: function (state, newBaseUrl) {
      state.baseUrl = newBaseUrl
    },
    ON_TABLE_PER_PAGE_CHANGED_MUTATION: function (state, newTablePerPage) {
      state.tablePerPage = newTablePerPage
    },
    ON_MARKED_IDS_ADD_MUTATION: function (state, { type, ids }) {
      ids.forEach(id => {
        if (state.markedIds[type].indexOf(id) === -1) {
          state.markedIds[type].push(id)
        }
      })
    },
    ON_MARKED_IDS_REMOVE_MUTATION: function (state, { type, ids }) {
      ids.forEach(id => {
        var index = state.markedIds[type].indexOf(id)
        if (index !== -1) {
          state.markedIds[type].splice(index, 1)
        }
      })
    },
    ON_MARKED_IDS_CLEAR_MUTATION: function (state, type) {
      state.markedIds[type] = []
    },
    ON_HIDDEN_COLUMNS_ADD_MUTATION: function (state, { type, columns }) {
      columns.forEach(id => {
        if (state.hiddenColumns[type].indexOf(id) === -1) {
          state.hiddenColumns[type].push(id)
        }
      })
    },
    ON_HIDDEN_COLUMNS_REMOVE_MUTATION: function (state, { type, columns }) {
      columns.forEach(id => {
        var index = state.hiddenColumns[type].indexOf(id)
        if (index !== -1) {
          state.hiddenColumns[type].splice(index, 1)
        }
      })
    },
    ON_ORIGINAL_TARGET_CHANGED_MUTATION: function (state, newOriginalTarget) {
      state.originalTarget = newOriginalTarget
    },
    ON_SETTINGS_CHANGED_MUTATION: function (state, newSettings) {
      state.settings = newSettings
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
    ON_HIDDEN_COLUMNS_ADD: function ({ commit }, payload) {
      commit('ON_HIDDEN_COLUMNS_ADD_MUTATION', payload)
    },
    ON_HIDDEN_COLUMNS_REMOVE: function ({ commit }, payload) {
      commit('ON_HIDDEN_COLUMNS_REMOVE_MUTATION', payload)
    },
    ON_ORIGINAL_TARGET_CHANGED: function ({ commit }, originalTarget) {
      commit('ON_ORIGINAL_TARGET_CHANGED_MUTATION', originalTarget)
    },
    ON_SETTINGS_CHANGED: function ({ commit }, settings) {
      commit('ON_SETTINGS_CHANGED_MUTATION', settings)
    }
  },
  plugins: [
    createPersistedState({
      key: name
    })
  ]
})

export default store
