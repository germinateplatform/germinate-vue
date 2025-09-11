import type { FilterGroup, PaginatedRequest, PaginatedResult } from '@/plugins/types/germinate'
import type { AxiosResponse } from 'axios'
import type { TableSelectionType } from '@/plugins/types/TableSelectionType'
import type { DataTableHeader, DataTableSortItem } from 'vuetify'
import type { RowPropsFunction } from 'vuetify/lib/components/VDataTable/types.mjs'
import type { DisplayType } from '@/components/tables/BaseTable.vue'

export interface BaseTableProps<T> {
  getData: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<T[]>>> }
  getIds?: { (options: PaginatedRequest): Promise<AxiosResponse<PaginatedResult<number[]>>> }
  download?: { (options: PaginatedRequest): Promise<AxiosResponse<Blob>> }
  getRowProps?: Record<string, any> | RowPropsFunction<T>
  selectionType?: TableSelectionType
  headers: DataTableHeader[]
  itemKey: string
  tableKey: string
  headerIcon: string
  headerIconColor?: string
  headerTitle: string
  filterOn?: FilterGroup[]
  markedItemType?: string
  showDetails?: boolean
  storeUrlParameters?: boolean
  bottomSheetVisible?: boolean
  supportsGridCards?: boolean
  displayType?: DisplayType
  sortBy?: DataTableSortItem[]
}
