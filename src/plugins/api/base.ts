import { coreStore } from '@/stores/app'
import router from '@/router'
import { i18n } from '@/plugins/vuetify.ts'
import { Pages } from '@/plugins/pages'
import axios, { type AxiosResponse, type ResponseType } from 'axios'

import emitter from 'tiny-emitter/instance'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'

const MAX_JAVA_INTEGER = 2_147_483_647

const gatekeeperErrors: { [key: string]: string } = {
  BAD_REQUEST_MISSING_FIELDS: 'gatekeeperErrorBadRequestMissingField',
  CONFLICT_USER_ALREADY_HAS_ACCESS: 'gatekeeperErrorConflictUserAlreadyHasAccess',
  CONFLICT_USER_ALREADY_REQUESTED_ACCESS: 'gatekeeperErrorConflictUserAlreadyRequestedAccess',
  CONFLICT_USERNAME_EMAIL_ALREADY_IN_USE: 'gatekeeperErrorConflictUsernameEmailAlreadyInUse',
  FORBIDDEN_ACCESS_TO_OTHER_USER: 'gatekeeperErrorForbiddenAccessToOtherUser',
  FORBIDDEN_INSUFFICIENT_PERMISSIONS: 'gatekeeperErrorForbiddenInsufficientPermissions',
  FORBIDDEN_INVALID_CREDENTIALS: 'gatekeeperErrorForbiddenInvalidCredentials',
  NOT_FOUND_ACTIVATION_KEY: 'gatekeeperErrorNotFoundActivationKey',
  NOT_FOUND_ACTIVATION_REQUEST: 'gatekeeperErrorNotFoundActivationRequest',
  NOT_FOUND_ID: 'gatekeeperErrorNotFoundId',
  NOT_FOUND_ID_OR_PAYLOAD: 'gatekeeperErrorNotFoundIdOrPayload',
  NOT_FOUND_INSTITUTION: 'gatekeeperErrorNotFoundInstitution',
  NOT_FOUND_PAYLOAD: 'gatekeeperErrorNotFoundPayload',
  NOT_FOUND_TOKEN: 'gatekeeperErrorNotFoundToken',
  NOT_FOUND_USER: 'gatekeeperErrorNotFoundUser',
  UNAVAILABLE_EMAIL: 'gatekeeperErrorUnavailableEmail',
}

/**
 * Returns the current authentication token
 */
const getToken = () => {
  const store = coreStore()
  let t = store.storeToken

  // Check if the token is still valid
  if (t && ((Date.now() - new Date(t.createdOn).getTime()) > t.lifetime)) {
    t = undefined
    store.setToken(t)
  }

  return t ? t.token : null
}

const handleError = (error: AxiosResponse) => {
  const store = coreStore()
  emitter.emit('show-loading', false)
  const variant = 'danger'
  const title = i18n.global.t('genericError')
  let message = error.statusText

  if (error.data && error.data.reasonPhrase && gatekeeperErrors[error.data.reasonPhrase]) {
    message = i18n.global.t(gatekeeperErrors[error.data.reasonPhrase])
  } else {
    const authMode = store.storeServerSettings?.authMode
    switch (error.status) {
      case 400:
        message = i18n.global.t('httpErrorFourOO')
        break
      case 401:
        message = i18n.global.t('httpErrorFourOOne')
        store.setToken(undefined)
        if (authMode === 'FULL' || authMode === 'SELECTIVE') {
          router.push(Pages.login.path)
        }
        return
      case 403: {
        message = i18n.global.t('httpErrorFourOThree')
        store.setToken(undefined)
        if (authMode === 'FULL' || authMode === 'SELECTIVE') {
          router.push(Pages.login.path)
        }
        return
      }
      case 404:
        message = i18n.global.t('httpErrorFourOFour')
        break
      case 405:
        message = i18n.global.t('httpErrorFourOFour')
        break
      case 408:
        message = i18n.global.t('httpErrorFourOEight')
        break
      case 409:
        message = i18n.global.t('httpErrorFourONine')
        break
      case 410:
        message = i18n.global.t('httpErrorFourTen')
        break
      case 500:
        message = i18n.global.t('httpErrorFiveOO')
        break
      case 501:
        message = i18n.global.t('httpErrorFiveOOne')
        break
      case 503:
        message = i18n.global.t('httpErrorFiveOThree')
        break
    }
  }

  emitter.emit('toast', {
    message,
    title,
    variant,
    autoHideDelay: 5000,
    appendToast: true,
  })
}

export interface ErrorHandler {
  codes: number[]
  callback: Function
}

/**
 * Sends a FORM to the given URL using authentication
 * @param {Object} param0 `{ url: String, formData: Object, method: String, success: Callback, error: { codes: [], callback: Callback } }`
 */
const authForm = <T>({ url = undefined, formData, method = 'post', success = undefined, error = { codes: [], callback: handleError } }: { url?: string, formData?: any | undefined, method?: string, success?: GerminateResponseHandler<T>, error?: ErrorHandler }) => {
  const store = coreStore()
  const promise = axios({
    baseURL: store.storeBaseUrl,
    url,
    method: method || 'post',
    data: formData,
    // crossDomain: true,
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getToken()}`,
    },
  })

  promise.then(result => {
    const t = store.storeToken

    // Check if the token is still valid. Renew it if so.
    if (t && ((Date.now() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
      t.createdOn = Date.now()
      store.setToken(t)
    }

    if (success) {
      success(result.data)
    }
  })

  promise.catch(err => {
    if (err.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      // Log the user out if the result is forbidden and no error method has been provided
      // Otherwise, we assume that the calling method takes care of the error
      if (!error) {
        if (err.response.status === 403) {
          store.setToken(undefined)
          const authMode = store.storeServerSettings?.authMode
          if (authMode === 'FULL' || authMode === 'SELECTIVE') {
            router.push(Pages.login.path)
          }
        } else if (process.env.NODE_ENV === 'development') {
          console.error(err)
        }
      } else if (error && error.callback) {
        if (error.codes.length === 0 || error.codes.includes(err.response.status)) {
          error.callback(err.response)
        } else {
          handleError(err.response)
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    } else if (err.request) {
      // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
      if (err.request.textStatus === 'timeout') {
        emitter.emit('toast', {
          message: 'Request to the server timed out.',
          title: 'Error',
          variant: 'danger',
          autoHideDelay: 5000,
          appendToast: true,
        })
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    }
  })

  return promise
}

/**
 * Sends an Axios request to the server using authentication
 * @param {Object} param0 `{ url: String, method: String, data: Object, formData: Object, dataType: String, contentType: String, success: Callback, error: { codes: [], callback: Callback } }`
 */
const authAxios = <T>({ url = undefined, method = 'GET', data = null, dataType = 'json', contentType = 'application/json; charset=utf-8', success = undefined, error = { codes: [], callback: handleError } }: { url?: string, data?: any, dataType?: ResponseType, contentType?: string, method?: string, success?: GerminateResponseHandler<T>, error?: ErrorHandler }) => {
  const store = coreStore()

  let requestData = null
  let requestParams = null

  // Stringify the data object for non-GET requests
  if (data !== null || data !== undefined) {
    if (method === 'GET') {
      requestParams = data
    } else {
      requestData = data
    }
  }

  const promise = axios({
    baseURL: store.storeBaseUrl,
    url,
    method,
    data: requestData,
    params: requestParams,
    // crossDomain: true,
    responseType: dataType,
    withCredentials: true,
    headers: {
      'Content-Type': contentType,
      Authorization: `Bearer ${getToken()}`,
    },
  })

  promise.then(result => {
    const t = store.storeToken

    // Check if the token is still valid. Renew it if so.
    if (t && ((Date.now() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
      t.createdOn = Date.now()
      store.setToken(t)
    }

    if (success) {
      if (dataType === 'blob' && result.headers && result.headers['content-disposition']) {
        const filename = result.headers['content-disposition']
          .split(';')
          .map((p: string) => p.trim())
          .filter((p: string) => p.indexOf('filename') === 0)
          .map((p: string) => p.replace('filename=', ''))

        if (filename && filename.length > 0) {
          result.data.filename = filename[0]
        }
      }

      success(result.data)
    }
  })

  promise.catch(err => {
    if (err.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      // Log the user out if the result is forbidden and no error method has been provided
      // Otherwise, we assume that the calling method takes care of the error
      if (!error) {
        if (err.response.status === 403) {
          store.setToken(undefined)
          const authMode = store.storeServerSettings?.authMode
          if (authMode === 'FULL' || authMode === 'SELECTIVE') {
            router.push(Pages.login.path)
          }
        } else if (process.env.NODE_ENV === 'development') {
          console.error(err)
        }
      } else if (error && error.callback) {
        if (error.codes.length === 0 || error.codes.includes(err.response.status)) {
          return error.callback(err.response)
        } else {
          return handleError(err.response)
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    } else if (err.request) {
      // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
      if (err.request.statusText === 'timeout') {
        emitter.emit('toast', {
          message: 'Request to the server timed out.',
          title: 'Error',
          variant: 'danger',
          autoHideDelay: 5000,
          appendToast: true,
        })
      } else if (error.codes.length === 0) {
        return error.callback(err)
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      if (process.env.NODE_ENV === 'development') {
        console.error(err)
      }
    }

    throw err
  })

  return promise
}

export {
  MAX_JAVA_INTEGER,
  gatekeeperErrors,
  getToken,
  handleError,
  authAxios,
  authForm,
}
