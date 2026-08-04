// Utilities
import { defineStore } from 'pinia'

import emitter from 'tiny-emitter/instance'
import { USER_TYPE_ADMINISTRATOR, USER_TYPE_DATA_CURATOR, USER_TYPE_REGULAR_USER, userIsAtLeast } from '@/plugins/api/auth'
import type { IndexedViewTableStoriesEnriched } from '@/plugins/types/client'
import type { ClientConfiguration, Token } from '@/plugins/types/germinate'
import type { StorageLike } from 'pinia-plugin-persistedstate'

let name = import.meta.env.VUE_APP_INSTANCE_NAME

if (!name) {
  name = 'germinate-' + window.location.pathname
}

const essentialKeys = new Set(['token', 'locale', 'baseUrl', 'serverSettings', 'markedIds', 'cookiesAccepted', 'selectedProjects'])
const nonPersistentKeys = new Set(['asyncJobUuids', 'asyncJobCount'])

export interface StoreContent {
  baseUrl: string | undefined
  token: Token | undefined
  serverSettings: ClientConfiguration | undefined
  userStates: UserState
  deviceConfig: any | undefined
  uniqueClientId: string | null
  runCount: number
}

export interface UserStateContent {
  theme: string
  systemTheme: string
  locale: string
  mapLayer: string
  hiddenColumns: HiddenColumns
  markedIds: MarkedItems
  customChartColors?: string[] | undefined
  asyncJobUuids: string[]
  tablePerPage: number
  selectedProjects: number[]
  changelogVersionNumber: string | undefined
  activeStory: IndexedViewTableStoriesEnriched | undefined
  cookiesAccepted: boolean | undefined
}

type MarkedItems = { [key: string]: number[] }
export type HiddenColumns = { [key: string]: string[] }
type UserState = { [key: number]: UserStateContent }

const defaultUserState: UserStateContent = {
  theme: 'system',
  systemTheme: 'dark',
  locale: 'en_GB',
  mapLayer: 'theme',
  hiddenColumns: {
    germplasm: [],
    germplasmAttributes: [],
    news: [],
    backups: [],
    dataUpdate: [],
    importFeedback: [],
    images: [],
    climates: [],
    climateData: [],
    comments: [],
    fileresources: [],
    maps: [],
    markers: [],
    mapDefinitions: [],
    datasets: [],
    datasetAttributes: [],
    experiments: [],
    entities: [],
    groups: [],
    userGroups: [],
    users: [],
    institutions: [],
    institutiondatasets: [],
    locations: [],
    taxonomies: [],
    pedigrees: [],
    pedigreedefinitions: [],
    traits: [],
    traitAttributes: [],
    trialsData: [],
    stories: [],
    collaborators: [],
    publications: [],
    projects: [],
  },
  markedIds: {
    germplasm: [],
    markers: [],
    locations: [],
  },
  tablePerPage: 12,
  asyncJobUuids: [],
  selectedProjects: [],
  changelogVersionNumber: undefined,
  activeStory: undefined,
  cookiesAccepted: undefined,
}

/**
 * Creates a GDPR-consent aware storage solution. This will only store keys marked specifically as essential when storing.
 * When loading, it'll fill in the gaps (non-essential keys and their values) from a default object
 * @param storage The Storage instance to use (defaults to localStorage)
 * @returns The StorageLike instance handling the persistence of this store
 */
function createConsentAwareStorage (storage: Storage = localStorage): StorageLike {
  return {
    getItem (key: string) {
      const result = storage.getItem(key || name)
      if (result) {
        try {
          const parsed = JSON.parse(result) as StoreContent

          // If it exists and there is user state data and GDPR banner should be shown
          if (parsed && parsed.serverSettings?.showGdprNotification && parsed.userStates) {
            // Then for each user state, set the defaults for those fields that aren't stored (because of declined cookies (GDPR))
            Object.keys(parsed.userStates).forEach(us => {
              const userId = +us
              parsed.userStates[userId] = Object.assign(JSON.parse(JSON.stringify(defaultUserState)), parsed.userStates[userId])

              Object.keys(defaultUserState.hiddenColumns).forEach(hd => {
                if (!parsed.userStates[userId].hiddenColumns[hd]) {
                  parsed.userStates[userId].hiddenColumns[hd] = defaultUserState.hiddenColumns[hd]
                }
              })
            })
          }
          return JSON.stringify(parsed)
        } catch {
          // Nothing to see here
        }
      }

      return result
    },
    setItem (key: string, value: string) {
      try {
        // Get the value and parse it
        const parsed = JSON.parse(value) as StoreContent

        // If it exists and there is user state data and GDPR banner should be shown
        if (parsed && parsed.serverSettings?.showGdprNotification && parsed.userStates) {
          // Then for each user state
          Object.keys(parsed.userStates).forEach(us => {
            const userId = +us
            // Now check if the cookie banner has been accepted. If not, remove the non-essential parts
            if (parsed.userStates[userId].cookiesAccepted !== true) {
              Object.keys(parsed.userStates[userId]).forEach(k => {
                if (!essentialKeys.has(k)) {
                  // @ts-expect-error
                  delete parsed.userStates[userId][k]
                }
              })
            }
          })
        }

        storage.setItem(key, JSON.stringify(parsed))
      } catch {
        storage.setItem(key, value)
      }
    },
  }
}

// Instantiate OUTSIDE defineStore options
const consentStorage = createConsentAwareStorage()

export const coreStore = defineStore('germinate', {
  state: () => ({
    baseUrl: undefined as string | undefined,
    token: undefined as Token | undefined,
    serverSettings: undefined as ClientConfiguration | undefined,
    userStates: {
      '-1': JSON.parse(JSON.stringify(defaultUserState)),
    } as UserState,
    deviceConfig: undefined as any | undefined,
    uniqueClientId: null as string | null,
    runCount: 0,
  }) as StoreContent,
  getters: {
    storeUserIsAdmin: (state): boolean => {
      if (state.token) {
        return userIsAtLeast(state.token.userType, USER_TYPE_ADMINISTRATOR)
      } else {
        return false
      }
    },
    storeUserIsDataCurator: (state): boolean => {
      if (state.token) {
        return userIsAtLeast(state.token.userType, USER_TYPE_DATA_CURATOR)
      } else {
        return false
      }
    },
    storeUserIsAuthenticated: (state): boolean => {
      if (state.token) {
        return userIsAtLeast(state.token.userType, USER_TYPE_REGULAR_USER)
      } else {
        return false
      }
    },
    storeRunCount: (state): number => state.runCount,
    storeUniqueClientId: (state): string | null => state.uniqueClientId,
    storeDeviceConfig: (state): any | undefined => state.deviceConfig,
    storeUserId: (state): number => state.token ? state.token.id : -1,
    storeToken: (state): Token | undefined => state.token,
    storeBaseUrl: (state): string | undefined => state.baseUrl,
    storeServerSettings: (state): ClientConfiguration | undefined => state.serverSettings,
    storeIsDarkMode (): boolean {
      return (this.userStates[this.storeUserId].theme === 'system' ? this.userStates[this.storeUserId].systemTheme : this.userStates[this.storeUserId].theme) === 'dark'
    },
    storeSystemTheme (): string {
      return this.userStates[this.storeUserId].systemTheme || 'dark'
    },
    storeTheme (): string {
      return this.userStates[this.storeUserId].theme || 'system'
    },
    storeCoookiesAccepted (): boolean | undefined {
      return this.userStates[this.storeUserId].cookiesAccepted
    },
    storeLocale (): string {
      return this.userStates[this.storeUserId].locale
    },
    storeMapLayer (): string {
      return this.userStates[this.storeUserId].mapLayer
    },
    storeActiveStory (): IndexedViewTableStoriesEnriched | undefined {
      return this.userStates[this.storeUserId].activeStory
    },
    storeSelectedProjects (): number[] {
      return this.userStates[this.storeUserId].selectedProjects
    },
    storeHiddenColumns (): HiddenColumns {
      return this.userStates[this.storeUserId].hiddenColumns
    },
    storeCustomChartColors (): string[] | undefined {
      return this.userStates[this.storeUserId].customChartColors
    },
    storeChartColors (): string[] {
      return (this.userStates[this.storeUserId].customChartColors || this.serverSettings?.colorsCharts || ['#00acef']).concat()
    },
    storeMarkedIds (): MarkedItems {
      return this.userStates[this.storeUserId].markedIds
    },
    storeMarkedGermplasm (): number[] {
      return this.userStates[this.storeUserId].markedIds.germplasm || []
    },
    storeMarkedMarkers (): number[] {
      return this.userStates[this.storeUserId].markedIds.markers || []
    },
    storeMarkedLocations (): number[] {
      return this.userStates[this.storeUserId].markedIds.locations || []
    },
    storeAsyncJobUuids (): string[] {
      return this.userStates[this.storeUserId].asyncJobUuids
    },
    storeTablePerPage (): number {
      return this.userStates[this.storeUserId].tablePerPage
    },
    storeChangelogVersionNumber (): string | undefined {
      return this.userStates[this.storeUserId].changelogVersionNumber
    },
  },
  actions: {
    setBaseUrl (newBaseUrl: string) {
      this.baseUrl = newBaseUrl
    },
    setToken (newToken: Token | undefined) {
      if (newToken && !this.userStates[newToken.id]) {
        const defaultState = JSON.parse(JSON.stringify(defaultUserState))
        const publicState = this.userStates[-1]
        const newState = Object.assign(defaultState, publicState)

        this.userStates[newToken.id] = newState
      }

      if (!newToken) {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }

      this.token = newToken
    },
    setServerSettings (newServerSettings: ClientConfiguration | undefined) {
      this.serverSettings = newServerSettings

      if (newServerSettings?.hiddenColumns) {
        let key: keyof typeof newServerSettings.hiddenColumns

        for (key in newServerSettings.hiddenColumns) {
          if (!this.userStates[this.storeUserId].hiddenColumns[key] || this.userStates[this.storeUserId].hiddenColumns[key].length === 0) {
            this.setHiddenColumnsType(key, newServerSettings.hiddenColumns[key])
          }
        }
      }
    },
    setSystemTheme (newSystemTheme: string) {
      this.userStates[this.storeUserId].systemTheme = newSystemTheme
    },
    setTheme (newTheme: string) {
      this.userStates[this.storeUserId].theme = newTheme
    },
    setLocale (newLocale: string) {
      this.userStates[this.storeUserId].locale = newLocale
    },
    setTablePerPage (newTablePerPage: number) {
      this.userStates[this.storeUserId].tablePerPage = newTablePerPage
    },
    setSelectedProjects (newSelectedProjects: number[]) {
      this.userStates[this.storeUserId].selectedProjects = newSelectedProjects
    },
    setMapLayer (newMapLayer: string) {
      this.userStates[this.storeUserId].mapLayer = newMapLayer
    },
    setChangelogVersionNumber (changelogVersionNumber: string) {
      this.userStates[this.storeUserId].changelogVersionNumber = changelogVersionNumber
    },
    setRunCount (newRunCount: number) {
      this.runCount = newRunCount
    },
    setUniqueClientId (newUniqueClientId: string) {
      this.uniqueClientId = newUniqueClientId
    },
    setHiddenColumns (newHiddenColumns: HiddenColumns) {
      this.userStates[this.storeUserId].hiddenColumns = newHiddenColumns
    },
    setCookiesAccepted (newCookiesAccepted: boolean | undefined) {
      this.userStates[this.storeUserId].cookiesAccepted = newCookiesAccepted

      emitter.emit('init-plausible')
    },
    setHiddenColumnsType (type: string, newHiddenColumns: string[]) {
      this.userStates[this.storeUserId].hiddenColumns[type] = newHiddenColumns
    },
    setCustomChartColors (newColors: string[]) {
      this.userStates[this.storeUserId].customChartColors = newColors
    },
    addMarkedIds (type: string, ids: number[]) {
      const set: Set<number> = new Set(this.userStates[this.storeUserId].markedIds[type])
      ids.forEach(id => set.add(id))
      this.userStates[this.storeUserId].markedIds[type] = [...set]
    },
    setDeviceConfig (newDeviceConfig: any | undefined) {
      this.deviceConfig = newDeviceConfig
    },
    removeMarkedIds (type: string, ids: number[]) {
      const set: Set<number> = new Set(this.userStates[this.storeUserId].markedIds[type])
      ids.forEach(id => set.delete(id))
      this.userStates[this.storeUserId].markedIds[type] = [...set]
    },
    clearMarkedIds (type: string) {
      this.userStates[this.storeUserId].markedIds[type] = []
    },
    setActiveStory (newActiveStory: IndexedViewTableStoriesEnriched | undefined) {
      this.userStates[this.storeUserId].activeStory = newActiveStory
    },
    setActiveStoryStep (index: number) {
      if (this.userStates[this.storeUserId].activeStory) {
        // @ts-expect-error
        this.userStates[this.storeUserId].activeStory.index = index
      }
    },
    setAsyncJobUuids (ids: string[]) {
      this.userStates[this.storeUserId].asyncJobUuids = ids
    },
    addAsyncJobUuids (ids: string[]) {
      const set: Set<string> = new Set(this.userStates[this.storeUserId].asyncJobUuids)
      ids.forEach(id => set.add(id))
      this.userStates[this.storeUserId].asyncJobUuids = [...set]
    },
    removeAsyncJobUuids (ids: string[]) {
      const set: Set<string> = new Set(this.userStates[this.storeUserId].asyncJobUuids)
      ids.forEach(id => set.delete(id))
      this.userStates[this.storeUserId].asyncJobUuids = [...set]
    },
    clearAsyncJobUuids () {
      this.userStates[this.storeUserId].asyncJobUuids = []
    },
  },
  persist: {
    key: name,
    storage: consentStorage,
  },
})
