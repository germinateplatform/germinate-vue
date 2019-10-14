<template>
  <div class="app">
    <AppHeader fixed>
      <SidebarToggler class="d-lg-none" display="md" mobile />
      <b-link class="navbar-brand" to="/">
        <img class="navbar-brand-full" src="/img/germinate-square.svg" width="48" height="48" alt="Germinate">
        <img class="navbar-brand-minimized" src="img/germinate-square.svg" width="48" height="48" alt="Germinate">
      </b-link>
      <SidebarToggler class="d-md-down-none" display="lg" :defaultOpen=true />
      <b-navbar-nav class="ml-auto">
        <b-nav-form @submit.prevent="search">
          <b-input-group class="mr-sm-2">
            <b-form-input size="sm" v-model="searchTerm" :placeholder="$t('inputPlaceholderSearch')"></b-form-input>
            <b-input-group-append>
              <b-button variant="light" @click="search"><i class="mdi mdi-18px mdi-magnify" /></b-button>
            </b-input-group-append>
          </b-input-group>
        </b-nav-form>
        <b-nav-item :disabled="getHelpDisabled()" @click="showHelp()"><i class="mdi mdi-18px mdi-help-circle-outline" /></b-nav-item>
        <LocaleDropdown />
        <MarkedItemDropdown />
        <UserSettingsDropdown />
      </b-navbar-nav>
      <div>
        <AsideToggler class="d-block" :display="'xs'" ref="asideToggler" @click.native="updateAside" />
        <b-badge pill variant="info" class="async-badge" v-if="asyncJobUuids && asyncJobUuids.length > 0">{{ asyncJobUuids.length }}</b-badge>
      </div>
    </AppHeader>
    <div class="app-body">
      <AppSidebar fixed>
        <SidebarHeader/>
        <SidebarNav :navItems="nav"></SidebarNav>
        <b-img class="brand-logo" fluid :src="getImageSrc('logo.svg')"></b-img>
        <SidebarFooter/>
        <SidebarMinimizer/>
      </AppSidebar>
      <main class="main">
        <div class="container-fluid my-4">
          <div class="mb-3 d-flex align-items-center">
            <b-img width="48" height="48" :src="getImageSrc('crop.svg')"></b-img>
            <h5 class="mt-0 ml-3">{{ $t('germinateTitle') }}</h5>
          </div>
          <hr />
          <router-view :key="$route.path"></router-view>
        </div>
      </main>
      <AppAside off-canvas>
        <DefaultAside ref="aside" />
      </AppAside>
    </div>
    <TheFooter>
      <div class="ml-auto">
        <a href="https://ics.hutton.ac.uk/get-germinate">Germinate</a>
        <span class="ml-1">&copy; {{ new Date().getFullYear() }} The James Hutton Institute.</span>
      </div>
    </TheFooter>

    <b-modal :title="$t('widgetHelpTitle')" v-if="helpKey" ref="helpModal" ok-only size="lg">
      <p v-html="$t(this.helpKey)" />
    </b-modal>
  </div>
</template>

<script>
import { Header as AppHeader, SidebarToggler, Sidebar as AppSidebar, SidebarFooter, SidebarHeader, SidebarMinimizer, SidebarNav, Aside as AppAside, AsideToggler, Footer as TheFooter } from '@coreui/vue'
import DefaultAside from './DefaultAside'
import UserSettingsDropdown from '@/components/dropdown/UserSettingsDropdown'
import MarkedItemDropdown from '@/components/dropdown/MarkedItemDropdown'
import LocaleDropdown from '@/components/dropdown/LocaleDropdown'
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
    MarkedItemDropdown
  },
  data () {
    return {
      nav: [],
      searchTerm: null
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
    search: function () {
      this.$router.push({ name: 'search', params: { searchTerm: this.searchTerm } })
    },
    getImageSrc: function (img) {
      var params = {
        token: this.token ? this.token.imageToken : null
      }
      var paramString = this.toUrlString(params)

      return this.baseUrl + 'image/src-svg/' + img + '?' + paramString
    },
    getHelpDisabled: function () {
      return this.helpKey === undefined || this.helpKey === null
    },
    showHelp: function () {
      this.$refs.helpModal.show()
    },
    updateNav: function () {
      this.nav = [
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
              url: '/data/germplasm',
              icon: 'mdi mdi-18px mdi-sprout'
            },
            {
              name: this.$t('menuGenotypicData'),
              url: '/data/genotypes/maps',
              icon: 'mdi mdi-18px mdi-dna',
              children: [
                {
                  name: this.$t('menuGenotypicMaps'),
                  url: '/data/genotypes/maps',
                  icon: 'mdi mdi-18px mdi-reorder-vertical'
                },
                {
                  name: this.$t('menuGenotypicDataExport'),
                  url: '/data/export/genotype',
                  icon: 'mdi mdi-18px mdi-dna'
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
                  url: '/data/trials/traits',
                  icon: 'mdi mdi-18px mdi-tag-text-outline'
                },
                {
                  name: this.$t('menuTrialsDataExport'),
                  url: '/data/export/trials',
                  icon: 'mdi mdi-18px mdi-shovel'
                }
              ]
            },
            {
              name: this.$t('menuDatasets'),
              url: '/data/datasets',
              icon: 'mdi mdi-18px mdi-database'
            },
            {
              name: this.$t('menuEnvironment'),
              url: '/data/environment',
              icon: 'mdi mdi-18px mdi-nature-people',
              children: [
                {
                  name: this.$t('menuLocations'),
                  url: '/data/environment/locations',
                  icon: 'mdi mdi-map'
                },
                {
                  name: this.$t('menuGeographicSearch'),
                  url: '/data/environment/geographic-search',
                  icon: 'mdi mdi-map-search'
                }
              ]
            }
          ]
        },
        {
          name: this.$t('menuGroups'),
          url: '/groups',
          icon: 'mdi mdi-18px mdi-group'
        },
        {
          name: this.$t('menuImageGallery'),
          url: '/image-gallery',
          icon: 'mdi mdi-18px mdi-image-multiple'
        },
        {
          name: this.$t('menuAbout'),
          url: '/about',
          icon: 'mdi mdi-18px mdi-information',
          children: [
            {
              name: this.$t('menuAboutGerminate'),
              url: '/about/germinate',
              icon: 'mdi mdi-map'
            }
          ]
        }
      ]
    },
    toggleAside: function () {
      if (!document.body.classList.contains('aside-menu-show')) {
        this.$refs.asideToggler.toggle()
      }

      this.updateAside()
    },
    updateAside: function () {
      this.$nextTick(() => this.$refs.aside.updateAsyncJobs(true))
    }
  },
  destroyed: function () {
    EventBus.$off('toggle-aside', this.toggleAside)
  },
  mounted: function () {
    this.updateNav()
    EventBus.$on('toggle-aside', this.toggleAside)
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
</style>
