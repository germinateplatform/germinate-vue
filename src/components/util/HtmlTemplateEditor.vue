<template>
  <div v-if="i18nKey">
    <b-checkbox v-if="isAdmin" switch v-model="editingEnabled">{{ $t('buttonEdit') }}</b-checkbox>

    <div v-if="isAdmin && editingEnabled" class="mb-3">
      <VueEditor
        v-model="text"
        :editorToolbar="customToolbar"
        useCustomImageHandler
        @image-added="handleImageAdded"
        @image-removed="handleImageRemoved" />

      <b-button @click="save" variant="success"><MdiIcon :path="mdiContentSave" /> {{ $t('buttonSubmit') }}</b-button>
    </div>
    <p v-html="text" v-else />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { mdiContentSave } from '@mdi/js'
import MdiIcon from '@/components/icons/MdiIcon'
import { VueEditor, Quill } from 'vue2-editor'
import { apiDeleteTemplateImageByName, apiPatchTemplateI18n, apiPostTemplateImage } from '@/mixins/api/misc'
import { USER_TYPE_ADMINISTRATOR, userIsAtLeast } from '@/mixins/api/auth'
import { getImageUrl } from '@/mixins/image'

// Make sure images added use bootstrap's 'img-fluid' class
const Image = Quill.import('formats/image')
Image.className = 'img-fluid'
Quill.register(Image, true)

export default {
  components: {
    MdiIcon,
    VueEditor
  },
  props: {
    i18nKey: {
      type: String,
      default: null
    }
  },
  beforeRouteLeave: function (to, from, next) {
    if (this.isAdmin && this.editingEnabled) {
      // Ask for confirmation. check this isn't a navigation initiated by finalising the trial setup
      this.$bvModal.msgBoxConfirm(this.$t('modalTextHtmlEditorLeaveSure'), {
        title: this.$t('modalTitleSure'),
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            next()
          }
        })
    }
  },
  computed: {
    ...mapGetters([
      'storeLocale',
      'storeToken'
    ]),
    isAdmin: function () {
      return this.storeToken && userIsAtLeast(this.storeToken.userType, USER_TYPE_ADMINISTRATOR)
    }
  },
  data: function () {
    return {
      mdiContentSave,
      text: '',
      editingEnabled: false,
      customToolbar: [
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ align: [] }],
        ['link', 'image']
      ]
    }
  },
  watch: {
    '$i18n.locale': {
      handler: function () {
        this.text = this.$t(this.i18nKey)
      },
      immediate: true
    }
  },
  methods: {
    handleImageRemoved: function (file, Editor, cursorLocation) {
      const start = file.indexOf('src/') + 4
      const end = file.indexOf('?')

      const name = file.substring(start, end)

      apiDeleteTemplateImageByName(name, () => {
        console.log('success')
      })
    },
    handleImageAdded: function (file, Editor, cursorLocation, resetUploader) {
      const formData = new FormData()
      formData.append('image', file)

      console.log(file)

      apiPostTemplateImage(formData, result => {
        Editor.insertEmbed(cursorLocation, 'image', getImageUrl(result, {
          name: result,
          type: 'template',
          size: 'large'
        }))
        resetUploader()
      })
    },
    save: function () {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'success',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            const payload = {}
            payload[this.i18nKey] = this.text

            apiPatchTemplateI18n(payload, this.storeLocale, () => {
              this.$router.go(0)
            })
          }
        })
    }
  }
}
</script>
