<template>
  <div>
    <!-- This is the gradient canvas -->
    <canvas class="gradient-canvas" ref="canvas" />
    <b-row>
      <b-col>
        <div class="d-flex align-items-center">
          <MdiIcon :path="mdiArrowCollapseLeft" className="mr-2" />
          <div class="text-left">
            <div>{{ $t('widgetGradientLow') }}</div>
            <div v-if="min !== undefined && min !== null">{{ formatMinMax(min) }}</div>
          </div>
        </div>
      </b-col>
      <b-col>
        <div class="d-flex justify-content-end align-items-center">
          <div class="text-right">
            <div>{{ $t('widgetGradientHigh') }} </div>
            <div v-if="max !== undefined && max !== null">{{ formatMinMax(max) }}</div>
          </div>
          <MdiIcon :path="mdiArrowCollapseRight" className="ml-2" />
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'

import { hexToRgb } from '@/mixins/colors.js'

import { mdiArrowCollapseLeft, mdiArrowCollapseRight } from '@mdi/js'

export default {
  components: {
    MdiIcon
  },
  props: {
    height: {
      type: Number,
      default: 25
    },
    min: {
      type: Number,
      default: null
    },
    max: {
      type: Number,
      default: null
    },
    formatMinMax: {
      type: Function,
      default: (x) => x
    }
  },
  data: function () {
    return {
      mdiArrowCollapseLeft,
      mdiArrowCollapseRight,
      numSteps: 100
    }
  },
  computed: {
    ...mapGetters([
      'storeServerSettings'
    ]),
    colors: function () {
      if (this.storeServerSettings && this.storeServerSettings.colorsGradient && this.storeServerSettings.colorsGradient.length > 0) {
        return this.storeServerSettings.colorsGradient.concat()
      } else {
        return ['#000000', '#570000', '#ff0000', '#ffc800', '#ffff00', '#ffffff']
      }
    },
    multiGradient: function () {
      const numSections = this.colors.length - 1

      let gradient = []

      for (let section = 1; section < numSections; section++) {
        gradient = gradient.concat(this.createGradient(this.colors[section - 1], this.colors[section], this.numSteps / numSections))
      }

      while (gradient.length < this.numSteps) {
        gradient.push(this.colors.length - 1)
      }

      return gradient
    }
  },
  watch: {
    colors: function () {
      this.refresh()
    },
    height: function () {
      this.refresh()
    }
  },
  methods: {
    createGradient: function (a, b, numSteps) {
      const one = hexToRgb(a)
      const two = hexToRgb(b)

      const gradient = []
      let iNorm

      for (let i = 0; i < numSteps; i++) {
        iNorm = i / (1.0 * numSteps - 1)
        const r = Math.round(one.r + iNorm * (two.r - one.r))
        const g = Math.round(one.g + iNorm * (two.g - one.g))
        const b = Math.round(one.b + iNorm * (two.b - one.b))
        gradient.push({ r: r, g: g, b: b })
      }

      return gradient
    },
    getColor: function (min, max, value) {
      if (min === max) {
        return 'white'
      }

      const norm = (value - min) / (1.0 * (max - min))
      let colorIndex = Math.floor(norm * (this.multiGradient.length - 1))

      colorIndex = Math.max(0, colorIndex)
      colorIndex = Math.min(colorIndex, this.multiGradient.length - 1)

      return this.multiGradient[colorIndex]
    },
    refresh: function () {
      this.$nextTick(() => {
        const canvas = this.$refs.canvas
        const ctx = canvas.getContext('2d')
        ctx.canvas.height = this.height
        ctx.canvas.width = canvas.offsetWidth

        // Create gradient
        const gradient = ctx.createLinearGradient(5, 0, canvas.offsetWidth - 5, 0)

        this.colors.forEach((c, i) => gradient.addColorStop(i * (1 / (this.colors.length - 1)), c))

        // Fill with gradient
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.offsetWidth, this.height)
      })
    }
  },
  mounted: function () {
    this.refresh()
  }
}
</script>

<style>
.gradient-canvas {
  width: 100%;
}
</style>
