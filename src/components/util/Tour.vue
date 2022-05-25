<template>
  <div v-if="popoverShow">
    <!-- The backdrop prevents input on the background -->
    <div class="backdrop" />
    <!-- The popover appears next to the element -->
    <b-popover :target="popoverTarget" :placement="steps[currentIndex].position" ref="popover" :show="popoverShow" variant="secondary">
      <template v-slot:title>
        <b-button @click="popoverShow = false" size="sm" class="ml-1 close" aria-label="Close">
          ×
        </b-button>
        <span>{{ steps[currentIndex].title() }}</span>
      </template>
      <div>
        <!-- Step content text -->
        <p v-html="steps[currentIndex].text()" />

        <!-- Buttons -->
        <b-button-group class="d-flex">
          <!-- Back button -->
          <b-button variant="secondary" @click="currentIndex = currentIndex - 1" :disabled="currentIndex < 1" v-if="steps.length > 1">
            <MdiIcon :path="mdiChevronLeft" /> {{ $t('buttonBack') }}</b-button>
          <!-- Next button -->
          <b-button variant="success" @click="currentIndex = currentIndex + 1" v-if="currentIndex < steps.length - 1">{{ $t('buttonNext') }} <MdiIcon :path="mdiChevronRight" /></b-button>
          <!-- Finish button -->
          <b-button variant="success" @click="resetPopover" v-else>{{ $t('buttonClose') }} <MdiIcon :path="mdiCheck" /></b-button>
        </b-button-group>
      </div>
    </b-popover>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'

import { mdiChevronLeft, mdiChevronRight, mdiCheck } from '@mdi/js'

export default {
  components: {
    MdiIcon
  },
  props: {
    steps: {
      type: Array,
      default: () => []
    }
  },
  data: function () {
    return {
      mdiChevronLeft,
      mdiChevronRight,
      mdiCheck,
      currentIndex: 0,
      popoverShow: false,
      popoverTarget: null
    }
  },
  watch: {
    currentIndex: function () {
      if (this.popoverShow) {
        this.updatePopover()
      } else {
        this.resetPopover()
      }
    },
    $route: function () {
      // Hide on page navigation
      this.resetPopover()
      document.body.classList.remove('overflow-hidden')
    },
    popoverShow: function (newValue) {
      if (newValue) {
        document.body.classList.add('overflow-hidden')
        document.addEventListener('keyup', this.handleKeys)
      } else {
        document.body.classList.remove('overflow-hidden')
        document.removeEventListener('keyup', this.handleKeys)
      }
    }
  },
  methods: {
    updatePopover: function () {
      this.popoverShow = false
      this.$nextTick(() => {
        if (this.currentIndex < this.steps.length) {
          this.popoverTarget = document.querySelector(this.steps[this.currentIndex].target())

          if (this.popoverTarget) {
            this.popoverShow = true

            const rect = this.popoverTarget.getBoundingClientRect()
            const absoluteElementTop = rect.top + window.pageYOffset
            const middle = absoluteElementTop - (window.innerHeight / 2)
            window.scrollTo({
              left: 0,
              top: middle,
              behavior: 'smooth'
            })
          } else {
            this.popoverShow = true
            this.currentIndex++
          }
        } else {
          this.popoverShow = false
        }
      })
    },
    resetPopover: function () {
      this.currentIndex = 0
      this.popoverTarget = null
      this.popoverShow = false
    },
    start: function () {
      this.resetPopover()
      this.updatePopover()
    },
    handleKeys: function (e) {
      if (this.popoverShow) {
        if (e.keyCode === 39) {
          // Right
          if (this.currentIndex < this.steps.length - 1) {
            this.currentIndex++
          }
        } else if (e.keyCode === 37) {
          // Left
          if (this.currentIndex > 0) {
            this.currentIndex--
          }
        } else if (e.keyCode === 27) {
          // Escape
          this.resetPopover()
        }
      }
    }
  }
}
</script>

<style scoped>
.backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1059;
}
</style>
