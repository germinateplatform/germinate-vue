<template>
  <v-form @submit.prevent>
    <!-- Text area for manual input as well as drag and drop file handling -->
    <v-textarea autofocus rows="10" @drop="handleDrop" :placeholder="$t(compProps.placeholder)" :model-value="fileContent" @update:model-value="notify" :error-messages="errorMessage ? $t(errorMessage) : undefined" />
    <p v-if="errorMessage" class="text-danger">{{ $t(errorMessage) }}</p>
  </v-form>
</template>

<script setup lang="ts">
  const fileContent = ref<string>()
  const errorMessage = ref<string>()

  export interface CompProps {
    placeholder?: string
    modelValue?: string
  }

  const compProps = withDefaults(defineProps<CompProps>(), {
    placeholder: 'widgetDropFileDefaultPlaceholder',
    modelValue: '',
  })
  const emit = defineEmits(['update:model-value'])

  watch(() => compProps.modelValue, async (newValue: string) => {
    fileContent.value = newValue
  })

  function notify (value: string) {
    emit('update:model-value', value)
  }

  async function handleDrop (e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()

    errorMessage.value = undefined

    // Check the dropped file
    if (e && e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Only the first one, we don't support multi-drop
      const file = e.dataTransfer.files[0]

      // Only plain text files are supported
      if (file.type === 'text/plain' && file.name.endsWith('.txt')) {
        // Restrict to 1MB
        if (file.size < 1_000_000) {
          fileContent.value = await file.text()
          emit('update:model-value', fileContent.value)
        } else {
          errorMessage.value = 'widgetDropFileErrorFileTooLarge'
        }
      } else {
        errorMessage.value = 'widgetDropFileErrorWrongFileType'
      }
    }
  }
</script>

<style>

</style>
