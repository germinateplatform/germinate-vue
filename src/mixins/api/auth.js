import baseApiMixin from '@/mixins/api/base'

export default {
  mixins: [baseApiMixin],
  methods: {
    /**
     * Checks whether the given user type is at least the given minimum user type
     * @param {String} userType The user type to check
     * @param {String} atLeast The user type to check against
     */
    userIsAtLeast: function (userType, atLeast) {
      switch (atLeast) {
        case 'Administrator':
          return userType === 'Administrator'
        case 'Data Curator':
          return userType === 'Administrator' || userType === 'Data Curator'
        case 'Regular User':
          return userType === 'Administrator' || userType === 'Data Curator' || userType === 'Regular User'
      }

      return false
    },
    /**
     * Deletes the current json token
     *
     * @param {Object} user The user object containing the username and the token as the password
     * @param {function=} onSuccess Called on success
     * @param {function=} onError Called on failure
     * @returns A Promise
     */
    apiDeleteToken: function (user, onSuccess, onError) {
      return this.authAxios({ url: 'token', method: 'DELETE', data: user, success: onSuccess, error: onError })
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
      return this.authAxios({ url: 'token', method: 'POST', data: user, success: onSuccess, error: onError })
    },
    apiSetupCheckGatekeeper: function (gkConfig, onSuccess, onError) {
      return this.authAxios({ url: 'setup/check/gatekeeper', method: 'POST', data: gkConfig, success: onSuccess, error: onError })
    },
    apiSetupCheckDatabase: function (dbConfig, onSuccess, onError) {
      return this.authAxios({ url: 'setup/check/database', method: 'POST', data: dbConfig, success: onSuccess, error: onError })
    }
  }
}
