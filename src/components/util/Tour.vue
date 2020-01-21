<template>
  <b-popover :target="popoverTarget" :placement="steps[currentIndex].position" ref="popover" :show="popoverShow" v-if="popoverShow" variant="secondary">
    <template v-slot:title>
      <b-button @click="popoverShow = false" size="sm" class="ml-1 close" aria-label="Close">
        <i class="mdi mdi-close" />
      </b-button>
      <span>{{ steps[currentIndex].title() }}</span>
    </template>
    <div>
      <p v-html="steps[currentIndex].text()" />

      <b-button-group class="d-flex">
        <b-button variant="secondary" @click="currentIndex = currentIndex - 1" :disabled="currentIndex < 1"><i class="mdi mdi-18px fix-alignment mdi-chevron-left" /> {{ $t('buttonBack') }}</b-button>
        <b-button variant="success" @click="currentIndex = currentIndex + 1" v-if="currentIndex < steps.length - 1">{{ $t('buttonNext') }} <i class="mdi mdi-18px fix-alignment mdi-chevron-right" /></b-button>
        <b-button variant="success" @click="resetPopover" v-else>{{ $t('buttonClose') }} <i class="mdi mdi-18px fix-alignment mdi-check" /></b-button>
      </b-button-group>
    </div>
  </b-popover>
</template>

<script>
export default {
  props: {
    steps: {
      type: Array,
      default: () => []
    }
  },
  data: function () {
    return {
      currentIndex: 0,
      popoverShow: false,
      popoverTarget: null
    }
  },
  watch: {
    currentIndex: function (newValue, oldValue) {
      if (this.popoverShow) {
        this.updatePopover()
      } else {
        this.resetPopover()
      }
    },
    $route (newValue, oldValue) {
      // Hide on page navigation
      this.resetPopover()
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
    }
  }
}
</script>

<style>

</style>
