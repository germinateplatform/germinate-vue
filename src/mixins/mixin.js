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
      'entityTypeStats',
      'helpKey',
      'hiddenColumns',
      'locale',
      'markedIds',
      'originalTarget',
      'recentIds',
      'serverSettings',
      'sidebarState',
      'tableFiltering',
      'tablePerPage',
      'token'
    ])
  },
  data: function () {
    return {
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
    getWindowWidth: function () {
      return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
      )
    },
    isTableColumnHidden: function (tableName, columnKey) {
      if (this.hiddenColumns[tableName]) {
        return (this.hiddenColumns[tableName].indexOf(columnKey) !== -1) ? 'd-none' : ''
      } else {
        return ''
      }
    },
    getNumberWithSuffix: function (value, decimals = 2, k = 1000, separator = '') {
      if (value === undefined || value === null || value === 0) {
        return '0'
      }

      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']

      const i = Math.floor(Math.log(value) / Math.log(k))

      return parseFloat((value / Math.pow(k, i)).toFixed(dm)) + separator + sizes[i]
    },
    isPageAvailable: function (name) {
      if (this.serverSettings != null && this.serverSettings.hiddenPages != null) {
        return this.serverSettings.hiddenPages.indexOf(name) === -1
      } else {
        return true
      }
    },
    downloadBlob: function (object) {
      if (!object || !object.blob) {
        return
      }

      var extension = object.extension

      var url = window.URL.createObjectURL(object.blob)

      var downloadLink = document.createElement('a')
      downloadLink.href = url
      if (object.filename && extension) {
        downloadLink.download = object.filename + '.' + extension
      }
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      this.$ga.event('download', 'data', object.filename + '.' + extension)
    },
    downloadSvgsFromContainer: function (container, isPlotly, filename) {
      // get svg source.
      var serializer = new XMLSerializer()
      var svgs = isPlotly ? container.querySelectorAll('svg:not(.icon):not(:last-child)') : container.querySelectorAll('svg')
      var source = '<?xml version="1.0" standalone="no"?>\r\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'

      svgs.forEach(s => {
        // serializer.serializeToString(s)
        var children = s.children
        for (var i = 0; i < children.length; i++) {
          source += serializer.serializeToString(children[i]) + '\r\n'
        }
      })

      source += '</svg>'

      // convert svg source to URI data scheme.
      var url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)

      var downloadLink = document.createElement('a')
      downloadLink.href = url
      downloadLink.download = filename + '.svg'
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      this.$ga.event('download', 'svg', filename + '.svg')
    },
    toUrlString: function (params) {
      return Object.keys(params).filter(function (key) {
        return params[key] !== undefined && params[key] !== null
      }).map(function (key) {
        return params[key] ? (key + '=' + encodeURIComponent(params[key])) : ''
      }).join('&')
    },
    uuidv4: function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0
        var v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },
    /**
     * This is the default error method that gets called if no other error handler is defined for the error code that caused it.
     * @param {*} error The error response object
     */
    handleError: function (error) {
      EventBus.$emit('show-loading', false)
      var variant = 'danger'
      var title = this.$t('genericError')
      var message = error.statusText

      if (error.data && error.data.reasonPhrase && this.gatekeeperErrors[error.data.reasonPhrase]) {
        message = this.$t(this.gatekeeperErrors[error.data.reasonPhrase])
      } else {
        switch (error.status) {
          case 400:
            message = this.$t('httpErrorFourOO')
            break
          case 401:
            message = this.$t('httpErrorFourOOne')
            break
          case 403:
            message = this.$t('httpErrorFourOThree')
            this.$store.dispatch('ON_TOKEN_CHANGED', null)
            var authMode = this.serverSettings.authMode
            if (authMode === 'FULL') {
              this.$router.push({ name: 'login' })
            } else if (authMode === 'SELECTIVE') {
              EventBus.$emit('on-show-login-form')
            }
            return
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

      this.$ga.exception(error.status + ' ' + message)

      this.$bvToast.toast(message, {
        title: title,
        variant: variant,
        autoHideDelay: 5000,
        appendToast: true
      })
    },
    authForm ({ url = null, formData, success = null, error = { codes: [], callback: this.handleError } }) {
      var vm = this

      const promise = axios.post(url, formData, {
        crossDomain: true,
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'Bearer ' + this.getToken()
        }
      })

      promise.then(function (result) {
        var t = vm.$store.getters.token

        // Check if the token is still valid. Renew it if so.
        if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
          t.createdOn = new Date().getTime()
          vm.$store.dispatch('ON_TOKEN_CHANGED', t)
        }

        if (success) {
          success(result.data)
        }
      })

      promise.catch(function (err) {
        if (err.response) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          // Log the user out if the result is forbidden and no error method has been provided
          // Otherwise, we assume that the calling method takes care of the error
          if (!error) {
            if (err.response.status === 403) {
              vm.$store.dispatch('ON_TOKEN_CHANGED', null)
              var authMode = vm.$store.getters.serverSettings.authMode
              if (authMode === 'FULL') {
                vm.$router.push({ name: 'login' })
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
              vm.handleError(err.response)
            }
          } else if (process.env.NODE_ENV === 'development') {
            console.error(err)
          }
        } else if (err.request) {
          // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
          if (err.request.textStatus === 'timeout') {
            vm.$bvToast.toast('Request to the server timed out.', {
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
    authAjax ({ url = null, method = 'GET', data = null, formData = null, dataType = 'json', contentType = 'application/json; charset=utf-8', success = null, error = { codes: [], callback: this.handleError } }) {
      var vm = this
      var requestData = null
      var requestParams = null

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

      promise.then(function (result) {
        var t = vm.$store.getters.token

        // Check if the token is still valid. Renew it if so.
        if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) <= t.lifetime)) {
          t.createdOn = new Date().getTime()
          vm.$store.dispatch('ON_TOKEN_CHANGED', t)
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

      promise.catch(function (err) {
        if (err.response) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          // Log the user out if the result is forbidden and no error method has been provided
          // Otherwise, we assume that the calling method takes care of the error
          if (!error) {
            if (err.response.status === 403) {
              vm.$store.dispatch('ON_TOKEN_CHANGED', null)
              var authMode = vm.$store.getters.serverSettings.authMode
              if (authMode === 'FULL') {
                vm.$router.push({ name: 'login' })
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
              return vm.handleError(err.response)
            }
          } else if (process.env.NODE_ENV === 'development') {
            console.error(err)
          }
        } else if (err.request) {
          // The request was made but no response was received `err.request` is an instance of XMLHttpRequest in the browser
          if (err.request.textStatus === 'timeout') {
            vm.$bvToast.toast('Request to the server timed out.', {
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
    getToken () {
      var t = this.$store.getters.token

      // Check if the token is still valid
      if (t && ((new Date().getTime() - new Date(t.createdOn).getTime()) > t.lifetime)) {
        t = null
        this.$store.dispatch('ON_TOKEN_CHANGED', t)
      }

      return t ? t.token : null
    }
  }
}
