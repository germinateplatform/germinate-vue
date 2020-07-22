<template>
  <b-modal
    ref="imageUploadModal"
    :ok-title="$t('buttonClose')"
    ok-only>
  <b-form @submit.prevent>
    <b-form-file
      class="mt-3"
      v-model="imageFile"
      :state="Boolean(imageFile)"
      accept=".jpg, .jpeg"/>
    <b-button type="submit" @click="uploadImage"><i class="mdi mdi-upload"/></b-button>
  </b-form>
</template>

<script>
export default {
  props: {
    foreignId: {
      type: Number,
      default: null
    },
    imageRefTable: {
      type: String,
      default: 'germinatebase'
    }
  },
  data: function () {
    return {
      imageFile: null
    }
  },
  methods: {
    show: function () {
      this.$refs.imageUploadModal.show()
    },
    hide: function () {
      this.$refs.imageUploadModal.hide()
    },
    uploadImage: function () {
      let formData = new FormData()
      formData.append('imageFile', this.imageFile)

      this.apiPostImage(this.foreignId, this.imageRefTable, )
    }
  }
}
</script>

<style>

</style>
