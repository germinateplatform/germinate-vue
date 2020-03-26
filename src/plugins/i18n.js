import Vue from 'vue'
import VueI18n from 'vue-i18n'
import axios from 'axios'

import deDE from '@/plugins/i18n/de_DE.json'
import enGB from '@/plugins/i18n/en_GB.json'

Vue.use(VueI18n)

var messages = {
  en_GB: enGB
}

export const i18n = new VueI18n({
  locale: null,
  fallbackLocale: 'en_GB',
  messages: messages
})

const loadedLanguages = []

function setI18nLanguage (lang) {
  i18n.locale = lang
  axios.defaults.headers.common['Accept-Language'] = lang
  document.querySelector('html').setAttribute('lang', lang)
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
  return axios.get(`clientlocale/${lang}`).then(m => {
    // If we get a response from the server, use it
    if (m.data) {
      // Delete the content of the about Germinate page, we don't want people to change it.
      delete m.data.pageAboutGerminateTitle
      delete m.data.pageAboutGerminateSubtitle
      delete m.data.pageAboutGerminateText
      delete m.data.pageAboutGerminateCardHomepageText
      delete m.data.pageAboutGerminateCardGithubText
      delete m.data.pageAboutGerminateCardPublicationText
      delete m.data.pageAboutGerminateCardDocumentationText
      delete m.data.pageAboutGerminateTeamTitle
      delete m.data.pageAboutGerminateTeamSubtitle
      delete m.data.pageAboutGerminateLocationTitle
      delete m.data.pageAboutGerminateLocationSubtitle
      delete m.data.pageAboutGerminateFundersTitle
      delete m.data.pageAboutGerminateFundersSubtitle
      delete m.data.pageAboutGerminateFundersText
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
