import { BadgePlugin, ButtonGroupPlugin, FormFilePlugin, ButtonPlugin, CardPlugin, CarouselPlugin, FormCheckboxPlugin, FormDatepickerPlugin, FormGroupPlugin, FormInputPlugin, FormPlugin, FormRadioPlugin, FormSelectPlugin, FormTagsPlugin, FormTextareaPlugin, ImagePlugin, InputGroupPlugin, LayoutPlugin, ListGroupPlugin, ModalPlugin, NavbarPlugin, PaginationPlugin, PopoverPlugin, ProgressPlugin, SidebarPlugin, SpinnerPlugin, TablePlugin, TabsPlugin, TooltipPlugin, VBScrollspyPlugin, ToastPlugin, CalendarPlugin } from 'bootstrap-vue'

import Vue from 'vue'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import { i18n } from '@/plugins/i18n.js'

import VueGtag from 'vue-gtag'

Vue.config.productionTip = false

Vue.use(BadgePlugin)
Vue.use(ButtonGroupPlugin)
Vue.use(ButtonPlugin)
Vue.use(CardPlugin)
Vue.use(CarouselPlugin)
Vue.use(CalendarPlugin)
Vue.use(FormCheckboxPlugin)
Vue.use(FormDatepickerPlugin)
Vue.use(FormFilePlugin)
Vue.use(FormGroupPlugin)
Vue.use(FormPlugin)
Vue.use(FormInputPlugin)
Vue.use(FormRadioPlugin)
Vue.use(FormSelectPlugin)
Vue.use(FormTagsPlugin)
Vue.use(FormTextareaPlugin)
Vue.use(ImagePlugin)
Vue.use(InputGroupPlugin)
Vue.use(LayoutPlugin, { breakpoints: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl'] })
Vue.use(ListGroupPlugin)
Vue.use(ModalPlugin)
Vue.use(NavbarPlugin)
Vue.use(PaginationPlugin)
Vue.use(PopoverPlugin)
Vue.use(ProgressPlugin)
Vue.use(SidebarPlugin)
Vue.use(SpinnerPlugin)
Vue.use(TablePlugin)
Vue.use(TabsPlugin)
Vue.use(TooltipPlugin)
Vue.use(ToastPlugin)
Vue.use(VBScrollspyPlugin)

Vue.use(VueGtag, {
  bootstrap: false,
  enabled: false
}, router)

// Set base URL
let baseUrl = './api/'
if (process.env.VUE_APP_BASE_URL) {
  baseUrl = process.env.VUE_APP_BASE_URL
}

store.commit('ON_APP_STATE_CHANGED_MUTATION', process.env.NODE_ENV)
store.commit('ON_BASE_URL_CHANGED_MUTATION', baseUrl)

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
