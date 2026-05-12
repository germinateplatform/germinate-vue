import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { PaginatedRequest, PaginatedResult, ViewTableClimateDataWithGroups, ViewTableClimates, ViewTableDatasets } from '@/plugins/types/germinate'

function apiPostDatasetClimates<T> (datasetIds: number[], onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  const queryData = {
    datasetIds,
  }
  return authAxios({ url: 'dataset/climate', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostClimateTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableClimates[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios<PaginatedResult<ViewTableClimates[]>>({ url: 'climate/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostClimateDataTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableClimateDataWithGroups[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios<PaginatedResult<ViewTableClimateDataWithGroups[]>>({ url: 'dataset/data/climate/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostClimateDataTableIds (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios<PaginatedResult<number[]>>({ url: 'dataset/data/climate/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostClimateDatasetTable (climateId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableDatasets[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios<PaginatedResult<ViewTableDatasets[]>>({ url: `climate/${climateId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export {
  apiPostDatasetClimates,
  apiPostClimateTable,
  apiPostClimateDataTable,
  apiPostClimateDataTableIds,
  apiPostClimateDatasetTable,
}
