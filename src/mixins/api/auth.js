import { authAxios } from '@/mixins/api/base'

const USER_TYPE_ADMINISTRATOR = 'Administrator'
const USER_TYPE_DATA_CURATOR = 'Data Curator'
const USER_TYPE_REGULAR_USER = 'Regular User'

/**
 * Checks whether the given user type is at least the given minimum user type
 * @param {String} userType The user type to check
 * @param {String} atLeast The user type to check against
 */
const userIsAtLeast = (userType, atLeast) => {
  switch (atLeast) {
    case USER_TYPE_ADMINISTRATOR:
      return userType === USER_TYPE_ADMINISTRATOR
    case USER_TYPE_DATA_CURATOR:
      return userType === USER_TYPE_ADMINISTRATOR || userType === USER_TYPE_DATA_CURATOR
    case USER_TYPE_REGULAR_USER:
      return userType === USER_TYPE_ADMINISTRATOR || userType === USER_TYPE_DATA_CURATOR || userType === USER_TYPE_REGULAR_USER
  }

  return false
}

/**
 * Deletes the current json token
 *
 * @param {Object} user The user object containing the username and the token as the password
 * @param {function=} onSuccess Called on success
 * @param {function=} onError Called on failure
 * @returns A Promise
 */
const apiDeleteToken = (user, onSuccess, onError) => authAxios({ url: 'token', method: 'DELETE', data: user, success: onSuccess, error: onError })

/**
 * Requests a token given the user details
 *
 * @param {Object} user The user object containing the username and password
 * @param {function=} onSuccess Called on success
 * @param {function=} onError Called on failure
 * @returns A Promise
 */
const apiPostToken = (user, onSuccess, onError) => authAxios({ url: 'token', method: 'POST', data: user, success: onSuccess, error: onError })

const apiSetupCheckGatekeeper = (gkConfig, onSuccess, onError) => authAxios({ url: 'setup/check/gatekeeper', method: 'POST', data: gkConfig, success: onSuccess, error: onError })

const apiSetupCheckDatabase = (dbConfig, onSuccess, onError) => authAxios({ url: 'setup/check/database', method: 'POST', data: dbConfig, success: onSuccess, error: onError })

const apiSetupStore = (data, onSuccess, onError) => authAxios({ url: 'setup/store', method: 'POST', data: data, success: onSuccess, error: onError })

export {
  userIsAtLeast,
  apiDeleteToken,
  apiPostToken,
  apiSetupCheckGatekeeper,
  apiSetupCheckDatabase,
  apiSetupStore,
  USER_TYPE_ADMINISTRATOR,
  USER_TYPE_DATA_CURATOR,
  USER_TYPE_REGULAR_USER
}
