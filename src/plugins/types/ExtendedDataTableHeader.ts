import type { DataTableHeader } from 'vuetify'

export interface ExtendedDataTableHeader extends DataTableHeader {
  preferredSearchColumn?: boolean
  visibleInTable?: boolean
  visibleInFilter?: boolean
  dataType?: string
  searchable?: boolean
  quickSearchable?: boolean
}
