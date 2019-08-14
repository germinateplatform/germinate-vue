import Vue from 'vue'
import Router from 'vue-router'
import auth from '@/auth'

// Containers
const DefaultContainer = () => import('@/containers/DefaultContainer')

// Users
const Users = () => import('@/views/users/Users')
const User = () => import('@/views/users/User')

Vue.use(Router)

function requireAuth (to, from, next) {
  if (!auth.loggedIn()) {
    next({
      path: '/login'
    })
  } else {
    next()
  }
}

export default new Router({
  mode: 'hash', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'open active',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import(/* webpackChunkName: "login" */ '@/views/pages/Login.vue')
    },
    {
      path: '/',
      redirect: '/home',
      name: '',
      component: DefaultContainer,
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
        }
      ]
    }
  ]
})
