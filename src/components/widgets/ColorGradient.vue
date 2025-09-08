<template>
  <div>
    <!-- This is the gradient canvas -->
    <canvas class="gradient-canvas" ref="canvas" />

    <div class="d-flex justify-space-between">
      <div class="d-flex align-center">
        <v-icon size="small" icon="mdi-arrow-collapse-left" class="me-2" />
        <div class="text-left">
          <div>{{ $t('widgetGradientLow') }}</div>
          <div v-if="min !== undefined && min !== null">{{ formatMinMax(min) }}</div>
        </div>
      </div>
      <div class="d-flex align-center">
        <div class="text-right">
          <div>{{ $t('widgetGradientHigh') }} </div>
          <div v-if="max !== undefined && max !== null">{{ formatMinMax(max) }}</div>
        </div>
        <v-icon size="small" icon="mdi-arrow-collapse-right" class="ms-2" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { coreStore } from '@/stores/app'

  interface Props {
    min?: number
    max?: number
    formatMinMax?: Function
    height?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    height: 25,
    formatMinMax: (x: number) => x,
  })

  const canvas = useTemplateRef('canvas')

  const store = coreStore()

  const colors = computed(() => {
    if (store.storeServerSettings && store.storeServerSettings.colorsGradient && store.storeServerSettings.colorsGradient.length > 0) {
      return store.storeServerSettings.colorsGradient.concat()
    } else {
      return ['#000000', '#570000', '#ff0000', '#ffc800', '#ffff00', '#ffffff']
    }
  })

  function refresh () {
    nextTick(() => {
      if (!canvas.value) {
        return
      }

      const ctx = canvas.value.getContext('2d')
      if (!ctx) {
        return
      }
      ctx.canvas.height = props.height
      ctx.canvas.width = canvas.value.offsetWidth

      // Create gradient
      const gradient = ctx.createLinearGradient(5, 0, canvas.value.offsetWidth - 5, 0)

      colors.value.forEach((c, i) => gradient.addColorStop(i * (1 / (colors.value.length - 1)), c))

      // Fill with gradient
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.value.offsetWidth, props.height)
    })
  }

  watch(() => props.height, () => refresh())
  watch(colors, () => refresh())

  onMounted(() => refresh())
</script>

<style scoped>
.gradient-canvas {
  width: 100%;
}
</style>
