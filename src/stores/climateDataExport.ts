import type { ViewTableDatasets, ViewTableGroups, ViewTableClimates } from '@/plugins/types/germinate'
import { defineStore } from 'pinia'

export interface ClimateDataStoreContent {
  climates: ViewTableClimates[]
  datasets: ViewTableDatasets[]
  groups: ViewTableGroups[]
}

export const useClimateDataStore = defineStore('climateDataStore', {
  state: () => ({
    climates: [],
    datasets: [],
    groups: [],
  }) as ClimateDataStoreContent,
  getters: {
    storeDatasetIds: (state): number[] => (state.datasets || []).map(ds => ds.datasetId || -1),
    storeDatasets: (state): ViewTableDatasets[] => state.datasets || [],
    storeClimates: (state): ViewTableClimates[] => state.climates || [],
    storeGroups: (state): ViewTableGroups[] => state.groups || [],
  },
  actions: {
    setDatasets (newDatasets: ViewTableDatasets[]) {
      this.datasets = newDatasets
    },
    setClimates (newClimates: ViewTableClimates[]) {
      this.climates = newClimates
    },
    setGroups (newGroups: ViewTableGroups[]) {
      this.groups = newGroups
    },
  },
})
