<template>
  <div>
    <!-- This is the gradient canvas -->
    <canvas class="gradient-canvas" ref="canvas" />
    <b-row>
      <b-col class="text-left">
        {{ $t('widgetGradientLow') }}
      </b-col>
      <b-col class="text-right">
        {{ $t('widgetGradientHigh') }}
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  props: {
    colors: {
      type: Array,
      default: () => ['#000000', '#570000', '#ff0000', '#ffc800', '#ffff00', '#ffffff']
    },
    height: {
      type: Number,
      default: 25
    }
  },
  methods: {
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
