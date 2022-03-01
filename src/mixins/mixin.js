import axios from 'axios'
import { mapGetters } from 'vuex'
import { EventBus } from '@/plugins/event-bus.js'

export default {
  computed: {
    ...mapGetters([
      'asyncJobCount',
      'asyncJobUuids',
      'baseUrl',
      'cookiesAccepted',
      'customChartColors',
      'darkMode',
      'entityTypeStats',
      'helpKey',
      'hiddenColumns',
      'locale',
      'mapLayer',
      'markedIds',
      'originalTarget',
      'recentIds',
      'serverSettings',
      'sidebarState',
      'tablePerPage',
      'token'
    ]),
    markedGermplasm: function () {
      return this.markedIds.germplasm
    },
    markedMarkers: function () {
      return this.markedIds.markers
    },
    markedLocations: function () {
      return this.markedIds.locations
    }
  },
  data: function () {
    return {
      germinateVersion: '4.2.1',
      MAX_JAVA_INTEGER: 2147483647,
      gatekeeperErrors: {
        'BAD_REQUEST_MISSING_FIELDS': 'gatekeeperErrorBadRequestMissingField',
        'CONFLICT_USER_ALREADY_HAS_ACCESS': 'gatekeeperErrorConflictUserAlreadyHasAccess',
        'CONFLICT_USER_ALREADY_REQUESTED_ACCESS': 'gatekeeperErrorConflictUserAlreadyRequestedAccess',
        'CONFLICT_USERNAME_EMAIL_ALREADY_IN_USE': 'gatekeeperErrorConflictUsernameEmailAlreadyInUse',
        'FORBIDDEN_ACCESS_TO_OTHER_USER': 'gatekeeperErrorForbiddenAccessToOtherUser',
        'FORBIDDEN_INSUFFICIENT_PERMISSIONS': 'gatekeeperErrorForbiddenInsufficientPermissions',
        'FORBIDDEN_INVALID_CREDENTIALS': 'gatekeeperErrorForbiddenInvalidCredentials',
        'NOT_FOUND_ACTIVATION_KEY': 'gatekeeperErrorNotFoundActivationKey',
        'NOT_FOUND_ACTIVATION_REQUEST': 'gatekeeperErrorNotFoundActivationRequest',
        'NOT_FOUND_ID': 'gatekeeperErrorNotFoundId',
        'NOT_FOUND_ID_OR_PAYLOAD': 'gatekeeperErrorNotFoundIdOrPayload',
        'NOT_FOUND_INSTITUTION': 'gatekeeperErrorNotFoundInstitution',
        'NOT_FOUND_PAYLOAD': 'gatekeeperErrorNotFoundPayload',
        'NOT_FOUND_TOKEN': 'gatekeeperErrorNotFoundToken',
        'NOT_FOUND_USER': 'gatekeeperErrorNotFoundUser',
        'UNAVAILABLE_EMAIL': 'gatekeeperErrorUnavailableEmail'
      }
    }
  },
  methods: {
    isTruncatedAfter: function (str, words) {
      if (!str) {
        return false
      }

      const parts = str.split(' ')

      return parts.length > words
    },
    objectArraysAreSame: function (x, y) {
      if ((x === null && y !== null) || (x !== null && y === null)) {
        return false
      } else if (x.length !== y.length) {
        return false
      } else {
        for (let one = 0; one < x.length; one++) {
          let hasMatch = false
          for (let two = 0; two < y.length; two++) {
            if (this.objectsAreSame(x[one], y[two])) {
              hasMatch = true
              break
            }
          }

          if (!hasMatch) {
            return false
          }
        }
        return true
      }
    },
    objectsAreSame: function (x, y) {
      var objectsAreSame = true
      for (var propertyName in x) {
        if (x[propertyName] !== y[propertyName]) {
          objectsAreSame = false
          break
        }
      }
      return objectsAreSame
    },
    /**
     * Toggles the dark mode on or off
     */
    toggleDarkMode: function () {
      if (this.darkMode === true) {
        this.$store.dispatch('ON_DARK_MODE_CHANGED', false)
      } else {
        this.$store.dispatch('ON_DARK_MODE_CHANGED', true)
      }
    },
    /**
     * Formats the given decimal number with the given number of decimal places
     * @param {Number} number The number to format
     * @param {Number} places The number of decimal spaces
     */
    toFixed: function (number, places) {
      return parseFloat(Math.round(number + 'e+' + places) + 'e-' + places)
    },
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
     * Gets the current window width
     */
    getWindowWidth: function () {
      return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
      )
    },
    /**
     * Checks whether the given column key in the given table is hidden or not
     * @param {String} tableName The name of the table
     * @param {String} columnKey The name of the column
     */
    isTableColumnHidden: function (tableName, columnKey) {
      if (this.hiddenColumns[tableName]) {
        return (this.hiddenColumns[tableName].indexOf(columnKey) !== -1) ? 'd-none' : ''
      } else {
        return ''
      }
    },
    /**
     * Formats the given value into a human-readable number (e.g. 1.000 -> 1K, 1.000.000 -> 1G)
     * @param {Number} value The value to format
     * @param {Number} decimals The decimal places
     * @param {Number} k The thousand value (e.g. 1000 or 1024)
     * @param {String} separator The separator between the number and the letter
     */
    getNumberWithSuffix: function (value, decimals = 2, k = 1000, separator = '') {
      if (value === undefined || value === null || value === 0) {
        return '0'
      }

      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']

      const i = Math.floor(Math.log(value) / Math.log(k))

      return parseFloat((value / Math.pow(k, i)).toFixed(dm)) + separator + sizes[i]
    },
    /**
     * Checks if the page with the given name is available in this configuration.
     * @param {String} name The name of the page to check (refer to router for names)
     */
    isPageAvailable: function (name) {
      if (this.serverSettings != null && this.serverSettings.hiddenPages != null) {
        return this.serverSettings.hiddenPages.indexOf(name) === -1
      } else {
        return true
      }
    },
    /**
     * Downloads the data file given in the parameter using the blow, filename and extension.
     * @param {Object} object Object of type `{ filename: '', blob: '', extension: '' }`
     */
    downloadBlob: function (object) {
      if (!object || !object.blob) {
        return
      }

      const filename = object.filename
      const extension = object.extension

      const url = window.URL.createObjectURL(object.blob)

      let downloadLink = document.createElement('a')
      downloadLink.href = url
      downloadLink.target = '_blank'
      downloadLink.rel = 'noopener noreferrer'
      if (filename && extension) {
        downloadLink.download = filename + '.' + extension
      }
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      this.$gtag.event('download', 'data', filename + '.' + extension)
    },
    /**
     * Downloads all SVGs contained in the given DOM element into a single SVG file
     * @param {Element} container The DOM element
     * @param {Boolean} isPlotly Is this a plotly.js chart?
     * @param {String} filename The file name to use for the downloaded file
     */
    downloadSvgsFromContainer: function (container, isPlotly, filename) {
      // get svg source.
      const serializer = new XMLSerializer()
      const svgs = isPlotly ? container.querySelectorAll('svg:not(.icon):not(:last-child)') : container.querySelectorAll('svg')
      let source = '<?xml version="1.0" standalone="no"?>\r\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'

      svgs.forEach(s => {
        // serializer.serializeToString(s)
        const children = s.children
        for (let i = 0; i < children.length; i++) {
          source += serializer.serializeToString(children[i]) + '\r\n'
        }
      })

      source += '</svg>'

      // convert svg source to URI data scheme.
      const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)

      let downloadLink = document.createElement('a')
      downloadLink.href = url
      downloadLink.download = filename + '.svg'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      this.$gtag.event('download', 'svg', filename + '.svg')
    },
    /**
     * Converts the given object into a safe URL string
     * @param {Object} params The object to convert
     */
    toUrlString: function (params) {
      return Object.keys(params).filter(function (key) {
        return params[key] !== undefined && params[key] !== null && params[key] !== ''
      }).map(function (key) {
        return params[key] ? (key + '=' + encodeURIComponent(params[key])) : ''
      }).join('&')
    },
    getImageUrl: function (name, params) {
      const paramString = this.toUrlString(params)

      let index = name.lastIndexOf('\\')
      if (index !== -1) {
        name = name.substring(index + 1)
      }
      index = name.lastIndexOf('/')
      if (index !== -1) {
        name = name.substring(index + 1)
      }

      return `${this.baseUrl}image/src/${encodeURI(name)}?${paramString}`
    },
    /**
     * Generates a v4 UUID
     */
    uuidv4: function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },
    /**
     * This is the default error method that gets called if no other error handler is defined for the error code that caused it.
     * @param {*} error The error response object
     */
    handleError: function (error) {
      EventBus.$emit('show-loading', false)
      let variant = 'danger'
      let title = this.$t('genericError')
      let message = error.statusText

      if (error.data && error.data.reasonPhrase && this.gatekeeperErrors[error.data.reasonPhrase]) {
        message = this.$t(this.gatekeeperErrors[error.data.reasonPhrase])
      } else {
        const authMode = this.serverSettings.authMode
        switch (error.status) {
          case 400:
            message = this.$t('httpErrorFourOO')
            break
          case 401:
            message = this.$t('httpErrorFourOOne')
            this.$store.dispatch('ON_TOKEN_CHANGED', null)
            if (authMode === 'FULL') {
              this.$router.push({ name: 'login' })
            } else if (authMode === 'SELECTIVE') {
              EventBus.$emit('on-show-login-form')
            }
            return
          case 403: {
            message = this.$t('httpErrorFourOThree')
            this.$store.dispatch('ON_TOKEN_CHANGED', null)
            if (authMode === 'FULL') {
              this.$router.push({ name: 'login' })
            } else if (authMode === 'SELECTIVE') {
              EventBus.$emit('on-show-login-form')
            }
            return
          }
          case 404:
            message = this.$t('httpErrorFourOFour')
            break
          case 405:
            message = this.$t('httpErrorFourOFour')
            break
          case 408:
            message = this.$t('httpErrorFourOEight')
            break
          case 409:
            message = this.$t('httpErrorFourONine')
            break
          case 410:
            message = this.$t('httpErrorFourTen')
            break
          case 500:
            message = this.$t('httpErrorFiveOO')
            break
          case 501:
            message = this.$t('httpErrorFiveOOne')
            break
          case 503:
            message = this.$t('httpErrorFiveOThree')
            break
        }
      }

      this.$gtag.exception(error.status + ' ' + message)

      this.$bvToast.toast(message, {
        title: title,
        variant: variant,
        autoHideDelay: 5000,
        appendToast: true
      })
    },
    /**
     * Sends a FORM to the given URL using authentication
     * @param {Object} param0 `{ url: String, formData: Object, success: Callback, error: { codes: [], callback: Callback } }`
     */
    authForm({ url = null, formData, success = null, error = { codes: [], callback: this.handleError } }) {
      const promise = axios.post(url, formData, {
        crossDomain: true,
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + this.getToken()
        }
      })

      promise.then(result => {
        const t = this.$store.getters.token

        // Check if the token is still valid. Renew it if so.
        if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
          t.createdOn = new Date().getTime()
          this.$store.dispatch('ON_TOKEN_CHANGED', t)
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
              this.$store.dispatch('ON_TOKEN_CHANGED', null)
              const authMode = this.$store.getters.serverSettings.authMode
              if (authMode === 'FULL') {
                this.$router.push({ name: 'login' })
              } else if (authMode === 'SELECTIVE') {
                EventBus.$emit('on-show-login-form')
              }
            } else if (process.env.NODE_ENV === 'development') {
              console.error(err)
            }
          } else if (error && error.callback) {
            if (error.codes.length === 0 || error.codes.includes(err.response.status)) {
              error.callback(err.response)
            } else {
              this.handleError(err.response)
            }
          } else if (process.env.NODE_ENV === 'development') {
            console.error(err)
          }
        } else if (err.request) {
          // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
          if (err.request.textStatus === 'timeout') {
            this.$bvToast.toast('Request to the server timed out.', {
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
    },
    /**
     * Sends an Axios request to the server using authentication
     * @param {Object} param0 `{ url: String, method: String, data: Object, formData: Object, dataType: String, contentType: String, success: Callback, error: { codes: [], callback: Callback } }`
     */
    authAxios({ url = null, method = 'GET', data = null, formData = null, dataType = 'json', contentType = 'application/json; charset=utf-8', success = null, error = { codes: [], callback: this.handleError } }) {
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
          'Authorization': 'Bearer ' + this.getToken()
        }
      })

      promise.then(result => {
        const t = this.$store.getters.token

        // Check if the token is still valid. Renew it if so.
        if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
          t.createdOn = new Date().getTime()
          this.$store.dispatch('ON_TOKEN_CHANGED', t)
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
              this.$store.dispatch('ON_TOKEN_CHANGED', null)
              const authMode = this.$store.getters.serverSettings.authMode
              if (authMode === 'FULL') {
                this.$router.push({ name: 'login' })
              } else if (authMode === 'SELECTIVE') {
                EventBus.$emit('on-show-login-form')
              }
            } else if (process.env.NODE_ENV === 'development') {
              console.error(err)
            }
          } else if (error && error.callback) {
            if (error.codes.length === 0 || error.codes.includes(err.response.status)) {
              return error.callback(err.response)
            } else {
              return this.handleError(err.response)
            }
          } else if (process.env.NODE_ENV === 'development') {
            console.error(err)
          }
        } else if (err.request) {
          // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
          if (err.request.textStatus === 'timeout') {
            this.$bvToast.toast('Request to the server timed out.', {
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
    },
    /**
     * Returns the current authentication token
     */
    getToken() {
      let t = this.$store.getters.token

      // Check if the token is still valid
      if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) > t.lifetime)) {
        t = null
        this.$store.dispatch('ON_TOKEN_CHANGED', t)
      }

      return t ? t.token : null
    }
  }
}
