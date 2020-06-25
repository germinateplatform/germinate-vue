export default {
  methods: {
    getColors: function () {
      if (this.customChartColors && this.customChartColors.length > 0) {
        return this.customChartColors
      } else {
        return this.serverSettings.colorsCharts
      }
    },
    getColor: function (index) {
      const colors = this.getColors()

      if (colors) {
        return colors[index % colors.length]
      } else {
        return '#00acef'
      }
    },
    createColorGradient: function (one, two, steps) {
      var oneRgb = this.hexToRgb(one)
      var twoRgb = this.hexToRgb(two)

      var result = []
      for (var i = 0; i < steps; i++) {
        var iNorm = i / (steps - 1)
        result.push(this.rgbToHex(
          Math.floor(oneRgb.r + iNorm * (twoRgb.r - oneRgb.r)),
          Math.floor(oneRgb.g + iNorm * (twoRgb.g - oneRgb.g)),
          Math.floor(oneRgb.b + iNorm * (twoRgb.b - oneRgb.b))
        ))
      }
      return result
    },
    hexToRgb: function (hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    },
    rgbToHex: function (r, g, b) {
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    },
    getHighContrastTextColor: function (backgroundColor) {
      const rgb = this.hexToRgb(backgroundColor)
      var o = Math.round(((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000)
      return (o > 125) ? 'black' : 'white'
    }
  }
}
