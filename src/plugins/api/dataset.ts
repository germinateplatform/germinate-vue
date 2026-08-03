import { authForm, authAxios, type ErrorHandler } from '@/plugins/api/base'
import { uuidv4 } from '@/plugins/util'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { PaginatedResult, DatasetCrossDataTypeRequest, Datasets, ExperimentRequest, ExportRequest, Fileresourcetypes, PaginatedDatasetRequest, PaginatedRequest, TrialsExportDatasetRequest, ViewTableDatasets, ViewTableExperiments, ViewTableFileresources, ViewTableLicenseDefinitions, ClimateExportDatasetRequest, ViewTableDatasetAttributes, DataExportJobs, ViewTableLicenses, ViewTableFileresourcetypes, ViewTableCollaborators } from '@/plugins/types/germinate'

export function apiPostPublicationDatasetTable (publicationId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableDatasets[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `publication/${publicationId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostCollaboratorsTable<T> (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'collaborator/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostDatasetCollaboratorsTable (datasetId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableCollaborators[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `dataset/${datasetId}/collaborator`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostTrialDatasetExport (queryData: TrialsExportDatasetRequest, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: 'dataset/export/trial?format=tab', dataType: 'blob', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostClimateDatasetExport (queryData: ClimateExportDatasetRequest, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: 'dataset/export/climate', dataType: 'blob', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostDatasetExport (datasetType: string, queryData: any, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: `dataset/export/${datasetType}`, dataType: 'blob', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostDatasetAttributeExport (queryData: ExperimentRequest, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: 'dataset/attribute/export', dataType: 'blob', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiGetDatasetSourceFile (datasetId: number, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: `dataset/${datasetId}/download-source?random=${uuidv4()}`, dataType: 'blob', success: onSuccess, error: onError })
}

export function apiPostExperimentTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableExperiments[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'experiment/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostDatasetTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableDatasets[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'dataset/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiDeleteDataset (datasetId: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `dataset/${datasetId}`, method: 'DELETE', success: onSuccess, error: onError })
}

export function apiDeleteExperiment (experimentId: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `experiment/${experimentId}`, method: 'DELETE', success: onSuccess, error: onError })
}

export function apiPostDatasetTableIds (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'dataset/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostDatasetAttributeTableExport (datasetId: number, queryData: ExportRequest, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  const url = datasetId !== null ? `dataset/${datasetId}/attribute/export` : 'dataset/attribute/table/export'
  return authAxios({ url, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
}

export function apiPostDatasetAsyncExport (uuids: string[], onSuccess?: GerminateResponseHandler<DataExportJobs[]>, onError?: ErrorHandler) {
  const queryData = {
    uuids,
  }
  return authAxios({ url: 'dataset/export/async', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiDeleteDatasetAsyncExport (uuid: string, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `dataset/export/async/${uuid}`, method: 'DELETE', success: onSuccess, error: onError })
}

export function apiPostDatasetAttributeTable (datasetId: number | null, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableDatasetAttributes[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  const url = datasetId !== null ? `dataset/${datasetId}/attribute` : 'dataset/attribute/table'
  return authAxios({ url, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostTraitStatsCategorical (queryData: TrialsExportDatasetRequest, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: 'dataset/categorical/trial', dataType: 'blob', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostClimateStatsCategorical (queryData: ClimateExportDatasetRequest, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: 'dataset/categorical/climate', dataType: 'blob', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostLicenseTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableLicenses[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'license/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiGetLicenses (onSuccess?: GerminateResponseHandler<ViewTableLicenseDefinitions[]>, onError?: ErrorHandler) {
  return authAxios({ url: 'license', success: onSuccess, error: onError })
}

export function apiPutExperiment (data: ViewTableExperiments, onSuccess?: GerminateResponseHandler<number>, onError?: ErrorHandler) {
  return authAxios({ url: 'experiment', method: 'PUT', data, success: onSuccess, error: onError })
}

export function apiPatchExperiment (experimentId: number, data: ViewTableExperiments, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `experiment/${experimentId}`, method: 'PATCH', data, success: onSuccess, error: onError })
}

export function apiPutLicense (data: ViewTableLicenseDefinitions, onSuccess?: GerminateResponseHandler<number>, onError?: ErrorHandler) {
  return authAxios({ url: 'license', method: 'PUT', data, success: onSuccess, error: onError })
}

export function apiPatchLicense (licenseId: number, data: ViewTableLicenseDefinitions, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `license/${licenseId}`, method: 'PATCH', data, success: onSuccess, error: onError })
}

export function apiGetAcceptLicense (licenseId: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `license/${licenseId}/accept`, success: onSuccess, error: onError })
}

export function apiPostFileResourceTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableFileresources[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'fileresource/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostDatasetfileresource (queryData: PaginatedDatasetRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableFileresources[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'dataset/fileresource', data: queryData, method: 'POST', success: onSuccess, error: onError })
}

export function apiGetFileResourceTypes (onSuccess?: GerminateResponseHandler<ViewTableFileresourcetypes[]>, onError?: ErrorHandler) {
  return authAxios({ url: 'fileresourcetype', success: onSuccess, error: onError })
}

export function apiPostFileresourceType (data: Fileresourcetypes, onSuccess?: GerminateResponseHandler<number>, onError?: ErrorHandler) {
  return authAxios({ url: 'fileresourcetype', method: 'POST', data, success: onSuccess, error: onError })
}

export function apiPostFileresourceFile (formData: FormData, onSuccess?: GerminateResponseHandler<string>, onError?: ErrorHandler) {
  return authForm({ url: 'fileresource', formData, success: onSuccess, error: onError })
}

export function apiPutFileresource (data: ViewTableFileresources, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: 'fileresource', method: 'PUT', data, success: onSuccess, error: onError })
}

export function apiDeleteFileresource (id: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `fileresource/${id}`, method: 'DELETE', success: onSuccess, error: onError })
}

export function apiGetDataResource (id: number, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: `fileresource/${id}`, dataType: 'blob', success: onSuccess, error: onError })
}

export function apiPostFileresourceDatasetTable (fileresourceId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableDatasets[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `fileresource/${fileresourceId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostCrossDataTypeComparison (data: DatasetCrossDataTypeRequest, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: 'dataset/crosscomparison', method: 'POST', dataType: 'blob', data, success: onSuccess, error: onError })
}

export function apiPatchDataset (id: number, data: Datasets, onSuccess?: GerminateResponseHandler<ViewTableDatasets>, onError?: ErrorHandler) {
  return authAxios({ url: `dataset/${id}`, method: 'PATCH', data, success: onSuccess, error: onError })
}

export function apiPostDataset (data: Datasets, onSuccess?: GerminateResponseHandler<ViewTableDatasets>, onError?: ErrorHandler) {
  return authAxios({ url: 'dataset', method: 'POST', data, success: onSuccess, error: onError })
}
