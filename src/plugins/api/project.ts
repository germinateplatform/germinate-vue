import { type ErrorHandler, authAxios, authForm } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { PaginatedRequest, PaginatedResult, ProjectStats, ViewTableProjects } from '@/plugins/types/germinate'

export function apiPostProjectTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableProjects[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'project/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostProjectTableIds (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'project/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostProject (formData: FormData, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authForm({ url: 'project', formData, success: onSuccess, error: onError })
}

export function apiPostProjectExperiments (projectId: number, experimentIds: number[], onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `project/${projectId}/experiment`, data: experimentIds, method: 'POST', success: onSuccess, error: onError })
}

export function apiPostProjectGroups (projectId: number, groupIds: number[], onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `project/${projectId}/group`, data: groupIds, method: 'POST', success: onSuccess, error: onError })
}

export function apiDeleteProjectExperiment (projectId: number, experimentId: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `project/${projectId}/experiment/${experimentId}`, method: 'DELETE', success: onSuccess, error: onError })
}

export function apiDeleteProjectGroup (projectId: number, groupId: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `project/${projectId}/group/${groupId}`, method: 'DELETE', success: onSuccess, error: onError })
}

export function apiPatchProject (projectId: number, formData: FormData, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authForm({ url: `project/${projectId}`, method: 'patch', formData, success: onSuccess, error: onError })
}

export function apiDeleteProject (projectId: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `project/${projectId}`, method: 'DELETE', success: onSuccess, error: onError })
}

export function apiGetProjectStats (projectId: number, onSuccess?: GerminateResponseHandler<ProjectStats>, onError?: ErrorHandler) {
  return authAxios({ url: `project/${projectId}/stats`, success: onSuccess, error: onError })
}
