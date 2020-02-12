<template>
  <div class="app">
    <AppHeader fixed id="app-header">
      <SidebarToggler class="d-lg-none" display="md" mobile @click.native="toggleSidebar" />
      <b-link class="navbar-brand" to="/">
        <img class="navbar-brand-full" src="img/germinate-square.svg" width="58" height="58" alt="Germinate">
        <img class="navbar-brand-minimized" src="img/germinate-square.svg" width="58" height="58" alt="Germinate">
        <img class="navbar-brand-full navbar-brand-text" src="img/germinate-text.svg" height="22" alt="Germinate">
      </b-link>
      <SidebarToggler class="d-md-down-none" display="lg" :defaultOpen=true @click.native="toggleSidebar" />
      <b-navbar-nav class="ml-auto align-items-stretch top-nav">
        <b-nav-form @submit.prevent="search" class="d-none d-sm-inline">
          <b-input-group class="mr-sm-2">
            <b-form-input size="sm" v-model="searchTerm" :placeholder="$t('inputPlaceholderSearch')"></b-form-input>
            <b-input-group-append>
              <b-button variant="light" @click="search"><i class="mdi mdi-18px mdi-magnify" /></b-button>
            </b-input-group-append>
          </b-input-group>
        </b-nav-form>
        <b-nav-item :disabled="getHelpDisabled()" @click="showHelp()" id="top-nav-help" class="d-flex align-self-center"><i :class="`mdi mdi-18px mdi-help-circle-outline ${getHelpDisabled() ? '' : 'text-info'}`" /></b-nav-item>
        <LocaleDropdown class="top-nav-locale d-flex align-self-center"/>
        <MarkedItemDropdown class="d-flex align-self-center" />
        <UserSettingsDropdown class="d-flex align-self-center" />
      </b-navbar-nav>
      <div>
        <AsideToggler class="d-block aside-toggler" :display="'xs'" ref="asideToggler" @click.native="updateAside" v-b-popover="asidePopoverConfig" />
        <b-badge pill variant="info" class="async-badge" v-if="asyncJobCount !== null && asyncJobCount > 0">{{ asyncJobCount }}</b-badge>
      </div>
    </AppHeader>

    <b-popover target="app-header" show placement="bottom" variant="info" v-if="serverSettings && serverSettings.showGdprNotification === true && cookiesAccepted === null">
      <template v-slot:title>{{ $t('widgetGdprNotificationTitle') }}</template>
      <p>{{ $t('widgetGdprNotificationText') }}</p>
      <p>{{ $t('widgetGdprNotificationReadMore') }}</p>
      <div class="d-flex flex-row">
        <b-button variant="success" class="flex-fill mr-2" @click="acceptCookies(true)">{{ $t('widgetGdprNotificationButtonAccept') }}</b-button>
        <b-button variant="secondary" class="flex-fill text-muted" v-b-tooltip:hover :title="$t('tooltipGdprNotificationButtonReject')" @click="acceptCookies(false)">{{ $t('widgetGdprNotificationButtonDecline') }}</b-button>
      </div>
    </b-popover>

    <div class="app-body">
      <AppSidebar fixed>
        <SidebarHeader/>
        <SidebarNav :navItems="nav" ref="sidebarNav"/>
        <SidebarFooter/>
        <SidebarMinimizer @click.native="toggleSidebar"/>
      </AppSidebar>
      <main class="main">
        <div class="container-fluid mb-4">
          <div class="mb-3 d-flex align-items-center my-4">
            <b-img width="48" height="48" :src="`${baseUrl}image/src-svg/crop.svg`"></b-img>
            <h5 class="my-0 ml-3">{{ $t('germinateTitle') }}</h5>
          </div>
          <hr />
          <router-view :key="$route.path"></router-view>
        </div>
      </main>
      <AppAside off-canvas>
        <DefaultAside ref="aside" />
      </AppAside>
    </div>
    <TheFooter class="bg-dark">
      <div class="text-muted">
        Version 4.0.0
      </div>
      <div class="ml-auto">
        <a href="https://ics.hutton.ac.uk/get-germinate">Germinate</a>
        <span class="ml-1">&copy; {{ new Date().getFullYear() }} The James Hutton Institute.</span>
      </div>
    </TheFooter>

    <b-modal :title="$t('widgetHelpTitle')" v-if="helpKey" ref="helpModal" ok-only size="lg">
      <p v-html="$t(this.helpKey)" />
    </b-modal>

    <Tour :steps="popoverContent" ref="introductionTour" />
  </div>
</template>

<script>
import { Header as AppHeader, SidebarToggler, Sidebar as AppSidebar, SidebarFooter, SidebarHeader, SidebarMinimizer, SidebarNav, Aside as AppAside, AsideToggler, Footer as TheFooter } from '@coreui/vue'
import DefaultAside from './DefaultAside'
import UserSettingsDropdown from '@/components/dropdown/UserSettingsDropdown'
import MarkedItemDropdown from '@/components/dropdown/MarkedItemDropdown'
import LocaleDropdown from '@/components/dropdown/LocaleDropdown'
import Tour from '@/components/util/Tour'
import { EventBus } from '@/plugins/event-bus.js'

export default {
  name: 'DefaultContainer',
  components: {
    AsideToggler,
    AppHeader,
    AppSidebar,
    AppAside,
    TheFooter,
    DefaultAside,
    LocaleDropdown,
    UserSettingsDropdown,
    SidebarFooter,
    SidebarToggler,
    SidebarHeader,
    SidebarNav,
    SidebarMinimizer,
    Tour,
    MarkedItemDropdown
  },
  data () {
    return {
      nav: [],
      searchTerm: null,
      popoverContent: [{
        title: () => this.$t('widgetIntroTourStepTitleWelcome'),
        text: () => this.$t('widgetIntroTourStepTextWelcome'),
        target: () => '#app-header',
        position: 'bottom'
      }, {
        title: () => this.$t('widgetIntroTourStepTitleMenu'),
        text: () => this.$t('widgetIntroTourStepTextMenu'),
        target: () => this.getMenuElement(),
        position: 'right'
      }, {
        title: () => this.$t('widgetIntroTourTitleHelp'),
        text: () => this.$t('widgetIntroTourTextHelp'),
        target: () => '#top-nav-help',
        position: 'bottom'
      }, {
        title: () => this.$t('widgetIntroTourTitleLanguage'),
        text: () => this.$t('widgetIntroTourTextLanguage'),
        target: () => '.top-nav-locale',
        position: 'bottom'
      }, {
        title: () => this.$t('widgetIntroTourTitleAsync'),
        text: () => this.$t('widgetIntroTourTextAsync'),
        target: () => '.aside-toggler',
        position: 'bottom'
      }],
      asidePopoverConfig: {
        title: this.$t('popoverSideMenuTitle'),
        content: this.$t('popoverSideMenuText'),
        placement: 'left',
        id: 'aside-popover-trigger',
        trigger: 'manual',
        variant: 'info'
      }
    }
  },
  computed: {
    name () {
      return this.$route.name
    },
    list () {
      return this.$route.matched.filter((route) => route.name || route.meta.label)
    }
  },
  watch: {
    locale: function (newValue, oldValue) {
      this.updateNav()
    }
  },
  methods: {
    acceptCookies: function (decision) {
      this.$store.dispatch('ON_COOKIES_ACCEPTED', decision)
    },
    search: function () {
      if (this.searchTerm && this.searchTerm.length > 0) {
        this.$router.push({ name: 'search-query', params: { searchTerm: this.searchTerm } })
      } else {
        this.$router.push({ name: 'search' })
      }
      this.searchTerm = null
    },
    getHelpDisabled: function () {
      return this.helpKey === undefined || this.helpKey === null
    },
    showHelp: function () {
      this.$refs.helpModal.show()
    },
    updateNav: function () {
      var tempNav = [
        {
          name: this.$t('menuHome'),
          url: '/home',
          icon: 'mdi mdi-18px mdi-home'
        },
        {
          name: this.$t('menuData'),
          url: '/data',
          icon: 'mdi mdi-18px mdi-harddisk',
          children: [
            {
              name: this.$t('menuGermplasm'),
              identifiers: ['germplasm'],
              url: '/data/germplasm',
              icon: 'mdi mdi-18px mdi-sprout'
            },
            {
              name: this.$t('menuGenotypicData'),
              url: '/data/genotypes/maps',
              icon: 'mdi mdi-18px mdi-dna',
              children: [
                {
                  name: this.$t('menuGenotypicMarkers'),
                  identifiers: ['markers'],
                  url: '/data/genotypes/markers',
                  icon: 'mdi mdi-18px mdi-rotate-90 mdi-format-indent-increase'
                },
                {
                  name: this.$t('menuGenotypicMaps'),
                  identifiers: ['maps', 'map-details'],
                  url: '/data/genotypes/maps',
                  icon: 'mdi mdi-18px mdi-reorder-vertical'
                },
                {
                  name: this.$t('menuGenotypicDataExport'),
                  identifiers: ['export-genotypes'],
                  url: '/data/export/genotype',
                  icon: 'mdi mdi-18px mdi-dna'
                },
                {
                  name: this.$t('menuAlleleFrequencyDataExport'),
                  identifiers: ['export-allelefrequency'],
                  url: '/data/export/allelefreq',
                  icon: 'mdi mdi-18px mdi-pulse'
                }
              ]
            },
            {
              name: this.$t('menuTrialsData'),
              url: '/data/trials/traits',
              icon: 'mdi mdi-18px mdi-tag-multiple',
              children: [
                {
                  name: this.$t('menuTrialsTraits'),
                  identifiers: ['traits'],
                  url: '/data/trials/traits',
                  icon: 'mdi mdi-18px mdi-tag-text-outline'
                },
                {
                  name: this.$t('menuTrialsDataExport'),
                  identifiers: ['export-trials'],
                  url: '/data/export/trials',
                  icon: 'mdi mdi-18px mdi-shovel'
                }
              ]
            },
            {
              name: this.$t('menuGeography'),
              url: '/data/geography',
              icon: 'mdi mdi-18px mdi-earth',
              children: [
                {
                  name: this.$t('menuLocations'),
                  identifiers: ['locations'],
                  url: '/data/geography/locations',
                  icon: 'mdi mdi-map'
                },
                {
                  name: this.$t('menuGeographicSearch'),
                  identifiers: ['geographic-search'],
                  url: '/data/geography/geographic-search',
                  icon: 'mdi mdi-map-search'
                }
              ]
            },
            {
              name: this.$t('menuClimateData'),
              url: '/data/climate/climates',
              icon: 'mdi mdi-18px mdi-weather-snowy-rainy',
              children: [
                {
                  name: this.$t('menuClimateClimates'),
                  identifiers: ['climates'],
                  url: '/data/climate/climates',
                  icon: 'mdi mdi-18px mdi-weather-snowy-rainy'
                },
                {
                  name: this.$t('menuClimateDataExport'),
                  identifiers: ['export-climates'],
                  url: '/data/export/climate',
                  icon: 'mdi mdi-18px mdi-chart-snakey'
                }
              ]
            },
            {
              name: this.$t('menuCompoundsData'),
              url: '/data/compounds/compounds',
              icon: 'mdi mdi-18px mdi-flask',
              children: [
                {
                  name: this.$t('menuCompoundsCompounds'),
                  identifiers: ['compounds'],
                  url: '/data/compounds/compounds',
                  icon: 'mdi mdi-18px mdi-atom'
                },
                {
                  name: this.$t('menuCompoundDataExport'),
                  identifiers: ['export-compounds'],
                  url: '/data/export/compound',
                  icon: 'mdi mdi-18px mdi-flask'
                }
              ]
            },
            {
              name: this.$t('menuDatasets'),
              identifiers: ['datasets'],
              url: '/data/datasets',
              icon: 'mdi mdi-18px mdi-database'
            },
            {
              name: this.$t('menuDataStatistics'),
              identifiers: ['statistics'],
              url: '/data/statistics',
              icon: 'mdi mdi-18px mdi-chart-areaspline'
            }
          ]
        },
        {
          name: this.$t('menuGroups'),
          identifiers: ['groups', 'group-details'],
          url: '/groups',
          icon: 'mdi mdi-18px mdi-group'
        },
        {
          name: this.$t('menuImages'),
          identifiers: ['images'],
          url: '/images',
          icon: 'mdi mdi-18px mdi-image-multiple'
        },
        {
          name: this.$t('menuSearch'),
          identifiers: ['search'],
          url: '/search',
          icon: 'mdi mdi-18px mdi-magnify'
        },
        {
          name: this.$t('menuAbout'),
          url: '/about',
          icon: 'mdi mdi-18px mdi-information',
          children: [
            {
              name: this.$t('menuAboutProject'),
              identifiers: ['about-project'],
              url: '/about/project',
              icon: 'mdi mdi-18px mdi-information-outline'
            },
            {
              name: this.$t('menuAboutGerminate'),
              identifiers: ['about-germinate'],
              url: '/about/germinate',
              icon: 'mdi mdi-18px mdi-alpha-g-circle-outline'
            },
            {
              name: this.$t('menuAboutExportFormat'),
              identifiers: ['about-export-formats'],
              url: '/about/export-formats',
              icon: 'mdi mdi-18px mdi-file-export'
            }
          ]
        }
      ]

      // If the server asks to hide certain pages, remove them from the menu
      if (this.serverSettings && this.serverSettings.hiddenPages && this.serverSettings.hiddenPages.length > 0) {
        var hiddenPages = this.serverSettings.hiddenPages
        this.nav = tempNav.filter(function f (o) {
          if (o.identifiers) {
            // If the item itself contains the hidden name as an identifier, remove it
            if (o.identifiers.filter(value => hiddenPages.indexOf(value) !== -1).length > 0) {
              return false
            }
          }

          // Else, recursively check the children and only keep this one, if there's at least one visible child
          if (o.children && o.children.length > 0) {
            return (o.children = o.children.filter(f)).length
          }

          return true
        })
      } else {
        this.nav = tempNav
      }
    },
    getMenuElement: function () {
      var width = this.getWindowWidth()

      if (width < 992) {
        return '.navbar-toggler'
      } else {
        return '.app-body .sidebar .sidebar-nav .nav'
      }
    },
    toggleSidebar: function () {
      this.$nextTick(() => {
        const isMinimized = document.body.classList.contains('sidebar-minimized')
        const isVisible = document.body.classList.contains('sidebar-lg-show')
        const state = isVisible ? 'sidebar-lg-show' : (isMinimized ? 'sidebar-minimized brand-minimized' : '')

        this.$store.dispatch('ON_SIDEBAR_STATE_CHANGED', state)
      })
    },
    toggleAside: function () {
      if (!document.body.classList.contains('aside-menu-show')) {
        this.$refs.asideToggler.toggle()
        this.$root.$emit('bv::show::popover', 'aside-popover-trigger')

        setTimeout(() => this.$root.$emit('bv::hide::popover', 'aside-popover-trigger'), 5000)
      }

      this.updateAside()
    },
    updateAside: function () {
      this.$nextTick(() => this.$refs.aside.updateAsyncJobs(true))
    },
    startIntroduction: function () {
      this.$refs.introductionTour.start()
    }
  },
  destroyed: function () {
    EventBus.$off('toggle-aside', this.toggleAside)
    EventBus.$off('show-introduction')
  },
  mounted: function () {
    this.updateNav()
    EventBus.$on('toggle-aside', this.toggleAside)
    EventBus.$on('show-introduction', this.startIntroduction)

    if (this.sidebarState && this.sidebarState.length > 0) {
      this.$nextTick(() => document.body.classList.add(...this.sidebarState.split(' ')))
    } else {
      this.$nextTick(() => {
        document.body.classList.remove('sidebar-lg-show', 'sidebar-minimized', 'brand-minimized')
      })
    }

    // Since we can't add the logos to the nav sidebar in any way that CoreUI provided, we have to insert it manually.
    var sb = this.$refs.sidebarNav.$el.querySelector('section')
    var img = document.createElement('img')
    img.src = this.baseUrl + 'image/src-svg/logo.svg'
    img.classList.add('brand-logo')
    img.classList.add('p-3')
    sb.appendChild(img)
  }
}
</script>

<style>
.brand-logo {
  width: 100%;
}
.sidebar-minimized .brand-logo {
  display: none;
}
.async-badge {
  position: absolute;
  margin-top: -13px;
  pointer-events: none;
}
.app-footer.bg-dark {
  border-top: 1px solid #24292d;
}
.app-header .navbar-brand {
  width: 200px;
}
.app-header .navbar-brand-text {
  margin-left: 10px;
}
.top-nav li.nav-item {
  justify-content: center;
  min-height: 40px;
}
.top-nav li.nav-item a {
  -ms-flex-item-align: center !important;
  align-self: center !important;
}
</style>
