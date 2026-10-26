import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { DatasetGroupModificationRequest, DatasetUserModificationRequest, PaginatedRequest, PaginatedResult, UserGroupModificationRequest, Usergroups, ViewTableUsergroups, ViewUserDetailsType } from '@/plugins/types/germinate'

export function apiDeleteUsergroup (groupId: number, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `usergroup/${groupId}`, method: 'DELETE', success: onSuccess, error: onError })
}

export function apiPatchUsergroup (group: Usergroups, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `usergroup/${group.id}`, data: group, method: 'PATCH', success: onSuccess, error: onError })
}

export function apiPutUsergroup (group: Usergroups, onSuccess?: GerminateResponseHandler<number>, onError?: ErrorHandler) {
  return authAxios({ url: 'usergroup', data: group, method: 'PUT', success: onSuccess, error: onError })
}

export function apiPostUsergroupTable (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableUsergroups[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'usergroup/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostUsergroupTableIds (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'usergroup/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostDatasetUserGroupTable (queryData: PaginatedRequest, datasetId: number, onSuccess?: GerminateResponseHandler<PaginatedResult<ViewTableUsergroups[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: `dataset/${datasetId}/usergroup`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostDatasetUsergroupTableIds (queryData: PaginatedRequest, datasetId: number, onSuccess?: GerminateResponseHandler<PaginatedResult<number[]>>, onError?: ErrorHandler) {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `dataset/${datasetId}/usergroup/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiGetUsers (type: 'usergroup' | 'dataset' | 'user', id?: number, onSuccess?: GerminateResponseHandler<ViewUserDetailsType[]>, onError?: ErrorHandler) {
  if (type === 'usergroup') {
    return authAxios({ url: `usergroup/${id}/user`, success: onSuccess, error: onError })
  } else if (type === 'dataset') {
    return authAxios({ url: `dataset/${id}/user`, success: onSuccess, error: onError })
  } else {
    return authAxios({ url: 'user', success: onSuccess, error: onError })
  }
}

export function apiPatchUserGroupMembers (queryData: UserGroupModificationRequest, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `usergroup/${queryData.userGroupId}/user`, data: queryData, method: 'PATCH', success: onSuccess, error: onError })
}

export function apiPatchDatasetUserMembers (queryData: DatasetUserModificationRequest, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `dataset/${queryData.datasetId}/user`, data: queryData, method: 'PATCH', success: onSuccess, error: onError })
}

export function apiPatchDatasetUserGroups (queryData: DatasetGroupModificationRequest, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: `dataset/${queryData.datasetId}/usergroup`, data: queryData, method: 'PATCH', success: onSuccess, error: onError })
}
