/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

import axios from 'axios'

import helium from '@/assets/icons/helium.svg'

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { type IconAliases, createVuetify } from 'vuetify'
import { aliases as defaultAliases } from 'vuetify/iconsets/mdi'

import enGB from '@/plugins/i18n/en_GB.json'
import deDE from '@/plugins/i18n/de_DE.json'

import { coreStore } from '@/stores/app'
import { createI18n, useI18n } from 'vue-i18n'
import { en, de } from 'vuetify/locale'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { VDateInput } from 'vuetify/labs/VDateInput'

const aliases: IconAliases = {
  ...defaultAliases,
  helium,
  germinate: ['M 11.999836,0 C 5.384778,0 -3.9999998e-7,5.38515 0,12.00026 -3.9999998e-7,18.61531 5.384778,24.00011 11.999836,24.00011 18.614894,24.00011 24,18.61531 24,12.00026 24,5.38515 18.614894,0 11.999836,0 Z m 0,2.09227 c 5.484271,0 9.907984,4.42367 9.907984,9.90799 0,5.48425 -4.423713,9.90754 -9.907984,9.90754 -5.4842703,0 -9.9076558,-4.42329 -9.9076558,-9.90754 0,-5.48432 4.4233855,-9.90799 9.9076558,-9.90799 z M 9.5003025,5.50579 c -2.4997191,0 -2.4997043,0 -3.7494633,2.16472 L 4.500991,9.83539 c -1.2498943,2.16476 -1.2498943,2.16487 0,4.32945 l 1.2498482,2.16476 c 1.261759,2.16476 1.2617442,2.16476 3.7494633,2.16476 2.4996545,0 2.4997185,0 3.7495455,-2.16476 h -8.1e-5 c 1.249812,-2.16476 1.249787,-2.16469 0,-4.32934 v -1.1e-4 H 10.750152 8.2505363 l 1.2497662,2.16469 H 12 L 10.750152,16.3296 H 8.2505363 L 7.0006881,14.16484 5.7508392,12.00015 7.0006881,9.83539 8.2505363,7.67051 h 2.4996157 2.499696 L 12,5.50579 Z m 4.9993125,0 1.249849,2.16472 1.249848,2.16488 h -2.499697 l -1.249767,2.16476 h 2.499616 l 1.249848,2.16469 -1.249848,2.16476 -1.249849,2.16476 h 2.499697 l 1.249849,-2.16476 1.249766,-2.16476 c 1.249826,-2.16476 1.249826,-2.16469 0,-4.32945 L 18.249161,7.67051 16.999312,5.50579 Z'],
}

// @ts-ignore
enGB.$vuetify = en
// @ts-ignore
deDE.$vuetify = de

type MessageType = typeof enGB | typeof deDE

const protectedProperties = ['pageAboutGerminateTitle', 'pageAboutGerminateSubtitle', 'pageAboutGerminateText', 'pageAboutGerminateCardHomepageText', 'pageAboutGerminateCardGithubText', 'pageAboutGerminateCardPublicationText', 'pageAboutGerminateCardDocumentationText', 'pageAboutGerminateTeamTitle', 'pageAboutGerminateTeamSubtitle', 'pageAboutGerminateTeamOthersTitle', 'pageAboutGerminateTeamOthersSubtitle', 'pageAboutGerminateTeamOthersText', 'pageAboutGerminateLocationTitle', 'pageAboutGerminateLocationSubtitle', 'pageAboutGerminateFundersTitle', 'pageAboutGerminateFundersSubtitle', 'pageAboutGerminateFundersText', 'pageAboutGerminateTeamSebastian', 'pageAboutGerminateTeamJobSebastian', 'pageAboutGerminateTeamIain', 'pageAboutGerminateTeamJobIain', 'pageAboutGerminateTeamPaul', 'pageAboutGerminateTeamJobPaul']
const loadedLanguages = [] as string[]
const messages: { [key: string]: MessageType } = {
  en: enGB,
}

const i18n = createI18n({
  locale: undefined,
  fallbackLocale: 'en',
  messages,
  legacy: false,
  globalInjection: true,
  warnHtmlMessage: false,
})

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
const vuetify = createVuetify({
  components: {
    VDateInput,
  },
  icons: {
    aliases,
  },
  theme: {
    defaultTheme: 'system',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#2d98da',
          muted: '#868e96',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#41a2cf',
          muted: '#868e96',
        },
      },
    },
  },
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
})

function setI18nLanguage (lang: string) {
  vuetify.locale.current.value = lang
  axios.defaults.headers.common['Accept-Language'] = lang

  return lang
}

export function loadLanguageAsync (lang: string) {
  let htmlTag = lang
  const underscoreIndex = lang.indexOf('_')
  if (underscoreIndex !== -1) {
    htmlTag = lang.slice(0, underscoreIndex)
  }

  const store = coreStore()

  // If the same language
  if (vuetify.locale.current.value === htmlTag) {
    return Promise.resolve(setI18nLanguage(htmlTag))
  }

  // If the language was already loaded
  if (loadedLanguages.includes(htmlTag)) {
    return Promise.resolve(setI18nLanguage(htmlTag))
  }

  // If the language hasn't been loaded yet
  return axios({
    baseURL: store.storeBaseUrl,
    method: 'get',
    url: `clientlocale/${lang}`,
  }).then(m => {
    // If we get a response from the server, use it
    if (m.data) {
      // Delete the content of the about Germinate page, we don't want people to change it.
      protectedProperties.forEach(p => delete m.data[p])
    }

    if (htmlTag === 'de') {
      // We do have some default text for de_DE, so load this here
      messages[htmlTag] = deDE
    }
    if (!messages[htmlTag]) {
      // @ts-ignore
      messages[htmlTag] = {}
    }

    Object.assign(messages[htmlTag], m.data)
    // i18n.setLocaleMessage(lang, messages[lang])
    loadedLanguages.push(htmlTag)
    return setI18nLanguage(htmlTag)
  }).catch(() => {
    // If we can't get it from the server, use the fallback we've got locally
    // i18n.setLocaleMessage(lang, messages[lang])
    loadedLanguages.push(htmlTag)
    return setI18nLanguage(htmlTag)
  })
}

export {
  vuetify,
  i18n,
}
