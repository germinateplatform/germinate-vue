import Vue from 'vue'
import Router from 'vue-router'
import auth from '@/auth'
import store from '@/store/store'
import { loadLanguageAsync } from '@/plugins/i18n'

// Users
const Users = () => import('@/views/users/Users')
const User = () => import('@/views/users/User')

Vue.use(Router)

function requireAuth (to, from, next) {
  if (!auth.loggedIn()) {
    // Remember the original target
    if (!store.getters.originalTarget) {
      store.dispatch('ON_ORIGINAL_TARGET_CHANGED', to)
    }
    next({ path: '/g8/login' })
  } else {
    next()
  }
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
            }
          ]
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
