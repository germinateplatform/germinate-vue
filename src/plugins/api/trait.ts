import { authAxios } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { ErrorHandler } from '@/plugins/api/base'
import type { PaginatedResult, ViewTableTraits, DatasetRequest, PaginatedDatasetRequest, PaginatedRequest, Phenotypes, TraitDatasetRequest, TraitTimelineRequest, TraitUnificationRequest, TrialCreationDetails, TrialsExportDatasetRequest, UnacceptedLicenseRequest, TrialSetupStats, ViewTableTrialsData, TraitStats, ViewTableDatasets, TrialStats, ViewTableLocations, ViewTableTrialLayouts } from '@/plugins/types/germinate'

function apiPostTrialsDataTable (queryData: TrialsExportDatasetRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableTrialsData[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios<PaginatedResult<ViewTableTrialsData[]>>({ url: 'dataset/data/trial/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTrialsDataTableIds<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'dataset/data/trial/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTrialsDataTimepoints<T> (queryData: TraitTimelineRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: 'dataset/data/trial/timepoint', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTraitTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableTraits[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios<PaginatedResult<ViewTableTraits[]>>({ url: 'trait/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTraitTableIds<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'trait/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostDatasetTraits (datasetIds: number[], onSuccess?: GerminateResponseHandler<ViewTableTraits[]>, onError?: ErrorHandler) {
  const queryData = {
    datasetIds,
  }
  return authAxios<ViewTableTraits[]>({ url: 'dataset/trait', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTraitDatasetTable (traitId: number, queryData: UnacceptedLicenseRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableDatasets[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios<PaginatedResult<ViewTableDatasets[]>>({ url: `trait/${traitId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
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
  return authAxios({ url: `trait/${id}`, method: 'PATCH', data, success: onSuccess, error: onError })
}

function apiPostTraitUnification<T> (queryData: TraitUnificationRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: 'trait/unify', data: queryData, method: 'POST', success: onSuccess, error: onError })
}

function apiGetTraitDistinctValues<T> (traitId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: `trait/${traitId}/values`, success: onSuccess, error: onError })
}

function apiPostTrialLocations (queryData: DatasetRequest, onSuccess?: GerminateResponseHandler<ViewTableLocations[]>, onError?: ErrorHandler) {
  return authAxios<ViewTableLocations[]>({ url: 'dataset/data/trial/location', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiGetTrialStats (onSuccess?: GerminateResponseHandler<TrialStats>, onError?: ErrorHandler) {
  return authAxios<TrialStats>({ url: 'trial/stats', success: onSuccess, error: onError })
}

function apiPostTrialLocationCount (queryData: DatasetRequest, onSuccess?: GerminateResponseHandler<number>, onError?: ErrorHandler) {
  return authAxios<number>({ url: 'dataset/data/trial/location/count', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTrialLayouts (queryData: DatasetRequest, onSuccess?: GerminateResponseHandler<ViewTableTrialLayouts[]>, onError?: ErrorHandler) {
  return authAxios<ViewTableTrialLayouts[]>({ url: 'dataset/data/trial/layout', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTrialLayoutCount (queryData: DatasetRequest, onSuccess?: GerminateResponseHandler<{ [key: number]: number }>, onError?: ErrorHandler) {
  return authAxios<{ [key: number]: number }>({ url: 'dataset/data/trial/layout/count', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiPostTrialCreation<T> (data: TrialCreationDetails, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: 'dataset/data/trial', method: 'POST', data, success: onSuccess, error: onError })
}

function apiPostTraitDatasetStats (queryData: TraitDatasetRequest, onSuccess?: GerminateResponseHandler<TraitStats[]>, onError?: ErrorHandler) {
  return authAxios<TraitStats[]>({ url: 'trait/stats', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

function apiGetTraitCategories<T> (onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  return authAxios({ url: 'trait/category', success: onSuccess, error: onError })
}

function apiPostTrialSetupStats (data: DatasetRequest, onSuccess?: GerminateResponseHandler<TrialSetupStats>, onError?: ErrorHandler) {
  return authAxios<TrialSetupStats>({ url: 'dataset/data/trial/setup', data, method: 'POST', success: onSuccess, error: onError })
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
  apiPostTrialLocations,
  apiPostTrialLocationCount,
  apiPostTrialLayouts,
  apiPostTrialLayoutCount,
  apiPostTraitAttributeTable,
  apiPostTrialsDataTimepoints,
  apiPostTrialGermplasm,
  apiPostTrialCreation,
  apiPostTraitDatasetStats,
  apiGetTraitCategories,
  apiPostTrialSetupStats,
  apiGetTrialStats,
}
