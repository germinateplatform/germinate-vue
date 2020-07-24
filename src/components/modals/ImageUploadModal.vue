<template>
  <b-modal
    ref="imageUploadModal"
    :title="$t('modalTitleImageUpload')"
    :ok-title="$t('buttonUpload')"
    ok-only
    @ok.prevent="uploadImage">
    <p>{{ $t('modalTextImageUpload') }}</p>
    <b-img v-for="(image, index) in imageData" :src="imageData[index]" :key="`image-preview-${index}`" fluid-grow rounded @load="clearMemory(index)" />
    <b-form @submit.prevent>
      <b-form-file
        class="mt-3"
        v-model="imageFiles"
        multiple
        :state="Boolean(imageFiles)"
        accept=".jpg, .jpeg, .png"/>
    </b-form>
  </b-modal>
</template>

<script>
import miscApi from '@/mixins/api/misc.js'
import { EventBus } from '@/plugins/event-bus.js'

export default {
  props: {
    foreignId: {
      type: Number,
      default: null
    },
    referenceTable: {
      type: String,
      default: 'germinatebase'
    }
  },
  data: function () {
    return {
      imageFiles: [],
      imageData: []
    }
  },
  watch: {
    imageFiles: function (newValue) {
      this.imageData = newValue.map(f => URL.createObjectURL(f))
    }
  },
  mixins: [ miscApi ],
  methods: {
    clearMemory: function (index) {
      URL.revokeObjectURL(this.imageData[index])
    },
    show: function () {
      this.imageFiles = []
      this.imageData = []
      this.$refs.imageUploadModal.show()
    },
    hide: function () {
      this.$refs.imageUploadModal.hide()
    },
    uploadImage: function () {
      if (this.imageFiles === null || this.imageFiles.length < 1) {
        // TODO feedback
        return
      }

      let formData = new FormData()
      this.imageFiles.forEach(i => {
        formData.append('imageFiles', i)
      })

      EventBus.$emit('show-loading', true)
      this.apiPostImageForm(this.foreignId, this.referenceTable, formData, result => {
        EventBus.$emit('show-loading', false)
        if (result) {
          this.$emit('images-updated')
          this.hide()
        }
      })
    }
  }
}
</script>

<style>

</style>
