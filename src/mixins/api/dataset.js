import { authForm, authAxios } from '@/mixins/api/base'
import { uuidv4 } from '@/mixins/util'

const apiPostPublicationDatasetTable = (publicationId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `publication/${publicationId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostCollaboratorsTable = (datasetId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `dataset/${datasetId}/collaborator`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetExport = (datasetType, queryData, onSuccess, onError) => authAxios({ url: `dataset/export/${datasetType}`, dataType: 'blob', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostDatasetAttributeExport = (queryData, onSuccess, onError) => authAxios({ url: 'dataset/attribute/export', dataType: 'blob', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiGetDatasetSourceFile = (datasetId, onSuccess, onError) => authAxios({ url: `dataset/${datasetId}/download-source?random=${uuidv4()}`, dataType: 'blob', success: onSuccess, error: onError })

const apiPostExperimentTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'experiment/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'dataset/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetTableIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'dataset/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetAttributeTableExport = (datasetId, queryData, onSuccess, onError) => {
  const url = datasetId !== null ? `dataset/${datasetId}/attribute/export` : 'dataset/attribute/table/export'
  return authAxios({ url: url, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetAsyncExport = (uuids, onSuccess, onError) => {
  const queryData = {
    uuids: uuids
  }
  return authAxios({ url: 'dataset/export/async', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiDeleteDatasetAsyncExport = (uuid, onSuccess, onError) => authAxios({ url: `dataset/export/async/${uuid}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPostDatasetAttributeTable = (datasetId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  const url = datasetId !== null ? `dataset/${datasetId}/attribute` : 'dataset/attribute/table'
  return authAxios({ url: url, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostTraitStats = (statsType, queryData, onSuccess, onError) => authAxios({ url: `dataset/stats/${statsType}`, method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostTraitStatsCategorical = (queryData, onSuccess, onError) => authAxios({ url: 'dataset/categorical/trial', dataType: 'blob', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostLicenseTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'license/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiGetLicenses = (onSuccess, onError) => authAxios({ url: 'license', success: onSuccess, error: onError })

const apiPutLicense = (data, onSuccess, onError) => authAxios({ url: 'license', method: 'PUT', data: data, success: onSuccess, error: onError })

const apiPatchLicense = (licenseId, data, onSuccess, onError) => authAxios({ url: `license/${licenseId}`, method: 'PATCH', data: data, success: onSuccess, error: onError })

const apiGetAcceptLicense = (licenseId, onSuccess, onError) => authAxios({ url: `license/${licenseId}/accept`, success: onSuccess, error: onError })

const apiPostFileResourceTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'fileresource/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiGetFileResourceTypes = (onSuccess, onError) => authAxios({ url: 'fileresourcetype', success: onSuccess, error: onError })

const apiPostFileresourceType = (data, onSuccess, onError) => authAxios({ url: 'fileresourcetype', method: 'POST', data: data, success: onSuccess, error: onError })

const apiPostFileresourceFile = (formData, onSuccess, onError) => authForm({ url: 'fileresource', formData: formData, success: onSuccess, error: onError })

const apiPutFileresource = (data, onSuccess, onError) => authAxios({ url: 'fileresource', method: 'PUT', data: data, success: onSuccess, error: onError })

const apiDeleteFileresource = (id, onSuccess, onError) => authAxios({ url: `fileresource/${id}`, method: 'DELETE', success: onSuccess, error: onError })

const apiGetDataResource = (id, onSuccess, onError) => authAxios({ url: `fileresource/${id}`, dataType: 'blob', success: onSuccess, error: onError })

const apiPostFileresourceDatasetTable = (fileresourceId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `fileresource/${fileresourceId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostCrossDataTypeComparison = (data, onSuccess, onError) => authAxios({ url: 'dataset/crosscomparison', method: 'POST', dataType: 'blob', data: data, success: onSuccess, error: onError })

const apiPatchDataset = (id, data, onSuccess, onError) => authAxios({ url: `dataset/${id}`, method: 'PATCH', data: data, success: onSuccess, error: onError })

export {
  apiPostPublicationDatasetTable,
  apiPostCollaboratorsTable,
  apiPostDatasetExport,
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
  apiGetLicenses,
  apiPutLicense,
  apiPatchLicense,
  apiPostLicenseTable,
  apiGetAcceptLicense,
  apiPostFileResourceTable,
  apiGetFileResourceTypes,
  apiPostFileresourceType,
  apiPostFileresourceFile,
  apiPutFileresource,
  apiDeleteFileresource,
  apiGetDataResource,
  apiPostFileresourceDatasetTable,
  apiPostCrossDataTypeComparison,
  apiPatchDataset
}
