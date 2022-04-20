<template>
  <b-nav-item-dropdown right v-if="languages && languages.length > 1" aria-label="Locale switcher">
    <template #button-content>
      <MdiIcon :path="mdiTranslate" />
    </template>

    <b-dropdown-header class="text-center border-bottom mb-2"><strong>{{ $t('dropdownLocales') }}</strong></b-dropdown-header>
    <b-dropdown-item v-for="language in languages" :key="'locale-' + language.locale" @click="onLocaleChanged(language)"><i :class="'fi fi-' + language.flag" /> {{ language.name }}</b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import { loadLanguageAsync } from '@/plugins/i18n'
import miscApi from '@/mixins/api/misc.js'

import { mdiTranslate } from '@mdi/js'

export default {
  components: {
    MdiIcon
  },
  computed: {
    ...mapGetters([
      'storeLocale'
    ])
  },
  data: function () {
    return {
      mdiTranslate,
      // Default set of languages. Server can provide additional ones
      languages: [{
        locale: 'en_GB',
        flag: 'gb',
        name: 'British English'
      }]
    }
  },
  mixins: [miscApi],
  methods: {
    onLocaleChanged: function (language) {
      loadLanguageAsync(language.locale).then(() => {
        this.$i18n.locale = language.locale
        this.$store.dispatch('setLocale', language.locale)
      })
    },
    init: function () {
      if (this.storeLocale) {
        this.$i18n.locale = this.languages.map(l => {
          return l.locale
        }).filter(l => {
          return this.storeLocale === l
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
