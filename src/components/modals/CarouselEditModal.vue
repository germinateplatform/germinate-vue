<template>
  <b-modal
    ref="carouselEditModal"
    size="xl"
    :title="$t('modalTitleEditCarousel')"
    :ok-title="$t('buttonUpdate')"
    :cancel-title="$t('buttonCancel')"
    :ok-disabled="!canContinue"
    @ok.prevent="okPressed">
    <!-- Modal showing news add form -->
    <template v-if="locales">
      <b-tabs>
        <b-tab v-for="locale in locales" :key="`locale-${locale.locale}`" :title="locale.name">
          <draggable v-model="settings[locale.locale]" tag="b-row" handle=".drag-handle" class="mt-3" v-if="settings && settings[locale.locale]">
            <b-col cols=12 md=6 lg=4 v-for="img in settings[locale.locale]" :key="`img-${locale.locale}-${img.name}`" class="mb-3">
              <b-img fluid-grow :src="getImage(img.name)" class="drag-handle border border-bottom-0" />
              <b-input-group>
                <b-form-textarea :rows="3" v-model="img.text" />
                <b-input-group-addon>
                  <b-button variant="danger" @click="deleteImage(img.name)"><MdiIcon :path="mdiDelete" /></b-button>
                </b-input-group-addon>
              </b-input-group>
            </b-col>
          </draggable>
        </b-tab>
      </b-tabs>

      <b-form-group :label="$t('formLabelCarouselImageAdd')" label-for="image-file">
        <b-form-file id="image-file" accept=".jpeg, .png, .jpg" v-model="imageFile" />
      </b-form-group>
      <b-form-group :label="$t('formLabelCarouselImageLocale')" label-for="image-locales">
        <b-form-checkbox-group
          id="image-locales"
          v-model="imageLocales"
          :options="localeOptions" />
      </b-form-group>
      <b-button variant="primary" @click="uploadImage" :disabled="!imageFile || imageLocales.length < 1"><MdiIcon :path="mdiFileImagePlusOutline" /> {{ $t('buttonUpload') }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'

import draggable from 'vuedraggable'

import { mapGetters } from 'vuex'
import { apiGetLocales, apiGetTemplateCarouselConfig, apiDeleteTemplateImageByName, apiPostTemplateImage, apiPostTemplateCarouselConfig } from '@/mixins/api/misc'

import { getImageUrl } from '@/mixins/image'

import { mdiPlusCircleOutline, mdiDelete, mdiFileImagePlusOutline } from '@mdi/js'

export default {
  components: {
    draggable,
    MdiIcon
  },
  data: function () {
    return {
      mdiFileImagePlusOutline,
      mdiDelete,
      mdiPlusCircleOutline,
      imageFile: null,
      settings: null,
      locales: [{ locale: 'en_GB', name: 'British English', flag: 'gb' }],
      imageLocales: [{ locale: 'en_GB', name: 'British English', flag: 'gb' }]
    }
  },
  computed: {
    ...mapGetters([
      'storeToken'
    ]),
    canContinue: function () {
      return this.settings !== undefined && this.settings !== null
    },
    localeOptions: function () {
      return this.locales.map(l => {
        return {
          value: l,
          text: l.name
        }
      })
    }
  },
  methods: {
    okPressed: function () {
      apiPostTemplateCarouselConfig(this.settings, () => {
        this.$emit('change')
        this.hide()
      })
    },
    uploadImage: function () {
      if (this.imageFile) {
        const formData = new FormData()
        this.imageLocales.forEach(l => formData.append('locales', l.locale))
        formData.append('imageFile', this.imageFile)

        apiPostTemplateImage(formData, () => {
          this.update()
        })
      }
    },
    deleteImage: function (name) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okTitle: this.$t('buttonDelete'),
        okVariant: 'danger',
        cancelTitle: this.$t('buttonCancel')
      })
        .then(value => {
          if (value === true) {
            apiDeleteTemplateImageByName(name, () => {
              this.update()
            })
          }
        })
    },
    getImage: function (name) {
      return getImageUrl(name, {
        name: name,
        token: this.storeToken ? this.storeToken.imageToken : null,
        type: 'template',
        size: 'large'
      })
    },
    update: function (showModal) {
      // Get locales
      apiGetLocales(result => {
        this.locales = result
        this.imageLocales = result
      })

      // Get carousel configuration file
      apiGetTemplateCarouselConfig(result => {
        if (result) {
          Object.keys(result).forEach(l => {
            if (result[l]) {
              result[l].forEach(i => {
                if (!i || !i.text) {
                  i.text = ''
                }
              })
            }
          })
        }

        this.settings = result

        if (showModal) {
          this.$refs.carouselEditModal.show()
        }
      }, {
        codes: [404],
        callback: () => {
          this.settings = null

          if (showModal) {
            this.$refs.carouselEditModal.show()
          }
          // Do nothing here, it just means there is no carousel file
        }
      })
    },
    show: function () {
      this.imageFile = null
      this.locales = [{ locale: 'en_GB', name: 'British English', flag: 'gb' }]
      this.imageLocales = [{ locale: 'en_GB', name: 'British English', flag: 'gb' }]
      this.settings = null
      this.update(true)
    },
    hide: function () {
      this.$refs.carouselEditModal.hide()
    }
  }
}
</script>

<style scoped>
img.drag-handle:hover {
  cursor: move;
}
</style>
