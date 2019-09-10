// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'core-js/es6/promise'
import 'core-js/es6/string'
import 'core-js/es7/array'
// import cssVars from 'css-vars-ponyfill'
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from '@/App'
import router from '@/router'
import store from '@/store/store'
import { i18n } from '@/plugins/i18n.js'
import mixin from '@/mixins/mixin.js'
import api from '@/mixins/api.js'
import { ClientTable, ServerTable } from 'vue-tables-2'
// LEAFLET
import { LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

require('es6-object-assign/auto')
require('es6-set/implement')
let axiosDefaults = require('axios/lib/defaults')

// todo
// cssVars()

var tableOptions = {
  pagination: {
    // nav: 'scroll', // TODO: Revisit when https://github.com/matfish2/vue-tables-2/issues/694 is fixed.
    nav: 'fixed',
    edge: true
  },
  sortIcon: {
    base: 'table-sort',
    up: 'table-sort-up',
    down: 'table-sort-down'
  }
}

Vue.mixin(mixin)
Vue.mixin(api)
Vue.use(ClientTable, tableOptions, false, 'bootstrap4', 'footerPagination')
Vue.use(ServerTable, tableOptions, false, 'bootstrap4', 'footerPagination')
Vue.use(BootstrapVue)
Vue.component('l-map', LMap)
Vue.component('l-tile-layer', LTileLayer)
Vue.component('l-marker', LMarker)
Vue.component('l-popup', LPopup)

delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

Vue.use({
  install: function (Vue) {
    Vue.prototype.$moment = require('moment')
    window.moment = Vue.prototype.$moment
    Vue.prototype.$plotly = require('plotly.js-dist')
    window.Plotly = Vue.prototype.$plotly
  }
})

Vue.filter('toDate', function (value) {
  return window.moment(value).format(window.moment.localeData().longDateFormat('L'))
})

// Set base URL
var baseUrl = 'http://localhost:8080/germinate/v3.6.0/api/'

if (process.env.VUE_APP_BASE_URL) {
  baseUrl = process.env.VUE_APP_BASE_URL
}

axiosDefaults.baseURL = baseUrl

store.commit('ON_BASE_URL_CHANGED_MUTATION', baseUrl)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  template: '<App/>',
  components: {
    App
  }
})
