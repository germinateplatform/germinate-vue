<template>
  <div>
    <div class="screenshot-button">
      <b-button class="btn-circle" variant="primary" @click.prevent.stop="takeScreenshot" v-b-tooltip.left="$t('tooltipFeedbackButton')"><MdiIcon :path="mdiCommentQuoteOutline" /></b-button>
    </div>
    <ScreenshotComponent ref="screenshot" @screenshot-taken="handleScreenshot" />

    <b-modal ref="feedbackModal" :title="$t('modalTitleUserFeedback')" size="lg" @ok.prevent="onSubmit" @shown="onShown" :cancel-title="$t('buttonCancel')" :ok-title="$t('buttonSubmit')" no-close-on-backdrop no-close-on-esc>
      <p>{{ $t('modalTextUserFeedback') }}</p>

      <b-img fluid-grow :src="imageData" />

      <b-form @submit.prevent="onSubmit" class="mt-3">
        <b-form-group :label="$t('formLabelFeedbackType')" label-for="feedbackType">
          <b-button-group class="flex-wrap">
            <b-button v-for="type in userFeedbackTypes" :key="`feeback-type-${type.id}`" variant="outline-secondary" class="text-dark" :pressed="feedbackType === type.id" @click="feedbackType = type.id">
              <MdiIcon :path="type.path" :color="type.color()" /> {{ type.text() }}
            </b-button>
          </b-button-group>
        </b-form-group>

        <b-form-group :label="$t('formLabelFeedbackSeverity')" label-for="severity">
          <b-button-group class="flex-wrap">
            <b-button v-for="severityType in severityTypes" :key="`severity-type-${severityType.id}`" variant="outline-secondary" class="text-dark" :pressed="severity === severityType.id" @click="severity = severityType.id">
              <MdiIcon :path="severityType.path" :className="severityType.color" /> {{ severityType.text() }}
            </b-button>
          </b-button-group>
        </b-form-group>

        <b-form-group :label="$t('formLabelFeedbackEmail')" label-for="contactEmail">
          <b-form-input id="contactEmail" type="email" v-model="contactEmail" required />
        </b-form-group>

        <b-form-group :label="$t('formLabelFeedbackContent')" label-for="content">
          <b-form-textarea id="content" v-model="content" required />
        </b-form-group>

        <b-form-group label-for="captcha" :description="$t('formDescriptionFeedbackCaptcha')">
          <template #label>
            {{ $t('formLabelFeedbackCaptcha') }} <b-button variant="link" size="sm" @click="getNewCaptcha"><MdiIcon :path="mdiAutorenew" /></b-button>
          </template>
          <div class="text-center mb-3">
            <b-img fluid :src="captchaUrl" />
          </div>
          <b-form-input id="captcha" v-model="captcha" required />
        </b-form-group>

        <p class="text-danger" v-if="formFeedback">{{ formFeedback }}</p>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { mdiCommentQuoteOutline, mdiAutorenew } from '@mdi/js'
import ScreenshotComponent from '@/components/util/ScreenshotComponent'
import MdiIcon from '@/components/icons/MdiIcon'
import { uuidv4, dataURLtoFile } from '@/mixins/util'
import { apiPostFeedbackUpload } from '@/mixins/api/misc'
import { userFeedbackSeverityTypes, userFeedbackTypes } from '@/mixins/types'

export default {
  components: {
    MdiIcon,
    ScreenshotComponent
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl'
    ]),
    severityTypes: function () {
      return [
        userFeedbackSeverityTypes.low,
        userFeedbackSeverityTypes.medium,
        userFeedbackSeverityTypes.high
      ]
    },
    captchaUrl: function () {
      return `${this.storeBaseUrl}feedback/${this.uuid}`
    }
  },
  data: function () {
    return {
      userFeedbackTypes,
      mdiCommentQuoteOutline,
      mdiAutorenew,
      imageData: null,
      contactEmail: null,
      severity: 'medium',
      feedbackType: 'general',
      captcha: null,
      content: null,
      uuid: null,
      formFeedback: null
    }
  },
  methods: {
    onSubmit: function () {
      if (!this.captcha || !this.content || !this.imageData || !this.severity || !this.feedbackType || !this.contactEmail) {
        this.formFeedback = this.$t('formErrorUserFeedbackIncorrectForm')
        return
      }

      const formData = new FormData()
      if (this.captcha) {
        formData.append('captcha', this.captcha)
      }
      if (this.content) {
        formData.append('content', this.content)
      }
      if (dataURLtoFile(this.imageData)) {
        formData.append('image', dataURLtoFile(this.imageData))
      }
      if (window.location.href) {
        formData.append('pageUrl', window.location.href)
      }
      if (this.severity) {
        formData.append('severity', this.severity)
      }
      if (this.feedbackType) {
        formData.append('feedbackType', this.feedbackType)
      }
      if (this.contactEmail) {
        formData.append('contactEmail', this.contactEmail)
      }

      apiPostFeedbackUpload(formData, this.uuid, () => {
        this.$refs.feedbackModal.hide()
        this.$bvToast.toast(this.$t('toastUserFeedbackSuccessText'), {
          title: this.$t('toastUserFeedbackSuccessTitle'),
          variant: 'success',
          autoHideDelay: 10000,
          appendToast: true
        })

        // At the end, reset everything
        this.contactEmail = null
        this.content = null
        this.captcha = null
        this.severity = 'medium'
        this.feedbackType = 'general'
        this.formFeedback = null
        this.imageData = null
      }, {
        codes: [404, 400],
        callback: (e) => {
          if (e.status === 404) {
            this.formFeedback = this.$t('formErrorUserFeedbackIncorrectCaptcha')
          } else if (e.status === 400) {
            this.formFeedback = this.$t('formErrorUserFeedbackIncorrectForm')
          } else {
            this.formFeedback = e.data
          }
        }
      })
    },
    onShown: function () {
      this.contactEmail = null
      this.content = null
      this.captcha = null
      this.severity = 'medium'
      this.feedbackType = 'general'
      this.formFeedback = null
      this.uuid = uuidv4()
    },
    getNewCaptcha: function () {
      this.uuid = uuidv4()
    },
    takeScreenshot: function () {
      this.$refs.screenshot.takeScreenshot()
    },
    handleScreenshot: function (imageData) {
      this.imageData = imageData

      this.$refs.feedbackModal.show()
    }
  }
}
</script>

<style scoped>
.screenshot-button {
  position: fixed;
  right: 1em;
  bottom: 3em;
  z-index: 1051;
}
.btn-circle {
  width: 50px;
  height: 50px;
  padding: 7px 10px;
  border-radius: 25px;
  text-align: center;
  transition: opacity .15s linear;
  opacity: 0.66;
}
.btn-circle:hover {
  opacity: 1;
}
</style>
