<template>
  <div class="app page-login flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <h2>{{ $t('widgetSignInTitle') }}</h2>
                <SignInForm v-on:login="login" :enabled="enabled"/>
                <p class="text-danger mt-3" v-if="response">{{ response }}</p>
              </b-card-body>
            </b-card>
            <b-card no-body class="text-white bg-primary py-5" v-if="serverSettings && serverSettings.registrationEnabled">
              <b-card-body class="text-center">
                <div>
                  <h2>{{ $t('widgetRegisterTitle') }}</h2>
                  <p>{{ $t('widgetRegisterText') }}</p>
                  <b-button variant="primary" class="active mt-3" @click="$refs.registrationModal.show()">{{ $t('buttonRegister') }}</b-button>
                </div>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
    </div>
    <RegistrationModal ref="registrationModal"/>
  </div>
</template>

<script>
import SignInForm from '@/components/util/SignInForm'
import RegistrationModal from '@/components/modals/RegistrationModal'

export default {
  name: 'Login',
  data: function () {
    return {
      response: null,
      enabled: true
    }
  },
  components: {
    RegistrationModal,
    SignInForm
  },
  methods: {
    login: function (user) {
      this.enabled = false
      this.apiPostToken(user, result => {
        this.error = false
        this.enabled = true
        // If it's successful, finally store them
        this.$store.dispatch('ON_TOKEN_CHANGED', result)
        if (this.originalTarget) {
          var path = this.originalTarget.path
          this.$store.dispatch('ON_ORIGINAL_TARGET_CHANGED', null)
          this.$router.push(path)
        } else {
          this.$router.push('/')
        }
      }, {
        codes: [],
        callback: function (error) {
          this.error = true
          if (error.status === 403 || error.status === 400) {
            this.response = this.$t('errorMessageInvalidUsernamePassword')
          } else {
            this.response = this.$t('errorMessageServerUnavailable')
          }
          this.enabled = true
          // If they're wrong, remove
          this.$store.dispatch('ON_TOKEN_CHANGED', null)
        }
      })
    }
  }
}
</script>

<style scoped>
.page-login {
  min-height: calc(100vh - 255px);
}
</style>
