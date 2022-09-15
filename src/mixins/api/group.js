import { MAX_JAVA_INTEGER, authAxios } from '@/mixins/api/base'

const apiPatchGroup = (group, onSuccess, onError) => authAxios({ url: `group/${group.id}`, data: group, method: 'PATCH', success: onSuccess, error: onError })

const apiPutGroup = (group, onSuccess, onError) => authAxios({ url: 'group', data: group, method: 'PUT', success: onSuccess, error: onError })

const apiDeleteGroup = (groupId, onSuccess, onError) => authAxios({ url: `group/${groupId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPatchGroupMembers = (groupId, groupType, groupModification, onSuccess, onError) => authAxios({ url: `group/${groupId}/${groupType}`, method: 'PATCH', data: groupModification, success: onSuccess, error: onError })

const apiGetGroupTypes = (onSuccess, onError) => authAxios({ url: `grouptype?limit=${MAX_JAVA_INTEGER}`, success: onSuccess, error: onError })

const apiPostGroupTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'group/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetGroups = (queryData, onSuccess, onError) => authAxios({ url: 'dataset/group', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostPublicationGroupTable = (publicationId, queryData, onSuccess, onError) => {
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
  apiPostPublicationGroupTable
}
