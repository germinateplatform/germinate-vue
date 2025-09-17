import { authForm, authAxios, type ErrorHandler } from '@/plugins/api/base'
import { uuidv4 } from '@/plugins/util'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { DatasetCrossDataTypeRequest, Datasets, ExperimentRequest, ExportRequest, Fileresourcetypes, PaginatedRequest, SubsettedDatasetRequest, TrialsExportDatasetRequest, ViewTableDatasets, ViewTableExperiments, ViewTableFileresources, ViewTableLicenseDefinitions } from '@/plugins/types/germinate'

const apiPostPublicationDatasetTable = <T>(publicationId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: `publication/${publicationId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostCollaboratorsTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'collaborator/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetCollaboratorsTable = <T>(datasetId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: `dataset/${datasetId}/collaborator`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostTrialDatasetExport = <T>(queryData: TrialsExportDatasetRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'dataset/export/trial?format=tab', dataType: 'blob', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostDatasetExport = <T>(datasetType: string, queryData: any, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `dataset/export/${datasetType}`, dataType: 'blob', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostDatasetAttributeExport = <T>(queryData: ExperimentRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'dataset/attribute/export', dataType: 'blob', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiGetDatasetSourceFile = <T>(datasetId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `dataset/${datasetId}/download-source?random=${uuidv4()}`, dataType: 'blob', success: onSuccess, error: onError })

const apiPostExperimentTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'experiment/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'dataset/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiDeleteDataset = <T>(datasetId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `dataset/${datasetId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiDeleteExperiment = <T>(experimentId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `experiment/${experimentId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPostDatasetTableIds = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'dataset/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetAttributeTableExport = <T>(datasetId: number, queryData: ExportRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  const url = datasetId !== null ? `dataset/${datasetId}/attribute/export` : 'dataset/attribute/table/export'
  return authAxios({ url, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetAsyncExport = <T>(uuids: string[], onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  const queryData = {
    uuids,
  }
  return authAxios({ url: 'dataset/export/async', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiDeleteDatasetAsyncExport = <T>(uuid: string, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `dataset/export/async/${uuid}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPostDatasetAttributeTable = <T>(datasetId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  const url = datasetId !== null ? `dataset/${datasetId}/attribute` : 'dataset/attribute/table'
  return authAxios({ url, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostTraitStats = <T>(statsType: string, queryData: SubsettedDatasetRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `dataset/stats/${statsType}`, method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostTraitStatsCategorical = <T>(queryData: SubsettedDatasetRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'dataset/categorical/trial', dataType: 'blob', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostClimateStatsCategorical = <T>(queryData: SubsettedDatasetRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'dataset/categorical/climate', dataType: 'blob', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostLicenseTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'license/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiGetLicenses = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'license', success: onSuccess, error: onError })

const apiPutExperiment = <T>(data: ViewTableExperiments, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'experiment', method: 'PUT', data, success: onSuccess, error: onError })

const apiPatchExperiment = <T>(experimentId: number, data: ViewTableExperiments, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `experiment/${experimentId}`, method: 'PATCH', data, success: onSuccess, error: onError })

const apiPutLicense = <T>(data: ViewTableLicenseDefinitions, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'license', method: 'PUT', data, success: onSuccess, error: onError })

const apiPatchLicense = <T>(licenseId: number, data: ViewTableLicenseDefinitions, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `license/${licenseId}`, method: 'PATCH', data, success: onSuccess, error: onError })

const apiGetAcceptLicense = <T>(licenseId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `license/${licenseId}/accept`, success: onSuccess, error: onError })

const apiPostFileResourceTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'fileresource/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetfileresource = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'dataset/fileresource', data: queryData, method: 'POST', success: onSuccess, error: onError })
}

const apiGetFileResourceTypes = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'fileresourcetype', success: onSuccess, error: onError })

const apiPostFileresourceType = <T>(data: Fileresourcetypes, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'fileresourcetype', method: 'POST', data, success: onSuccess, error: onError })

const apiPostFileresourceFile = <T>(formData: FormData, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authForm({ url: 'fileresource', formData, success: onSuccess, error: onError })

const apiPutFileresource = <T>(data: ViewTableFileresources, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'fileresource', method: 'PUT', data, success: onSuccess, error: onError })

const apiDeleteFileresource = <T>(id: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `fileresource/${id}`, method: 'DELETE', success: onSuccess, error: onError })

const apiGetDataResource = <T>(id: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `fileresource/${id}`, dataType: 'blob', success: onSuccess, error: onError })

const apiPostFileresourceDatasetTable = <T>(fileresourceId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: `fileresource/${fileresourceId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostCrossDataTypeComparison = <T>(data: DatasetCrossDataTypeRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'dataset/crosscomparison', method: 'POST', dataType: 'blob', data, success: onSuccess, error: onError })

const apiPatchDataset = <T>(id: number, data: Datasets, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `dataset/${id}`, method: 'PATCH', data, success: onSuccess, error: onError })

const apiPostDataset = <T>(data: Datasets, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'dataset', method: 'POST', data, success: onSuccess, error: onError })

export {
  apiPostPublicationDatasetTable,
  apiPostDatasetCollaboratorsTable,
  apiPostDatasetExport,
  apiPostTrialDatasetExport,
  apiPostDatasetAttributeExport,
  apiGetDatasetSourceFile,
  apiPostExperimentTable,
  apiPostDatasetTable,
  apiPostDatasetTableIds,
  apiPostDatasetAttributeTableExport,
  apiPostDatasetAsyncExport,
  apiDeleteDatasetAsyncExport,
  apiPostDatasetAttributeTable,
  apiPostTraitStats,
  apiPostTraitStatsCategorical,
  apiPostClimateStatsCategorical,
  apiPutExperiment,
  apiPatchExperiment,
  apiDeleteDataset,
  apiDeleteExperiment,
  apiGetLicenses,
  apiPutLicense,
  apiPatchLicense,
  apiPostLicenseTable,
  apiGetAcceptLicense,
  apiPostDatasetfileresource,
  apiPostFileResourceTable,
  apiGetFileResourceTypes,
  apiPostFileresourceType,
  apiPostFileresourceFile,
  apiPutFileresource,
  apiDeleteFileresource,
  apiGetDataResource,
  apiPostFileresourceDatasetTable,
  apiPostCrossDataTypeComparison,
  apiPatchDataset,
  apiPostDataset,
  apiPostCollaboratorsTable,
}
