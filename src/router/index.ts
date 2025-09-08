/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHashHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import emitter from 'tiny-emitter/instance'
import { coreStore } from '@/stores/app'
import { Pages } from '@/plugins/pages'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
  // @ts-ignore
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition || (from && to && from.path === to.path)) {
      return savedPosition
    } else {
      window.scrollTo(0, 0)
      return { left: 0, top: 0 }
    }
  },
})

router.beforeEach((to, from, next) => {
  emitter.emit('show-loading', false)

  const store = coreStore()

  // Redirect to login page if we're in FULL auth mode and not logged in
  if (store.storeServerSettings && store.storeServerSettings.authMode === 'FULL' && !store.storeToken && (to.path !== Pages.login.path)) {
    next('/login')
  } else {
    next()
  }
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
