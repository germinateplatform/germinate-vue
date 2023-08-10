import store from '@/store'

const padTo2Digits = (num) => num.toString().padStart(2, '0')

const getDateTimeString = (date) => {
  if (!date) {
    date = new Date()
  }

  return `${date.getFullYear()}-${padTo2Digits(date.getMonth() + 1)}-${padTo2Digits(date.getDate())}-${padTo2Digits(date.getHours())}-${padTo2Digits(date.getMinutes())}-${padTo2Digits(date.getSeconds())}`
}

const getDateString = (date) => {
  if (!date) {
    date = new Date()
  }

  return `${date.getFullYear()}-${padTo2Digits(date.getMonth() + 1)}-${padTo2Digits(date.getDate())}`
}

/**
 * Formats the given value into a human-readable number (e.g. 1.000 -> 1K, 1.000.000 -> 1G)
 * @param {Number} value The value to format
 * @param {Number} decimals The decimal places
 * @param {Number} k The thousand value (e.g. 1000 or 1024)
 * @param {String} separator The separator between the number and the letter
 */
const getNumberWithSuffix = (value, decimals = 2, k = 1000, separator = '') => {
  if (value === undefined || value === null || value === 0) {
    return '0'
  }

  // Check if advanced number formatting is available
  if ('Intl' in window && Intl.NumberFormat) {
    const locale = (store.getters.storeLocale || 'en_GB').replace('_', '-')
    let formatter
    if (k === 1024) {
      // Handle byte values
      const UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte']
      let size = Math.abs(Number(value))
      let u = 0
      while (size >= 1024 && u < UNITS.length - 1) {
        size /= 1024
        ++u
      }
      formatter = Intl.NumberFormat(locale, { style: 'unit', unit: UNITS[u], unitDisplay: 'short', maximumFractionDigits: decimals })
      value = size
    } else {
      // Handle regular numeric values
      formatter = Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: decimals })
    }

    return formatter.format(value)
  } else {
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
    const i = Math.floor(Math.log(value) / Math.log(k))

    return parseFloat((value / Math.pow(k, i)).toFixed(dm)) + separator + sizes[i]
  }
}

/**
 * Converts the given object into a safe URL string
 * @param {Object} params The object to convert
 */
const toUrlString = (params) => {
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => params[key] ? (key + '=' + encodeURIComponent(params[key])) : '')
    .join('&')
}

const isTruncatedAfterWords = (str, words) => {
  if (!str) {
    return false
  }

  const parts = str.split(' ')

  return parts.length > words
}

const truncateAfterWords = (str, words) => {
  if (!str) {
    return str
  }

  const parts = str.split(' ')

  if (parts.length > words) {
    return parts.splice(0, words).join(' ') + '...'
  } else {
    return str
  }
}

const truncateAfterChars = (str, length) => {
  if (!str) {
    return str
  }

  if (str.length > length) {
    return str.substring(0, length) + '...'
  } else {
    return str
  }
}

/**
 * Formats the given decimal number with the given number of decimal places
 * @param {Number} number The number to format
 * @param {Number} places The number of decimal spaces
 */
const toFixed = (number, places) => parseFloat(Math.round(number + 'e+' + places) + 'e-' + places)

export {
  padTo2Digits,
  getDateTimeString,
  getDateString,
  getNumberWithSuffix,
  toUrlString,
  truncateAfterChars,
  isTruncatedAfterWords,
  truncateAfterWords,
  toFixed
}
