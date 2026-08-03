import type { AsyncExportResult, DataImportJobs, DataOrientation, PaginatedRequest, PaginatedResult, ViewTableImportJobs } from '@/plugins/types/germinate'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import { authAxios, authForm, type ErrorHandler } from '@/plugins/api/base'

export function apiPostDataImportStats (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableImportJobs[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'import/stats', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostDataAsyncImport (uuids: string[], onSuccess?: GerminateResponseHandler<DataImportJobs[]>, onError?: ErrorHandler) {
  const queryData = {
    uuids,
  }
  return authAxios({ url: 'import/template', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiDeleteDataAsyncImport (uuid: string, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `import/template/${uuid}`, method: 'DELETE', success: onSuccess, error: onError })
}

export function apiGetDataAsyncImportStart (uuid: string, onSuccess?: GerminateResponseHandler<AsyncExportResult[]>, onError?: ErrorHandler) {
  return authAxios({ url: `import/template/${uuid}/import`, success: onSuccess, error: onError })
}

export function apiGetDataAsyncImportLog (uuid: string, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: `import/template/${uuid}/log`, dataType: 'blob', success: onSuccess, error: onError })
}

export function apiPostDataUpload (formData: FormData, templateType: string, isUpdate: boolean, dataOrientation: DataOrientation | undefined, datasetId: number | undefined, datasetStateId: number | undefined, onSuccess?: GerminateResponseHandler<AsyncExportResult[]>, onError?: ErrorHandler) {
  return authForm({ url: `import/template/file?type=${templateType}&update=${isUpdate}&dataOrientation=${dataOrientation}&datasetStateId=${datasetStateId}&datasetId=${datasetId || ''}`, formData, success: onSuccess, error: onError })
}
