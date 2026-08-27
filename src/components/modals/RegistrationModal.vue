<template>
  <v-dialog v-model="dialog" fullscreen>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>{{ $t('modalTitleRegistration') }}</v-toolbar-title>
        <v-btn
          :icon="mdiClose"
          @click="dialog = false"
        />
      </v-toolbar>
      <v-card-text>
        <v-banner
          style="z-index: 2;"
          color="surface"
          bg-color="error"
          :icon="mdiAlert"
          sticky
          v-if="errorMessage"
        >
          <template #text>
            <span v-html="errorMessage" />
          </template>
        </v-banner>

        <v-stepper class="fullscreen-stepper" :items="steps" v-model="step">
          <template #item.1>
            <v-card :title="$t('widgetRegisterStepDetails')" flat>
              <template #text>
                <!-- GDPR information -->
                <div v-html="$t('widgetRegisterGdpr')" v-if="$t('widgetRegisterGdpr')" />

                <v-switch :label="$t('widgetRegisterGatekeeperAccount')" color="primary" v-model="hasGatekeeperAccount" :hint="$t('tooltipRegisterGatekeeper')" persistent-hint />

                <template v-if="hasGatekeeperAccount">
                  <v-row class="mt-5">
                    <v-col>
                      <v-text-field
                        v-model="existingUser.username"
                        :label="$t('formLabelUsername')"
                        hide-details
                        :prepend-inner-icon="mdiEmailOutline"
                      />
                    </v-col>
                    <v-col>
                      <v-text-field
                        v-model="existingUser.password"
                        :type="passwordVisible ? 'text' : 'password'"
                        :label="$t('formLabelPassword')"
                        hide-details
                        :prepend-inner-icon="mdiLockOutline"
                        :append-inner-icon="passwordVisible ? mdiEyeOff : mdiEye"
                        @click:append-inner="passwordVisible = !passwordVisible"
                      />
                    </v-col>
                  </v-row>
                </template>
                <template v-else>
                  <v-row class="mt-5">
                    <v-col>
                      <v-text-field
                        v-model="newUser.user.userFullName"
                        :error-messages="(showFormFeedback && formState.newUser.fullName === false) ? ['f'] : []"
                        :label="$t('formLabelFullName')"
                        hide-details
                        :prepend-inner-icon="mdiFormTextbox"
                      />
                    </v-col>
                    <v-col>
                      <v-text-field
                        v-model="newUser.user.userEmailAddress"
                        :error-messages="(showFormFeedback && formState.newUser.email === false) ? ['f'] : []"
                        :label="$t('formLabelEmail')"
                        hide-details
                        :prepend-inner-icon="mdiEmailOutline"
                      />
                    </v-col>
                    <v-col>
                      <v-text-field
                        v-model="newUser.user.userPassword"
                        :error-messages="(showFormFeedback && formState.newUser.password === false) ? ['f'] : []"
                        :type="passwordVisible ? 'text' : 'password'"
                        :label="$t('formLabelPassword')"
                        :prepend-inner-icon="mdiLockOutline"
                        :messages="['f']"
                        @click:append-inner="passwordVisible = !passwordVisible"
                      >
                        <template #append-inner>
                          <v-icon tabindex="-1" :icon="passwordVisible ? mdiEyeOff : mdiEye" />
                        </template>
                        <template #message>
                          <v-progress-linear
                            :chunk-count="5"
                            :model-value="passwordStrength.score + 1"
                            :max="5"
                            :color="passwordStrengthColor[passwordStrength.score]"
                          />
                        </template>
                      </v-text-field>
                    </v-col>
                    <v-col>
                      <v-text-field
                        v-model="passwordConfirm"
                        :type="passwordVisible ? 'text' : 'password'"
                        :label="$t('formLabelPasswordConfirm')"
                        hide-details
                        :error-messages="(showFormFeedback && formState.newUser.passwordConfirm === false) ? ['f'] : []"
                        :prepend-inner-icon="mdiLockOutline"
                        @click:append-inner="passwordVisible = !passwordVisible"
                      >
                        <template #append-inner>
                          <v-icon tabindex="-1" :icon="passwordVisible ? mdiEyeOff : mdiEye" />
                        </template>
                      </v-text-field>
                    </v-col>
                    <v-col>
                      <v-autocomplete
                        v-model="newUser.user.institutionId"
                        :label="$t('formLabelInstitution')"
                        :items="institutions"
                        :error-messages="(showFormFeedback && formState.newUser.institution === false) ? ['f'] : []"
                        item-value="id"
                        autocomplete="off"
                        :messages="['f']"
                        clearable
                        :item-title="item => `${item.acronym} | ${item.name}`"
                        :prepend-inner-icon="mdiHomeCity"
                      >
                        <template #message>
                          <a href="#" @click.prevent="institutionModal?.show()">{{ $t('widgetRegisterInstitutionText') }}</a>
                        </template>
                      </v-autocomplete>
                    </v-col>
                  </v-row>
                </template>
              </template>

              <div v-if="showFormFeedback">
                <template v-if="hasGatekeeperAccount">
                  <v-list slim density="compact">
                    <v-list-item :title="$t('formLabelUsername')" :prepend-icon="formState.existingUser.username ? mdiCheck : mdiClose" :base-color="formState.existingUser.username ? 'success' : 'error'" />
                    <v-list-item :title="$t('formLabelPassword')" :prepend-icon="formState.existingUser.password ? mdiCheck : mdiClose" :base-color="formState.existingUser.password ? 'success' : 'error'" />
                  </v-list>
                </template>
                <template v-else>
                  <v-list slim density="compact">
                    <v-list-item :title="$t('formLabelFullName')" :prepend-icon="formState.newUser.fullName ? mdiCheck : mdiClose" :base-color="formState.newUser.fullName ? 'success' : 'error'" />
                    <v-list-item :title="$t('formLabelEmail')" :prepend-icon="formState.newUser.email ? mdiCheck : mdiClose" :base-color="formState.newUser.email ? 'success' : 'error'" />
                    <v-list-item :title="$t('formLabelPasswordStrength')" :prepend-icon="formState.newUser.password ? mdiCheck : mdiClose" :base-color="formState.newUser.password ? 'success' : 'error'" />
                    <v-list-item :title="$t('formLabelPasswordConfirm')" :prepend-icon="formState.newUser.passwordConfirm ? mdiCheck : mdiClose" :base-color="formState.newUser.passwordConfirm ? 'success' : 'error'" />
                    <v-list-item :title="$t('formLabelInstitution')" :prepend-icon="formState.newUser.institution ? mdiCheck : mdiClose" :base-color="formState.newUser.institution ? 'success' : 'error'" />
                  </v-list>
                </template>
              </div>
            </v-card>
          </template>

          <template #item.2>
            <v-card class="h-100" :title="t('widgetRegisterStepTerms')" flat>
              <template #text><span v-html="$t('widgetRegisterDisclaimer')" /></template>

              <template #actions>
                <v-spacer />
                <v-btn
                  :text="$t('buttonAccept')"
                  :variant="disclaimerAccepted ? 'flat' : 'tonal'"
                  :color="disclaimerAccepted ? 'success' : 'default'"
                  @click="disclaimerAccepted = !disclaimerAccepted"
                  :prepend-icon="disclaimerAccepted ? mdiCheckboxMarked : mdiCheckboxBlankOutline"
                />
              </template>
            </v-card>
          </template>

          <template #actions="{ next, prev }">
            <v-card-actions>
              <v-btn @click="prev" :disabled="step === 1" :text="$t('buttonBack')" />
              <v-spacer />

              <v-btn
                :text="step === steps.length ? $t('buttonRegister') : $t('buttonNext')"
                color="primary"
                variant="flat"
                @click="checkForm(next)"
                :disabled="!canContinue && step !== 1"
              />
            </v-card-actions>
          </template>
        </v-stepper>
      </v-card-text>
    </v-card>

    <!-- @vue-generic {import('@/plugins/types/germinate').NewUnapprovedUser} -->
    <GenericAddEditFormModal
      title="modalTitleInstitution"
      v-model="newUser.user"
      :fields="institutionFields"
      :notify="setInstitution"
      ref="institutionModal"
    />
  </v-dialog>
</template>

<script setup lang="ts">
  import type { GatekeeperInstitution, NewUnapprovedUser, NewUnapprovedUserRequest, NewUserAccessRequest } from '@/plugins/types/germinate'
  import { coreStore } from '@/stores/app'
  import { mdiAlert, mdiCheck, mdiCheckboxBlankOutline, mdiCheckboxMarked, mdiClose, mdiEmailOutline, mdiEye, mdiEyeOff, mdiFormTextbox, mdiHomeCity, mdiLockOutline } from '@mdi/js'
  import { useI18n } from 'vue-i18n'
  import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
  import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
  import { gatekeeperErrors, handleError, MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { isSet } from '@/plugins/util'

  import emitter from 'tiny-emitter/instance'
  import type { AxiosError, AxiosResponse } from 'axios'
  import { apiGetGatekeeperInstitutions, apiPostGatekeeperExisting, apiPostGatekeeperNew } from '@/plugins/api/gatekeeper'

  zxcvbnOptions.setOptions({
    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
    },
  })

  const store = coreStore()

  const passwordStrengthColor = shallowRef<{ [index: number]: string }>({
    0: 'error',
    1: '#e74c3c',
    2: 'warning',
    3: 'success',
    4: 'success',
  })

  const institutionModal = useTemplateRef('institutionModal')
  const showFormFeedback = ref(false)
  const dialog = ref(false)
  const step = ref(1)
  const disclaimerAccepted = ref(false)
  const hasGatekeeperAccount = ref(false)
  const passwordVisible = ref(false)
  const passwordConfirm = ref<string>()
  const errorMessage = ref<string>()
  const institutions = ref<GatekeeperInstitution[]>([])
  const newUser = ref<NewUnapprovedUserRequest>({
    locale: store.storeLocale,
    user: {
      locale: store.storeLocale,
      userFullName: undefined,
      userEmailAddress: undefined,
      userPassword: undefined,
      institutionId: undefined,
      institutionName: undefined,
      institutionAcronym: undefined,
      institutionAddress: undefined,
    },
  })
  const existingUser = ref<NewUserAccessRequest>({
    locale: store.storeLocale,
    username: undefined,
    password: undefined,
  })

  const passwordStrength = computed(() => zxcvbn(newUser.value.user.userPassword || ''))

  const { t, te } = useI18n()

  const institutionFields = computed(() => {
    return [{
      key: 'institutionName',
      title: 'formLabelInstitutionName',
      type: 'text' as const,
      required: true,
      width: 1,
      valid: (value: string) => value !== undefined && value !== null && value.trim().length > 0,
    }, {
      key: 'institutionAcronym',
      title: 'formLabelInstitutionAcronym',
      type: 'text' as const,
      required: true,
      width: 1,
      valid: (value: string) => value !== undefined && value !== null && value.trim().length > 0,
    }, {
      key: 'institutionAddress',
      title: 'formLabelInstitutionAddress',
      type: 'text' as const,
      required: false,
      width: 1,
    }]
  })

  const steps = computed(() => {
    const result = [t('widgetRegisterStepDetails')]

    if (te('widgetRegisterDisclaimer') && t('widgetRegisterDisclaimer').length > 0) {
      result.push(t('widgetRegisterStepTerms'))
    }

    return result
  })

  function setInstitution (data: NewUnapprovedUser) {
    return new Promise<boolean>(resolve => {
      newUser.value.user.institutionId = -institutions.value.length
      newUser.value.user.institutionName = data.institutionName
      newUser.value.user.institutionAcronym = data.institutionAcronym
      newUser.value.user.institutionAddress = data.institutionAddress

      institutions.value.push({
        id: -institutions.value.length,
        name: data.institutionName || '',
        acronym: data.institutionAcronym || '',
        address: data.institutionAddress || '',
      })

      institutions.value.sort((a, b) => a.name.localeCompare(b.name))

      resolve(true)
    })
  }

  function checkForm (nextCallback: () => void) {
    showFormFeedback.value = true

    if (canContinue.value) {
      if (step.value === steps.value.length) {
        onSubmit()
      } else {
        nextCallback()
      }
    }
  }

  function show () {
    reset()

    apiGetGatekeeperInstitutions({ page: 1, limit: MAX_JAVA_INTEGER }, result => {
      if (result && result.data) {
        result.data.sort((a, b) => a.name.localeCompare(b.name))

        institutions.value = result.data
      }
    })

    dialog.value = true
  }
  function hide () {
    dialog.value = false

    reset()
  }

  function reset () {
    showFormFeedback.value = false
    dialog.value = false
    step.value = 1
    disclaimerAccepted.value = false
    hasGatekeeperAccount.value = false
    passwordVisible.value = false
    passwordConfirm.value = undefined
    errorMessage.value = undefined
    newUser.value = {
      locale: store.storeLocale,
      user: {
        locale: store.storeLocale,
        userFullName: undefined,
        userEmailAddress: undefined,
        userPassword: undefined,
        institutionId: undefined,
        institutionName: undefined,
        institutionAcronym: undefined,
        institutionAddress: undefined,
      },
    }
    existingUser.value = {
      locale: store.storeLocale,
      username: undefined,
      password: undefined,
    }
  }

  watch(step, async () => {
    passwordVisible.value = false
  })
  watch(hasGatekeeperAccount, async () => {
    showFormFeedback.value = false
  })

  const formState = computed(() => {
    const nu = newUser.value.user
    return {
      existingUser: {
        username: isSet(existingUser.value.username),
        password: isSet(existingUser.value.password),
      },
      newUser: {
        email: isSet(nu.userEmailAddress),
        fullName: isSet(nu.userFullName),
        password: isSet(nu.userPassword) && passwordStrength.value.score >= 3,
        passwordConfirm: isSet(passwordConfirm.value) && nu.userPassword === passwordConfirm.value,
        institution: nu.institutionId !== undefined && nu.institutionId !== null,
      },
    }
  })

  const canContinue = computed(() => {
    switch (step.value) {
      case 1:
        if (hasGatekeeperAccount.value) {
          return Object.values(formState.value.existingUser).every(fs => fs === true)
        } else {
          return Object.values(formState.value.newUser).every(fs => fs === true)
        }
      case 2:
        return disclaimerAccepted.value === true
    }
  })

  function onSubmit () {
    if (hasGatekeeperAccount.value) {
      // Existing user, new request
      emitter.emit('show-loading', true)
      apiPostGatekeeperExisting(existingUser.value, result => {
        if (result === true) {
          // Show toast
          emitter.emit('show-snackbar', {
            title: t('widgetRegisterToastSuccessfulExistingTitle'),
            text: t('widgetRegisterToastSuccessfulExistingText'),
            color: 'success',
            timeout: 10_000,
          })

          hide()
        } else {
          // Show error
          errorMessage.value = t('widgetRegisterUnsuccessful')
        }
      }, {
        codes: [],
        callback: (error: AxiosError) => {
          // Show error
          if (error && error.response && error.response.data && error.response.data && gatekeeperErrors[error.response.data as string]) {
            errorMessage.value = t(gatekeeperErrors[error.response.data as string])
          } else {
            errorMessage.value = (error.response?.data as string) || handleError(error)
          }
        },
      }).finally(() => emitter.emit('show-loading', false))
    } else {
      if (newUser.value.user.institutionId !== undefined && newUser.value.user.institutionId < 0) {
        newUser.value.user.institutionId = undefined
      }

      emitter.emit('show-loading', true)
      // Register the new user
      apiPostGatekeeperNew(newUser.value, result => {
        if (result === true) {
          // Show toast
          emitter.emit('show-snackbar', {
            text: t('widgetRegisterToastSuccessfulNewText'),
            title: t('widgetRegisterToastSuccessfulNewTitle'),
            color: 'success',
            timeout: 10_000,
          })
          hide()
        } else {
          // Show error message
          errorMessage.value = t('widgetRegisterUnsuccessful')
        }
      }, {
        codes: [],
        callback: (error: AxiosError) => {
          // Show error
          if (error && error.response && error.response.data && error.response.data && gatekeeperErrors[error.response.data as string]) {
            errorMessage.value = t(gatekeeperErrors[error.response.data as string])
          } else {
            errorMessage.value = (error.response?.data as string) || handleError(error)
          }
        },
      }).finally(() => emitter.emit('show-loading', false))
    }
  }

  onMounted(() => {
    apiGetGatekeeperInstitutions({ page: 1, limit: MAX_JAVA_INTEGER }, result => {
      if (result && result.data) {
        result.data.sort((a, b) => a.name.localeCompare(b.name))

        institutions.value = result.data
      }
    })
  })

  defineExpose({
    show,
    hide,
  })
</script>

<style scoped>
.fullscreen-stepper {
  min-height: 90vh;
  display: flex;
  flex-direction: column;
}
/* Deep selector to target Vuetify's internal window/content wrapper */
.fullscreen-stepper :deep(.v-stepper-window) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.fullscreen-stepper :deep(.v-stepper-window-item) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
</style>
