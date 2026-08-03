import { MAX_JAVA_INTEGER, authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { AsyncExportResult, ExportRequest, MapExportRequest, PaginatedRequest, PaginatedResult, GenotypeSubsetDatasetRequest, ViewTableDatasetMaps, ViewTableDatasets, GenotypeStats, ViewTableMapdefinitions, ViewTableMarkers, ViewTableMaps, ViewTableGroups } from '@/plugins/types/germinate'

export function apiPostMarkerTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableMarkers[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'marker/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostMarkerTableIds (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'marker/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGroupMarkerTable (groupId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableMarkers[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `group/${groupId}/marker`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGroupMarkerTableIds (groupId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `group/${groupId}/marker/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGenotypeDatasetSummary (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableDatasets[]>>, onError?: ErrorHandler) {
  queryData.page = 0
  queryData.limit = MAX_JAVA_INTEGER
  return authAxios({ url: 'dataset/export/genotype/summary', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiGetGenotypeStats (onSuccess?: GerminateResponseHandler<GenotypeStats>, onError?: ErrorHandler) {
  return authAxios({ url: 'genotype/stats', success: onSuccess, error: onError })
}

export function apiPostGenotypeDatasetExport (queryData: GenotypeSubsetDatasetRequest, onSuccess?: GerminateResponseHandler<AsyncExportResult[]>, onError?: ErrorHandler) {
  return authAxios<AsyncExportResult[]>({ url: 'dataset/export/genotype', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGroupMarkerTableExport (groupId: number, queryData: ExportRequest, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: `group/${groupId}/marker/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
}

export function apiPostMarkerGroupTable (markerId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableGroups[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `marker/${markerId}/group`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostMapsTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableMaps[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'map/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostDatasetMapTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<ViewTableDatasetMaps[]>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'dataset/map', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostMapdefinitionTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableMapdefinitions[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'map/mapdefinition/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostMapdefinitionTableIds (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'map/mapdefinition/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostMapExport (mapId: number, queryData: MapExportRequest, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: `map/${mapId}/export`, method: 'POST', data: queryData, dataType: 'blob', success: onSuccess, error: onError })
}

export function apiPostMarkerDatasetTable (markerId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableDatasets[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `marker/${markerId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}
