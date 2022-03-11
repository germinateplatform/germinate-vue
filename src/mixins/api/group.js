const MAX_JAVA_INTEGER = 2147483647

export default {
  methods: {
    apiGetGroup: function (groupId, onSuccess, onError) {
      return this.authAxios({ url: `group/${groupId}`, success: onSuccess, error: onError })
    },
    apiPatchGroup: function (group, onSuccess, onError) {
      return this.authAxios({ url: `group/${group.id}`, data: group, method: 'PATCH', success: onSuccess, error: onError })
    },
    apiPutGroup: function (group, onSuccess, onError) {
      return this.authAxios({ url: 'group', data: group, method: 'PUT', success: onSuccess, error: onError })
    },
    apiDeleteGroup: function (groupId, onSuccess, onError) {
      return this.authAxios({ url: `group/${groupId}`, method: 'DELETE', success: onSuccess, error: onError })
    },
    apiPatchGroupMembers: function (groupId, groupType, groupModification, onSuccess, onError) {
      return this.authAxios({ url: `group/${groupId}/${groupType}`, method: 'PATCH', data: groupModification, success: onSuccess, error: onError })
    },
    apiGetGroupTypes: function (onSuccess, onError) {
      return this.authAxios({ url: `grouptype?limit=${MAX_JAVA_INTEGER}`, success: onSuccess, error: onError })
    },
    apiPostGroupTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: 'group/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetGroups: function (queryData, onSuccess, onError) {
      return this.authAxios({ url: 'dataset/group', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostPublicationGroupTable: function (publicationId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAxios({ url: `publication/${publicationId}/group`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    }
  }
}
