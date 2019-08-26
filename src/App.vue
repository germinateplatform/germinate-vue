<template>
  <div>
    <router-view :class="printContent ? 'd-print-none' : ''"></router-view>
    <div ref="printer-view" class="d-none d-print-block" v-html="printContent" v-if="printContent"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { EventBus } from '@/plugins/event-bus.js'
import { loadLanguageAsync } from '@/plugins/i18n'

export default {
  name: 'app',
  data: function () {
    return {
      printContent: null
    }
  },
  computed: {
    ...mapState([
      'locale'
    ])
  },
  mounted: function () {
    loadLanguageAsync(this.locale)
    EventBus.$on('on-print', newContent => {
      this.printContent = newContent

      this.$nextTick(() => {
        window.print()
        this.$nextTick(() => {
          this.printContent = null
        })
      })
    })
  }
}
</script>

<style lang="scss">
  // CoreUI Icons Set
  @import '~@coreui/icons/css/coreui-icons.min.css';
  /* Import Simple Line Icons Set */
  $simple-line-font-path: '~simple-line-icons/fonts/';
  @import '~simple-line-icons/scss/simple-line-icons.scss';
  /* Import Flag Icons Set */
  @import '~flag-icon-css/css/flag-icon.min.css';
  @import '~@mdi/font/css/materialdesignicons.min.css';
  /* Import Bootstrap Vue Styles */
  @import '~bootstrap-vue/dist/bootstrap-vue.css';
  // Import Main styles for this application
  @import 'assets/scss/style';
</style>
