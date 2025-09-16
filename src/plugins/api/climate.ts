import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { PaginatedRequest } from '../types/germinate'

function apiPostDatasetClimates<T> (datasetIds: number[], onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  const queryData = {
    datasetIds,
  }
  return authAxios({ url: 'dataset/climate', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostClimateTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'climate/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostClimateDataTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'dataset/data/climate/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostClimateDataTableIds<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'dataset/data/climate/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostClimateDatasetTable<T> (climateId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `climate/${climateId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export {
  apiPostDatasetClimates,
  apiPostClimateTable,
  apiPostClimateDataTable,
  apiPostClimateDataTableIds,
  apiPostClimateDatasetTable,
}
