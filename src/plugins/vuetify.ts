/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

import axios from 'axios'

import helium from '@/assets/icons/helium.svg'

// Styles
import 'vuetify/styles'

// Composables
import { type IconAliases, createVuetify } from 'vuetify'
import { aliases as defaultAliases, mdi } from 'vuetify/iconsets/mdi-svg'

import enGB from '@/plugins/i18n/en_GB.json'
import deDE from '@/plugins/i18n/de_DE.json'

import { createI18n, useI18n } from 'vue-i18n'
import { en, de } from 'vuetify/locale'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { VImg } from 'vuetify/components'

// 1. Define your custom icon component
const flapjackIcon = {
  // 'props' are passed by Vuetify (like 'class' and 'style')
  render: (props: any) => h(VImg, {
    ...props,
    src: './img/tools/flapjack.png', // Reference your static or aliased path
    width: 24, // Optional: set a default size
    height: 24,
  }),
}

const aliases: IconAliases = {
  ...defaultAliases,
  helium,
  flapjack: flapjackIcon as any,
  doi: ['M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0M6.93 4.57h2.223v11.098h-2.22v-.905c-.225.282-.757.572-.988.702a3.14 3.14 0 0 1-1.465.372 3.24 3.24 0 0 1-2.218-.834c-.774-.683-1.137-1.725-1.137-2.847q0-1.714 1.188-2.737c.628-.543 1.398-.977 2.214-.977.476 0 1.062.042 1.479.245.24.114.67.385.926.649zm12.65.045q.555 0 .945.39a1.26 1.26 0 0 1 .388.936q0 .561-.39.95a1.3 1.3 0 0 1-.943.383 1.3 1.3 0 0 1-.942-.39 1.3 1.3 0 0 1-.383-.942q0-.555.383-.938a1.3 1.3 0 0 1 .941-.388m-5.85 3.729q1.895 0 3.025 1.285a3.66 3.66 0 0 1 .922 2.499q0 1.466-.915 2.516-1.11 1.275-3.105 1.276-2.003 0-3.111-1.276-.915-1.05-.915-2.576 0-1.377.922-2.439 1.116-1.285 3.176-1.285m4.67.26h2.362v7.056h-2.362zM5.205 10.378c-.47 0-.907.344-1.209.7-.244.287-.367.731-.367 1.1 0 .371.14.78.384 1.07.297.356.618.6 1.093.6.428 0 .936-.18 1.229-.474.297-.293.544-.785.544-1.212 0-.423-.115-.929-.412-1.221-.299-.299-.84-.563-1.262-.563m8.45.117a1.46 1.46 0 0 0-1.196.578 1.65 1.65 0 0 0-.375 1.056q0 .6.375 1.065.462.576 1.196.576a1.49 1.49 0 0 0 1.11-.471q.453-.48.453-1.17 0-.682-.46-1.155a1.46 1.46 0 0 0-1.103-.479'],
  brapi: ['M 5.7597657,0 A 5.75992,5.75992 0 0 0 0,5.7597657 5.75992,5.75992 0 0 0 5.7597657,11.519531 H 11.519531 V 5.7597657 A 5.75992,5.75992 0 0 0 5.7597657,0 Z M 18.240234,0 a 5.75992,5.75992 0 0 0 -5.759765,5.7597657 v 5.7597653 h 5.759765 A 5.75992,5.75992 0 0 0 24,5.7597657 5.75992,5.75992 0 0 0 18.240234,0 Z M 5.7597657,12.480469 A 5.75992,5.75992 0 0 0 0,18.240234 5.75992,5.75992 0 0 0 5.7597657,24 5.75992,5.75992 0 0 0 11.519531,18.240234 v -5.759765 z m 6.7207033,0 v 5.759765 A 5.75992,5.75992 0 0 0 18.240234,24 5.75992,5.75992 0 0 0 24,18.240234 5.75992,5.75992 0 0 0 18.240234,12.480469 Z'],
  sgone: ['M12 3c-3.8 0-6.9 2.7-7.7 6.3L3 17c-.2 1 .6 2 1.7 2h14.6c1.1 0 1.9-1 1.7-2l-1.3-7.7C18.9 5.7 15.8 3 12 3M5.8 10.5h12.4l.3 1.5H5.5l.3-1.5M5.1 15h13.8l.3 2H4.8l.3-2z'],
  genesys: ['M11.3,0C5.1,0,0,5.1,0,11.3c0,6.3,5.1,11.3,11.3,11.3s11.3-5.1,11.3-11.3C22.7,5.1,17.6,0,11.3,0z M11.4,19.7 c0,0.1-0.1,0.2,0,0.2c0,0,0,0.1,0,0.1c0,0.1,0,0.1,0,0.2c0,0,0,0.1-0.1,0.1l-0.1,0.1c-2.2-0.6-4-2.3-5.4-4c-1.5-1.9-2.7-4.2-3.1-6.6 C2.5,8.5,2.5,7.2,3,5.9c2.5,1.6,4.6,3.9,6.2,6.4C10.5,14.5,11.4,17,11.4,19.7C11.4,19.6,11.4,19.6,11.4,19.7z M11.5,11.7 c0,0-0.1,0.1-0.1,0.1c0,0,0,0,0,0c0,0-0.1,0-0.1,0.1c0,0,0,0-0.1,0l-0.1,0c-0.9-1-1.3-2.4-1.5-3.7C9.4,6.9,9.5,5.4,10,4.1 c0.3-0.7,0.7-1.4,1.3-1.9c0.8,1.6,1.2,3.3,1.2,5.1C12.6,8.8,12.3,10.4,11.5,11.7C11.5,11.7,11.5,11.7,11.5,11.7z M17.3,12.6 c-1.2,1.7-2.8,3.2-4.7,4c0,0,0,0,0,0c-0.1,0-0.1,0-0.2,0c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1,0c0,0-0.1,0-0.1,0l-0.1-0.1 c-0.2-1.8,0.4-3.7,1.3-5.3c1-1.7,2.3-3.3,4-4.4c0.9-0.6,1.9-1,3-1C19.7,8.3,18.7,10.6,17.3,12.6z'],
  agroportal: ['M23.577 4.42c-.77-1.644-2.023-2.832-3.735-3.532-2.323-.956-4.743-1.075-7.206-.665-2.592.432-4.929 1.443-7.055 2.925-.424.296-.835.61-1.252.912l-.061-.068 2.488-2.246-.062-.137c-.224.055-.486.057-.667.175-1.96 1.287-3.566 2.897-4.724 4.91C.467 8.146-.04 9.674.003 11.352a5 5 0 0 0 1.4 3.385c.608.649 1.35 1.13 2.122 1.592 1.544.917 3.212 1.384 5.003 1.478 2.896.153 5.626-.463 8.186-1.751a19 19 0 0 0 2.535-1.527 11.6 11.6 0 0 0 2.528-2.507c1.07-1.427 2.03-2.884 2.186-4.718.086-.998.045-1.963-.386-2.884M21.48 6.926a7.8 7.8 0 0 1-.869 2.856c-1.327 2.51-3.48 4.114-6.14 5.095-1.957.722-3.994.812-5.996.159-1.29-.423-2.37-1.178-3.106-2.33q-.093-.152-.224-.275a2.3 2.3 0 0 0-.313-.2c0 .146-.059.32 0 .433 1 1.911 2.535 3.173 4.735 3.605q.782.159 1.577.219c.53.037 1.066.008 1.614.031-.457.087-.912.233-1.372.251-1.26.05-2.517.034-3.747-.333-1.555-.462-2.787-1.289-3.584-2.692-.641-1.127-.857-2.315-.594-3.572A9.17 9.17 0 0 1 6 5.51a14.9 14.9 0 0 1 4.575-3.145c1.762-.783 3.623-1.066 5.523-.717 1.387.258 2.607.886 3.294 2.182.494.928.72 1.896.34 2.924-.183.49-.379.976-.555 1.47-.032.087 0 .196.008.295.102-.004.213.014.303-.02a.54.54 0 0 0 .247-.193c.553-.876 1.042-1.784 1.058-2.844.008-.558-.038-1.125-.058-1.636a4.9 4.9 0 0 1 .745 3.1'],
  cropontology: ['M15.098 0a8.615 8.805 63.59 0 0-3.059 11.055 8.615 8.805 63.59 0 0 2.176 2.748 8.615 8.805 63.59 0 0 3.06-11.055A8.615 8.805 63.59 0 0 15.098 0M4.184 6.916a8.615 8.805 0 0 0-3.428.727 8.615 8.805 0 0 0 8.541 7.658 8.615 8.805 0 0 0 3.43-.729 8.615 8.805 0 0 0-8.543-7.656m5.008 8.686a9.116 8.919 31.916 0 0-7.955 4.146A9.116 8.919 31.916 0 0 0 23.16a9.116 8.919 31.916 0 0 11.405-3.314 9.116 8.919 31.916 0 0 1.238-3.412 9.116 8.919 31.916 0 0-3.451-.832'],
  germinate: ['M 11.999836,0 C 5.384778,0 -3.9999998e-7,5.38515 0,12.00026 -3.9999998e-7,18.61531 5.384778,24.00011 11.999836,24.00011 18.614894,24.00011 24,18.61531 24,12.00026 24,5.38515 18.614894,0 11.999836,0 Z m 0,2.09227 c 5.484271,0 9.907984,4.42367 9.907984,9.90799 0,5.48425 -4.423713,9.90754 -9.907984,9.90754 -5.4842703,0 -9.9076558,-4.42329 -9.9076558,-9.90754 0,-5.48432 4.4233855,-9.90799 9.9076558,-9.90799 z M 9.5003025,5.50579 c -2.4997191,0 -2.4997043,0 -3.7494633,2.16472 L 4.500991,9.83539 c -1.2498943,2.16476 -1.2498943,2.16487 0,4.32945 l 1.2498482,2.16476 c 1.261759,2.16476 1.2617442,2.16476 3.7494633,2.16476 2.4996545,0 2.4997185,0 3.7495455,-2.16476 h -8.1e-5 c 1.249812,-2.16476 1.249787,-2.16469 0,-4.32934 v -1.1e-4 H 10.750152 8.2505363 l 1.2497662,2.16469 H 12 L 10.750152,16.3296 H 8.2505363 L 7.0006881,14.16484 5.7508392,12.00015 7.0006881,9.83539 8.2505363,7.67051 h 2.4996157 2.499696 L 12,5.50579 Z m 4.9993125,0 1.249849,2.16472 1.249848,2.16488 h -2.499697 l -1.249767,2.16476 h 2.499616 l 1.249848,2.16469 -1.249848,2.16476 -1.249849,2.16476 h 2.499697 l 1.249849,-2.16476 1.249766,-2.16476 c 1.249826,-2.16476 1.249826,-2.16469 0,-4.32945 L 18.249161,7.67051 16.999312,5.50579 Z'],
}

// @ts-ignore
enGB.$vuetify = en
// @ts-ignore
deDE.$vuetify = de

type MessageType = typeof enGB | typeof deDE

const protectedProperties = ['pageAboutGerminateTitle', 'pageAboutGerminateSubtitle', 'pageAboutGerminateText', 'pageAboutGerminateCardHomepageText', 'pageAboutGerminateCardGithubText', 'pageAboutGerminateCardPublicationText', 'pageAboutGerminateCardDocumentationText', 'pageAboutGerminateTeamTitle', 'pageAboutGerminateTeamSubtitle', 'pageAboutGerminateTeamOthersTitle', 'pageAboutGerminateTeamOthersSubtitle', 'pageAboutGerminateTeamOthersText', 'pageAboutGerminateLocationTitle', 'pageAboutGerminateLocationSubtitle', 'pageAboutGerminateFundersTitle', 'pageAboutGerminateFundersSubtitle', 'pageAboutGerminateFundersText', 'pageAboutGerminateFundersExtra', 'pageAboutGerminateTeamSebastian', 'pageAboutGerminateTeamJobSebastian', 'pageAboutGerminateTeamIain', 'pageAboutGerminateTeamJobIain', 'pageAboutGerminateTeamPaul', 'pageAboutGerminateTeamJobPaul']
const loadedLanguages = [] as string[]
const messages: { [key: string]: MessageType } = {
  'en-GB': enGB,
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
  components: {},
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'system',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#2d98da',
          muted: '#868e96',
          info: '#2980b9',
          success: '#27ae60',
          error: '#c0392b',
          warning: '#f39c12',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#41a2cf',
          muted: '#868e96',
          info: '#3498db',
          success: '#2ecc71',
          error: '#e74c3c',
          warning: '#f1c40f',
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
  const htmlTag = lang.replace('_', '-')
  // const underscoreIndex = lang.indexOf('_')
  // if (underscoreIndex !== -1) {
  //   htmlTag = lang.slice(0, underscoreIndex)
  // }

  const store = useCoreStore()

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

    if (htmlTag === 'de-DE') {
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
