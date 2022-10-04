import Vue from 'vue'
import VueRouter from 'vue-router'
import auth from '@/auth'
import store from '@/store'
import { loadLanguageAsync } from '@/plugins/i18n'
import { userIsAtLeast } from '@/mixins/api/auth'
import { Pages } from '@/mixins/pages'

console.log(Pages, Pages.home)

const emitter = require('tiny-emitter/instance')

Vue.use(VueRouter)

const originalReplace = VueRouter.prototype.replace
VueRouter.prototype.replace = function replace (location, onResolve, onReject) {
  if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject)
  return originalReplace.call(this, location).catch(err => {
    if (err && err.name !== 'NavigationDuplicated') {
      throw err
    }
  })
}

function requireAuth (to, from, next) {
  const authMode = store.getters.storeServerSettings ? store.getters.storeServerSettings.authMode : 'NONE'
  const token = store.getters.storeToken

  emitter.emit('show-loading', false)

  // If we're in full auth mode, check credentials for each call
  if (authMode === 'FULL') {
    if (!auth.loggedIn()) {
      // Remember the original target
      if (!store.getters.storeOriginalTarget) {
        store.dispatch('setOriginalTarget', to.path)
      }
      next({ name: 'login' })
      return
    } else if (to.meta && to.meta.minUserType && (!token || !userIsAtLeast(token.userType, to.meta.minUserType))) {
      next({ name: '403' })
      return
    }
  } else if (authMode === 'SELECTIVE' && to.meta && to.meta.minUserType && (!token || !userIsAtLeast(token.userType, to.meta.minUserType))) {
    next({ name: '403' })
  }

  next()
}

const routes = [
  {
    path: '/login',
    name: Pages.login,
    component: () => import(/* webpackChunkName: "login" */ '@/views/Login.vue')
  },
  {
    path: '/setup',
    name: Pages.setup,
    component: () => import(/* webpackChunkName: "login" */ '@/views/Setup.vue')
  },
  {
    path: '/',
    name: '',
    redirect: '/home',
    component: () => import(/* webpackChunkName: "dashboard" */ '@/views/DashboardContainer'),
    children: [
      {
        path: '/home',
        name: Pages.home,
        component: () => import(/* webpackChunkName: "home" */ '@/views/HomeView'),
        beforeEnter: requireAuth
      },
      {
        path: 'cookies',
        name: Pages.cookies,
        component: () => import(/* webpackChunkName: "cookies" */ '@/views/Cookies'),
        beforeEnter: requireAuth
      },
      {
        path: 'admin',
        redirect: '/admin/settings',
        name: '',
        component: {
          render (c) { return c('router-view') }
        },
        children: [
          {
            path: 'user-permissions',
            name: Pages.userPermissions,
            meta: { minUserType: 'Administrator' },
            component: () => import(/* webpackChunkName: "user-permissions" */ '@/views/admin/UserPermissions.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'germinate-settings',
            name: Pages.germinateSettings,
            meta: { minUserType: 'Administrator' },
            component: () => import(/* webpackChunkName: "germinate-settings" */ '@/views/admin/GerminateSettings.vue'),
            beforeEnter: requireAuth
          }
        ]
      },
      {
        path: 'data',
        redirect: '/data/germplasm',
        name: '',
        component: {
          render (c) { return c('router-view') }
        },
        children: [
          {
            path: 'germplasm',
            name: Pages.germplasm,
            component: () => import(/* webpackChunkName: "germplasm" */ '@/views/data/germplasm/Germplasm.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'germplasm-unifier',
            name: Pages.germplasmUnifier,
            meta: { minUserType: 'Data Curator' },
            component: () => import(/* webpackChunkName: "germplasm-unifier" */ '@/views/data/germplasm/GermplasmUnifier.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'germplasm/:germplasmId',
            name: Pages.passport,
            component: () => import(/* webpackChunkName: "passport" */ '@/views/data/germplasm/Passport.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'climate',
            redirect: '/data/climate/climates',
            name: '',
            component: {
              render (c) { return c('router-view') }
            },
            children: [
              {
                path: 'climates',
                name: Pages.climates,
                component: () => import(/* webpackChunkName: "climates" */ '@/views/data/climate/Climates.vue'),
                beforeEnter: requireAuth
              },
              {
                path: 'climates/:climateId',
                name: Pages.climateDetails,
                component: () => import(/* webpackChunkName: "climate-details" */ '@/views/data/climate/ClimateDetails.vue'),
                beforeEnter: requireAuth
              }
            ]
          },
          {
            path: 'trials',
            redirect: '/data/trials/traits',
            name: '',
            component: {
              render (c) { return c('router-view') }
            },
            children: [
              {
                path: 'traits',
                name: Pages.traits,
                component: () => import(/* webpackChunkName: "traits" */ '@/views/data/trials/Traits.vue'),
                beforeEnter: requireAuth
              },
              {
                path: 'traits/:traitId',
                name: Pages.traitDetails,
                component: () => import(/* webpackChunkName: "trait-details" */ '@/views/data/trials/TraitDetails.vue'),
                beforeEnter: requireAuth
              }
            ]
          },
          {
            path: 'genotypes',
            redirect: '/data/genotypes/maps',
            name: '',
            component: {
              render (c) { return c('router-view') }
            },
            children: [
              {
                path: 'markers',
                name: Pages.markers,
                component: () => import(/* webpackChunkName: "markers" */ '@/views/data/genotype/Markers.vue'),
                beforeEnter: requireAuth
              },
              {
                path: 'marker/:markerId',
                name: Pages.markerDetails,
                component: () => import(/* webpackChunkName: "marker-details" */ '@/views/data/genotype/Marker.vue'),
                beforeEnter: requireAuth
              },
              {
                path: 'maps',
                name: Pages.maps,
                component: () => import(/* webpackChunkName: "maps" */ '@/views/data/genotype/Maps.vue'),
                beforeEnter: requireAuth
              },
              {
                path: 'maps/:mapId',
                name: Pages.mapDetails,
                component: () => import(/* webpackChunkName: "map-details" */ '@/views/data/genotype/Maps.vue'),
                beforeEnter: requireAuth
              }
            ]
          },
          {
            path: 'export/cross',
            name: Pages.exportCrossComparison,
            component: () => import(/* webpackChunkName: "export-cross-data" */'@/views/data/export/CrossDataTypeComparison.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'export/:datasetType',
            name: Pages.export,
            component: () => import(/* webpackChunkName: "dataset-selector" */ '@/views/DatasetSelector.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'export/genotype/:datasetIds',
            name: Pages.exportGenotypes,
            component: () => import(/* webpackChunkName: "genotype-export" */ '@/views/data/export/GenotypeExport.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'export/climate/:datasetIds',
            name: Pages.exportClimates,
            component: () => import(/* webpackChunkName: "climate-export" */'@/views/data/export/ClimateExport.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'export/trials/:datasetIds',
            name: Pages.exportTraits,
            component: () => import(/* webpackChunkName: "trials-export" */'@/views/data/export/TrialsExport.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'export/allelefreq/:datasetIds',
            name: Pages.exportAlleleFrequency,
            component: () => import(/* webpackChunkName: "allelefreq-export" */ '@/views/data/export/AlleleFrequencyExport.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'geography',
            redirect: '/data/geography/locations',
            name: '',
            component: {
              render (c) { return c('router-view') }
            },
            children: [
              {
                path: 'locations',
                name: Pages.locations,
                component: () => import(/* webpackChunkName: "locations" */ '@/views/data/geography/Locations.vue'),
                beforeEnter: requireAuth
              },
              {
                path: 'geographic-search',
                name: Pages.geographicSearch,
                component: () => import(/* webpackChunkName: "geographic-search" */'@/views/data/geography/GeographicSearch.vue'),
                beforeEnter: requireAuth
              }
            ]
          },
          {
            path: 'datasets',
            name: Pages.datasets,
            component: () => import(/* webpackChunkName: "datasets" */ '@/views/data/Datasets.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'experiments',
            name: Pages.experiments,
            component: () => import(/* webpackChunkName: "experiments" */ '@/views/data/Experiments.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'experiments/:experimentId',
            name: Pages.experimentDetails,
            component: () => import(/* webpackChunkName: "experiment-details" */ '@/views/data/ExperimentDetails.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'data-resources',
            name: Pages.dataResources,
            component: () => import(/* webpackChunkName: "data-resources" */ '@/views/data/DataResources.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'statistics',
            name: Pages.statistics,
            component: () => import(/* webpackChunkName: "data-statistics" */ '@/views/data/DataStatistics.vue'),
            beforeEnter: requireAuth
          }
        ]
      },
      {
        path: 'images',
        name: Pages.images,
        component: () => import(/* webpackChunkName: "images" */ '@/views/Images.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'marked-items',
        name: Pages.markedItems,
        component: () => import(/* webpackChunkName: "marked-items" */ '@/views/MarkedItemsView.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'marked-items/:itemType',
        name: Pages.markedItemsType,
        component: () => import(/* webpackChunkName: "marked-items-type" */ '@/views/MarkedItemsView.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'import',
        redirect: '/import/data-upload',
        name: '',
        component: {
          render (c) { return c('router-view') }
        },
        children: [
          {
            path: 'data-upload',
            name: Pages.importUpload,
            meta: { minUserType: 'Data Curator' },
            component: () => import(/* webpackChunkName: "data-uploader" */ '@/views/data/DataUploader.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'data-upload/:templateType',
            name: Pages.importUploadType,
            meta: { minUserType: 'Data Curator' },
            component: () => import(/* webpackChunkName: "data-uploader-type" */ '@/views/data/DataUploader.vue'),
            beforeEnter: requireAuth
          }
        ]
      },
      {
        path: 'search',
        name: Pages.search,
        component: () => import(/* webpackChunkName: "search" */ '@/views/Search.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'search/:searchTerm',
        name: Pages.searchQuery,
        component: () => import(/* webpackChunkName: "search-term" */ '@/views/Search.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'publications',
        name: Pages.publications,
        component: () => import(/* webpackChunkName: "publications" */ '@/views/Publications.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'publications/:publicationId',
        name: Pages.publicationDetails,
        component: () => import(/* webpackChunkName: "publication-details" */ '@/views/Publications.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'groups',
        name: Pages.groups,
        component: () => import(/* webpackChunkName: "groups" */ '@/views/Groups.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'groups/upload/:file',
        name: Pages.groupUpload,
        component: () => import(/* webpackChunkName: "group-upload" */ '@/views/GroupUpload.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'groups/:groupId',
        name: Pages.groupDetails,
        component: () => import(/* webpackChunkName: "group-details" */ '@/views/Groups.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'about',
        redirect: '/about/germinate',
        name: '',
        component: {
          render (c) { return c('router-view') }
        },
        children: [
          {
            path: 'germinate',
            name: Pages.aboutGerminate,
            meta: { canBeHidden: false },
            component: () => import(/* webpackChunkName: "about-germinate" */ '@/views/about/AboutGerminate.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'project',
            name: Pages.aboutProject,
            component: () => import(/* webpackChunkName: "about-project" */ '@/views/about/AboutProject.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'export-formats',
            name: Pages.aboutExportFormats,
            component: () => import(/* webpackChunkName: "about-export-formats" */ '@/views/about/ExportFormats.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'export-formats/:format',
            name: Pages.aboutExportFormatsType,
            component: () => import(/* webpackChunkName: "about-export-formats-detail" */ '@/views/about/ExportFormats.vue'),
            beforeEnter: requireAuth
          }
        ]
      },
      {
        path: '403',
        name: Pages.fourZeroThree,
        component: () => import(/* webpackChunkName: "error-403" */ '@/views/error/Page403.vue')
      },
      {
        path: '404',
        name: Pages.fourZeroFour,
        component: () => import(/* webpackChunkName: "error-403" */ '@/views/error/Page404.vue')
      },
      {
        path: '*',
        name: Pages.fallback,
        redirect: '/home'
      }
    ]
  }
]

const router = new VueRouter({
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition || (from && to && from.path === to.path)) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  const serverSettings = store.getters.storeServerSettings

  // Check if this page can be hidden
  const canBeHidden = !to.meta || to.meta.canBeHidden !== false
  // If the requested page isn't available because it has been hidden, redirect to 404
  if (serverSettings && serverSettings.hiddenPages && canBeHidden) {
    if (serverSettings.hiddenPages.indexOf(to.name) !== -1) {
      next({ name: '404' })
      return
    }
  }

  store.dispatch('setHelpKey', null)
  loadLanguageAsync(store.getters.storeLocale).then(() => next())
})

export default router
