<template>
  <AppHeaderDropdown right>
    <template slot="header">
      <i class="mdi mdi-18px mdi-account" />
    </template>
    <template slot="dropdown">
      <b-dropdown-header tag="div" class="text-center"><strong>User settings</strong></b-dropdown-header>
      <b-dropdown-item><i class="mdi mdi-18px mdi-settings text-primary" /> Settings</b-dropdown-item>
      <template v-if="serverSettings.authMode !== 'NONE'">
        <b-dropdown-item @click="signOut" v-if="token && token.token"><i class="mdi mdi-18px mdi-logout-variant text-danger" /> Logout</b-dropdown-item>
        <b-dropdown-item @click="$refs.signInModal.show()" v-else><i class="mdi mdi-18px mdi-login-variant text-danger" /> Login</b-dropdown-item>
      </template>
      <template v-if="serverSettings.authMode !== 'NONE' && token && token.userType === 'Administrator'">
        <b-dropdown-header tag="div" class="text-center"><strong>Admin settings</strong></b-dropdown-header>
        <b-dropdown-item><i class="mdi mdi-18px mdi-shield-account text-warning" /> Admin settings</b-dropdown-item>
        <b-dropdown-item :to="{ name: 'user-permissions' }"><i class="mdi mdi-18px mdi-account-key text-warning" /> User permissions</b-dropdown-item>
        <b-dropdown-item to="/import/data-upload"><i class="mdi mdi-18px mdi-upload text-warning" /> Data uploader</b-dropdown-item>
      </template>
    </template>
    <b-modal ref="signInModal" :title="$t('widgetSignInTitle')" hide-footer>
      <SignInForm v-on:login="signIn" :enabled="enabled" />
      <p class="text-danger mt-3" v-if="response">{{ response }}</p>
    </b-modal>
  </AppHeaderDropdown>
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
          this.$router.push('/g8/login')
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
    }
  },
  mounted: function () {
    EventBus.$on('on-show-login-form', () => this.$refs.signInModal.show())
  }
}
</script>

<style>
</style>
