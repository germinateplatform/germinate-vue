<template>
  <span></span>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: function () {
    return {
      options: {
        texts: this.getPaginationTexts()
      }
    }
  },
  computed: {
    ...mapState([
      'locale'
    ])
  },
  watch: {
    locale (newValue, oldValue) {
      this.options.texts = this.getPaginationTexts()
    }
  }
}
</script>

<style>

</style>
