<template>
  <v-form @submit.prevent="login">

    <div class="text-heading-1 text-medium-emphasis">{{ $t('widgetSignInTitle') }}</div>

    <div class="text-subtitle-1 text-medium-emphasis">{{ $t('formLabelUsername') }}</div>

    <v-text-field
      density="compact"
      :label="$t('formLabelUsername')"
      prepend-inner-icon="mdi-email-outline"
      autofocus
      :readonly="loading"
      v-model="username"
    />

    <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
      {{ $t('formLabelPassword') }}
      <a
        v-if="store.storeServerSettings && store.storeServerSettings.gatekeeperUrl"
        class="text-caption text-decoration-none"
        :href="store.storeServerSettings && store.storeServerSettings.gatekeeperUrl"
        rel="noopener noreferrer"
        target="_blank"
      >
        {{ $t('widgetSignInForgotPassword') }}</a>
    </div>

    <v-text-field
      :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
      :type="visible ? 'text' : 'password'"
      density="compact"
      :label="$t('formLabelPassword')"
      v-model="password"
      prepend-inner-icon="mdi-lock-outline"
      :readonly="loading"
      @click:append-inner="visible = !visible"
    />

    <v-card
      v-if="error"
      class="mb-4"
      color="red-darken-1"
    >
      <v-card-text class="text-caption text-white">
        {{ error }}
      </v-card-text>
    </v-card>

    <v-btn
      block
      type="submit"
      :disabled="!valid || loading"
      class="mb-8"
      prepend-icon="mdi-login-variant"
      color="primary"
      size="large"
    >
      {{ $t('buttonSignIn') }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
  import { apiPostToken } from '@/plugins/api/auth'
  import type { Token } from '@/plugins/types/Token'
  import { coreStore } from '@/stores/app'
  import type { AxiosResponse } from 'axios'
  import { useI18n } from 'vue-i18n'

  import emitter from 'tiny-emitter/instance'

  const visible = ref(false)
  const username = ref('')
  const password = ref('')
  const loading = ref(false)
  const error = ref()

  const store = coreStore()
  const router = useRouter()
  const { t } = useI18n()

  const valid = computed(() => {
    return username.value && username.value.trim() !== '' && password.value && password.value.trim() !== ''
  })

  const emit = defineEmits(['close', 'set-loading'])

  watch(loading, async newValue => {
    emit('set-loading', newValue)
  })

  function login () {
    apiPostToken({
      username: username.value,
      password: password.value,
    }, (result: Token) => {
      loading.value = false

      store.setToken(result)

      router.push('/')

      username.value = ''
      password.value = ''
      error.value = null

      emit('close')

      emitter.emit('update-sidebar-menu')
    }, {
      codes: [403, 503],
      callback: (e: AxiosResponse) => {
        loading.value = false
        switch (e.status) {
          case 403: {
            error.value = t('errorLoginFourOThree')
            break
          }
          case 504: {
            error.value = t('errorLoginFiveOThree')
            break
          }
        }
      },
    })
  }
</script>
