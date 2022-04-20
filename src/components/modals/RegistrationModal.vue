<template>
  <div>
    <b-modal size="lg"
            :title="$t('modalTitleRegistration')"
            :cancel-title="$t('buttonBack')"
            :ok-title="currentStep === registrationSteps.length - 1 ? $t('buttonRegister') : $t('buttonNext')"
            :ok-disabled="!canGoNext"
            :ok-only="currentStep === 0"
            @ok.prevent="next"
            @cancel.prevent="prev"
            ref="registrationModal">
      <!-- Registration step indicator -->
      <b-button-group
        class="registration-steps mb-4">
        <b-button v-for="step in registrationSteps" :key="`registration-step-${step.value}`" :variant="step.value === currentStep ? 'primary' : 'secondary'">
          {{ step.text() }}
        </b-button>
      </b-button-group>
      <div v-if="currentStep === 0">
        <!-- Registration disclaimer -->
        <blockquote class="blockquote p-2">
          <div v-html="$t('widgetRegisterDisclaimer')" v-if="$t('widgetRegisterDisclaimer')" />
        </blockquote>

        <b-form-checkbox v-model="disclaimerAccepted" switch>
          {{ $t('widgetRegisterDisclaimerAccept') }}
        </b-form-checkbox>
      </div>
      <div v-else-if="currentStep === 1">
        <!-- GDPR information -->
        <div v-html="$t('widgetRegisterGdpr')" v-if="$t('widgetRegisterGdpr')"/>
        <hr />
        <b-form-checkbox v-model="hasGatekeeper" switch>
          {{ $t('widgetRegisterGatekeeperAccount') }} <span v-b-tooltip.hover :title="$t('tooltipRegisterGatekeeper')"><MdiIcon :path="mdiHelpCircle" /></span>
        </b-form-checkbox>

        <!-- Registration form -->
        <b-form @submit.prevent.stop="register" class="mt-3" :validated="formValidated">
          <template v-if="hasGatekeeper">
            <div class="mb-3">{{ $t('widgetRegisterExistingAccountText') }}</div>
            <b-form-group
              :label="$t('formLabelUsername')"
              label-for="username">
              <b-form-input id="username" name="username" autocomplete="username" @blur="validateForm" :state="formState.userEmailAddress" v-model="user.userUsername" type="text" trim required />
            </b-form-group>
            <PasswordInput v-model="user.userPassword" @blur="validateForm" :state="formState.userPassword" :label="$t('formLabelPassword')" ref="passwordInput" />
          </template>

          <template v-else>
            <div class="mb-3">{{ $t('widgetRegisterNewAccountText') }}</div>
            <b-form-group
              :label="$t('formLabelEmail')"
              label-for="email">
              <b-form-input id="email" name="email" autocomplete="email" @blur="validateForm" :state="formState.userEmailAddress" v-model="user.userEmailAddress" type="email" trim required />
            </b-form-group>
            <PasswordInput v-model="user.userPassword" @blur="validateForm" :state="formState.userPassword" :label="$t('formLabelPassword')" ref="passwordInput" />
            <b-form-group
              :label="$t('formLabelPasswordConfirm')"
              label-for="passwordConfirm">
              <b-form-input id="passwordConfirm" name="password-confirm" @blur="validateForm" :state="formState.userPasswordConfirm" autocomplete="password-confirm" v-model="user.userPasswordConfirm" type="password" trim required />
            </b-form-group>
            <b-form-group
              :label="$t('formLabelFullName')"
              label-for="name">
              <b-form-input id="name" name="name" autocomplete="name" @blur="validateForm" :state="formState.userFullName" v-model="user.userFullName" type="text" trim required />
            </b-form-group>
            <b-form-group
              :label="$t('formLabelInstitution')"
              label-for="institution">
              <b-form-select id="institution" v-model="selectedInstitution" @blur="validateForm" :state="formState.userInstitution" :options="institutions" trim required />
              <a href="#" @click.prevent.stop slot="description" v-b-modal.institutionModal>{{ $t('widgetRegisterInstitutionText') }}</a>
            </b-form-group>
          </template>
        </b-form>
      </div>

      <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
    </b-modal>

    <!-- Institution modal -->
    <b-modal id="institutionModal"
             ok-only
             @ok="addInstitution"
             :ok-title="$t('buttonCreate')"
             :ok-disabled="!canAddInstitution()"
             :title="$t('modalTitleInstitution')">
      <b-form @submit.prevent.stop>
        <b-form-group
          :label="$t('formLabelInstitutionName')"
          label-for="institutionName">
          <b-form-input id="institutionName" v-model="tempInstitution.name" type="text" trim required />
        </b-form-group>
        <b-form-group
          :label="$t('formLabelInstitutionAcronym')"
          label-for="institutionAcronym">
          <b-form-input id="institutionAcronym" v-model="tempInstitution.acronym" type="text" trim required />
        </b-form-group>
        <b-form-group
          :label="$t('formLabelInstitutionAddress')"
          label-for="institutionAddress">
          <b-form-input id="institutionAddress" v-model="tempInstitution.address" type="text" trim />
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import PasswordInput from '@/components/util/PasswordInput'
import miscApi from '@/mixins/api/misc.js'

import { mdiHelpCircle } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      mdiHelpCircle,
      currentStep: 0,
      errorMessage: null,
      registrationSteps: [{
        text: () => this.$t('widgetRegisterStepTerms'),
        value: 0
      }, {
        text: () => this.$t('widgetRegisterStepDetails'),
        value: 1
      }],
      selectedInstitution: null,
      institutions: [],
      disclaimerAccepted: false,
      hasGatekeeper: false,
      formValidated: false,
      formState: {
        userEmailAddress: null,
        userPassword: null,
        userPasswordConfirm: null,
        userFullName: null,
        userInstitution: null
      },
      user: {
        userUsername: null,
        userPassword: null,
        userPasswordConfirm: null,
        userFullName: null,
        userEmailAddress: null
      },
      tempInstitution: {
        name: null,
        acronym: null,
        address: null
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeLocale'
    ]),
    canGoNext: function () {
      switch (this.currentStep) {
        case 0:
          return this.disclaimerAccepted
        case 1:
          if (this.hasGatekeeper) {
            return this.user.userUsername && this.user.userPassword
          } else {
            return this.user.userPassword &&
              this.user.userPasswordConfirm &&
              this.user.userPassword === this.user.userPasswordConfirm &&
              this.user.userFullName &&
              this.user.userEmailAddress &&
              this.selectedInstitution !== null &&
              this.$refs.passwordInput.getScore() >= 2
          }
      }

      return false
    }
  },
  components: {
    MdiIcon,
    PasswordInput
  },
  mixins: [miscApi],
  methods: {
    validateForm: function () {
      this.formValidated = true

      if (this.hasGatekeeper) {
        this.formState.userEmailAddress = this.user.userUsername !== null
        this.formState.userPassword = this.user.userPassword !== null
      } else {
        this.formState.userEmailAddress = this.user.userEmailAddress !== null
        this.formState.userPassword = this.user.userPassword !== null
        this.formState.userPasswordConfirm = this.user.userPasswordConfirm !== null && (this.user.userPassword === this.user.userPasswordConfirm)
        this.formState.userFullName = this.user.userFullName !== null
        this.formState.userInstitution = this.selectedInstitution !== null
      }
    },
    register: function () {
      if (!this.hasGatekeeper) {
        this.errorMessage = null
        this.user.userUsername = this.user.userEmailAddress

        // If the institution doesn't exist (no id), set information
        if (!this.selectedInstitution.id) {
          delete this.user.institutionId
          this.user.institutionName = this.selectedInstitution.name
          this.user.institutionAcronym = this.selectedInstitution.acronym
          this.user.institutionAddress = this.selectedInstitution.address
        } else {
          this.user.institutionId = this.selectedInstitution.id
          delete this.user.institutionName
          delete this.user.institutionAcronym
          delete this.user.institutionAddress
        }

        const newRequest = {
          locale: this.storeLocale,
          user: this.user
        }

        delete newRequest.user.userPasswordConfirm

        emitter.emit('show-loading', true)
        // Register the new user
        this.apiPostGatekeeperNew(newRequest, result => {
          emitter.emit('show-loading', false)

          if (result === true) {
            // Show toast
            this.$bvToast.toast(this.$t('widgetRegisterToastSuccessfulNewText'), {
              title: this.$t('widgetRegisterToastSuccessfulNewTitle'),
              variant: 'success',
              autoHideDelay: 10000,
              appendToast: true
            })
            this.hide()
          } else {
            // Show error message
            this.errorMessage = this.$t('widgetRegisterUnsuccessful')
          }
        }).catch(error => {
          // Show error message
          if (error && error.response && error.response.data && error.response.data.reasonPhrase && this.gatekeeperErrors[error.response.data.reasonPhrase]) {
            this.errorMessage = this.$t(this.gatekeeperErrors[error.response.data.reasonPhrase])
            emitter.emit('show-loading', false)
          }
        })
      } else {
        // Existing user, new request
        const existingRequest = {
          locale: this.storeLocale,
          username: this.user.userUsername,
          password: this.user.userPassword
        }

        emitter.emit('show-loading', true)
        this.apiPostGatekeeperExisting(existingRequest, result => {
          emitter.emit('show-loading', false)

          if (result === true) {
            // Show toast
            this.$bvToast.toast(this.$t('widgetRegisterToastSuccessfulExistingText'), {
              title: this.$t('widgetRegisterToastSuccessfulExistingTitle'),
              variant: 'success',
              autoHideDelay: 10000,
              appendToast: true
            })
            this.hide()
          } else {
            // Show error
            this.errorMessage = this.$t('widgetRegisterUnsuccessful')
          }
        }).catch(error => {
          // Show error
          if (error && error.response && error.response.data && error.response.data.reasonPhrase && this.gatekeeperErrors[error.response.data.reasonPhrase]) {
            this.errorMessage = this.$t(this.gatekeeperErrors[error.response.data.reasonPhrase])
            emitter.emit('show-loading', false)
          }
        })
      }
    },
    addInstitution: function () {
      this.selectedInstitution = this.tempInstitution
      delete this.selectedInstitution.id
      this.tempInstitution = {
        name: null,
        acronym: null,
        address: null
      }
      this.institutions.push({
        text: this.selectedInstitution.acronym + ' - ' + this.selectedInstitution.name,
        value: this.selectedInstitution
      })
    },
    canAddInstitution: function () {
      return this.tempInstitution.name && this.tempInstitution.acronym
    },
    prev: function () {
      this.currentStep = Math.max(0, this.currentStep - 1)
    },
    next: function () {
      if (this.currentStep === this.registrationSteps.length - 1) {
        this.register()
      } else {
        this.currentStep = Math.min(this.registrationSteps.length - 1, this.currentStep + 1)
      }
    },
    show: function () {
      this.$refs.registrationModal.show()
    },
    hide: function () {
      this.$refs.registrationModal.hide()
    }
  },
  mounted: function () {
    const query = {
      page: 1,
      limit: this.MAX_JAVA_INTEGER
    }
    // Get all existing institutions
    this.apiGetGatekeeperInstitutions(query, result => {
      if (result && result.data) {
        const tempInst = []

        result.data.forEach(i => tempInst.push({
          value: i,
          text: i.acronym + ' - ' + i.name
        }))

        this.institutions = tempInst

        if (this.institutions.length > 0) {
          this.selectedInstitution = this.institutions[0].value
        }
      }
    }, {
      codes: [503],
      callback: function () {
        // Ignore this, it means registration isn't available.
      }
    })
  }
}
</script>

<style scoped>
.registration-steps {
  width: 100%;
}
.registration-steps .btn {
  pointer-events: none;
}
.blockquote {
  max-height: 50vh;
  overflow-y: auto;
  border: 1px solid var(--gray);
  border-radius: 5px;
}
</style>
