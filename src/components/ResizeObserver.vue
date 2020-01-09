<template>
  <div class="resize-observer" tabindex="-1"></div>
</template>

<script>
import { debounce } from 'lodash/core'
export default {
  name: 'resize-observer',
  data: function () {
    return {
      width: 0,
      height: 0,
      resizeObject: null
    }
  },
  methods: {
    compareAndNotify () {
      if (this.width !== this.$el.offsetWidth) {
        this.width = this.$el.offsetWidth
        this.$emit('notify-width', this.width)
      }
      if (this.height !== this.$el.offsetHeight) {
        this.height = this.$el.offsetHeight
        this.$emit('notify-height', this.height)
      }
    },
    addResizeHandlers () {
      this.resizeObject.contentDocument.defaultView.addEventListener('resize', debounce(this.compareAndNotify, 100))
      this.compareAndNotify()
    },
    removeResizeHandlers () {
      if (this.resizeObject && this.resizeObject.onload) {
        if (this.resizeObject.contentDocument) {
          this.resizeObject.contentDocument.defaultView.removeEventListener('resize', debounce(this.compareAndNotify, 100))
        }
        delete this.resizeObject.onload
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.width = this.$el.offsetWidth
      this.height = this.$el.offsetHeight
    })
    const object = document.createElement('object')
    this.resizeObject = object
    object.setAttribute('aria-hidden', 'true')
    object.setAttribute('tabindex', -1)
    object.onload = this.addResizeHandlers
    object.type = 'text/html'
    object.data = 'about:blank'
    this.$el.appendChild(object)
  },
  beforeDestroy () {
    this.removeResizeHandlers()
  }
}
</script>

<style scoped>
.resize-observer {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  pointer-events: none;
  display: block;
  overflow: hidden;
  opacity: 0;
}
.resize-observer >>> object {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
}
</style>
