<template>
  <svg ref="background" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>
</template>

<script>
import SimplexNoise from 'simplex-noise'
import { debounce } from 'lodash'

export default {
  data: function () {
    return {
      backgroundColors: null
    }
  },
  methods: {
    updateBackground: function () {
      const svg = this.$refs.background

      if (!svg) {
        return
      }

      const w = window.innerWidth
      const h = window.innerHeight

      const random = (a, b) => {
        if (!a) {
          return Math.random()
        }
        if (!b) {
          return Math.random() * a
        }

        if (a > b) {
          [a, b] = [b, a] // swap values
        }
        return a + Math.random() * (b - a)
      }
      const randInt = (a, b) => ~~random(a, b)
      const lerp = (a, b, amount) => a + (b - a) * amount
      const clamp = (a, min, max) => a < min ? min : a > max ? max : a
      const map = (n, a, b, c, d, clamped = false) => clamped ? clamp(lerp(c, d, (n - a) / (b - a)), c, d) : lerp(c, d, (n - a) / (b - a))
      const array = n => new Array(n).fill(0).map((d, i) => i)

      const seed = Date.now()

      const n = 120

      const p = this.backgroundColors

      var simplex = new SimplexNoise()

      const TAU = 6.283185307179586

      var svgNS = svg.namespaceURI
      svg.setAttribute('width', w)
      svg.setAttribute('height', h)

      const rect = document.createElementNS(svgNS, 'rect')
      rect.setAttribute('x', 0)
      rect.setAttribute('y', 0)
      rect.setAttribute('width', w)
      rect.setAttribute('height', h)
      rect.setAttribute('stroke', 'none')
      rect.setAttribute('fill', '#fefefe')

      svg.appendChild(rect)

      const g = document.createElementNS(svgNS, 'g')
      g.setAttribute('transform', `translate(${randInt(w)}, ${randInt(h)})`)
      svg.appendChild(g)

      for (var i = 0; i < n; i++) {
        const rad = 20 + i * 8
        const color = p[Math.floor(Math.random() * (p.length - 1)) + 1]

        const path = document.createElementNS(svgNS, 'path')
        var d = ''

        for (var j = 0; j < 360; j++) {
          const angle = j / 360 * TAU
          const c = Math.cos(angle)
          const s = Math.sin(angle)
          const noise = simplex.noise3D(c, s, seed) * 0.5 + 0.5
          const r = rad * (1 + noise * ((i / n) ** 3))
          const x = c * r
          const y = s * r

          d = d + `${j === 0 ? 'M' : 'L'} ${x} ${y}`
        }

        d += ' Z'

        path.setAttribute('d', d)
        path.setAttribute('fill', i === 0 ? color : 'none')
        path.setAttribute('stroke', color)
        path.setAttribute('stroke-width', map(i, 20, n, 5, 11, true))
        path.setAttribute('stroke-linejoin', 'round')

        if (i !== 0) {
          path.setAttribute('stroke-dasharray', array(200).map(j => j % 2 === 1 ? randInt(5, i) : random() > i / n ? randInt(200) : randInt(3, 10)).join(' '))
        }

        g.appendChild(path)
      }
    },
    clearBackground: function () {
      var chart = this.$refs.background
      while (chart.firstChild) {
        chart.removeChild(chart.firstChild)
      }
    }
  },
  mounted: function () {
    var primaryColor = (this.serverSettings && this.serverSettings.colorPrimary) ? this.serverSettings.colorPrimary : '#20a8d8'
    this.backgroundColors = this.createColorGradient('#ffffff', primaryColor, 4)

    this.updateBackground()

    // Clear the background first
    window.addEventListener('resize', this.clearBackground)
    // Then debounce the re-drawing
    window.addEventListener('resize', debounce(this.updateBackground, 500))
  },
  beforeDestroy: function () {
    // Remove both listeners
    window.removeEventListener('resize', this.clearBackground)
    window.removeEventListener('resize', debounce(this.updateBackground, 500))
  }
}
</script>

<style>

</style>
