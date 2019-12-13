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
// LEAFLET
import { LMap, LTileLayer, LMarker, LPopup } from 'vue2-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

import Autocomplete from '@trevoreyre/autocomplete-vue'
import '@trevoreyre/autocomplete-vue/dist/style.css'

require('es6-object-assign/auto')
require('es6-set/implement')
let axiosDefaults = require('axios/lib/defaults')

// todo
// cssVars()

Vue.mixin(mixin)
Vue.use(BootstrapVue)
Vue.use(Autocomplete)
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
    Vue.prototype.$d3 = require('d3')
    window.d3 = Vue.prototype.$d3
    Vue.prototype.$dagreD3 = require('dagre-d3')
    window.dagreD3 = Vue.prototype.$dagreD3
    Vue.prototype.$zxcvbn = require('zxcvbn')
    window.zxcvbn = Vue.prototype.$zxcvbn
  }
})

Vue.filter('toThousandSeparators', value => {
  if (value === null || value === undefined) {
    return null
  }

  const locale = store.getters.locale

  if (locale) {
    return value.toLocaleString(locale.replace('_', '-'))
  } else {
    return value.toLocaleString()
  }
})

Vue.filter('toDate', value => {
  if (value === null || value === undefined) {
    return null
  }
  var moment
  if (value.indexOf('-') !== -1) {
    moment = window.moment(value)
  } else {
    moment = window.moment(value, 'MMM D, YYYY')
  }
  return moment.format(i18n.t('formatDate'))
})

Vue.filter('toDateTime', value => {
  if (value === null || value === undefined) {
    return null
  }
  var moment
  if (value.indexOf('-') !== -1) {
    moment = window.moment(value)
  } else {
    moment = window.moment(value, 'MMM D, YYYY')
  }
  return moment.format(i18n.t('formatDateTime'))
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
