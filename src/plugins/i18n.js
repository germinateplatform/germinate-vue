import Vue from 'vue'
import VueI18n from 'vue-i18n'
import store from '@/store'

import deDE from '@/plugins/i18n/de_DE.json'
import enGB from '@/plugins/i18n/en_GB.json'

const axios = require('axios').default

const protectedProperties = ['pageAboutGerminateTitle', 'pageAboutGerminateSubtitle', 'pageAboutGerminateText', 'pageAboutGerminateCardHomepageText', 'pageAboutGerminateCardGithubText', 'pageAboutGerminateCardPublicationText', 'pageAboutGerminateCardDocumentationText', 'pageAboutGerminateTeamTitle', 'pageAboutGerminateTeamSubtitle', 'pageAboutGerminateTeamOthersTitle', 'pageAboutGerminateTeamOthersSubtitle', 'pageAboutGerminateTeamOthersText', 'pageAboutGerminateLocationTitle', 'pageAboutGerminateLocationSubtitle', 'pageAboutGerminateFundersTitle', 'pageAboutGerminateFundersSubtitle', 'pageAboutGerminateFundersText', 'pageAboutGerminateTeamSebastian', 'pageAboutGerminateTeamJobSebastian', 'pageAboutGerminateTeamIain', 'pageAboutGerminateTeamJobIain', 'pageAboutGerminateTeamPaul', 'pageAboutGerminateTeamJobPaul']

Vue.use(VueI18n)

const messages = {
  en_GB: enGB
}

export const i18n = new VueI18n({
  locale: null,
  fallbackLocale: 'en_GB',
  warnHtmlInMessage: 'off',
  messages: messages
})

const loadedLanguages = []

function setI18nLanguage (lang) {
  i18n.locale = lang
  axios.defaults.headers.common['Accept-Language'] = lang
  let htmlTag = lang
  const underscoreIndex = lang.indexOf('_')
  if (underscoreIndex !== -1) {
    htmlTag = lang.substring(0, underscoreIndex)
  }
  document.querySelector('html').setAttribute('lang', htmlTag)
  return lang
}

export function loadLanguageAsync (lang) {
  // If the same language
  if (i18n.locale === lang) {
    return Promise.resolve(setI18nLanguage(lang))
  }

  // If the language was already loaded
  if (loadedLanguages.includes(lang)) {
    return Promise.resolve(setI18nLanguage(lang))
  }

  // If the language hasn't been loaded yet
  return axios({
    baseURL: store.getters.storeBaseUrl,
    method: 'get',
    url: /* webpackChunkName: "lang-[request]" */ `clientlocale/${lang}`
  }).then(m => {
    // If we get a response from the server, use it
    if (m.data) {
      // Delete the content of the about Germinate page, we don't want people to change it.
      protectedProperties.forEach(p => delete m.data[p])
    }

    if (lang === 'de_DE') {
      // We do have some default text for de_DE, so load this here
      messages[lang] = deDE
    }
    if (!messages[lang]) {
      messages[lang] = {}
    }

    Object.assign(messages[lang], m.data)
    i18n.setLocaleMessage(lang, messages[lang])
    loadedLanguages.push(lang)
    return setI18nLanguage(lang)
  }).catch(() => {
    // If we can't get it from the server, use the fallback we've got locally
    i18n.setLocaleMessage(lang, messages[lang])
    loadedLanguages.push(lang)
    return setI18nLanguage(lang)
  })
}
