/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import { vuetify, i18n } from '@/plugins/vuetify'
import pinia from '@/stores'
import router from '@/router'

// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(i18n)

  app.runWithContext(() => {
    const dateOptions = inject<{ locale: Record<string, string> }>(
      Symbol.for('vuetify:date-options'),
    )!

    // every Vuetify locale key, known or not, resolves to the browser's locale
    dateOptions.locale = new Proxy({}, { get: () => navigator.language })
  })
}
