// Utilities
import type { ServerSettings } from '@/plugins/types/ServerSettings'
import type { Token } from '@/plugins/types/Token'
import { defineStore } from 'pinia'

import emitter from 'tiny-emitter/instance'
import { USER_TYPE_ADMINISTRATOR, USER_TYPE_DATA_CURATOR, USER_TYPE_REGULAR_USER, userIsAtLeast } from '@/plugins/api/auth'

let name = import.meta.env.VUE_APP_INSTANCE_NAME

if (!name) {
  name = 'germinate-' + window.location.pathname
}

export interface StoreContent {
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
}

type MarkedItems = { [key: string]: number[] }
export type HiddenColumns = { [key: string]: string[] }
type UserState = { [key: number]: StoreContent }

const defaultUserState: StoreContent = {
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
    institutions: [],
    institutiondatasets: [],
    locations: [],
    taxonomies: [],
    pedigrees: [],
    pedigreedefinitions: [],
    traits: [],
    traitAttributes: [],
    trialsData: [],
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
}

export const coreStore = defineStore('germinate', {
  state: () => ({
    baseUrl: undefined as string | undefined,
    token: undefined as Token | undefined,
    serverSettings: undefined as ServerSettings | undefined,
    userStates: {
      '-1': JSON.parse(JSON.stringify(defaultUserState)),
    } as UserState,
  }),
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
    storeUserId: (state): number => state.token ? state.token.id : -1,
    storeToken: (state): Token | undefined => state.token,
    storeBaseUrl: (state): string | undefined => state.baseUrl,
    storeServerSettings: (state): ServerSettings | undefined => state.serverSettings,
    storeIsDarkMode (): boolean {
      return (this.userStates[this.storeUserId].theme === 'system' ? this.userStates[this.storeUserId].systemTheme : this.userStates[this.storeUserId].theme) === 'dark'
    },
    storeSystemTheme (): string {
      return this.userStates[this.storeUserId].systemTheme || 'dark'
    },
    storeTheme (): string {
      return this.userStates[this.storeUserId].theme || 'system'
    },
    storeLocale (): string {
      return this.userStates[this.storeUserId].locale
    },
    storeMapLayer (): string {
      return this.userStates[this.storeUserId].mapLayer
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
        this.userStates[newToken.id] = JSON.parse(JSON.stringify(defaultUserState))
      }

      if (!newToken) {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      } else {
        emitter.emit('logged-in')
      }

      this.token = newToken
    },
    setServerSettings (newServerSettings: ServerSettings | undefined) {
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
    setHiddenColumns (newHiddenColumns: HiddenColumns) {
      this.userStates[this.storeUserId].hiddenColumns = newHiddenColumns
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
    removeMarkedIds (type: string, ids: number[]) {
      const set: Set<number> = new Set(this.userStates[this.storeUserId].markedIds[type])
      ids.forEach(id => set.delete(id))
      this.userStates[this.storeUserId].markedIds[type] = [...set]
    },
    clearMarkedIds (type: string) {
      this.userStates[this.storeUserId].markedIds[type] = []
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
  },
})
