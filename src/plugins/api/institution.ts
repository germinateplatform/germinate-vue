import type { PaginatedRequest, PaginatedResult, ViewTableInstitutionDatasets, ViewTableInstitutions } from '@/plugins/types/germinate'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import { authAxios, type ErrorHandler } from '@/plugins/api/base'

export function apiPostInstitutionTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableInstitutions[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'institution/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostInstitutionDatasetTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableInstitutionDatasets[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'institution/dataset/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGermplasmInstitutionTable (germplasmId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableInstitutions[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `germplasm/${germplasmId}/institution/table`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}
