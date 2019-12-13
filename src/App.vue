<template>
  <div>
    <router-view :class="printContent ? 'd-print-none' : ''"></router-view>
    <div ref="printer-view" class="d-none d-print-block" v-html="printContent" v-if="printContent"></div>

    <b-modal ref="loadingModal" :title="$t('modalTitleLoading')" hide-footer no-close-on-backdrop no-close-on-esc hide-header-close>
      <div class="text-center">
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
      </div>
    </b-modal>
  </div>
</template>

<script>
import Vue from 'vue'
import VueAnalytics from 'vue-analytics'
import { EventBus } from '@/plugins/event-bus.js'
import { loadLanguageAsync } from '@/plugins/i18n'
import miscApi from '@/mixins/api/misc.js'
import statsApi from '@/mixins/api/stats.js'

export default {
  name: 'app',
  data: function () {
    return {
      printContent: null
    }
  },
  watch: {
    token: function (newValue, oldValue) {
      this.apiGetEntityTypeStats(result => {
        this.$store.dispatch('ON_ENTITY_TYPE_STATS_CHANGED', result)
      })
    }
  },
  created: async function () {
    this.apiGetEntityTypeStats(result => {
      this.$store.dispatch('ON_ENTITY_TYPE_STATS_CHANGED', result)
    })
    await this.apiGetSettings(result => {
      if (result && result.googleAnalyticsKey) {
        Vue.use(VueAnalytics, {
          id: result.googleAnalyticsKey,
          router: this.$router
        })

        // Disable initially, users have to opt-in
        Vue.$ga.disable()
      }

      this.$store.dispatch('ON_SETTINGS_CHANGED', result)
    })
  },
  mixins: [ miscApi, statsApi ],
  methods: {
    print: function (newContent) {
      this.printContent = newContent

      this.$nextTick(() => {
        window.print()
        this.$nextTick(() => {
          this.printContent = null
        })
      })
    },
    toggleLoading: function (show) {
      if (show) {
        this.$refs.loadingModal.show()
      } else {
        this.$refs.loadingModal.hide()
      }
    }
  },
  destroyed: function () {
    EventBus.$off('on-print', this.print)
    EventBus.$off('show-loading', this.toggleLoading)
  },
  mounted: function () {
    loadLanguageAsync(this.locale)
    EventBus.$on('on-print', this.print)
    EventBus.$on('show-loading', this.toggleLoading)

    // Load the custom .css file provided specifically for this project
    let file = document.createElement('link')
    file.rel = 'stylesheet'
    file.href = this.baseUrl + 'settings/css'
    document.head.appendChild(file)
  }
}
</script>

<style lang="scss">
  // CoreUI Icons Set
  @import '~@coreui/icons/css/coreui-icons.min.css';
  /* Import Simple Line Icons Set */
  $simple-line-font-path: '~simple-line-icons/fonts/';
  @import '~simple-line-icons/scss/simple-line-icons.scss';
  /* Import Flag Icons Set */
  @import '~flag-icon-css/css/flag-icon.min.css';
  @import '~@mdi/font/css/materialdesignicons.min.css';
  /* Import Bootstrap Vue Styles */
  @import '~bootstrap-vue/dist/bootstrap-vue.css';
  // Import Main styles for this application
  @import 'assets/scss/style';
</style>
