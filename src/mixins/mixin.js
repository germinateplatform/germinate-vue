import axios from 'axios'

export default {
  methods: {
    debounceFunction (func, delay) {
      let inDebounce
      return function () {
        const context = this
        const args = arguments
        clearTimeout(inDebounce)
        inDebounce = setTimeout(() => func.apply(context, args), delay)
      }
    },
    getPaginationTexts () {
      return {
        count: this.$t('paginationCount'),
        first: this.$t('paginationFirst'),
        last: this.$t('paginationLast'),
        filter: this.$t('paginationFilter'),
        filterPlaceholder: this.$t('paginationFilterPlaceholder'),
        limit: this.$t('paginationLimit'),
        page: this.$t('paginationPage'),
        noResults: this.$t('paginationNoResult'),
        filterBy: this.$t('paginationFilterBy'),
        loading: this.$t('paginationLoading'),
        defaultOption: this.$t('paginationDefaultOption'),
        columns: this.$t('paginationColumns')
      }
    },
    /**
     * This is the default error method that gets called if no other error handler is defined for the error code that caused it.
     * @param {*} error The error response object
     */
    handleError (error) {
      var variant = 'danger'
      var title = this.$t('genericError')
      var message = error.statusText
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
          this.$router.push('/g8/login')
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

      this.$bvToast.toast(message, {
        title: title,
        variant: variant,
        autoHideDelay: 5000,
        appendToast: true
      })
    },
    authAjax ({ url = null, method = 'GET', data = null, dataType = 'json', success = null, error = null }) {
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
        params: requestParams,
        crossDomain: true,
        responseType: dataType,
        withCredentials: true,
        headers: {
          'content-type': 'application/json; charset=utf-8',
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
              vm.$router.push('/g8/login')
            } else if (process.env.NODE_ENV === 'development') {
              console.error(err)
            }
          } else {
            error(err)
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
    unauthAjax ({ url = null, method = 'GET', data = null, dataType = 'json', success = null, error = { codes: [], callback: this.handleError } }) {
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

      return axios({
        url: url,
        method: method,
        data: requestData,
        params: requestParams,
        crossDomain: true,
        responseType: dataType,
        headers: {
          'content-type': 'application/json; charset=utf-8'
        }
      })
        .then(function (result) {
          if (success) {
            success(result.data)
          }
        })
        .catch(function (err) {
          if (err.response) {
            // The request was made and the server responded with a status code that falls out of the range of 2xx
            if (error && error.callback) {
              if (error.codes.length === 0 || error.codes.includes(err.status)) {
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
