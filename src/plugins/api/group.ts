import { MAX_JAVA_INTEGER, authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { DatasetGroupRequest, GroupModificationRequest, Groups, PaginatedRequest } from '@/plugins/types/germinate'

const apiPatchGroup = <T>(group: Groups, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `group/${group.id}`, data: group, method: 'PATCH', success: onSuccess, error: onError })

const apiPutGroup = <T>(group: Groups, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'group', data: group, method: 'PUT', success: onSuccess, error: onError })

const apiDeleteGroup = <T>(groupId: number, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `group/${groupId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPatchGroupMembers = <T>(groupId: number, groupType: string, groupModification: GroupModificationRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `group/${groupId}/${groupType}`, method: 'PATCH', data: groupModification, success: onSuccess, error: onError })

const apiGetGroupTypes = <T>(onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: `grouptype?limit=${MAX_JAVA_INTEGER}`, success: onSuccess, error: onError })

const apiPostGroupTable = <T>(queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: 'group/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetGroups = <T>(queryData: DatasetGroupRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'dataset/group', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostPublicationGroupTable = <T>(publicationId: number, queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => {
  queryData.page -= 1
  return authAxios({ url: `publication/${publicationId}/group`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export {
  apiPatchGroup,
  apiPutGroup,
  apiDeleteGroup,
  apiPatchGroupMembers,
  apiGetGroupTypes,
  apiPostGroupTable,
  apiPostDatasetGroups,
  apiPostPublicationGroupTable,
}
