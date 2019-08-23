
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
    apiPostGermplasmTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'germplasm/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiGetMap: function (mapId, onSuccess, onError) {
      return this.authAjax({ url: 'map/' + mapId, success: onSuccess, error: onError })
    },
    apiGetMapExport: function (mapId, onSuccess, onError) {
      return this.authAjax({ url: 'map/' + mapId + '/export', dataType: 'blob', success: onSuccess, error: onError })
    },
    apiPostMapsTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'map/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostMapdefinitionTable: function (mapId, queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'map/' + mapId + '/mapdefinition/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostDatasetTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'dataset/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiPostLicenseTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'license/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    }
  }
}
