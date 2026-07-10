import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { CountryCount, ExportRequest, PaginatedRequest, PaginatedResult, ViewTableLocations } from '@/plugins/types/germinate'

function apiPostLocationTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableLocations[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios<PaginatedResult<ViewTableLocations[]>>({ url: 'location/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostLocationDistanceTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'location/distance/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostLocationDistanceTableIds<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'location/distance/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostLocationPolygonTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  if (queryData.orderBy === 'distance') {
    delete queryData.orderBy
    delete queryData.ascending
  }
  return authAxios({ url: 'location/polygon/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostLocationPolygonTableIds<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'location/polygon/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostLocationTableIds<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'location/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGroupLocationTableExport = <T>(groupId: number, queryData: ExportRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `group/${groupId}/location/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })

function apiPostGroupLocationTable<T> (groupId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `group/${groupId}/location`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostGroupLocationTableIds<T> (groupId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `group/${groupId}/location/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiGetCountries = (onSuccess?: GerminateResponseHandler<CountryCount[]>, onError?: ErrorHandler) => authAxios<CountryCount[]>({ url: 'country', success: onSuccess, error: onError })

export {
  apiPostLocationTable,
  apiPostLocationTableIds,
  apiPostLocationDistanceTable,
  apiPostLocationDistanceTableIds,
  apiPostLocationPolygonTable,
  apiPostLocationPolygonTableIds,
  apiPostGroupLocationTableExport,
  apiPostGroupLocationTable,
  apiPostGroupLocationTableIds,
  apiGetCountries,
}
