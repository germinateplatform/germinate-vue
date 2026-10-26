import type { ViewTableDatasets, ViewTableGroups, ViewTableTraits } from '@/plugins/types/germinate'
import { defineStore } from 'pinia'

export interface TraitDataStoreContent {
  traits: ViewTableTraits[]
  datasets: ViewTableDatasets[]
  groups: ViewTableGroups[]
}

export const useTraitDataStore = defineStore('traitDataStore', {
  state: () => ({
    traits: [],
    datasets: [],
    groups: [],
  }) as TraitDataStoreContent,
  getters: {
    storeDatasetIds: (state): number[] => (state.datasets || []).map(ds => ds.datasetId || -1),
    storeDatasets: (state): ViewTableDatasets[] => state.datasets || [],
    storeTraits: (state): ViewTableTraits[] => state.traits || [],
    storeGroups: (state): ViewTableGroups[] => state.groups || [],
  },
  actions: {
    setDatasets (newDatasets: ViewTableDatasets[]) {
      this.datasets = newDatasets
    },
    setTraits (newTraits: ViewTableTraits[]) {
      this.traits = newTraits
    },
    setGroups (newGroups: ViewTableGroups[]) {
      this.groups = newGroups
    },
  },
})
