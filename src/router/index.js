import Vue from 'vue'
import VueRouter from 'vue-router'
import auth from '@/auth'
import store from '@/store'
import { loadLanguageAsync } from '@/plugins/i18n'
import { userIsAtLeast } from '@/mixins/api/auth'

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
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '@/views/Login.vue')
  },
  {
    path: '/setup',
    name: 'setup',
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
        name: 'home',
        component: () => import(/* webpackChunkName: "home" */ '@/views/HomeView'),
        beforeEnter: requireAuth
      },
      {
        path: 'cookies',
        name: 'cookies',
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
            name: 'user-permissions',
            meta: { minUserType: 'Administrator' },
            component: () => import(/* webpackChunkName: "user-permissions" */ '@/views/admin/UserPermissions.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'germinate-settings',
            name: 'germinate-settings',
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
            name: 'germplasm',
            component: () => import(/* webpackChunkName: "germplasm" */ '@/views/data/germplasm/Germplasm.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'germplasm-unifier',
            name: 'germplasm-unifier',
            meta: { minUserType: 'Data Curator' },
            component: () => import(/* webpackChunkName: "germplasm-unifier" */ '@/views/data/germplasm/GermplasmUnifier.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'germplasm/:germplasmId',
            name: 'passport',
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
                name: 'climates',
                component: () => import(/* webpackChunkName: "climates" */ '@/views/data/climate/Climates.vue'),
                beforeEnter: requireAuth
              },
              {
                path: 'climates/:climateId',
                name: 'climate-details',
                component: () => import(/* webpackChunkName: "climate-details" */ '@/views/data/climate/ClimateDetails.vue'),
                beforeEnter: requireAuth
              }
            ]
          },
          {
            path: 'compounds',
            redirect: '/data/compounds/compounds',
            name: '',
            component: {
              render (c) { return c('router-view') }
            },
            children: [
              {
                path: 'compounds',
                name: 'compounds',
                component: () => import(/* webpackChunkName: "compounds" */'@/views/data/compound/Compounds.vue'),
                beforeEnter: requireAuth
              },
              {
                path: 'compounds/:compoundId',
                name: 'compound-details',
                component: () => import(/* webpackChunkName: "compound-details" */'@/views/data/compound/CompoundDetails.vue'),
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
                name: 'traits',
                component: () => import(/* webpackChunkName: "traits" */ '@/views/data/trials/Traits.vue'),
                beforeEnter: requireAuth
              },
              {
                path: 'traits/:traitId',
                name: 'trait-details',
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
                name: 'markers',
                component: () => import(/* webpackChunkName: "markers" */ '@/views/data/genotype/Markers.vue'),
                beforeEnter: requireAuth
              },
              {
                path: 'marker/:markerId',
                name: 'marker',
                component: () => import(/* webpackChunkName: "marker-details" */ '@/views/data/genotype/Marker.vue'),
                beforeEnter: requireAuth
              },
              {
                path: 'maps',
                name: 'maps',
                component: () => import(/* webpackChunkName: "maps" */ '@/views/data/genotype/Maps.vue'),
                beforeEnter: requireAuth
              },
              {
                path: 'maps/:mapId',
                name: 'map-details',
                component: () => import(/* webpackChunkName: "map-details" */ '@/views/data/genotype/Maps.vue'),
                beforeEnter: requireAuth
              }
            ]
          },
          {
            path: 'export/cross',
            name: 'export-cross-comparison',
            component: () => import(/* webpackChunkName: "export-cross-data" */'@/views/data/export/CrossDataTypeComparison.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'export/:datasetType',
            name: 'export',
            component: () => import(/* webpackChunkName: "dataset-selector" */ '@/views/DatasetSelector.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'export/genotype/:datasetIds',
            name: 'export-genotypes',
            component: () => import(/* webpackChunkName: "genotype-export" */ '@/views/data/export/GenotypeExport.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'export/compounds/:datasetIds',
            name: 'export-compounds',
            component: () => import(/* webpackChunkName: "compound-export" */'@/views/data/export/CompoundExport.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'export/climate/:datasetIds',
            name: 'export-climate',
            component: () => import(/* webpackChunkName: "climate-export" */'@/views/data/export/ClimateExport.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'export/trials/:datasetIds',
            name: 'export-trials',
            component: () => import(/* webpackChunkName: "trials-export" */'@/views/data/export/TrialsExport.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'export/allelefreq/:datasetIds',
            name: 'export-allelefrequency',
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
                name: 'locations',
                component: () => import(/* webpackChunkName: "locations" */ '@/views/data/geography/Locations.vue'),
                beforeEnter: requireAuth
              },
              {
                path: 'geographic-search',
                name: 'geographic-search',
                component: () => import(/* webpackChunkName: "geographic-search" */'@/views/data/geography/GeographicSearch.vue'),
                beforeEnter: requireAuth
              }
            ]
          },
          {
            path: 'datasets',
            name: 'datasets',
            component: () => import(/* webpackChunkName: "datasets" */ '@/views/data/Datasets.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'experiments',
            name: 'experiments',
            component: () => import(/* webpackChunkName: "experiments" */ '@/views/data/Experiments.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'experiments/:experimentId',
            name: 'experiment-details',
            component: () => import(/* webpackChunkName: "experiment-details" */ '@/views/data/ExperimentDetails.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'data-resources',
            name: 'data-resources',
            component: () => import(/* webpackChunkName: "data-resources" */ '@/views/data/DataResources.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'statistics',
            name: 'statistics',
            component: () => import(/* webpackChunkName: "data-statistics" */ '@/views/data/DataStatistics.vue'),
            beforeEnter: requireAuth
          }
        ]
      },
      {
        path: 'images',
        name: 'images',
        component: () => import(/* webpackChunkName: "images" */ '@/views/Images.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'marked-items',
        name: 'marked-items',
        component: () => import(/* webpackChunkName: "marked-items" */ '@/views/MarkedItemsView.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'marked-items/:itemType',
        name: 'marked-items-type',
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
            name: 'import-upload',
            meta: { minUserType: 'Data Curator' },
            component: () => import(/* webpackChunkName: "data-uploader" */ '@/views/data/DataUploader.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'data-upload/:templateType',
            name: 'import-upload-type',
            meta: { minUserType: 'Data Curator' },
            component: () => import(/* webpackChunkName: "data-uploader-type" */ '@/views/data/DataUploader.vue'),
            beforeEnter: requireAuth
          }
        ]
      },
      {
        path: 'search',
        name: 'search',
        component: () => import(/* webpackChunkName: "search" */ '@/views/Search.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'search/:searchTerm',
        name: 'search-query',
        component: () => import(/* webpackChunkName: "search-term" */ '@/views/Search.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'publications',
        name: 'publications',
        component: () => import(/* webpackChunkName: "publications" */ '@/views/Publications.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'publications/:publicationId',
        name: 'publication-details',
        component: () => import(/* webpackChunkName: "publication-details" */ '@/views/Publications.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'groups',
        name: 'groups',
        component: () => import(/* webpackChunkName: "groups" */ '@/views/Groups.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'groups/upload/:file',
        name: 'group-upload',
        component: () => import(/* webpackChunkName: "group-upload" */ '@/views/GroupUpload.vue'),
        beforeEnter: requireAuth
      },
      {
        path: 'groups/:groupId',
        name: 'group-details',
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
            name: 'about-germinate',
            meta: { canBeHidden: false },
            component: () => import(/* webpackChunkName: "about-germinate" */ '@/views/about/AboutGerminate.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'project',
            name: 'about-project',
            component: () => import(/* webpackChunkName: "about-project" */ '@/views/about/AboutProject.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'export-formats',
            name: 'about-export-formats',
            component: () => import(/* webpackChunkName: "about-export-formats" */ '@/views/about/ExportFormats.vue'),
            beforeEnter: requireAuth
          },
          {
            path: 'export-formats/:format',
            name: 'about-export-formats-specific',
            component: () => import(/* webpackChunkName: "about-export-formats-detail" */ '@/views/about/ExportFormats.vue'),
            beforeEnter: requireAuth
          }
        ]
      },
      {
        path: '403',
        name: '403',
        component: () => import(/* webpackChunkName: "error-403" */ '@/views/error/Page403.vue')
      },
      {
        path: '404',
        name: '404',
        component: () => import(/* webpackChunkName: "error-403" */ '@/views/error/Page404.vue')
      },
      {
        path: '*',
        name: 'fallback',
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
