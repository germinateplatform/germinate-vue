<template>
  <AppHeaderDropdown right v-if="languages && languages.length > 1">
    <template slot="header">
      <i class="mdi mdi-18px mdi-translate" />
    </template>\
    <template slot="dropdown">
      <b-dropdown-header tag="div" class="text-center"><strong>{{ $t('dropdownLocales') }}</strong></b-dropdown-header>
      <b-dropdown-item v-for="language in languages" :key="'locale-' + language.locale" @click="onLocaleChanged(language)"><i :class="'flag-icon flag-icon-' + language.flag" /> {{ language.name }}</b-dropdown-item>
    </template>
  </AppHeaderDropdown>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'
import { loadLanguageAsync } from '@/plugins/i18n'
import miscApi from '@/mixins/api/misc.js'

export default {
  name: 'LocaleDropdown',
  components: {
    AppHeaderDropdown
  },
  data: function () {
    return {
      // Default set of languages. Server can provide additional ones
      languages: [{
        locale: 'en_GB',
        flag: 'gb',
        name: 'British English'
      }]
    }
  },
  mixins: [ miscApi ],
  methods: {
    onLocaleChanged: function (language) {
      loadLanguageAsync(language.locale).then(() => {
        this.$i18n.locale = language.locale
        this.$store.dispatch('ON_LOCALE_CHANGED', language.locale)
      })
    },
    init: function () {
      if (this.locale) {
        this.$i18n.locale = this.languages.map(l => {
          return l.locale
        }).filter(l => {
          return this.locale === l
        })
      }
    }
  },
  mounted: function () {
    // Ask the server which locales are available
    this.apiGetLocales(result => {
      // If there is a result, use it
      if (result) {
        this.languages = result
      }

      this.init()
    }, () => {
      // If there's an error, work with what we've got
      this.init()
    })
  }
}
</script>

<style>
</style>
