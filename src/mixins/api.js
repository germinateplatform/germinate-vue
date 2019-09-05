
const MAX_JAVA_INTEGER = 2147483647

export default {
  methods: {
    // TOKEN
    /**
     * Deletes the current json token
     *
     * @param {Object} user The user object containing the username and the token as the password
     * @param {function=} onSuccess Called on success
     * @param {function=} onError Called on failure
     * @returns A Promise
     */
    apiDeleteToken: function (user, onSuccess, onError) {
      return this.authAjax({ url: 'token', method: 'DELETE', data: user, success: onSuccess, error: onError })
    },
    /**
     * Requests a token given the user details
     *
     * @param {Object} user The user object containing the username and password
     * @param {function=} onSuccess Called on success
     * @param {function=} onError Called on failure
     * @returns A Promise
     */
    apiPostToken: function (user, onSuccess, onError) {
      return this.authAjax({ url: 'token', method: 'POST', data: user, success: onSuccess, error: onError })
    },
    apiGetGermplasm: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'germplasm', data: queryData, success: onSuccess, error: onError })
    },
    apiGetGermplasmMcpd: function (germplasmId, onSuccess, onError) {
      return this.authAjax({ url: `germplasm/${germplasmId}/mcpd`, success: onSuccess, error: onError })
    },
    apiPostGermplasmTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'germplasm/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmTableIds: function (queryData, onSuccess, onError) {
      queryData.page = 0
      queryData.limit = MAX_JAVA_INTEGER
      return this.authAjax({ url: 'germplasm/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmGroupTable: function (groupId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: `group/${groupId}/germplasm`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostGermplasmGroupTableIds: function (groupId, queryData, onSuccess, onError) {
      queryData.page = 0
      queryData.limit = MAX_JAVA_INTEGER
      return this.authAjax({ url: `group/${groupId}/germplasm/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMarkerGroupTable: function (groupId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: `group/${groupId}/marker`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMarkerGroupTableIds: function (groupId, queryData, onSuccess, onError) {
      queryData.page = 0
      queryData.limit = MAX_JAVA_INTEGER
      return this.authAjax({ url: `group/${groupId}/marker/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostLocationTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'location/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostLocationTableIds: function (queryData, onSuccess, onError) {
      queryData.page = 0
      queryData.limit = MAX_JAVA_INTEGER
      return this.authAjax({ url: 'location/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostLocationGroupTable: function (groupId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: `group/${groupId}/location`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostLocationGroupTableIds: function (groupId, queryData, onSuccess, onError) {
      queryData.page = 0
      queryData.limit = MAX_JAVA_INTEGER
      return this.authAjax({ url: `group/${groupId}/location/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiGetMap: function (mapId, onSuccess, onError) {
      return this.authAjax({ url: `map/${mapId}`, success: onSuccess, error: onError })
    },
    apiGetMapExport: function (mapId, onSuccess, onError) {
      return this.authAjax({ url: `map/${mapId}/export`, dataType: 'blob', success: onSuccess, error: onError })
    },
    apiPostMapsTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'map/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMapdefinitionTable: function (mapId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: `map/${mapId}/mapdefinition/table`, method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'dataset/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetTableIds: function (queryData, onSuccess, onError) {
      queryData.page = 0
      queryData.limit = MAX_JAVA_INTEGER
      return this.authAjax({ url: 'dataset/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostLicenseTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'license/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiGetOverviewStats: function (onSuccess, onError) {
      return this.authAjax({ url: 'stats/overview', success: onSuccess, error: onError })
    },
    apiGetSettings: function (onSuccess, onError) {
      return this.authAjax({ url: 'settings', success: onSuccess, error: onError })
    },
    apiGetSettingsFile: function (queryData, onSuccess, onError) {
      return this.authAjax({ url: 'settings/file', data: queryData, success: onSuccess, error: onError })
    },
    apiGetImageSrc: function (queryData, onSuccess, onError) {
      return this.authAjax({ url: 'image/src', data: queryData, dataType: 'arraybuffer', success: onSuccess, error: onError })
    },
    apiPostGroupTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'group/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiGetGroup: function (groupId, onSuccess, onError) {
      return this.authAjax({ url: `group/${groupId}`, success: onSuccess, error: onError })
    },
    apiPatchGroup: function (group, onSuccess, onError) {
      return this.authAjax({ url: `group/${group.id}`, data: group, method: 'PATCH', success: onSuccess, error: onError })
    },
    apiDeleteGroup: function (groupId, onSuccess, onError) {
      return this.authAjax({ url: `group/${groupId}`, method: 'DELETE', success: onSuccess, error: onError })
    },
    apiPatchGroupMembers: function (groupId, groupType, groupModification, onSuccess, onError) {
      return this.authAjax({ url: `group/${groupId}/${groupType}`, method: 'PATCH', data: groupModification, success: onSuccess, error: onError })
    },
    apiGetGroupTypes: function (onSuccess, onError) {
      return this.authAjax({ url: `grouptype?limit=${MAX_JAVA_INTEGER}`, success: onSuccess, error: onError })
    },
    apiPostDataUpload: function (formData, onSuccess, onError) {
      return this.authForm({ url: 'import/template/mcpd', formData: formData, success: onSuccess, error: onError })
    },
    apiGetDataUploadStatus: function (uuid, onSuccess, onError) {
      return this.authAjax({ url: `import/template/${uuid}/status`, success: onSuccess, error: onError })
    }
  }
}
