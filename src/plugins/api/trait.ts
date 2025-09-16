import { authAxios } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { ErrorHandler } from '@/plugins/api/base'
import type { DatasetRequest, PaginatedDatasetRequest, PaginatedRequest, Phenotypes, TraitDatasetRequest, TraitTimelineRequest, TraitUnificationRequest, TrialCreationDetails, UnacceptedLicenseRequest } from '@/plugins/types/germinate'

function apiPostTrialsDataTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'dataset/data/trial/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTrialsDataTableIds<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'dataset/data/trial/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTrialsDataTimepoints<T> (queryData: TraitTimelineRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  authAxios({ url: 'dataset/data/trial/timepoint', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTraitTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'trait/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTraitTableIds<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'trait/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostDatasetTraits<T> (datasetIds: number[], onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  const queryData = {
    datasetIds,
  }
  return authAxios({ url: 'dataset/trait', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTraitDatasetTable<T> (traitId: number, queryData: UnacceptedLicenseRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `trait/${traitId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTraitAttributeTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'trait/attribute', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTrialGermplasm<T> (queryData: PaginatedDatasetRequest, isGermplasm: boolean, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `dataset/data/trial/germplasm?isGermplasm=${isGermplasm}`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPatchTrait<T> (id: number, data: Phenotypes, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  authAxios({ url: `trait/${id}`, method: 'PATCH', data, success: onSuccess, error: onError })
}

function apiPostTraitUnification<T> (queryData: TraitUnificationRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  authAxios({ url: 'trait/unify', data: queryData, method: 'POST', success: onSuccess, error: onError })
}

function apiGetTraitDistinctValues<T> (traitId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  authAxios({ url: `trait/${traitId}/values`, success: onSuccess, error: onError })
}

function apiPostTrialLocationCount<T> (queryData: DatasetRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  authAxios({ url: 'dataset/data/trial/location/count', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTrialCreation<T> (data: TrialCreationDetails, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  authAxios({ url: 'dataset/data/trial', method: 'POST', data, success: onSuccess, error: onError })
}

function apiPostTraitDatasetStats<T> (queryData: TraitDatasetRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  authAxios({ url: 'trait/stats', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiGetTraitCategories<T> (onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  authAxios({ url: 'trait/category', success: onSuccess, error: onError })
}

export {
  apiPostTrialsDataTable,
  apiPostTrialsDataTableIds,
  apiPostTraitTable,
  apiPostTraitTableIds,
  apiPostDatasetTraits,
  apiPostTraitDatasetTable,
  apiPatchTrait,
  apiPostTraitUnification,
  apiGetTraitDistinctValues,
  apiPostTrialLocationCount,
  apiPostTraitAttributeTable,
  apiPostTrialsDataTimepoints,
  apiPostTrialGermplasm,
  apiPostTrialCreation,
  apiPostTraitDatasetStats,
  apiGetTraitCategories,
}
