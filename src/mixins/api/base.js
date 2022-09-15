import axios from 'axios'
import store from '@/store'
import router from '@/router'
import { i18n } from '@/plugins/i18n.js'
import { exception } from 'vue-gtag'

const emitter = require('tiny-emitter/instance')

const MAX_JAVA_INTEGER = 2147483647

const gatekeeperErrors = {
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
  UNAVAILABLE_EMAIL: 'gatekeeperErrorUnavailableEmail'
}

/**
 * Returns the current authentication token
 */
const getToken = () => {
  let t = store.getters.storeToken

  // Check if the token is still valid
  if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) > t.lifetime)) {
    t = null
    store.dispatch('setToken', t)
  }

  return t ? t.token : null
}

const handleError = (error) => {
  emitter.emit('show-loading', false)
  const variant = 'danger'
  const title = i18n.t('genericError')
  let message = error.statusText

  if (error.data && error.data.reasonPhrase && gatekeeperErrors[error.data.reasonPhrase]) {
    message = i18n.t(gatekeeperErrors[error.data.reasonPhrase])
  } else {
    const authMode = store.getters.storeServerSettings.authMode
    switch (error.status) {
      case 400:
        message = i18n.t('httpErrorFourOO')
        break
      case 401:
        message = i18n.t('httpErrorFourOOne')
        store.dispatch('setToken', null)
        if (authMode === 'FULL') {
          router.push({ name: 'login' })
        } else if (authMode === 'SELECTIVE') {
          router.push({ name: 'login-selective' })
        }
        return
      case 403: {
        message = i18n.t('httpErrorFourOThree')
        store.dispatch('setToken', null)
        if (authMode === 'FULL') {
          router.push({ name: 'login' })
        } else if (authMode === 'SELECTIVE') {
          router.push({ name: 'login-selective' })
        }
        return
      }
      case 404:
        message = i18n.t('httpErrorFourOFour')
        break
      case 405:
        message = i18n.t('httpErrorFourOFour')
        break
      case 408:
        message = i18n.t('httpErrorFourOEight')
        break
      case 409:
        message = i18n.t('httpErrorFourONine')
        break
      case 410:
        message = i18n.t('httpErrorFourTen')
        break
      case 500:
        message = i18n.t('httpErrorFiveOO')
        break
      case 501:
        message = i18n.t('httpErrorFiveOOne')
        break
      case 503:
        message = i18n.t('httpErrorFiveOThree')
        break
    }
  }

  exception(error.status + ' ' + message)

  emitter.emit('toast', {
    message: message,
    title: title,
    variant: variant,
    autoHideDelay: 5000,
    appendToast: true
  })
}

/**
 * Sends a FORM to the given URL using authentication
 * @param {Object} param0 `{ url: String, formData: Object, success: Callback, error: { codes: [], callback: Callback } }`
 */
const authForm = ({ url = null, formData, success = null, error = { codes: [], callback: handleError } }) => {
  const promise = axios.post(url, formData, {
    crossDomain: true,
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getToken()}`
    }
  })

  promise.then(result => {
    const t = store.getters.storeToken

    // Check if the token is still valid. Renew it if so.
    if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
      t.createdOn = new Date().getTime()
      store.dispatch('setToken', t)
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
          store.dispatch('setToken', null)
          const authMode = store.getters.storeServerSettings.authMode
          if (authMode === 'FULL') {
            router.push({ name: 'login' })
          } else if (authMode === 'SELECTIVE') {
            router.push({ name: 'login-selective' })
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
          appendToast: true
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
const authAxios = ({ url = null, method = 'GET', data = null, formData = null, dataType = 'json', contentType = 'application/json; charset=utf-8', success = null, error = { codes: [], callback: handleError } }) => {
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
    url: url,
    method: method,
    data: requestData,
    formData: formData,
    params: requestParams,
    crossDomain: true,
    responseType: dataType,
    withCredentials: true,
    headers: {
      'Content-Type': contentType,
      Authorization: `Bearer ${getToken()}`
    }
  })

  promise.then(result => {
    const t = store.getters.storeToken

    // Check if the token is still valid. Renew it if so.
    if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
      t.createdOn = new Date().getTime()
      store.dispatch('setToken', t)
    }

    if (success) {
      if (dataType === 'blob' && result.headers && result.headers['content-disposition']) {
        const filename = result.headers['content-disposition']
          .split(';')
          .map(p => p.trim())
          .filter(p => p.indexOf('filename') === 0)
          .map(p => p.replace('filename=', ''))

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
          store.dispatch('setToken', null)
          const authMode = store.getters.storeServerSettings.authMode
          if (authMode === 'FULL') {
            router.push({ name: 'login' })
          } else if (authMode === 'SELECTIVE') {
            router.push({ name: 'login-selective' })
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
      if (err.request.textStatus === 'timeout') {
        emitter.emit('toast', {
          message: 'Request to the server timed out.',
          title: 'Error',
          variant: 'danger',
          autoHideDelay: 5000,
          appendToast: true
        })
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
  authForm
}
