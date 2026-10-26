import type { Comments, PaginatedRequest, PaginatedResult, ViewTableComments } from '@/plugins/types/germinate'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import { authAxios, type ErrorHandler } from '@/plugins/api/base'

export function apiPostCommentsTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableComments[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'comment/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPutComment (comment: Comments, onSuccess?: GerminateResponseHandler<number>, onError?: ErrorHandler) {
  return authAxios({ url: 'comment', data: comment, method: 'PUT', success: onSuccess, error: onError })
}

export function apiDeleteComment (commentId: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `comment/${commentId}`, method: 'DELETE', success: onSuccess, error: onError })
}
