import { authAxios } from '@/mixins/api/base'

/**
 * Checks whether the given user type is at least the given minimum user type
 * @param {String} userType The user type to check
 * @param {String} atLeast The user type to check against
 */
const userIsAtLeast = (userType, atLeast) => {
  switch (atLeast) {
    case 'Administrator':
      return userType === 'Administrator'
    case 'Data Curator':
      return userType === 'Administrator' || userType === 'Data Curator'
    case 'Regular User':
      return userType === 'Administrator' || userType === 'Data Curator' || userType === 'Regular User'
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
  apiSetupStore
}
