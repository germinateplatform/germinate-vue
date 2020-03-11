<template>
  <b-form @submit.prevent :validated="errorMessage === null">
    <b-textarea ref="dropZone" rows="10" v-on:drop="handleDrop" :placeholder="$t(placeholder)" v-model="fileContent" :state="errorMessage === null" />
    <p v-if="errorMessage" class="text-danger">{{ $t(errorMessage) }}</p>
  </b-form>
</template>

<script>
export default {
  data: function () {
    return {
      fileContent: null,
      errorMessage: null
    }
  },
  props: {
    placeholder: {
      type: String,
      default: 'widgetDropFileDefaultPlaceholder'
    }
  },
  methods: {
    handleDrop: function (e) {
      event.preventDefault()
      event.stopPropagation()

      this.errorMessage = null

      // Check the dropped file
      if (e && e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // Only the first one, we don't support multi-drop
        const file = e.dataTransfer.files[0]

        // Only plain text files are supported
        if (file.type === 'text/plain' && file.name.endsWith('.txt')) {
          if (file.size < 1000000) {
            // Restrict to 1MB
            const reader = new FileReader()
            reader.onload = event => {
              this.fileContent = event.target.result
            }
            reader.readAsText(file)
          } else {
            this.errorMessage = 'widgetDropFileErrorFileTooLarge'
          }
        } else {
          this.errorMessage = 'widgetDropFileErrorWrongFileType'
        }
      }
    },
    getContent: function () {
      return this.fileContent ? this.fileContent.split('\n') : null
    },
    focus: function () {
      this.$refs.dropZone.focus()
    }
  }
}
</script>

<style>

</style>
