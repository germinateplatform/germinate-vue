import { MAX_JAVA_INTEGER, authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { DatasetGroupRequest, GroupModificationRequest, Groups, Grouptypes, PaginatedRequest, PaginatedResult, ViewTableGroups } from '@/plugins/types/germinate'

export function apiPatchGroup (group: Groups, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `group/${group.id}`, data: group, method: 'PATCH', success: onSuccess, error: onError })
}

export function apiPutGroup (group: Groups, onSuccess?: GerminateResponseHandler<number>, onError?: ErrorHandler) {
  return authAxios({ url: 'group', data: group, method: 'PUT', success: onSuccess, error: onError })
}

export function apiDeleteGroup (groupId: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `group/${groupId}`, method: 'DELETE', success: onSuccess, error: onError })
}

export function apiPatchGroupMembers (groupId: number, groupType: string, groupModification: GroupModificationRequest, onSuccess?: GerminateResponseHandler<number>, onError?: ErrorHandler) {
  return authAxios({ url: `group/${groupId}/${groupType}`, method: 'PATCH', data: groupModification, success: onSuccess, error: onError })
}

export function apiGetGroupTypes (onSuccess?: GerminateResponseHandler<PaginatedResult<Grouptypes[]>>, onError?: ErrorHandler) {
  return authAxios({ url: `grouptype?limit=${MAX_JAVA_INTEGER}`, success: onSuccess, error: onError })
}

export function apiPostGroupTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableGroups[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'group/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostDatasetGroups (queryData: DatasetGroupRequest, onSuccess?: GerminateResponseHandler<ViewTableGroups[]>, onError?: ErrorHandler) {
  return authAxios({ url: 'dataset/group', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostPublicationGroupTable (publicationId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableGroups[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `publication/${publicationId}/group`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}
