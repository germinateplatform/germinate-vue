export default {
  methods: {
    getDateTimeString: function (date) {
      if (!date) {
        date = new Date()
      }

      return `${date.getFullYear()}-${this.padTo2Digits(date.getMonth() + 1)}-${this.padTo2Digits(date.getDate())}-${this.padTo2Digits(date.getHours())}-${this.padTo2Digits(date.getMinutes())}-${this.padTo2Digits(date.getSeconds())}`
    },
    padTo2Digits: function (num) {
      return num.toString().padStart(2, '0')
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
    isTruncatedAfter: function (str, words) {
      if (!str) {
        return false
      }

      const parts = str.split(' ')

      return parts.length > words
    },
    truncateAfterWords: function (str, words) {
      if (!str) {
        return str
      }

      const parts = str.split(' ')

      if (parts.length > words) {
        return parts.splice(0, words).join(' ') + '...'
      } else {
        return str
      }
    },
    /**
     * Formats the given decimal number with the given number of decimal places
     * @param {Number} number The number to format
     * @param {Number} places The number of decimal spaces
     */
    toFixed: function (number, places) {
      return parseFloat(Math.round(number + 'e+' + places) + 'e-' + places)
    }
  }
}
