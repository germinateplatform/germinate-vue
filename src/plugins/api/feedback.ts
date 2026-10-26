import { authAxios, authForm, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { PaginatedRequest, PaginatedResult, Userfeedback } from '@/plugins/types/germinate'

export function apiPostFeedbackUpload (formData: FormData, uuid: string, onSuccess?: GerminateResponseHandler<void>, onError?: ErrorHandler) {
  return authForm({ url: `feedback/${uuid}`, formData, success: onSuccess, error: onError })
}

export function apiPostUserFeedbackTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<Userfeedback[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'feedback/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiGetUserFeedbackMarkAsRead (id: number, onSuccess?: GerminateResponseHandler<void>, onError?: ErrorHandler) {
  return authAxios({ url: `feedback/${id}/mark`, success: onSuccess, error: onError })
}

export function apiDeleteUserFeedback (id: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `feedback/${id}`, method: 'DELETE', success: onSuccess, error: onError })
}
