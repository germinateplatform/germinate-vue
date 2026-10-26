import type { PaginatedRequest, PaginatedResult, Storysteps, ViewTableStories, ViewTableStoriesEnriched } from '@/plugins/types/germinate'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import { authAxios, authForm, type ErrorHandler } from '@/plugins/api/base'

export function apiPostStoryTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableStoriesEnriched[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'story/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiDeleteStoryById (storyId: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `story/${storyId}`, method: 'DELETE', success: onSuccess, error: onError })
}

export function apiPatchStory (storyId: number, data: ViewTableStories, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `story/${storyId}`, method: 'PATCH', data, success: onSuccess, error: onError })
}

export function apiPatchStorySteps (storyId: number, data: Storysteps[], onSuccess?: GerminateResponseHandler<void>, onError?: ErrorHandler) {
  return authAxios({ url: `story/${storyId}/step`, method: 'PATCH', data, success: onSuccess, error: onError })
}

export function apiPostStoryUpload (formData: FormData, onSuccess?: GerminateResponseHandler<void>, onError?: ErrorHandler) {
  return authForm({ url: 'story', formData, success: onSuccess, error: onError })
}

export function apiPostStoryStepUpload (storyId: number, formData: FormData, onSuccess?: GerminateResponseHandler<void>, onError?: ErrorHandler) {
  return authForm({ url: `story/${storyId}/step`, formData, success: onSuccess, error: onError })
}

export function apiDeleteStoryStep (storyId: number, storyStepId: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `story/${storyId}/step/${storyStepId}`, method: 'DELETE', success: onSuccess, error: onError })
}
