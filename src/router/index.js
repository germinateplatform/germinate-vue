import Vue from 'vue'
import Router from 'vue-router'
import auth from '@/auth'
import store from '@/store/store'
import { loadLanguageAsync } from '@/plugins/i18n'
import { EventBus } from '@/plugins/event-bus.js'

// Users
const Users = () => import('@/views/users/Users')
const User = () => import('@/views/users/User')

Vue.use(Router)

function requireAuth (to, from, next) {
  console.log(from)
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
      name: '',
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
          name: 'Home',
          component: () => import('@/views/Dashboard'),
          beforeEnter: requireAuth
        },
        {
          path: 'admin',
          redirect: '/admin/settings',
          name: 'Admin settings',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'settings',
              name: 'Settings',
              meta: { requiresAdmin: true },
              component: () => import('@/views/admin/Settings.vue'),
              beforeEnter: requireAuth
            }
          ]
        },
        {
          path: 'users',
          meta: { label: 'Users' },
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: '',
              component: Users
            },
            {
              path: ':id',
              meta: { label: 'User Details' },
              name: 'User',
              component: User
            }
          ]
        },
        {
          path: 'data',
          redirect: '/data/germplasm',
          name: 'Data',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'germplasm',
              name: 'Germplasm',
              component: () => import('@/views/data/germplasm/Germplasm.vue'),
              beforeEnter: requireAuth
            },
            {
              path: 'datasets',
              name: 'Datasets',
              component: () => import('@/views/data/Datasets.vue'),
              beforeEnter: requireAuth
            },
            {
              path: 'germplasm/:germplasmId',
              name: 'Passport',
              component: () => import('@/views/data/germplasm/Passport.vue'),
              beforeEnter: requireAuth
            },
            {
              path: 'genotypes/maps',
              name: 'Maps',
              component: () => import('@/views/data/genotype/Maps.vue'),
              beforeEnter: requireAuth
            },
            {
              path: 'genotypes/maps/:mapId',
              name: 'MapId',
              component: () => import('@/views/data/genotype/Maps.vue'),
              beforeEnter: requireAuth
            },
            {
              path: 'environment/locations',
              name: 'Locations',
              component: () => import('@/views/data/environment/Locations.vue'),
              beforeEnter: requireAuth
            }
          ]
        },
        {
          path: 'import',
          redirect: '/import/data-upload',
          name: 'Import',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'data-upload',
              name: 'Data upload',
              component: () => import('@/views/data/DataUploader.vue'),
              beforeEnter: requireAuth
            }
          ]
        },
        {
          path: 'export/:experimentType',
          name: 'Export',
          component: () => import('@/views/DatasetSelector.vue'),
          beforeEnter: requireAuth
        },
        {
          path: 'groups',
          name: 'Groups',
          component: () => import('@/views/Groups.vue'),
          beforeEnter: requireAuth
        },
        {
          path: 'groups/:groupId',
          name: 'GroupId',
          component: () => import('@/views/Groups.vue'),
          beforeEnter: requireAuth
        },
        {
          path: 'about',
          name: 'About',
          component: () => import('@/views/About.vue')
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
