<template>
  <div>
    <!-- Main view -->
    <router-view :class="printContent ? 'd-print-none' : ''"></router-view>

    <!-- Print view for printable content -->
    <div ref="printer-view" class="d-none d-print-block" v-html="printContent" v-if="printContent"></div>

    <b-modal ref="loadingModal" :title="$t('modalTitleLoading')" hide-footer no-close-on-backdrop no-close-on-esc hide-header-close>
      <div class="text-center">
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
        <p class="text-muted mt-3" v-if="$t('modalTextLoading')">{{ $t('modalTextLoading') }}</p>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { EventBus } from '@/plugins/event-bus.js'
import { loadLanguageAsync } from '@/plugins/i18n'
import miscApi from '@/mixins/api/misc.js'
import statsApi from '@/mixins/api/stats.js'
import { Detector } from '@/plugins/browser-detect.js'

export default {
  name: 'app',
  metaInfo () {
    return {
      meta: [
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: this.homeUrl },
        { property: 'og:title', content: 'Germinate - The generic plant genetic resources database' },
        { property: 'og:description', content: 'Germinate is an open source plant database infrastructure and application programming platform on which complex data from genetic resource collections can be stored, queried and visualized.' },
        { property: 'og:image', content: `${this.pathUrl}img/android-chrome-512x512.png` },
        { property: 'og:image:type', content: 'image/png' },
        { name: 'twitter:title', content: 'Germinate is an open source plant database infrastructure and application programming platform on which complex data from genetic resource collections can be stored, queried and visualized.' },
        { name: 'twitter:description', content: 'Germinate - The generic plant genetic resources database' },
        { name: 'twitter:url', content: this.homeUrl },
        { name: 'twitter:image', content: `${this.pathUrl}img/android-chrome-512x512.png` },
        { name: 'twitter:card', content: 'summary_large_image' }
      ]
    }
  },
  computed: {
    /** Mapgetters exposing the store configuration */
    ...mapGetters([
      'uniqueClientId'
    ]),
    pathUrl: function () {
      return window.location.origin + window.location.pathname
    },
    homeUrl: function () {
      const relative = this.$router.resolve({ name: 'home' }).href
      return this.pathUrl + relative
    }
  },
  data: function () {
    return {
      printContent: null
    }
  },
  watch: {
    token: function () {
      this.apiGetEntityTypeStats(result => {
        this.$store.dispatch('ON_ENTITY_TYPE_STATS_CHANGED', result)
      })
    },
    darkMode: function () {
      this.loadAndSetDarkMode()
    }
  },
  created: async function () {
    await this.apiGetSettings(result => {
      this.$store.dispatch('ON_SETTINGS_CHANGED', result)

      this.apiGetEntityTypeStats(result => {
        this.$store.dispatch('ON_ENTITY_TYPE_STATS_CHANGED', result)
      })
    })
  },
  mixins: [ miscApi, statsApi ],
  methods: {
    isLocalhost: function () {
      return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === ''
    },
    loadAndSetDarkMode: function () {
      import('darkreader')
        .then(({ enable, disable }) => {
          if (this.darkMode === true) {
            enable()
          } else {
            disable()
          }
        })
    },
    print: function (newContent) {
      // Set the print content
      this.printContent = newContent

      // Wait a bit
      this.$nextTick(() => {
        // Ask the browser to print
        window.print()
        this.$nextTick(() => {
          // Hide the print content
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
    },
    attachStyleSheet: function () {
      if (this.customStyleSheet) {
        document.head.removeChild(this.customStyleSheet)
      }      

      // Load the custom .css file provided specifically for this project
      this.customStyleSheet = document.createElement('link')
      this.customStyleSheet.rel = 'stylesheet'
      this.customStyleSheet.href = this.baseUrl + 'settings/css'
      document.head.appendChild(this.customStyleSheet)
    }
  },
  destroyed: function () {
    EventBus.$off('on-print', this.print)
    EventBus.$off('show-loading', this.toggleLoading)
    EventBus.$off('on-stylesheet-changed', this.attachStyleSheet)
  },
  mounted: function () {
    loadLanguageAsync(this.locale)
    EventBus.$on('on-print', this.print)
    EventBus.$on('show-loading', this.toggleLoading)
    EventBus.$on('on-stylesheet-changed', this.attachStyleSheet)

    this.attachStyleSheet()

    this.loadAndSetDarkMode()

    // Log the run
    if (!this.isLocalhost()) {
      let id = this.uniqueClientId
      if (!id) {
        id = this.uuidv4()

        this.$store.dispatch('ON_UNIQUE_CLIENT_ID_CHANGED', id)
      }

      const config = new Detector().detect()
      const data = {
        application: 'Germinate',
        id: id,
        version: `${this.germinateVersion}`,
        locale: this.locale,
        os: `${config.os} ${config.osVersion}`
      }
      this.authAxios({ url: 'https://ics.hutton.ac.uk/app-logger/log', method: 'GET', data: data })
    }
  }
}
</script>

<style lang="scss">
  /* Import Flag Icons Set */
  @import '~flag-icon-css/css/flag-icon.min.css';
  @import '~@mdi/font/css/materialdesignicons.min.css';
  @import '~vue-context/dist/css/vue-context.css';

  $container-max-widths: (
    sm: 540px,
    md: 720px,
    lg: 960px,
    xl: 1140px,
    xxl: 1400px
  );

  $grid-breakpoints: (
    xs: 0,
    sm: 576px,
    md: 768px,
    lg: 992px,
    xl: 1200px,
    xxl: 1500px
  );

  /* Import Bootstrap Vue Styles */
  @import '~bootstrap-vue/dist/bootstrap-vue.css';
  // Import Main styles for this application
  @import 'assets/scss/style';

  @import '~leaflet-easybutton/src/easy-button.css';
</style>
