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
      redirect: '/dashboard',
      name: 'Home',
      component: DefaultContainer,
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
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
          redirect: '/data/accessions',
          name: 'Data',
          component: {
            render (c) { return c('router-view') }
          },
          children: [
            {
              path: 'accessions',
              name: 'Accessions',
              component: () => import('@/views/data/Accessions.vue'),
              beforeEnter: requireAuth
            }
          ]
        }
      ]
    }
  ]
})
