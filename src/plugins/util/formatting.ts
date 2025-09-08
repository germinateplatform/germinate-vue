import { coreStore } from '@/stores/app'

const padTo2Digits = (num: number) => num.toString().padStart(2, '0')

const getDateTimeString = (date?: Date) => {
  if (!date) {
    date = new Date()
  }

  return `${date.getFullYear()}-${padTo2Digits(date.getMonth() + 1)}-${padTo2Digits(date.getDate())}-${padTo2Digits(date.getHours())}-${padTo2Digits(date.getMinutes())}-${padTo2Digits(date.getSeconds())}`
}

const getDateString = (date: Date) => {
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
const getNumberWithSuffix = (value: number, decimals = 2, k = 1000, separator = '') => {
  if (value === undefined || value === null || value === 0) {
    return '0'
  }

  const store = coreStore()

  // Check if advanced number formatting is available
  if ('Intl' in window && Intl.NumberFormat) {
    const locale = (store.storeLocale || 'en_GB').replace('_', '-')
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
    const dm = Math.max(0, decimals)
    const sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']
    const i = Math.floor(Math.log(value) / Math.log(k))

    return Number.parseFloat((value / Math.pow(k, i)).toFixed(dm)) + separator + sizes[i]
  }
}

/**
 * Converts the given object into a safe URL string
 * @param {Object} params The object to convert
 */
const toUrlString = (params: { [key: string]: string | undefined }) => {
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => params[key] ? (key + '=' + encodeURIComponent(params[key])) : '')
    .join('&')
}

const isTruncatedAfterWords = (str: string, words: number) => {
  if (!str) {
    return false
  }

  const parts = str.split(' ')

  return parts.length > words
}

const truncateAfterWords = (str: string, words: number) => {
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

const truncateAfterChars = (str: string, length: number) => {
  if (!str) {
    return str
  }

  if (str.length > length) {
    return str.slice(0, length) + '...'
  } else {
    return str
  }
}

const isAnyMissing = (...parts: (string | undefined)[]): boolean => {
  return !parts || parts.some(p => !p || p.trim().length === 0)
}

/**
 * Formats the given decimal number with the given number of decimal places
 * @param {Number} number The number to format
 * @param {Number} places The number of decimal spaces
 */
const toFixed = (number: number, places: number) => Number.parseFloat(Math.round(+(number + 'e+' + places)) + 'e-' + places)

export {
  padTo2Digits,
  getDateTimeString,
  getDateString,
  getNumberWithSuffix,
  toUrlString,
  truncateAfterChars,
  isTruncatedAfterWords,
  truncateAfterWords,
  toFixed,
  isAnyMissing,
}
