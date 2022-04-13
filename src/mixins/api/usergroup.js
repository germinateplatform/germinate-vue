export default {
  methods: {
    apiPostDatasetUserGroupTable: function (queryData, datasetId, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: `dataset/${datasetId}/usergroup`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetUserGroupIds: function (queryData, datasetId, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAxios({ url: `dataset/${datasetId}/usergroup/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostUserGroupTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'usergroup/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostUserGroupIds: function (queryData, onSuccess, onError) {
      delete queryData.orderBy
      delete queryData.ascending
      return this.authAxios({ url: 'usergroup/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiDeleteUserGroup: function (groupId, onSuccess, onError) {
      return this.authAxios({ url: `usergroup/${groupId}`, method: 'DELETE', success: onSuccess, error: onError })
    },
    apiPutUserGroup: function (group, onSuccess, onError) {
      return this.authAxios({ url: 'usergroup', method: 'PUT', data: group, success: onSuccess, error: onError })
    },
    apiPatchUserGroup: function (group, onSuccess, onError) {
      return this.authAxios({ url: `usergroup/${group.id}`, data: group, method: 'PATCH', success: onSuccess, error: onError })
    },
    apiGetUsers: function (params, onSuccess, onError) {
      if (params && params.userGroupId) {
        return this.authAxios({ url: `usergroup/${params.userGroupId}/user`, success: onSuccess, error: onError })
      } else if (params && params.datasetId) {
        return this.authAxios({ url: `dataset/${params.datasetId}/user`, success: onSuccess, error: onError })
      } else {
        return this.authAxios({ url: 'user', success: onSuccess, error: onError })
      }
    },
    apiPatchUserGroupMembers: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: `usergroup/${queryData.userGroupId}/user`, data: queryData, method: 'PATCH', success: onSuccess, error: onError })
    },
    apiPatchDatasetUserGroups: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: `dataset/${queryData.datasetId}/usergroup`, data: queryData, method: 'PATCH', success: onSuccess, error: onError })
    },
    apiPatchDatasetUserMembers: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: `dataset/${queryData.datasetId}/user`, data: queryData, method: 'PATCH', success: onSuccess, error: onError })
    }
  }
}
