import type { ViewTableProjects, ViewTableLocations, ViewTableStoriesEnriched, Storysteps } from '@/plugins/types/germinate'

import type { DataTableHeader } from 'vuetify'

export interface ExtendedDataTableHeader extends DataTableHeader {
  preferredSearchColumn?: boolean
  visibleInTable?: boolean
  visibleInFilter?: boolean
  dataType?: string
  searchable?: boolean
  quickSearchable?: boolean
}

export type SearchStatsField = 'germplasm' | 'germplasmAttributes' | 'trialData' | 'climateData' | 'markers' | 'datasets' | 'datasetAttributes' | 'pedigreeDefinitions' | 'locations'

export interface SearchStats {
  germplasm: SearchStatsState
  germplasmAttributes: SearchStatsState
  trialData: SearchStatsState
  climateData: SearchStatsState
  markers: SearchStatsState
  datasets: SearchStatsState
  datasetAttributes: SearchStatsState
  pedigreeDefinitions: SearchStatsState
  locations: SearchStatsState
}

export interface SearchStatsState {
  value?: number
  loading: boolean
}

export interface ExtendedViewTableLocations extends ViewTableLocations {
  additionalInfo?: { [key: string]: string }
}

export interface ExtendedViewTableProjects extends ViewTableProjects {
  file?: File
}

export interface ExtendedViewTableStoriesEnriched extends ViewTableStoriesEnriched {
  file?: File
}

export interface ExtendedStorysteps extends Storysteps {
  file?: File
}

export interface IndexedViewTableStoriesEnriched extends ViewTableStoriesEnriched {
  index: number
  isEdit: boolean
}
