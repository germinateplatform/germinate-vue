<template>
  <div>
    <v-textarea
      v-model="model"
      v-bind="$attrs"
      :label="label"
      :class="['drop-textarea', { 'drop-textarea--active': isDragging }]"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <template #append-inner>
        <v-btn
          :icon="mdiFileUpload"
          variant="text"
          density="comfortable"
          :color="isDragging ? 'primary' : undefined"
          @click="openFilePicker"
        />
      </template>
    </v-textarea>

    <input
      ref="fileInputRef"
      type="file"
      class="drop-textarea__hidden-input"
      :accept="acceptAttribute"
      @change="onFileInputChange"
    >
  </div>
</template>

<script setup lang="ts">
  import { mdiFileUpload } from '@mdi/js'

  defineOptions({ inheritAttrs: false })

  interface Props {
    label?: string
    prettyPrintJson?: boolean
    acceptedExtensions?: string[]
  }

  const props = withDefaults(defineProps<Props>(), {
    label: undefined,
    prettyPrintJson: true,
    acceptedExtensions: () => ['txt', 'csv', 'tsv', 'json'],
  })

  interface FileLoadedPayload {
    file: File
    content: string
  }

  const fileInputRef = ref<HTMLInputElement | null>(null)

  const emit = defineEmits<{
    'file-loaded': [payload: FileLoadedPayload]
    'file-error': [error: Error]
  }>()

  // value exposed to the parent via v-model
  const model = defineModel<string>({ default: '' })

  const isDragging = ref(false)
  let dragCounter = 0 // handles nested dragenter/dragleave firing on child elements

  // normalize once so comparisons are case-insensitive and consistent
  const normalizedExtensions = computed(() => props.acceptedExtensions.map(ext => ext.toLowerCase()))

  const label = computed(() => props.label ?? `Drop a ${formatExtensionList(normalizedExtensions.value)} file, or type here`)

  // value for the native <input accept> attribute, e.g. ".txt,.csv,.tsv,.json"
  const acceptAttribute = computed(() => normalizedExtensions.value.map(ext => `.${ext}`).join(','))

  function openFilePicker (): void {
    fileInputRef.value?.click()
  }

  function formatExtensionList (extensions: string[]): string {
    return extensions.map(ext => `.${ext}`).join(', ')
  }

  function getExtension (filename: string): string {
    return filename.split('.').pop()?.toLowerCase() ?? ''
  }

  function isAcceptedExtension (ext: string): boolean {
    return normalizedExtensions.value.includes(ext)
  }

  function onDragEnter (): void {
    dragCounter++
    isDragging.value = true
  }

  function onDragOver (): void {
    // needed to allow drop; kept separate from dragenter for clarity
  }

  function onDragLeave (): void {
    dragCounter--
    if (dragCounter <= 0) {
      dragCounter = 0
      isDragging.value = false
    }
  }

  async function onFileInputChange (event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    // reset so selecting the same file again still fires a change event next time
    input.value = ''

    if (!file) return

    await processFile(file)
  }

  async function processFile (file: File): Promise<void> {
    const ext = getExtension(file.name)
    if (!isAcceptedExtension(ext)) {
      emit('file-error', new Error(`Unsupported file type: .${ext}`))
      return
    }

    try {
      const text = await file.text()
      model.value = ext === 'json' && props.prettyPrintJson
        ? tryPrettyPrintJson(text)
        : text
      emit('file-loaded', { file, content: model.value })
    } catch (err) {
      emit('file-error', err instanceof Error ? err : new Error(String(err)))
    }
  }

  async function onDrop (event: DragEvent): Promise<void> {
    dragCounter = 0
    isDragging.value = false

    const file = event.dataTransfer?.files?.[0]
    if (!file) return

    const ext = getExtension(file.name)
    if (!isAcceptedExtension(ext)) {
      emit('file-error', new Error(`Unsupported file type: .${ext}`))
      return
    }

    try {
      const text = await file.text()
      model.value = ext === 'json' && props.prettyPrintJson
        ? tryPrettyPrintJson(text)
        : text
      emit('file-loaded', { file, content: model.value })
    } catch (err) {
      emit('file-error', err instanceof Error ? err : new Error(String(err)))
    }
  }

  function tryPrettyPrintJson (text: string): string {
    try {
      return JSON.stringify(JSON.parse(text), null, 2)
    } catch {
      // not valid JSON, fall back to raw text
      return text
    }
  }
</script>

<style scoped>
.drop-textarea {
  transition: outline-color 0.15s ease;
  outline: 2px dashed transparent;
  outline-offset: 4px;
  border-radius: 2px;
}

.drop-textarea--active {
  outline-color: rgb(var(--v-theme-primary));
}

.drop-textarea__hidden-input {
  display: none;
}
</style>
