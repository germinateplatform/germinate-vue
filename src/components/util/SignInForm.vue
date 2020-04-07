<template>
  <b-form>
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
        <b-col cols="6" class="text-right">
          <b-button variant="link" class="px-0">{{ $t('widgetSignInForgotPassword') }}</b-button>
        </b-col>
      </b-row>
    </b-form>
  </b-form>
</template>

<script>
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
    }
  },
  methods: {
    login: function () {
      if (this.enabled) {
        this.$ga.event('login', 'login')
        this.$emit('login', this.user)
      }
    }
  }
}
</script>
