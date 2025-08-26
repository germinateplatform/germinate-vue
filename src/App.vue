<template>
  <div id="app">
    <router-view v-if="i18nLoaded" :class="printContent ? 'd-print-none' : ''" />

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
import Vue from 'vue'
import { VuePlausible } from 'vue-plausible'
import { loadLanguageAsync } from '@/plugins/i18n'
import { mapGetters } from 'vuex'
import { Detector } from '@/plugins/browser-detect.js'
import { uuidv4, germinateVersion } from '@/mixins/util'
import { apiGetSettings } from '@/mixins/api/misc'
import { authAxios } from '@/mixins/api/base'
import { apiGetEntityTypeStats } from '@/mixins/api/stats'
import { Pages } from '@/mixins/pages'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      i18nLoaded: false,
      printContent: null
    }
  },
  computed: {
    ...mapGetters([
      'storeLocale',
      'storeBaseUrl',
      'storeAppState'
    ])
  },
  methods: {
    isLocalhost: function () {
      return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === ''
    },
    attachStyleSheet: function () {
      this.$nextTick(() => {
        if (this.customStyleSheet) {
          document.head.removeChild(this.customStyleSheet)
        }

        // Load the custom .css file provided specifically for this project
        this.customStyleSheet = document.createElement('link')
        this.customStyleSheet.rel = 'stylesheet'
        this.customStyleSheet.href = this.storeBaseUrl + 'settings/css'
        document.head.appendChild(this.customStyleSheet)
      })
    },
    print: function (newContent) {
      document.body.classList.add('print')
      // Set the print content
      this.printContent = newContent

      // Wait a bit
      this.$nextTick(() => {
        // Ask the browser to print
        window.print()
        this.$nextTick(() => {
          // Hide the print content
          this.printContent = null
          document.body.classList.remove('print')
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
    updateI18nAppState: function () {
      this.$i18n.silentTranslationWarn = this.storeAppState !== 'development'
    },
    toast: function (config) {
      this.$bvToast.toast(config.message, config)
    }
  },
  created: async function () {
    loadLanguageAsync(this.storeLocale).then(() => {
      this.i18nLoaded = true
    })

    await apiGetSettings(result => {
      this.$store.dispatch('setServerSettings', result)

      if (result.plausibleDomain) {
        Vue.use(VuePlausible, {
          domain: result.plausibleDomain,
          hashMode: result.plausibleHashMode || true,
          apiHost: result.plausibleApiHost || 'https://plausible.io',
          trackLocalhost: false
        })

        this.$nextTick(() => {
          this.$plausible.enableAutoPageviews()
        })
      }

      apiGetEntityTypeStats(result => {
        this.$store.dispatch('setEntityTypeStats', result)
      })
    }, {
      codes: [503],
      callback: () => this.$router.push({ name: Pages.setup })
    })
  },
  watch: {
    storeAppState: function () {
      this.updateI18nAppState()
    }
  },
  mounted: function () {
    this.updateI18nAppState()

    emitter.on('on-print', this.print)
    emitter.on('on-stylesheet-changed', this.attachStyleSheet)
    emitter.on('show-loading', this.toggleLoading)
    emitter.on('toast', this.toast)
    this.attachStyleSheet()

    // Log the run
    if (!this.isLocalhost()) {
      let id = this.uniqueClientId
      if (!id) {
        id = uuidv4()

        this.$store.dispatch('setUniqueClientId', id)
      }

      const config = new Detector().detect()
      if (config.os !== undefined && config.os !== null && config.os !== 'Search Bot') {
        const data = {
          application: 'Germinate',
          id: id,
          version: germinateVersion,
          locale: this.storeLocale,
          os: `${config.os} ${config.osVersion}`
        }
        authAxios({ url: 'https://ics.hutton.ac.uk/app-logger/log', method: 'GET', data: data })
      }
    }
  },
  beforeDestroy: function () {
    emitter.off('on-print', this.print)
    emitter.off('on-stylesheet-changed', this.attachStyleSheet)
    emitter.off('show-loading', this.toggleLoading)
    emitter.off('toast', this.toast)
  }
}
</script>

<style lang="scss">
$font-size-base: 1rem;
$primary: #23a1d7;
$dark:    #36363b;
$secondary: #bdc3c7;
$success: #27ae60;
$info:    #3498db;
$warning: #f39c12;
$danger:  #e74c3c;
$indigo:  #6610f2;
$purple:  #6f42c1;
$pink:    #e83e8c;
$red:     #dc3545;
$orange:  #fd7e14;
$yellow:  #ffc107;
$green:   #28a745;
$teal:    #20c997;
$cyan:    #17a2b8;
$headings-font-weight: 400;
$badge-font-size: 85%;
$small-font-size: 70%;

$container-max-widths: (
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px,
  xxxl: 1600px
);

$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1140px,
  xxl: 1320px,
  xxxl: 1500px
);

@import '~bootswatch/dist/cosmo/variables';
@import '~bootstrap/scss/bootstrap';
@import '~bootstrap-vue/src/index.scss';
@import '~bootswatch/dist/cosmo/bootswatch';
@import '@/assets/dark-mode.scss';
@import '~flag-icons/css/flag-icons.min.css';

.card-columns {
  @include media-breakpoint-only(sm) {
    column-count: 1;
  }
  @include media-breakpoint-only(md) {
    column-count: 1;
  }
  @include media-breakpoint-only(lg) {
    column-count: 1;
  }
  @include media-breakpoint-only(xl) {
    column-count: 2;
  }
  @include media-breakpoint-only(xxl) {
    column-count: 2;
  }
  @include media-breakpoint-only(xxxl) {
    column-count: 2;
  }
}

.list-group-item.info {
  border-left: 4px solid $info !important;
}
.list-group-item.warning {
  border-left: 4px solid $warning !important;
}
.list-group-item.danger {
  border-left: 4px solid $danger !important;
}
.list-group-item.success {
  border-left: 4px solid $success !important;
}
button .mdi-icon-wrapper + * {
  vertical-align: middle;
}

// Hide modal backdrop when printing
body.print .modal-backdrop {
  display: none;
}
</style>
