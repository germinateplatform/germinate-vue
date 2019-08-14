<template>
  <AppHeaderDropdown right>
    <template slot="header">
      <i class="mdi mdi-18px mdi-translate" />
    </template>\
    <template slot="dropdown">
      <b-dropdown-header tag="div" class="text-center"><strong>Locale</strong></b-dropdown-header>
      <b-dropdown-item v-for="language in languages" :key="'locale-' + language.locale" @click="onLocaleChanged(language)"><i :class="'flag-icon flag-icon-' + language.flag" /> {{ language.name }}</b-dropdown-item>
    </template>
  </AppHeaderDropdown>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'
import { mapState } from 'vuex'

export default {
  name: 'LocaleDropdown',
  components: {
    AppHeaderDropdown
  },
  data: () => {
    return {
      languages: [{
        locale: 'en_GB',
        flag: 'gb',
        name: 'British English'
      }, {
        locale: 'de_DE',
        flag: 'de',
        name: 'Deutsch - Deutschland'
      }]
    }
  },
  computed: {
    ...mapState([
      'locale'
    ])
  },
  methods: {
    onLocaleChanged: function (language) {
      this.$i18n.locale = language.locale
      this.$store.dispatch('ON_LOCALE_CHANGED', language.locale)
    }
  },
  mounted: function () {
    var vm = this

    if (this.locale) {
      this.$i18n.locale = this.languages.map(function (l) {
        return l.locale
      }).filter(function (l) {
        return vm.locale === l
      })
    }
  }
}
</script>

<style>
</style>
