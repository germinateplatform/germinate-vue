<template>
  <div class="app page-login flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <SignInForm v-on:login="login" />
              </b-card-body>
            </b-card>
            <b-card no-body class="text-white bg-primary py-5">
              <b-card-body class="text-center">
                <div>
                  <h2>Sign up</h2>
                  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  <b-button variant="primary" class="active mt-3">Register Now!</b-button>
                </div>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import SignInForm from '@/components/util/SignInForm'

export default {
  name: 'Login',
  components: {
    SignInForm
  },
  methods: {
    login: function (user) {
      var vm = this

      this.apiPostToken(user, function (result) {
        vm.error = false
        // If it's successful, finally store them
        vm.$store.dispatch('ON_TOKEN_CHANGED', result)
        if (vm.originalTarget) {
          var path = vm.originalTarget.path
          vm.$store.dispatch('ON_ORIGINAL_TARGET_CHANGED', null)
          vm.$router.push(path)
        } else {
          vm.$router.push('/')
        }
      }, {
        codes: [],
        callback: function (error) {
          vm.error = true
          if (error.status === 403 || error.status === 400) {
            vm.response = vm.$t('errorMessageInvalidUsernamePassword')
          } else {
            vm.response = vm.$t('errorMessageServerUnavailable')
          }
          // If they're wrong, remove
          vm.$store.dispatch('ON_TOKEN_CHANGED', null)
        }
      })
    }
  }
}
</script>

<style scoped>
.page-login {
  min-height: calc(100vh - 105px);
}
</style>
