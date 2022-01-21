export default {
  methods: {
    /**
     * Returns the chart colors
     */
    getColors: function () {
      if (this.customChartColors && this.customChartColors.length > 0) {
        return this.customChartColors
      } else {
        return this.serverSettings.colorsCharts
      }
    },
    /**
     * Returns the chart color at the given index
     * @param {Number} index The index
     */
    getColor: function (index) {
      const colors = this.getColors()

      if (colors) {
        return colors[index % colors.length]
      } else {
        return '#00acef'
      }
    },
    createMultiColorGradient: function (colors, steps) {
      const sections = colors.length - 1

      let result = []

      for (let i = 0; i < steps; i++) {
        result = result.concat(this.createColorGradient(colors[i], colors[i + 1], Math.floor(steps / sections)))
      }

      while (result.length < steps) {
        result.push(colors[colors.length - 1])
      }
      
      return result
    },
    /**
     * Creates a linear gradient between the two given colors with the given number of steps
     * @param {String} one The first color in HEX
     * @param {String} two The second color in HEX
     * @param {Number} steps The number of steps between the two colors
     */
    createColorGradient: function (one, two, steps) {
      const oneRgb = this.hexToRgb(one)
      const twoRgb = this.hexToRgb(two)

      let result = []
      for (let i = 0; i < steps; i++) {
        const iNorm = i / (steps - 1)
        result.push(this.rgbToHex(
          Math.floor(oneRgb.r + iNorm * (twoRgb.r - oneRgb.r)),
          Math.floor(oneRgb.g + iNorm * (twoRgb.g - oneRgb.g)),
          Math.floor(oneRgb.b + iNorm * (twoRgb.b - oneRgb.b))
        ))
      }
      return result
    },
    /**
     * Converts a HEX value into an RGB object
     * @param {String} hex The hex color
     */
    hexToRgb: function (hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    },
    /**
     * Converts the given R, G, B values into a HEX color
     * @param {Number} r The red color component
     * @param {Number} g The green color component
     * @param {Number} b The blue color component
     */
    rgbToHex: function (r, g, b) {
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    },
    /**
     * Determines the best text color (either white or black) given the background color
     * @param {String} backgroundColor The background color in HEX
     */
    getHighContrastTextColor: function (backgroundColor) {
      if (backgroundColor) {
        const rgb = this.hexToRgb(backgroundColor)
        if (!rgb) {
          return 'black'
        }
        const o = Math.round(((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000)
        return (o > 125) ? 'black' : 'white'
      } else {
        return 'black'
      }
    }
  }
}
