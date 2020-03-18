// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// import cssVars from 'css-vars-ponyfill'
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from '@/App'
import router from '@/router'
import store from '@/store/store'
import { i18n } from '@/plugins/i18n.js'
import mixin from '@/mixins/mixin.js'
// LEAFLET
import { LMap, LTileLayer, LMarker, LPopup, LImageOverlay } from 'vue2-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

import Autocomplete from '@trevoreyre/autocomplete-vue'
import '@trevoreyre/autocomplete-vue/dist/style.css'

// require('core-js/es6/promise')
// require('core-js/es6/string')
// require('core-js/es7/array')
// require('es6-object-assign/auto')
// require('es6-set/implement')
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
Vue.component('l-image-overlay', LImageOverlay)

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
    Vue.prototype.$plotly = require('@/plugins/charts/custom-plotly')
    window.Plotly = Vue.prototype.$plotly
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

Vue.filter('truncateAfterWords', (str, words) => {
  const parts = str.split(' ')

  if (parts.length > words) {
    return parts.splice(0, words).join(' ') + '...'
  } else {
    return str
  }
})

// Set base URL
var baseUrl = 'http://localhost:8080/germinate/v4.0.0/api/'

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
