<template>
  <AppHeaderDropdown right>
    <template slot="header">
      <i class="mdi mdi-18px mdi-account" />
    </template>\
    <template slot="dropdown">
      <b-dropdown-header tag="div" class="text-center"><strong>User settings</strong></b-dropdown-header>
      <b-dropdown-item><i class="mdi mdi-18px mdi-settings text-primary" /> Settings</b-dropdown-item>
      <b-dropdown-item @click="signOut"><i class="mdi mdi-18px mdi-logout-variant text-danger" /> Logout</b-dropdown-item>
      <template v-if="token.isAdmin">
        <b-dropdown-header tag="div" class="text-center"><strong>Admin settings</strong></b-dropdown-header>
        <b-dropdown-item><i class="mdi mdi-18px mdi-shield-account text-warning" /> Admin settings</b-dropdown-item>
        <b-dropdown-item><i class="mdi mdi-18px mdi-account-key text-warning" /> User permissions</b-dropdown-item>
      </template>
    </template>
  </AppHeaderDropdown>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'
import { mapState } from 'vuex'

export default {
  name: 'UserSettingsDropdown',
  components: {
    AppHeaderDropdown
  },
  data: () => {
    return {}
  },
  computed: {
    ...mapState([
      'token'
    ])
  },
  methods: {
    signOut: function () {
      var vm = this

      var user = {
        email: this.token.username,
        password: this.token.token
      }

      this.apiDeleteToken(user, function (result) {
        console.log(result)
        // If it's successful, delete token, then redirect
        vm.$store.dispatch('ON_TOKEN_CHANGED', null)
        vm.$router.push('/g8/login')
      }, {
        codes: [],
        callback: function () {
          // If they're wrong, remove
          vm.$store.dispatch('ON_TOKEN_CHANGED', null)
        }
      })
    }
  }
}
</script>

<style>
</style>
