import store from '@/store'

const FACTOR = 0.75

/**
     * Returns the chart colors
     */
const getColors = () => {
  if (store.getters.storeCustomChartColors && store.getters.storeCustomChartColors.length > 0) {
    return store.getters.storeCustomChartColors
  } else {
    return store.getters.storeServerSettings.colorsCharts
  }
}

const getTemplateColors = () => {
  if (store.getters.storeServerSettings && store.getters.storeServerSettings.colorsTemplate && store.getters.storeServerSettings.colorsTemplate.length > 0) {
    return store.getters.storeServerSettings.colorsTemplate
  } else {
    return ['#00acef']
  }
}

const getTemplateColor = (index) => {
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
const getColor = (index) => {
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
const createColorGradient = (one, two, steps) => {
  const oneRgb = hexToRgb(one)
  const twoRgb = hexToRgb(two)

  const result = []
  for (let i = 0; i < steps; i++) {
    const iNorm = i / (steps - 1)
    result.push(rgbToHex(
      Math.floor(oneRgb.r + iNorm * (twoRgb.r - oneRgb.r)),
      Math.floor(oneRgb.g + iNorm * (twoRgb.g - oneRgb.g)),
      Math.floor(oneRgb.b + iNorm * (twoRgb.b - oneRgb.b))
    ))
  }
  return result
}

const createMultiColorGradient = (colors, steps) => {
  const sections = colors.length - 1

  let result = []

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
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

/**
 * Converts the given R, G, B values into a HEX color
 * @param {Number} r The red color component
 * @param {Number} g The green color component
 * @param {Number} b The blue color component
 */
const rgbToHex = (r, g, b) => `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`

const rgbColorToHex = (c) => rgbToHex(c.r, c.g, c.b)

/**
 * Determines the best text color (either white or black) given the background color
 * @param {String} backgroundColor The background color in HEX
 */
const getHighContrastTextColor = (backgroundColor) => {
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

const brighten = (c) => {
  let r = c.r
  let g = c.g
  let b = c.b
  const i = Math.round(1.0 / 1.0 - FACTOR)
  if (r === 0 && g === 0 && b === 0) {
    return {
      r: i,
      g: i,
      b: i
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
    b: Math.min(255, Math.round(b / FACTOR))
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
  brighten
}
