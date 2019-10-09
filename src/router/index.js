import Vue from 'vue'
import Router from 'vue-router'
import auth from '@/auth'
import store from '@/store/store'
import { loadLanguageAsync } from '@/plugins/i18n'
import { EventBus } from '@/plugins/event-bus.js'

Vue.use(Router)

function requireAuth (to, from, next) {
  var authMode = store.getters.serverSettings ? store.getters.serverSettings.authMode : 'NONE'
  var token = store.getters.token
  // If we're in full auth mode, check credentials for each call
  if (authMode === 'FULL') {
    if (!auth.loggedIn()) {
      // Remember the original target
      if (!store.getters.originalTarget) {
        store.dispatch('ON_ORIGINAL_TARGET_CHANGED', to)
      }
      next({ path: '/g8/login' })
      return
    } else if (to.meta && to.meta.requiresAdmin && token.userType !== 'Administrator') {
      next({ path: '/403' })
      return
    }
  } else if (authMode === 'SELECTIVE' && to.meta && to.meta.requiresAdmin && (!token || token.userType !== 'Administrator')) {
    if (from.name) {
      EventBus.$emit('on-show-login-form')
    } else {
      next({ path: '/home' })
    }
    return
  }

  next()
}

const router = new Router({
  mode: 'hash', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/g8',
      redirect: '/g8/login',
      name: 'login',
      component: () => import('@/containers/DefaultPublic'),
      children: [
        {
          path: 'login',
          name: 'Login',
          component: () => import(/* webpackChunkName: "login" */ '@/views/pages/Login.vue')
        }
      ]
    },
    {
      path: '/',
      redirect: '/home',
      name: '',
      component: () => import('@/containers/DefaultContainer'),
      children: [
        {
          path: 'home',
          name: 'home',
          component: () => import('@/views/Dashboard'),
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
              path: 'settings',
              name: 'admin-settings',
              meta: { requiresAdmin: true },
              component: () => import('@/views/admin/Settings.vue'),
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
              component: () => import('@/views/data/germplasm/Germplasm.vue'),
              beforeEnter: requireAuth
            },
            {
              path: 'germplasm/:germplasmId',
              name: 'passport',
              component: () => import('@/views/data/germplasm/Passport.vue'),
              beforeEnter: requireAuth
            },
            {
              path: 'datasets',
              name: 'datasets',
              component: () => import('@/views/data/Datasets.vue'),
              beforeEnter: requireAuth
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
                  component: () => import('@/views/data/trials/Traits.vue'),
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
                  path: 'maps',
                  name: 'maps',
                  component: () => import('@/views/data/genotype/Maps.vue'),
                  beforeEnter: requireAuth
                },
                {
                  path: 'maps/:mapId',
                  name: 'map-details',
                  component: () => import('@/views/data/genotype/Maps.vue'),
                  beforeEnter: requireAuth
                }
              ]
            },
            {
              path: 'environment',
              redirect: '/data/environment/locations',
              name: '',
              component: {
                render (c) { return c('router-view') }
              },
              children: [
                {
                  path: 'locations',
                  name: 'locations',
                  component: () => import('@/views/data/environment/Locations.vue'),
                  beforeEnter: requireAuth
                },
                {
                  path: 'geographic-search',
                  name: 'geographic-search',
                  component: () => import('@/views/data/environment/GeographicSearch.vue'),
                  beforeEnter: requireAuth
                }
              ]
            },
            {
              path: 'export/:experimentType',
              name: 'export',
              component: () => import('@/views/DatasetSelector.vue'),
              beforeEnter: requireAuth
            },
            {
              path: 'export/trials/:datasetIds',
              name: 'export-trials',
              component: () => import('@/views/data/export/TrialsExport.vue'),
              beforeEnter: requireAuth,
              props (route) {
                const datasetIds = route.params.datasetIds || ''

                return {
                  datasetIds: datasetIds === '' ? [] : datasetIds.split(',').map(Number)
                }
              }
            },
            {
              path: 'export/genotypes/:datasetIds',
              name: 'export-genotypes',
              component: () => import('@/views/data/export/GenotypeExport.vue'),
              beforeEnter: requireAuth,
              props (route) {
                const datasetIds = route.params.datasetIds || ''

                return {
                  datasetIds: datasetIds === '' ? [] : datasetIds.split(',').map(Number)
                }
              }
            }
          ]
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
              component: () => import('@/views/data/DataUploader.vue'),
              beforeEnter: requireAuth
            }
          ]
        },
        {
          path: 'groups',
          name: 'groups',
          component: () => import('@/views/Groups.vue'),
          beforeEnter: requireAuth
        },
        {
          path: 'groups/:groupId',
          name: 'group-details',
          component: () => import('@/views/Groups.vue'),
          beforeEnter: requireAuth
        },
        {
          path: 'image-gallery',
          name: 'image-gallery',
          component: () => import('@/views/ImageGallery.vue'),
          beforeEnter: requireAuth
        },
        {
          path: 'marked-items',
          name: 'marked-items',
          component: () => import('@/views/MarkedItemsView.vue'),
          beforeEnter: requireAuth
        },
        {
          path: 'marked-items/:itemType',
          name: 'marked-items-type',
          component: () => import('@/views/MarkedItemsView.vue'),
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
              component: () => import('@/views/about/AboutGerminate.vue')
            }
          ]
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  store.dispatch('ON_HELP_KEY_CHANGED', null)
  loadLanguageAsync(store.getters.locale).then(() => next())
})

export default router
