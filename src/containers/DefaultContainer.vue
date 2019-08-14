<template>
  <div class="app">
    <AppHeader fixed>
      <SidebarToggler class="d-lg-none" display="md" mobile />
      <b-link class="navbar-brand" to="#">
        <img class="navbar-brand-full" src="/img/germinate.svg" width="150" height="32" alt="Germinate">
        <img class="navbar-brand-minimized" src="img/brand/sygnet.svg" width="30" height="30" alt="Germinate">
      </b-link>
      <SidebarToggler class="d-md-down-none" display="lg" :defaultOpen=true />
      <!-- <b-navbar-nav class="d-md-down-none">
        <b-nav-item class="px-3">Settings</b-nav-item>
      </b-navbar-nav> -->
      <b-navbar-nav class="ml-auto">
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
        <Breadcrumb :list="list"/>
        <div class="container-fluid">
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
  </div>
</template>

<script>
import { Header as AppHeader, SidebarToggler, Sidebar as AppSidebar, SidebarFooter, SidebarForm, SidebarHeader, SidebarMinimizer, SidebarNav, Aside as AppAside, AsideToggler, Footer as TheFooter, Breadcrumb } from '@coreui/vue'
import DefaultAside from './DefaultAside'
import UserSettingsDropdown from '@/components/dropdown/UserSettingsDropdown'
import MarkedItemDropdown from '@/components/dropdown/MarkedItemDropdown'
import LocaleDropdown from '@/components/dropdown/LocaleDropdown'

export default {
  name: 'DefaultContainer',
  components: {
    AsideToggler,
    AppHeader,
    AppSidebar,
    AppAside,
    TheFooter,
    Breadcrumb,
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
      nav: [
        {
          name: 'Home',
          url: '/home',
          icon: 'mdi mdi-18px mdi-home',
          badge: {
            variant: 'primary',
            text: 'NEW'
          }
        },
        {
          name: 'Data',
          url: '/data',
          icon: 'mdi mdi-18px mdi-harddisk',
          children: [
            {
              name: 'Germplasm',
              url: '/data/germplasm',
              icon: 'mdi mdi-18px mdi-sprout'
            },
            {
              name: 'Genotypic data',
              url: '/data/genotypes/maps',
              icon: 'mdi mdi-18px mdi-dna',
              children: [
                {
                  name: 'Maps',
                  url: '/data/genotypes/maps',
                  icon: 'mdi mdi-18px mdi-reorder-vertical'
                }
              ]
            },
            {
              name: 'Datasets',
              url: '/data/datasets',
              icon: 'mdi mdi-18px mdi-database'
            }
          ]
        }
      ]
    }
  },
  computed: {
    name () {
      return this.$route.name
    },
    list () {
      return this.$route.matched.filter((route) => route.name || route.meta.label)
    }
  }
}
</script>
