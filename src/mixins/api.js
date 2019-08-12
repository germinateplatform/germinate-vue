
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
    apiGetGermplasmTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'germplasm/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    },
    apiGetMapsTable: function (queryData, onSuccess, onError) {
      queryData.page -= 1
      return this.authAjax({ url: 'maps/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
    }
  }
}
