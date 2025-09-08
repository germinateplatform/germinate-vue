import { authAxios } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '../types/GerminateResponseHandler'
import type { ErrorHandler } from './base'
import type { DatabaseConfig, GatekeeperConfig, LoginDetails, ServerSetupConfig } from '../types/germinate'

const USER_TYPE_ADMINISTRATOR = 'Administrator'
const USER_TYPE_DATA_CURATOR = 'Data Curator'
const USER_TYPE_REGULAR_USER = 'Regular User'

/**
 * Checks whether the given user type is at least the given minimum user type
 * @param {String} userType The user type to check
 * @param {String} atLeast The user type to check against
 */
const userIsAtLeast = (userType: string, atLeast: string) => {
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
const apiDeleteToken = <T>(user: LoginDetails, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'token', method: 'DELETE', data: user, success: onSuccess, error: onError })

/**
 * Requests a token given the user details
 *
 * @param {Object} user The user object containing the username and password
 * @param {function=} onSuccess Called on success
 * @param {function=} onError Called on failure
 * @returns A Promise
 */
const apiPostToken = <T>(user: LoginDetails, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'token', method: 'POST', data: user, success: onSuccess, error: onError })

const apiSetupCheckGatekeeper = <T>(gkConfig: GatekeeperConfig, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'setup/check/gatekeeper', method: 'POST', data: gkConfig, success: onSuccess, error: onError })

const apiSetupCheckDatabase = <T>(dbConfig: DatabaseConfig, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'setup/check/database', method: 'POST', data: dbConfig, success: onSuccess, error: onError })

const apiSetupStore = <T>(data: ServerSetupConfig, onSuccess?: GerminateResponseHandler<T>, onError?: ErrorHandler) => authAxios({ url: 'setup/store', method: 'POST', data: data, success: onSuccess, error: onError })

export {
  userIsAtLeast,
  apiDeleteToken,
  apiPostToken,
  apiSetupCheckGatekeeper,
  apiSetupCheckDatabase,
  apiSetupStore,
  USER_TYPE_ADMINISTRATOR,
  USER_TYPE_DATA_CURATOR,
  USER_TYPE_REGULAR_USER,
}
