<template>
  <div>
    <p class="text-muted" v-html="$t('widgetSignInText')" />
    <b-form @submit.prevent="login">
      <!-- Username and password input fields -->
      <b-input-group class="mb-3">
        <b-input-group-prepend is-text><i class="mdi mdi-18px mdi-account" /></b-input-group-prepend>
        <b-form-input type="text" class="form-control" :placeholder="$t('formLabelUsername')" autocomplete="username email" required autofocus v-model="user.username" />
      </b-input-group>
      <b-input-group class="mb-4">
        <b-input-group-prepend is-text><i class="mdi mdi-18px mdi-lock-outline" /></b-input-group-prepend>
        <b-form-input type="password" class="form-control" :placeholder="$t('formLabelPassword')" autocomplete="current-password" required v-model="user.password" />
      </b-input-group>
      <!-- Actions go here -->
      <b-row>
        <b-col cols="6">
          <b-button variant="primary" class="px-4" @click="login" :disabled="!enabled" type="submit"><b-spinner small type="grow" v-if="!enabled" /> {{ $t('buttonSignIn') }}</b-button>
        </b-col>
        <b-col cols="6" class="d-flex justify-content-end align-items-end flex-column" v-if="serverSettings && serverSettings.gatekeeperUrl">
          <a :href="serverSettings.gatekeeperUrl">{{ $t('widgetSignInForgotPassword') }}</a>
          <a href="#" @click.prevent="$refs.registrationModal.show()" v-if="showRegistration">{{ $t('buttonRegister') }}</a>
        </b-col>
      </b-row>
    </b-form>

    <!-- Registration modal -->
    <RegistrationModal ref="registrationModal" v-if="showRegistration" />
  </div>
</template>

<script>
import RegistrationModal from '@/components/modals/RegistrationModal'

export default {
  data: function () {
    return {
      user: {
        username: null,
        password: null
      }
    }
  },
  props: {
    enabled: {
      type: Boolean,
      default: true
    },
    showRegistration: {
      type: Boolean,
      default: false
    }
  },
  components: {
    RegistrationModal
  },
  methods: {
    login: function () {
      if (this.enabled) {
        this.$gtag.event('login', 'login')
        this.$emit('login', JSON.parse(JSON.stringify(this.user)))

        this.user = {
          username: null,
          password: null
        }
      }
    }
  }
}
</script>
