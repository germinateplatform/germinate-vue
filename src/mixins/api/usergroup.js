import { authAxios } from '@/mixins/api/base'

const apiPostDatasetUserGroupTable = (queryData, datasetId, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `dataset/${datasetId}/usergroup`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetUserGroupIds = (queryData, datasetId, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `dataset/${datasetId}/usergroup/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostUserGroupTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'usergroup/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostUserGroupIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'usergroup/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiDeleteUserGroup = (groupId, onSuccess, onError) => authAxios({ url: `usergroup/${groupId}`, method: 'DELETE', success: onSuccess, error: onError })

const apiPutUserGroup = (group, onSuccess, onError) => authAxios({ url: 'usergroup', method: 'PUT', data: group, success: onSuccess, error: onError })

const apiPatchUserGroup = (group, onSuccess, onError) => authAxios({ url: `usergroup/${group.id}`, data: group, method: 'PATCH', success: onSuccess, error: onError })

const apiGetUsers = (params, onSuccess, onError) => {
  if (params && params.userGroupId) {
    return authAxios({ url: `usergroup/${params.userGroupId}/user`, success: onSuccess, error: onError })
  } else if (params && params.datasetId) {
    return authAxios({ url: `dataset/${params.datasetId}/user`, success: onSuccess, error: onError })
  } else {
    return authAxios({ url: 'user', success: onSuccess, error: onError })
  }
}

const apiPatchUserGroupMembers = (queryData, onSuccess, onError) => authAxios({ url: `usergroup/${queryData.userGroupId}/user`, data: queryData, method: 'PATCH', success: onSuccess, error: onError })

const apiPatchDatasetUserGroups = (queryData, onSuccess, onError) => authAxios({ url: `dataset/${queryData.datasetId}/usergroup`, data: queryData, method: 'PATCH', success: onSuccess, error: onError })

const apiPatchDatasetUserMembers = (queryData, onSuccess, onError) => authAxios({ url: `dataset/${queryData.datasetId}/user`, data: queryData, method: 'PATCH', success: onSuccess, error: onError })

export {
  apiPostDatasetUserGroupTable,
  apiPostDatasetUserGroupIds,
  apiPostUserGroupTable,
  apiPostUserGroupIds,
  apiDeleteUserGroup,
  apiPutUserGroup,
  apiPatchUserGroup,
  apiGetUsers,
  apiPatchUserGroupMembers,
  apiPatchDatasetUserGroups,
  apiPatchDatasetUserMembers
}
