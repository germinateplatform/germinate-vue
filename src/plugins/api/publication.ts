import type { PaginatedRequest, PaginatedResult, Publicationdata, Publications, ViewTablePublications } from '@/plugins/types/germinate'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import { authAxios, type ErrorHandler } from '@/plugins/api/base'

export function apiGetPublicationById (publicationId: number, onSuccess?: GerminateResponseHandler<ViewTablePublications>, onError?: ErrorHandler) {
  return authAxios({ url: `publication/${publicationId}`, success: onSuccess, error: onError })
}

export function apiPostPublicationsTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTablePublications[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'publication/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiGetPublications (type: string, id?: number, onSuccess?: GerminateResponseHandler<ViewTablePublications[]>, onError?: ErrorHandler) {
  return authAxios({ url: `publicationtype/${type}/${id || ''}`, method: 'GET', success: onSuccess, error: onError })
}

export function apiPutPublication (data: Publications, onSuccess?: GerminateResponseHandler<number>, onError?: ErrorHandler) {
  return authAxios({ url: 'publication', method: 'PUT', data, success: onSuccess, error: onError })
}

export function apiPutPublicationReference (publicationId: number, data: Publicationdata, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `publication/${publicationId}/reference`, method: 'PUT', data, success: onSuccess, error: onError })
}

export function apiDeletePublicationReference (publicationId: number, referenceType: string, referenceId?: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `publication/${publicationId}/reference/${referenceType}/${referenceId || ''}`, method: 'DELETE', success: onSuccess, error: onError })
}
