import { coreStore } from '@/stores/app'

const FACTOR = 0.75

export interface RGB {
  r: number
  g: number
  b: number
}

/**
     * Returns the chart colors
     */
const getColors = (): string[] | undefined => {
  const store = coreStore()
  if (store.storeCustomChartColors && store.storeCustomChartColors.length > 0) {
    return store.storeCustomChartColors
  } else {
    return store.storeServerSettings?.colorsCharts
  }
}

const getPrimaryColor = (): string => {
  const rgb = getComputedStyle(document.documentElement).getPropertyValue('--v-theme-primary').split(',').map(s => +s.trim())
  return rgbToHex(rgb[0], rgb[1], rgb[2])
}

const getTemplateColors = () => {
  const store = coreStore()
  if (store.storeServerSettings && store.storeServerSettings.colorsTemplate && store.storeServerSettings.colorsTemplate.length > 0) {
    return store.storeServerSettings.colorsTemplate
  } else {
    return ['#00acef']
  }
}

const getTemplateColor = (index: number): string => {
  const colors = getTemplateColors()

  if (colors) {
    return colors[index % colors.length]
  } else {
    return '#00acef'
  }
}

/**
 * Returns the chart color at the given index
 * @param {Number} index The index
 */
const getColor = (index: number): string => {
  const colors = getColors()

  if (colors) {
    return colors[index % colors.length]
  } else {
    return '#00acef'
  }
}

/**
 * Creates a linear gradient between the two given colors with the given number of steps
 * @param {String} one The first color in HEX
 * @param {String} two The second color in HEX
 * @param {Number} steps The number of steps between the two colors
 */
const createColorGradient = (one: string, two: string, steps: number) => {
  const oneRgb = hexToRgb(one)
  const twoRgb = hexToRgb(two)

  const result = []

  if (oneRgb && twoRgb) {
    for (let i = 0; i < steps; i++) {
      const iNorm = i / (steps - 1)
      result.push(rgbToHex(
        Math.floor(oneRgb.r + iNorm * (twoRgb.r - oneRgb.r)),
        Math.floor(oneRgb.g + iNorm * (twoRgb.g - oneRgb.g)),
        Math.floor(oneRgb.b + iNorm * (twoRgb.b - oneRgb.b)),
      ))
    }
  }

  return result
}

const createMultiColorGradient = (colors: string[], steps: number): string[] => {
  const sections = colors.length - 1

  let result: string[] = []

  for (let i = 0; i < steps; i++) {
    result = result.concat(createColorGradient(colors[i], colors[i + 1], Math.floor(steps / sections)))
  }

  while (result.length < steps) {
    result.push(colors[colors.length - 1])
  }

  return result
}

/**
 * Converts a HEX value into an RGB object
 * @param {String} hex The hex color
 */
const hexToRgb = (hex: string): RGB | undefined => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : undefined
}

/**
 * Converts the given R, G, B values into a HEX color
 * @param {Number} r The red color component
 * @param {Number} g The green color component
 * @param {Number} b The blue color component
 */
const rgbToHex = (r: number, g: number, b: number): string => `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`

const rgbColorToHex = (c: RGB): string => rgbToHex(c.r, c.g, c.b)

/**
 * Determines the best text color (either white or black) given the background color
 * @param {String} backgroundColor The background color in HEX
 */
const getHighContrastTextColor = (backgroundColor: string): string => {
  if (backgroundColor) {
    const rgb = hexToRgb(backgroundColor)
    if (!rgb) {
      return 'black'
    }
    const o = Math.round(((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000)
    return (o > 125) ? 'black' : 'white'
  } else {
    return 'black'
  }
}

const brighten = (c: RGB): RGB => {
  let r = c.r
  let g = c.g
  let b = c.b
  const i = Math.round(1 / (1 - FACTOR))
  if (r === 0 && g === 0 && b === 0) {
    return {
      r: i,
      g: i,
      b: i,
    }
  }

  if (r > 0 && r < i) {
    r = i
  }
  if (g > 0 && g < i) {
    g = i
  }
  if (b > 0 && b < i) {
    b = i
  }

  return {
    r: Math.min(255, Math.round(r / FACTOR)),
    g: Math.min(255, Math.round(g / FACTOR)),
    b: Math.min(255, Math.round(b / FACTOR)),
  }
}

const hexToRGBA = (hex: string, alpha: number) => {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)

  if (alpha) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  } else {
    return `rgba(${r}, ${g}, ${b})`
  }
}

export {
  getColors,
  getColor,
  getTemplateColors,
  getTemplateColor,
  createMultiColorGradient,
  createColorGradient,
  hexToRgb,
  rgbToHex,
  rgbColorToHex,
  getHighContrastTextColor,
  brighten,
  getPrimaryColor,
  hexToRGBA,
}
