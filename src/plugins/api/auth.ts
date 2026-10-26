import { authAxios } from '@/plugins/api/base'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'
import type { ErrorHandler } from '@/plugins/api/base'
import type { DatabaseConfig, GatekeeperConfig, LoginDetails, ServerSetupConfig, Token } from '@/plugins/types/germinate'

const USER_TYPE_ADMINISTRATOR = 'Administrator'
const USER_TYPE_DATA_CURATOR = 'Data Curator'
const USER_TYPE_REGULAR_USER = 'Regular User'

/**
 * Checks whether the given user type is at least the given minimum user type
 * @param {String} userType The user type to check
 * @param {String} atLeast The user type to check against
 */
export function userIsAtLeast (userType: string, atLeast: string) {
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
export function apiDeleteToken (user: LoginDetails, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: 'token', method: 'DELETE', data: user, success: onSuccess, error: onError })
}

/**
 * Requests a token given the user details
 *
 * @param {Object} user The user object containing the username and password
 * @param {function=} onSuccess Called on success
 * @param {function=} onError Called on failure
 * @returns A Promise
 */
export function apiPostToken (user: LoginDetails, onSuccess?: GerminateResponseHandler<Token>, onError?: ErrorHandler) {
  return authAxios({ url: 'token', method: 'POST', data: user, success: onSuccess, error: onError })
}

export function apiSetupCheckGatekeeper (gkConfig: GatekeeperConfig, onSuccess?: GerminateResponseHandler<void>, onError?: ErrorHandler) {
  return authAxios({ url: 'setup/check/gatekeeper', method: 'POST', data: gkConfig, success: onSuccess, error: onError })
}

export function apiSetupCheckDatabase (dbConfig: DatabaseConfig, onSuccess?: GerminateResponseHandler<void>, onError?: ErrorHandler) {
  return authAxios({ url: 'setup/check/database', method: 'POST', data: dbConfig, success: onSuccess, error: onError })
}

export function apiSetupStore (data: ServerSetupConfig, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: 'setup/store', method: 'POST', data, success: onSuccess, error: onError })
}

export {
  USER_TYPE_ADMINISTRATOR,
  USER_TYPE_DATA_CURATOR,
  USER_TYPE_REGULAR_USER,
}
