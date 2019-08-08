import Vue from 'vue'
import VueI18n from 'vue-i18n'

import en from '@/lang/en_GB.json'
import de from '@/lang/de_DE.json'

Vue.use(VueI18n)

export const i18n = new VueI18n({
  locale: 'en_GB',
  fallbackLocale: 'en_GB',
  messages: {
    en_GB: en,
    de_DE: de
  }
})
