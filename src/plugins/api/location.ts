import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { CountryCount, ExportRequest, LocationDistance, PaginatedRequest, PaginatedResult, ViewTableGroupLocations, ViewTableLocations } from '@/plugins/types/germinate'

export function apiPostLocationTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableLocations[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'location/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostLocationDistanceTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<LocationDistance[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'location/distance/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostLocationDistanceTableIds (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'location/distance/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostLocationPolygonTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableLocations[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  if (queryData.orderBy === 'distance') {
    delete queryData.orderBy
    delete queryData.ascending
  }
  return authAxios({ url: 'location/polygon/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostLocationPolygonTableIds (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'location/polygon/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostLocationTableIds (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'location/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGroupLocationTableExport (groupId: number, queryData: ExportRequest, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: `group/${groupId}/location/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGroupLocationTable (groupId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableGroupLocations[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `group/${groupId}/location`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGroupLocationTableIds (groupId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `group/${groupId}/location/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiGetCountries (onSuccess?: GerminateResponseHandler<CountryCount[]>, onError?: ErrorHandler) {
  return authAxios({ url: 'country', success: onSuccess, error: onError })
}
