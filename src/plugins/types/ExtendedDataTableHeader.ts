import type { DataTableHeader } from 'vuetify'

export interface ExtendedDataTableHeader extends DataTableHeader {
  preferredSortingColumn?: boolean
  visibleInTable?: boolean
  visibleInFilter?: boolean
  dataType?: string
  searchable?: boolean
}
