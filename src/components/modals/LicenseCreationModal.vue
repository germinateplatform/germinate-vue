<template>
  <b-modal ref="licenseCreationModal" scrollable :title="$t('modalTitleLicenseCreation')" size="xl" @ok.prevent="handleOk">
    <b-tabs>
      <b-tab v-for="locale in locales" :key="`locale-tab-${locale.locale}`">
        <template #title>
          <i :class="'fi fi-' + locale.flag"/> <span>{{ locale.name || locale.locale }}</span>
        </template>
        <b-form @submit.prevent class="mt-3" :validated="formFeedback.name !== null">
          <b-form-group :label-for="`license-name-${locale.locale}`" :label="$t('formLabelLicenseName')">
            <b-input v-model="licenseName" :id="`license-name-${locale.locale}`" required :state="formFeedback.name" />
          </b-form-group>
          <b-form-group :label-for="`license-description-${locale.locale}`" :label="$t('formLabelLicenseDescription')">
            <b-input v-model="licenseDescription" :id="`license-description-${locale.locale}`" />
          </b-form-group>
          <b-form-group :label-for="`license-content-${locale.locale}`" :label="$t('formLabelLicenseContent')">
            <b-row>
              <b-col cols=12 md=6>
                <b-form-textarea :id="`license-content-${locale.locale}`" @scroll="handleScroll(locale.locale)" v-model="licenseData[locale.locale]" class="h-100 license-modal-height" :placeholder="$t('formPlaceholderLicenseHtml')" :ref="`ta-${locale.locale}`" />
              </b-col>
              <b-col cols=12 md=6>
                <div v-html="licenseData[locale.locale] || $t('formPlaceholderLicenseHtmlPreview')" class="license-modal-height" :ref="`div-${locale.locale}`" />
              </b-col>
            </b-row>
          </b-form-group>
        </b-form>
      </b-tab>
    </b-tabs>
  </b-modal>
</template>

<script>
import Vue from 'vue'
import { apiGetLocales } from '@/mixins/api/misc'
import { apiPatchLicense, apiPutLicense } from '@/mixins/api/dataset'

export default {
  props: {
    license: {
      type: Object,
      default: null
    }
  },
  data: function () {
    return {
      licenseName: null,
      licenseDescription: null,
      licenseData: {},
      locales: [],
      formFeedback: {
        name: null
      }
    }
  },
  methods: {
    show: function () {
      this.licenseName = this.license ? this.license.licenseName : null
      this.licenseDescription = this.license ? this.license.licenseDescription : null
      this.licenseData = {}

      if (!this.locales || this.locales.length < 1) {
        apiGetLocales(result => {
          this.locales = result

          this.prepareLocalesThenShow()
        })
      } else {
        this.prepareLocalesThenShow()
      }
    },
    hide: function () {
      this.$refs.licenseCreationModal.hide()
    },
    handleScroll: function (locale) {
      const ta = this.$refs[`ta-${locale}`][0].$el
      const div = this.$refs[`div-${locale}`][0]
      const taTop = ta.scrollTop
      const taHeight = ta.scrollHeight - ta.clientHeight
      // const divTop = div.scrollTop
      const divHeight = div.scrollHeight - div.clientHeight

      div.scrollTop = 0 + ((taTop - 0) * (divHeight - 0)) / (taHeight - 0)
    },
    prepareLocalesThenShow: function () {
      this.locales.forEach(l => {
        Vue.set(this.licenseData, l.locale, this.license ? this.license.licenseData[l.locale] : null)
      })

      this.formFeedback = {
        name: null
      }
      this.$refs.licenseCreationModal.show()
    },
    handleOk: function () {
      if (!this.licenseName || this.licenseName.trim().length < 1) {
        this.formFeedback.name = false
        return
      } else {
        this.formFeedback.name = true
      }

      if (this.license) {
        let hasChanged = false

        hasChanged ||= this.license.licenseName !== this.licenseName
        hasChanged ||= this.license.licenseDescription !== this.licenseDescription

        this.locales.forEach(l => {
          hasChanged ||= this.license.licenseData[l.locale] !== this.licenseData[l.locale]
        })

        if (hasChanged) {
          // Update the license on the server
          apiPatchLicense(this.license.licenseId, {
            licenseId: this.license.licenseId,
            licenseName: this.licenseName,
            licenseDescription: this.licenseDescription,
            licenseData: this.licenseData
          }, result => {
            if (result) {
              this.$emit('license-updated')
              this.hide()
            }
          })
        } else {
          this.hide()
        }
      } else {
        // Create a new license
        apiPutLicense({
          licenseName: this.licenseName,
          licenseDescription: this.licenseDescription,
          licenseData: this.licenseData
        }, result => {
          if (result) {
            this.$emit('license-added', result)
            this.hide()
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.license-modal-height {
  max-height: 50vh;
}
div.license-modal-height {
  overflow-y: auto;
}
</style>
