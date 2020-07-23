<template>
  <b-modal
    ref="imageUploadModal"
    :title="$t('modalTitleImageUpload')"
    :ok-title="$t('buttonUpload')"
    ok-only
    @ok.prevent="uploadImage">
    <p>{{ $t('modalTextImageUpload') }}</p>
    <b-img :src="imageData" v-if="imageData" fluid-grow rounded @load="clearMemory" />
    <b-form @submit.prevent>
      <b-form-file
        class="mt-3"
        v-model="imageFile"
        :state="Boolean(imageFile)"
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
      imageFile: null,
      imageData: null
    }
  },
  watch: {
    imageFile: function (newValue) {
      this.imageData = URL.createObjectURL(newValue)
    }
  },
  mixins: [ miscApi ],
  methods: {
    clearMemory: function () {
      URL.revokeObjectURL(this.imageData)
    },
    show: function () {
      this.imageFile = null
      this.imageData = null
      this.$refs.imageUploadModal.show()
    },
    hide: function () {
      this.$refs.imageUploadModal.hide()
    },
    uploadImage: function () {
      if (this.imageFile === null) {
        // TODO feedback
        return
      }

      let formData = new FormData()
      formData.append('imageFile', this.imageFile)

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
