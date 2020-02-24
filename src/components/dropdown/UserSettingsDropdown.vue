<template>
  <div>
    <AppHeaderDropdown right v-if="serverSettings.authMode !== 'NONE'" class="d-flex align-self-center">
      <template slot="header">
        <i class="mdi mdi-18px mdi-account" />
      </template>
      <template slot="dropdown">
        <template v-if="token && token.userType === 'Administrator'">
          <b-dropdown-header tag="div" class="text-center"><strong>{{ $t('dropdownUserSettingsAdvancedSettings') }}</strong></b-dropdown-header>
          <b-dropdown-item :to="{ name: 'user-permissions' }"><i class="mdi mdi-18px mdi-account-key text-warning" /> {{ $t('dropdownUserSettingsUserPermissions') }}</b-dropdown-item>
          <b-dropdown-item :to="{ name: 'import-upload' }"><i class="mdi mdi-18px mdi-upload text-warning" /> {{ $t('dropdownUserSettingsDataUpload') }}</b-dropdown-item>
        </template>
        <b-dropdown-header tag="div" class="text-center"><strong>{{ $t('dropdownUserSettings') }}</strong></b-dropdown-header>
        <b-dropdown-item @click="signOut" v-if="token && token.token"><i class="mdi mdi-18px mdi-logout-variant text-danger" /> {{ $t('dropdownUserSettingsLogout') }}</b-dropdown-item>
        <b-dropdown-item @click="showLogin" v-else><i class="mdi mdi-18px mdi-login-variant text-danger" /> {{ $t('dropdownUserSettingsLogin') }}</b-dropdown-item>
      </template>
    </AppHeaderDropdown>
    <b-modal ref="signInModal" :title="$t('widgetSignInTitle')" hide-footer>
      <SignInForm v-on:login="signIn" :enabled="enabled" />
      <p class="text-danger mt-3" v-if="response">{{ response }}</p>
    </b-modal>
  </div>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'
import { EventBus } from '@/plugins/event-bus.js'
import SignInForm from '@/components/util/SignInForm'
import authApi from '@/mixins/api/auth.js'

export default {
  name: 'UserSettingsDropdown',
  components: {
    AppHeaderDropdown,
    SignInForm
  },
  data: () => {
    return {
      response: null,
      enabled: true
    }
  },
  mixins: [ authApi ],
  methods: {
    signIn: function (user) {
      this.enabled = false
      this.apiPostToken(user, result => {
        // If it's successful, finally store them
        this.enabled = true
        this.$store.dispatch('ON_TOKEN_CHANGED', result)
        this.$refs.signInModal.hide()
      }, {
        codes: [],
        callback: error => {
          this.enabled = true
          if (error.status === 403 || error.status === 400) {
            this.response = this.$t('errorMessageInvalidUsernamePassword')
          } else {
            this.response = this.$t('errorMessageServerUnavailable')
          }
          // If they're wrong, remove
          this.$store.dispatch('ON_TOKEN_CHANGED', null)
        }
      })
    },
    signOut: function () {
      var user = {
        email: this.token.username,
        password: this.token.token
      }

      var vm = this
      this.apiDeleteToken(user, result => {
        // If it's successful, delete token, then redirect
        this.$store.dispatch('ON_TOKEN_CHANGED', null)

        if (this.serverSettings.authMode === 'FULL') {
          this.$router.push({ name: 'login' })
        } else {
          this.$router.push('/home')
        }
      }, {
        codes: [],
        callback: function () {
          // If they're wrong, remove
          vm.$store.dispatch('ON_TOKEN_CHANGED', null)
        }
      })
    },
    showLogin: function () {
      console.log(this.$refs)
      this.$nextTick(() => this.$refs.signInModal.show())
    }
  },
  mounted: function () {
    EventBus.$on('on-show-login-form', () => {
      this.showLogin()
    })
  }
}
</script>

<style>
</style>
