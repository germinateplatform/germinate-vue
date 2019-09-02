<template>
  <div class="app">
    <AppHeader fixed>
      <SidebarToggler class="d-lg-none" display="md" mobile />
      <b-link class="navbar-brand d-none d-lg-inline-flex" to="/">
        <img class="navbar-brand-full" src="/img/germinate.svg" width="150" height="32" alt="Germinate">
        <img class="navbar-brand-minimized" src="img/germinate-square.svg" width="48" height="48" alt="Germinate">
      </b-link>
      <SidebarToggler class="d-md-down-none" display="lg" :defaultOpen=true />
      <!-- <b-navbar-nav class="d-md-down-none">
        <b-nav-item class="px-3">Settings</b-nav-item>
      </b-navbar-nav> -->
      <b-navbar-nav class="ml-auto">
        <b-nav-form>
          <b-form-input size="sm" class="mr-sm-2" placeholder="Search"></b-form-input>
        </b-nav-form>
        <b-nav-item :disabled="getHelpDisabled()" @click="showHelp()"><i class="mdi mdi-18px mdi-help-circle-outline" /></b-nav-item>
        <LocaleDropdown />
        <MarkedItemDropdown />
        <UserSettingsDropdown />
      </b-navbar-nav>
      <AsideToggler class="d-none d-lg-block" />
      <!--<AsideToggler class="d-lg-none" mobile />-->
    </AppHeader>
    <div class="app-body">
      <AppSidebar fixed>
        <SidebarHeader/>
        <SidebarForm/>
        <SidebarNav :navItems="nav"></SidebarNav>
        <SidebarFooter/>
        <SidebarMinimizer/>
      </AppSidebar>
      <main class="main">
        <!-- TODO: Replace this with i18n content or remove it -->
        <!-- <Breadcrumb :list="list"/> -->
        <div class="container-fluid mt-4">
          <div class="d-lg-none">
            <img class="mx-auto" src="/img/germinate.svg" width="300" height="64" alt="Germinate" style="display: block;">
            <hr />
          </div>
          <router-view :key="$route.path"></router-view>
        </div>
      </main>
      <AppAside off-canvas>
        <!--aside-->
        <DefaultAside/>
      </AppAside>
    </div>
    <TheFooter>
      <!--footer-->
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
import { Header as AppHeader, SidebarToggler, Sidebar as AppSidebar, SidebarFooter, SidebarForm, SidebarHeader, SidebarMinimizer, SidebarNav, Aside as AppAside, AsideToggler, Footer as TheFooter } from '@coreui/vue'
import DefaultAside from './DefaultAside'
import UserSettingsDropdown from '@/components/dropdown/UserSettingsDropdown'
import MarkedItemDropdown from '@/components/dropdown/MarkedItemDropdown'
import LocaleDropdown from '@/components/dropdown/LocaleDropdown'
import { mapState } from 'vuex'

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
    SidebarForm,
    SidebarFooter,
    SidebarToggler,
    SidebarHeader,
    SidebarNav,
    SidebarMinimizer,
    MarkedItemDropdown
  },
  data () {
    return {
      nav: []
    }
  },
  computed: {
    ...mapState([
      'helpKey',
      'locale'
    ]),
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
                }
              ]
            },
            {
              name: this.$t('menuDatasets'),
              url: '/data/datasets',
              icon: 'mdi mdi-18px mdi-database'
            }
          ]
        },
        {
          name: this.$t('menuGroups'),
          url: '/groups',
          icon: 'mdi mdi-18px mdi-group'
        },
        {
          name: this.$t('menuAbout'),
          url: '/about',
          icon: 'mdi mdi-18px mdi-information'
        }
      ]
    }
  },
  mounted: function () {
    this.updateNav()
  }
}
</script>

<style scoped>
</style>
