<template>
  <b-nav-item-dropdown right v-if="storeServerSettings && storeServerSettings.authMode !== 'NONE'">
    <template #button-content>
      <MdiIcon :path="mdiAccount" />
    </template>

    <!-- Administrators get to see additional items -->
    <template v-if="storeToken && userIsAtLeast(storeToken.userType, 'Data Curator')">
      <b-dropdown-header class="text-center border-bottom mb-2"><strong>{{ $t('dropdownUserSettingsAdvancedSettings') }}</strong></b-dropdown-header>
      <b-dropdown-item :to="{ name: 'germinate-settings' }" v-if="userIsAtLeast(storeToken.userType, 'Administrator')"><span class="text-warning"><MdiIcon :path="mdiCog"/></span> {{ $t('dropdownUserSettingsGerminateSettings') }}</b-dropdown-item>
      <b-dropdown-item :to="{ name: 'user-permissions' }" v-if="userIsAtLeast(storeToken.userType, 'Administrator')"><span class="text-warning"><MdiIcon :path="mdiAccountKey"/></span> {{ $t('dropdownUserSettingsUserPermissions') }}</b-dropdown-item>
      <b-dropdown-item v-if="storeServerSettings.dataImportMode !== 'NONE'" :to="{ name: 'import-upload' }"><span class="text-warning"><MdiIcon :path="mdiUpload"/></span> {{ $t('dropdownUserSettingsDataUpload') }}</b-dropdown-item>
      <b-dropdown-item :to="{ name: 'germplasm-unifier' }"><span class="text-warning"><MdiIcon :path="mdiSetMerge"/></span> {{ $t('dropdownUserSettingsGermplasmUnifier') }}</b-dropdown-item>
    </template>
    <!-- Settings -->
    <b-dropdown-header class="text-center border-bottom mb-2"><strong>{{ $t('dropdownUserSettings') }}<span v-if="storeToken">: {{ storeToken.username }}</span></strong></b-dropdown-header>
    <!-- Logout -->
    <b-dropdown-item @click="signOut" v-if="storeToken && storeToken.token"><span class="text-danger"><MdiIcon :path="mdiLogoutVariant" /></span> {{ $t('dropdownUserSettingsLogout') }}</b-dropdown-item>
    <!-- Login -->
    <b-dropdown-item :to="{ name: 'login' }" v-else><span class="text-success"><MdiIcon :path="mdiLoginVariant" /></span> {{ $t('dropdownUserSettingsLogin') }}</b-dropdown-item>
  </b-nav-item-dropdown>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import authApi from '@/mixins/api/auth.js'

import { mdiAccount, mdiCog, mdiAccountKey, mdiUpload, mdiSetMerge, mdiLogoutVariant, mdiLoginVariant } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    MdiIcon
  },
  data: () => {
    return {
      mdiAccount,
      mdiCog,
      mdiAccountKey,
      mdiUpload,
      mdiSetMerge,
      mdiLogoutVariant,
      mdiLoginVariant,
      enabled: true
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeServerSettings'
    ])
  },
  mixins: [authApi],
  methods: {
    signIn: function (user) {
      this.enabled = false
      this.apiPostToken(user, result => {
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

      this.apiDeleteToken(user, () => {
        // If it's successful, delete token, then redirect
        this.$store.dispatch('setToken', null)

        if (this.storeServerSettings.authMode === 'FULL') {
          this.$router.push({ name: 'login' })
        } else {
          this.$router.push({ name: 'home' })
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
