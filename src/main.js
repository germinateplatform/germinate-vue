import 'core-js/es6/promise'
import 'core-js/es6/string'
import 'core-js/es7/array'
import 'es6-object-assign/auto'
import 'es6-set/implement'

import Vue from 'vue'
// import BootstrapVue from 'bootstrap-vue'
import App from '@/App'
import router from '@/router'
import store from '@/store/store'
import { i18n } from '@/plugins/i18n.js'
import mixin from '@/mixins/mixin.js'

import Autocomplete from '@trevoreyre/autocomplete-vue'
import '@trevoreyre/autocomplete-vue/dist/style.css'

// Import the bootstrap-vue plugins
import {
  BadgePlugin,
  ButtonPlugin,
  ButtonGroupPlugin,
  CardPlugin,
  CarouselPlugin,
  CollapsePlugin,
  DropdownPlugin,
  FormPlugin,
  FormCheckboxPlugin,
  FormDatepickerPlugin,
  FormFilePlugin,
  FormGroupPlugin,
  FormInputPlugin,
  FormRadioPlugin,
  FormSelectPlugin,
  FormTagsPlugin,
  FormTextareaPlugin,
  ImagePlugin,
  InputGroupPlugin,
  LayoutPlugin,
  ListGroupPlugin,
  ModalPlugin,
  NavPlugin,
  NavbarPlugin,
  PaginationPlugin,
  PopoverPlugin,
  ProgressPlugin,
  SpinnerPlugin,
  TablePlugin,
  TabsPlugin,
  ToastPlugin,
  TooltipPlugin,
  VBPopoverPlugin,
  VBScrollspyPlugin,
  VBTooltipPlugin
} from 'bootstrap-vue'

import VueMeta from 'vue-meta'
Vue.use(VueMeta)

let axiosDefaults = require('axios/lib/defaults')

Vue.mixin(mixin)
Vue.use(Autocomplete)

// Import the bootstrap-vue plugins
Vue.use(BadgePlugin)
Vue.use(ButtonPlugin)
Vue.use(ButtonGroupPlugin)
Vue.use(CardPlugin)
Vue.use(CarouselPlugin)
Vue.use(CollapsePlugin)
Vue.use(DropdownPlugin)
Vue.use(FormPlugin)
Vue.use(FormCheckboxPlugin)
Vue.use(FormDatepickerPlugin)
Vue.use(FormFilePlugin)
Vue.use(FormGroupPlugin)
Vue.use(FormInputPlugin)
Vue.use(FormRadioPlugin)
Vue.use(FormSelectPlugin)
Vue.use(FormTagsPlugin)
Vue.use(FormTextareaPlugin)
Vue.use(ImagePlugin)
Vue.use(InputGroupPlugin)
Vue.use(LayoutPlugin)
Vue.use(ListGroupPlugin)
Vue.use(ModalPlugin)
Vue.use(NavPlugin)
Vue.use(NavbarPlugin)
Vue.use(PaginationPlugin)
Vue.use(PopoverPlugin)
Vue.use(ProgressPlugin)
Vue.use(SpinnerPlugin)
Vue.use(TablePlugin)
Vue.use(TabsPlugin)
Vue.use(ToastPlugin)
Vue.use(TooltipPlugin)
Vue.use(VBPopoverPlugin)
Vue.use(VBScrollspyPlugin)
Vue.use(VBTooltipPlugin)

Vue.use({
  install: function (Vue) {
    // Make moment.js available
    Vue.prototype.$moment = require('moment')
    window.moment = Vue.prototype.$moment
    // Make custom plotly available
    Vue.prototype.$plotly = require('@/plugins/charts/custom-plotly')
    window.Plotly = Vue.prototype.$plotly
  }
})

// Add thousand separators
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

// Date formatting
Vue.filter('toDate', value => {
  if (value === null || value === undefined) {
    return null
  }
  let moment
  if (value.indexOf('-') !== -1) {
    moment = window.moment(value)
  } else {
    moment = window.moment(value, 'MMM D, YYYY')
  }
  return moment.format(i18n.t('formatDate'))
})

// Date time formatting
Vue.filter('toDateTime', value => {
  if (value === null || value === undefined) {
    return null
  }
  let moment
  if (value.indexOf('-') !== -1) {
    moment = window.moment(value)
  } else {
    moment = window.moment(value, 'MMM D, YYYY')
  }
  return moment.format(i18n.t('formatDateTime'))
})

// Truncate a string after this many words
Vue.filter('truncateAfterWords', (str, words) => {
  if (!str) {
    return str
  }

  const parts = str.split(' ')

  if (parts.length > words) {
    return parts.splice(0, words).join(' ') + '...'
  } else {
    return str
  }
})

// Set base URL
let baseUrl = './api/'

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
