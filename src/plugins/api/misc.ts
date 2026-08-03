import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { ClimateExportDatasetRequest, GenesysRequestDetails, LinkRequest, PaginatedRequest, PaginatedResult, TrialsExportDatasetRequest, ViewTableLinks, ViewTableMapoverlays } from '@/plugins/types/germinate'

export function apiPostTableExport (queryData: TrialsExportDatasetRequest | ClimateExportDatasetRequest, tableType: string, onSuccess?: GerminateResponseHandler<Blob>, onError?: ErrorHandler) {
  return authAxios({ url: `${tableType}/table/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })
}

export function apiPostMapOverlayTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableMapoverlays[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'mapoverlay/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostLinks (queryData: LinkRequest, onSuccess?: GerminateResponseHandler<ViewTableLinks[]>, onError?: ErrorHandler) {
  return authAxios({ url: 'link/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGenesysRequest (data: GenesysRequestDetails, onSuccess?: GerminateResponseHandler<string>, onError?: ErrorHandler) {
  return authAxios({ url: 'genesys/germplasm', method: 'POST', data, success: onSuccess, error: onError })
}
