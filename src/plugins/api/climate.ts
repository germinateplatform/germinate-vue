import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { ClimateDatasetRequest, ClimateStats, DatasetRequest, PaginatedRequest, PaginatedResult, ViewTableClimateDataWithGroups, ViewTableClimates, ViewTableDatasets, ViewTableLocations } from '@/plugins/types/germinate'

export function apiPostDatasetClimates (datasetIds: number[], onSuccess?: GerminateResponseHandler<ViewTableClimates[]>, onError?: ErrorHandler) {
  const queryData = {
    datasetIds,
  }
  return authAxios({ url: 'dataset/climate', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostClimateTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableClimates[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'climate/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostClimateLocations (queryData: DatasetRequest, onSuccess?: GerminateResponseHandler<ViewTableLocations[]>, onError?: ErrorHandler) {
  return authAxios({ url: 'dataset/data/climate/location', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostClimateDataTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableClimateDataWithGroups[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'dataset/data/climate/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostClimateDataTableIds (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'dataset/data/climate/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostClimateDatasetTable (climateId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableDatasets[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `climate/${climateId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiGetClimateStats (onSuccess?: GerminateResponseHandler<ClimateStats>, onError?: ErrorHandler) {
  return authAxios({ url: 'climate/stats', success: onSuccess, error: onError })
}

export function apiPostClimateYears (data: ClimateDatasetRequest, onSuccess?: GerminateResponseHandler<number[]>, onError?: ErrorHandler) {
  return authAxios({ url: 'climate/stats/year', data, method: 'POST', success: onSuccess, error: onError })
}
