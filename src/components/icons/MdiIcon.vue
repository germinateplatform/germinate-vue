<template functional>
  <span class="mdi-icon-wrapper">
    <svg xmlns="http://www.w3.org/2000/svg" :viewBox="`0 0 24 24`" :width="$options.getSize(props.size)" :height="$options.getSize(props.size)" :class="`mdi-icon ${props.className}`" :style="$options.getStyle(props)">
      <path :d="props.path" />
    </svg>
  </span>
</template>

<script>
export default {
  props: {
    path: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: null
    },
    rotate: {
      type: Number,
      default: 0
    },
    className: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: null
    }
  },
  getSize (size) {
    return size || '1em'
  },
  getStyle (props) {
    const result = {}

    if (props.rotate) {
      result.transform = `rotate(${props.rotate}deg)`
    }
    if (props.color) {
      result.color = props.color
    }

    return result
  }
}
</script>

<style scoped>
.mdi-icon {
  fill: currentColor;
}
</style>
