<template>
  <div>
    <b-navbar :type="storeDarkMode ? 'dark' : 'light'" :variant="storeDarkMode ? 'dark' : 'light'" id="app-header" fixed="top" class="border-primary border-bottom">
      <b-navbar-brand :to="{ name: 'home' }">
        <b-img-lazy class="navbar-brand-full" src="img/germinate-square.svg" width="45" height="45" alt="Germinate logo" />
        <b-img-lazy class="navbar-brand-full navbar-brand-text ml-2" src="img/germinate-text.svg" height="22" alt="Germinate logo" />
      </b-navbar-brand>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto align-items-stretch top-nav">
        <b-nav-form @submit.prevent="search" class="d-none d-md-inline" form-class="h-100">
          <!-- Search box -->
          <b-input-group class="mr-sm-2">
            <b-form-input size="sm" class="search-input" v-model="searchTerm" :placeholder="$t('inputPlaceholderSearch')"></b-form-input>
            <b-input-group-append>
              <b-button @click="search" :aria-label="$t('inputPlaceholderSearch')">
                <MdiIcon :path="mdiMagnify" />
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-nav-form>

        <b-nav-item :disabled="helpDisabled" @click="showHelp" id="top-nav-help" aria-label="Help information">
          <MdiIcon :path="mdiHelpCircleOutline" :class="{ 'text-info': !helpDisabled }" />
        </b-nav-item>
        <b-nav-item @click="toggleDarkMode" id="top-nav-darkmode" v-b-tooltip:hover="$t('menuTopDarkModeToggle')" :aria-label="$t('menuTopDarkModeToggle')">
          <span :class="{ 'text-info': storeDarkMode === true }"><MdiIcon :path="mdiThemeLightDark" /></span>
        </b-nav-item>

        <LocaleDropdown class="top-nav-locale"/>
        <UserSettingsDropdown />
        <b-nav-item v-b-toggle.asyncbar id="aside-toggler" aria-label="Asynchronous job toggle">
          <!-- Indicate how many jobs are running -->
          <b-badge pill variant="info" class="async-badge" v-if="storeAsyncJobCount !== null && storeAsyncJobCount > 0">{{ storeAsyncJobCount }}</b-badge>
          <MdiIcon :path="mdiMenu" v-else/>
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>
    <div id="dashboard-app">
      <SidebarComponent :collapsed="collapsed" :width="sidebarWidth" @toggle-collapse="onToggleCollapse" />

      <div id="content" :style="{ paddingLeft: sidebarWidth }" :class="{ 'mx-3': true, 'pb-3': true, 'pt-2': true, 'collapsed': collapsed, 'onmobile': isOnMobile }" >
        <b-container fluid>
          <PageHeader />

          <router-view :key="$route.path" />
        </b-container>
      </div>
    </div>

    <!-- GDPR notification -->
    <b-popover target="app-header" show placement="bottom" variant="info" v-if="storeServerSettings && storeServerSettings.showGdprNotification === true && storeCookiesAccepted === null">
      <template v-slot:title>{{ $t('widgetGdprNotificationTitle') }}</template>
      <p>{{ $t('widgetGdprNotificationText') }}</p>
      <p><router-link :to="{ name: 'cookies' }">{{ $t('widgetGdprNotificationReadMore') }}</router-link></p>
      <div class="d-flex flex-row">
        <b-button variant="success" class="flex-fill mr-2" @click="acceptCookies(true)">{{ $t('widgetGdprNotificationButtonAccept') }}</b-button>
        <b-button variant="outline-secondary" class="flex-fill text-muted" v-b-tooltip:hover :title="$t('tooltipGdprNotificationButtonReject')" @click="acceptCookies(false)">{{ $t('widgetGdprNotificationButtonDecline') }}</b-button>
      </div>
    </b-popover>

    <!-- Help modal -->
    <b-modal :title="$t('widgetHelpTitle')" v-if="storeHelpKey" ref="helpModal" ok-only size="lg">
      <p v-html="$t(this.storeHelpKey)" />
    </b-modal>

    <div
      v-if="isOnMobile && !collapsed"
      class="v-sidebar-backdrop b-sidebar-backdrop bg-dark"
      @click="collapsed = true" />
    <b-sidebar id="asyncbar" shadow right backdrop lazy backdrop-variant="dark" sidebar-class="border-left border-primary" title="Asynchronous jobs" v-model="asyncSidebarOpen">
      <SidebarAsyncJobs />
    </b-sidebar>

    <!-- Introduction tour -->
    <Tour :steps="popoverContent" ref="introductionTour" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import PageHeader from '@/components/structure/PageHeader'
import SidebarComponent from '@/components/structure/SidebarComponent'
import MdiIcon from '@/components/icons/MdiIcon'
import LocaleDropdown from '@/components/dropdowns/LocaleDropdown'
import UserSettingsDropdown from '@/components/dropdowns/UserSettingsDropdown'
import SidebarAsyncJobs from '@/components/structure/SidebarAsyncJobs'
import Tour from '@/components/util/Tour'
import miscApiMixin from '@/mixins/api/misc'
import statsApiMixin from '@/mixins/api/stats'

import { mdiMagnify, mdiHelpCircleOutline, mdiMenu, mdiThemeLightDark } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    LocaleDropdown,
    MdiIcon,
    PageHeader,
    SidebarAsyncJobs,
    SidebarComponent,
    UserSettingsDropdown,
    Tour
  },
  computed: {
    ...mapGetters([
      'storeAsyncJobCount',
      'storeCookiesAccepted',
      'storeDarkMode',
      'storeHelpKey',
      'storeLocale',
      'storeServerSettings'
    ]),
    helpDisabled: function () {
      return this.storeHelpKey === undefined || this.storeHelpKey === null
    }
  },
  data: function () {
    return {
      mdiHelpCircleOutline,
      mdiMagnify,
      mdiMenu,
      mdiThemeLightDark,
      collapsed: false,
      isOnMobile: false,
      sidebarWidth: '300px',
      searchTerm: null,
      asyncSidebarOpen: false,
      popoverContent: [{
        title: () => this.$t('widgetIntroTourStepTitleWelcome'),
        text: () => this.$t('widgetIntroTourStepTextWelcome'),
        target: () => '#app-header',
        position: 'bottom'
      }, {
        title: () => this.$t('widgetIntroTourStepTitleMenu'),
        text: () => this.$t('widgetIntroTourStepTextMenu'),
        target: () => '.v-sidebar-menu',
        position: 'right'
      }, {
        title: () => this.$t('widgetIntroTourTitleHelp'),
        text: () => this.$t('widgetIntroTourTextHelp'),
        target: () => '#top-nav-help',
        position: 'bottom'
      }, {
        title: () => this.$t('widgetIntroTourTitleDarkMode'),
        text: () => this.$t('widgetIntroTourTextDarkMode'),
        target: () => '#top-nav-darkmode',
        position: 'bottom'
      }, {
        title: () => this.$t('widgetIntroTourTitleLanguage'),
        text: () => this.$t('widgetIntroTourTextLanguage'),
        target: () => '.top-nav-locale',
        position: 'bottom'
      }, {
        title: () => this.$t('widgetIntroTourTitleAsync'),
        text: () => this.$t('widgetIntroTourTextAsync'),
        target: () => '#aside-toggler',
        position: 'bottom'
      }]
    }
  },
  watch: {
    storeDarkMode: function () {
      this.loadAndSetDarkMode()
    }
  },
  mixins: [miscApiMixin, statsApiMixin],
  methods: {
    showHelp: function () {
      this.$refs.helpModal.show()
    },
    acceptCookies: function (decision) {
      this.$store.dispatch('setCookiesAccepted', decision)
    },
    loadAndSetDarkMode: function () {
      document.body.classList.toggle('dark-mode')
    },
    /**
     * Toggles the dark mode on or off
     */
    toggleDarkMode: function () {
      if (this.storeDarkMode === true) {
        this.$store.dispatch('setDarkMode', false)
      } else {
        this.$store.dispatch('setDarkMode', true)
      }
    },
    onToggleCollapse (collapsed) {
      this.collapsed = collapsed
    },
    onResize () {
      if (window.innerWidth < 992) {
        this.sidebarWidth = '200px'
      } else {
        this.sidebarWidth = '300px'
      }

      if (window.innerWidth <= 767) {
        this.isOnMobile = true
        this.collapsed = true
      } else {
        this.isOnMobile = false
        this.collapsed = false
      }
    },
    search: function () {
      if (this.searchTerm === '💩') {
        // TODO: Easteregg goes here...
      } else if (this.searchTerm && this.searchTerm.length > 0) {
        this.$router.push({ name: 'search-query', params: { searchTerm: this.searchTerm } })
      } else {
        this.$router.push({ name: 'search' })
      }
      this.searchTerm = null
    },
    startIntroduction: function () {
      this.$refs.introductionTour.start()
    },
    toggleAsyncSidebar: function (upOrDown) {
      this.$store.dispatch('setAsyncSidebarTabIndex', upOrDown === 'download' ? 0 : 1)
      this.asyncSidebarOpen = true
    }
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.onResize)
    emitter.off('show-introduction', this.startIntroduction)
    emitter.off('toggle-aside', this.toggleAsyncSidebar)
  },
  mounted: function () {
    this.onResize()
    window.addEventListener('resize', this.onResize)
    emitter.on('show-introduction', this.startIntroduction)
    emitter.on('toggle-aside', this.toggleAsyncSidebar)

    if (this.storeDarkMode) {
      this.loadAndSetDarkMode()
    }
  }
}
</script>

<style lang="scss">
$navbar-height: 72px;

#dashboard-app {
  margin-top: $navbar-height;
  height: calc(100vh - $navbar-height);
}

#content {
  transition: 0.3s ease;
}
#content.collapsed,
#content.onmobile {
  padding-left: 50px !important;
}

.v-sidebar-menu {
  position: fixed;
  top: $navbar-height;
  left: 0;
  bottom: 0;
}

.v-sidebar-backdrop {
  z-index: 900;
}

.form-inline .form-control.search-input {
  height: auto;
}

.mdi-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.b-sidebar > .b-sidebar-header {
  flex-direction: row-reverse;
}

.b-sidebar.b-sidebar-right > .b-sidebar-header .close {
  margin-left: auto;
  margin-right: 0;
}

@media (min-width: 768px) {
  #content {
    margin-left: 0;
  }
}
</style>
