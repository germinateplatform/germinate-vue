<template>
  <div class="app page-login flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <b-form>
                  <h1>Login</h1>
                  <p class="text-muted">Sign In to your account</p>
                  <b-input-group class="mb-3">
                    <b-input-group-prepend><b-input-group-text><i class="icon-user"></i></b-input-group-text></b-input-group-prepend>
                    <b-form-input type="text" class="form-control" :placeholder="$t('formLabelUsername')" autocomplete="username email" required autofocus v-model="user.username" />
                  </b-input-group>
                  <b-input-group class="mb-4">
                    <b-input-group-prepend><b-input-group-text><i class="icon-lock"></i></b-input-group-text></b-input-group-prepend>
                    <b-form-input type="password" class="form-control" :placeholder="$t('formLabelPassword')" autocomplete="current-password" required v-model="user.password" />
                  </b-input-group>
                  <b-row>
                    <b-col cols="6">
                      <b-button variant="primary" class="px-4" @click="login">Login</b-button>
                    </b-col>
                    <b-col cols="6" class="text-right">
                      <b-button variant="link" class="px-0">Forgot password?</b-button>
                    </b-col>
                  </b-row>
                </b-form>
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
export default {
  name: 'Login',
  data: function () {
    return {
      user: {
        username: null,
        password: null
      }
    }
  },
  methods: {
    login: function () {
      var vm = this

      this.apiPostToken(this.user, function (result) {
        vm.error = false
        // If it's successful, finally store them
        vm.$store.dispatch('ON_TOKEN_CHANGED', result)
        vm.$router.push('/')
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
