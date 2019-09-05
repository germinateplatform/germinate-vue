<template>
  <div>
    <router-view :class="printContent ? 'd-print-none' : ''"></router-view>
    <div ref="printer-view" class="d-none d-print-block" v-html="printContent" v-if="printContent"></div>

    <b-modal ref="loadingModal" :title="$t('modalTitleLoading')" hide-footer no-close-on-backdrop no-close-on-esc hide-header-close>
      <div class="text-center">
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
      </div>
    </b-modal>
  </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus.js'
import { loadLanguageAsync } from '@/plugins/i18n'

export default {
  name: 'app',
  data: function () {
    return {
      printContent: null
    }
  },
  created: async function () {
    await this.apiGetSettings(result => {
      this.$store.dispatch('ON_SETTINGS_CHANGED', result)
    })
  },
  methods: {
    print: function (newContent) {
      this.printContent = newContent

      this.$nextTick(() => {
        window.print()
        this.$nextTick(() => {
          this.printContent = null
        })
      })
    },
    toggleLoading: function (show) {
      if (show) {
        this.$refs.loadingModal.show()
      } else {
        this.$refs.loadingModal.hide()
      }
    }
  },
  destroyed: function () {
    EventBus.$off('on-print', this.print)
    EventBus.$off('show-loading', this.toggleLoading)
  },
  mounted: function () {
    loadLanguageAsync(this.locale)
    EventBus.$on('on-print', this.print)
    EventBus.$on('show-loading', this.toggleLoading)
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
