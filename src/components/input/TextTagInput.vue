<template>
  <v-combobox
    class="mb-3"
    v-model="tags"
    v-bind="$attrs"
    clearable
    chips
    multiple
    counter
    :items="tags"
    :delimiters="['\n']"
    :prepend-inner-icon="mdiTagMultiple"
    persistent-hint
    ref="tagInput"
  />
</template>

<script setup lang="ts">
  import { mdiTagMultiple } from '@mdi/js'

  const tags = defineModel<string[]>({
    default: () => [],
  })

  const tagInput = useTemplateRef('tagInput')

  onMounted(() => {
    // Listen for paste events on the categories
    tagInput.value?.addEventListener('paste', (event: ClipboardEvent) => {
      if (event.clipboardData?.getData('text')?.includes('\n')) {
        event.preventDefault()

        if (!tags.value) {
          tags.value = []
        }

        tags.value.push(...(event.clipboardData!.getData('text')!.split('\n').map(x => x.trim()).filter(x => x.length > 0) || []))
      }
    })
  })
</script>
