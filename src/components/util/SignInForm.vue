<template>
  <div>
    <p class="text-muted" v-html="$t('widgetSignInText')" />
    <b-form @submit.prevent="login">
      <!-- Username and password input fields -->
      <b-input-group class="mb-3">
        <b-input-group-prepend is-text><MdiIcon :path="mdiAccount" /></b-input-group-prepend>
        <b-form-input type="text" class="form-control" :placeholder="$t('formLabelUsername')" autocomplete="username email" required autofocus v-model="user.username" />
      </b-input-group>
      <b-input-group class="mb-4">
        <b-input-group-prepend is-text><MdiIcon :path="mdiLockOutline" /></b-input-group-prepend>
        <b-form-input type="password" class="form-control" :placeholder="$t('formLabelPassword')" autocomplete="current-password" required v-model="user.password" />
      </b-input-group>
      <!-- Actions go here -->
      <b-row>
        <b-col cols="6">
          <b-button variant="primary" class="px-4" @click="login" :disabled="!enabled" type="submit"><b-spinner small type="grow" v-if="!enabled" /> {{ $t('buttonSignIn') }}</b-button>
        </b-col>
        <b-col cols="6" class="d-flex justify-content-end align-items-end flex-column" v-if="storeServerSettings && storeServerSettings.gatekeeperUrl">
          <a :href="storeServerSettings.gatekeeperUrl">{{ $t('widgetSignInForgotPassword') }}</a>
          <a href="#" @click.prevent="$refs.registrationModal.show()" v-if="showRegistration">{{ $t('buttonRegister') }}</a>
        </b-col>
      </b-row>
    </b-form>

    <!-- Registration modal -->
    <RegistrationModal ref="registrationModal" v-if="showRegistration" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'
import RegistrationModal from '@/components/modals/RegistrationModal'

import { mdiAccount, mdiLockOutline } from '@mdi/js'

export default {
  data: function () {
    return {
      mdiAccount,
      mdiLockOutline,
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
    MdiIcon,
    RegistrationModal
  },
  computed: {
    ...mapGetters([
      'storeServerSettings'
    ])
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
