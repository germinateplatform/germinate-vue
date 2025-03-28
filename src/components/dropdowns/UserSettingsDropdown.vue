<template>
  <b-nav-item-dropdown right v-if="storeServerSettings && storeServerSettings.authMode !== 'NONE'">
    <template #button-content>
      <MdiIcon :path="mdiAccount" />
    </template>

    <!-- Administrators get to see additional items -->
    <template v-if="storeToken && userIsAtLeast(storeToken.userType, USER_TYPE_DATA_CURATOR)">
      <b-dropdown-header class="text-center border-bottom mb-2"><strong>{{ $t('dropdownUserSettingsAdvancedSettings') }}</strong></b-dropdown-header>
      <b-dropdown-item :to="{ name: Pages.germinateSettings }" v-if="userIsAtLeast(storeToken.userType, USER_TYPE_ADMINISTRATOR)"><span class="text-warning"><MdiIcon :path="mdiCog"/></span> {{ $t('dropdownUserSettingsGerminateSettings') }}</b-dropdown-item>
      <b-dropdown-item :to="{ name: Pages.userPermissions }" v-if="userIsAtLeast(storeToken.userType, USER_TYPE_ADMINISTRATOR)"><span class="text-warning"><MdiIcon :path="mdiAccountKey"/></span> {{ $t('dropdownUserSettingsUserPermissions') }}</b-dropdown-item>
      <b-dropdown-item v-if="storeServerSettings.dataImportMode !== 'NONE'" :to="{ name: Pages.importUpload }"><span class="text-warning"><MdiIcon :path="mdiUpload"/></span> {{ $t('dropdownUserSettingsDataUpload') }}</b-dropdown-item>
      <b-dropdown-item :to="{ name: Pages.germplasmUnifier }"><span class="text-warning"><MdiIcon :path="mdiSetMerge"/></span> {{ $t('dropdownUserSettingsGermplasmUnifier') }}</b-dropdown-item>
      <b-dropdown-item :to="{ name: Pages.germplasmMatch }"><span class="text-warning"><MdiIcon :path="mdiTextSearch"/></span> {{ $t('dropdownUserSettingsGermplasmMatchSearch') }}</b-dropdown-item>
      <b-dropdown-item :to="{ name: Pages.userFeedback }" v-if="storeServerSettings.supportsFeedback"><span class="text-warning"><MdiIcon :path="mdiCommentQuoteOutline"/></span> {{ $t('dropdownUserSettingsUserFeedback') }}</b-dropdown-item>
    </template>
    <!-- Settings -->
    <b-dropdown-header class="text-center border-bottom mb-2"><strong>{{ $t('dropdownUserSettings') }}<span v-if="storeToken">: {{ storeToken.username }}</span></strong></b-dropdown-header>
    <template  v-if="storeToken && storeToken.token">
      <b-dropdown-item @click="$refs.tokenModal.show()"><span class="text-info"><MdiIcon :path="mdiCircleMultiple" /></span> {{ $t('dropdownUserSettingsGetToken') }}</b-dropdown-item>
      <!-- Logout -->
      <b-dropdown-item @click="signOut"><span class="text-danger"><MdiIcon :path="mdiLogoutVariant" /></span> {{ $t('dropdownUserSettingsLogout') }}</b-dropdown-item>
    </template>
    <!-- Login -->
    <b-dropdown-item :to="{ name: Pages.login }" v-else><span class="text-success"><MdiIcon :path="mdiLoginVariant" /></span> {{ $t('dropdownUserSettingsLogin') }}</b-dropdown-item>

    <GetTokenModal ref="tokenModal" />
  </b-nav-item-dropdown>
</template>

<script>
import { mapGetters } from 'vuex'

import GetTokenModal from '@/components/modals/GetTokenModal'
import MdiIcon from '@/components/icons/MdiIcon'
import { userIsAtLeast, apiDeleteToken, apiPostToken, USER_TYPE_ADMINISTRATOR, USER_TYPE_DATA_CURATOR } from '@/mixins/api/auth'

import { mdiAccount, mdiCog, mdiAccountKey, mdiUpload, mdiCircleMultiple, mdiSetMerge, mdiLogoutVariant, mdiLoginVariant, mdiCommentQuoteOutline, mdiTextSearch } from '@mdi/js'
import { Pages } from '@/mixins/pages'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    GetTokenModal,
    MdiIcon
  },
  data: () => {
    return {
      Pages,
      mdiAccount,
      mdiCog,
      mdiCircleMultiple,
      mdiAccountKey,
      mdiUpload,
      mdiSetMerge,
      mdiLogoutVariant,
      mdiLoginVariant,
      mdiCommentQuoteOutline,
      mdiTextSearch,
      enabled: true,
      USER_TYPE_ADMINISTRATOR,
      USER_TYPE_DATA_CURATOR
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeServerSettings'
    ])
  },
  methods: {
    userIsAtLeast,
    signIn: function (user) {
      this.enabled = false
      apiPostToken(user, result => {
        // If it's successful, finally store them
        this.enabled = true
        this.$store.dispatch('setToken', result)
        window.location.reload()
        emitter.emit('update-sidebar-menu')
      }, {
        codes: [],
        callback: () => {
          this.enabled = true
          // If they're wrong, remove
          this.$store.dispatch('setToken', null)
          emitter.emit('update-sidebar-menu')
        }
      })
    },
    signOut: function () {
      const user = {
        email: this.storeToken.username,
        password: this.storeToken.token
      }

      apiDeleteToken(user, () => {
        // If it's successful, delete token, then redirect
        this.$store.dispatch('setToken', null)

        if (this.storeServerSettings.authMode === 'FULL') {
          this.$router.push({ name: Pages.login })
        } else {
          this.$router.push({ name: Pages.home })
        }

        this.$gtag.event('login', 'logout')

        emitter.emit('update-sidebar-menu')
      }, {
        codes: [],
        callback: () => {
          // If they're wrong, remove
          this.$store.dispatch('setToken', null)

          emitter.emit('update-sidebar-menu')
        }
      })
    }
  }
}
</script>

<style>
</style>
