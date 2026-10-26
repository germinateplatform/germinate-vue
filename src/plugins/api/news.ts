import type { News, PaginatedRequest, PaginatedResult, ViewTableNews } from '@/plugins/types/germinate'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import { authAxios, type ErrorHandler } from '@/plugins/api/base'

export function apiPostNews (newsItem: News, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: 'news', method: 'POST', data: newsItem, success: onSuccess, error: onError })
}

export function apiDeleteNews (newsId: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `news/${newsId}`, method: 'DELETE', success: onSuccess, error: onError })
}

export function apiPostNewsTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableNews[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'news/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}
