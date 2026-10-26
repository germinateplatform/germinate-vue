<template>
  <v-file-upload
    v-model="model"
    clearable
    filter-by-type="image/jpeg,image/png"
    multiple
    show-size
    title="Drag and drop JPG or PNG images"
  >
    <template #default>
      <v-file-upload-dropzone density="comfortable" />

      <v-file-upload-list>
        <template #default="{ files, onClickRemove }">
          <v-file-upload-item
            v-for="(file, index) in files"
            :key="file.name + file.lastModified"
            clearable
            :file="file"
            show-size
            @click:remove="onClickRemove(index)"
          >
            <template #prepend>
              <v-avatar
                :color="statusColor(file)"
                :icon="statusIcon(file)"
                rounded="circle"
                variant="tonal"
              />
              <v-progress-linear
                absolute
                :color="statusColor(file)"
                :indeterminate="uploads.get(file)?.status === 'uploading' && uploads.get(file)?.progress === 100"
                location="bottom"
                :model-value="uploads.get(file)?.progress ?? 0"
              />
            </template>
          </v-file-upload-item>
        </template>
      </v-file-upload-list>
    </template>
  </v-file-upload>

  <TagInput
    v-model="imageTags"
  />

  <v-btn
    class="mt-4"
    color="primary"
    :disabled="pending.length === 0"
    :loading="isUploading"
    :prepend-icon="mdiFileUpload"
    @click="uploadPending"
    :text="$t('buttonUpdate')"
  />
</template>

<script setup lang="ts">
  import { apiPatchImageTags, apiPostReferenceImage } from '@/plugins/api/image'
  import type { ImageTag } from '@/plugins/types/germinate'
  import { mdiFileUpload } from '@mdi/js'
  import type { AxiosResponse } from 'axios'

  type UploadStatus = 'uploading' | 'success' | 'error'

  const props = defineProps<{
    referenceTable: string
    foreignId: number
  }>()

  const emit = defineEmits<{
    finished: [result: { succeeded: number, failed: number }]
  }>()

  const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png'])

  const imageTags = ref<ImageTag[]>([])

  // Files that were never uploaded, or whose upload failed (so the button doubles as "retry")
  const pending = computed(() => model.value.filter(file => {
    const status = uploads.get(file)?.status
    return !status || status === 'error'
  }))

  const model = ref<File[]>([])
  const uploads = shallowReactive(new Map<File, { status: UploadStatus, progress: number }>())

  const isUploading = computed(() => {
    for (const upload of uploads.values()) {
      if (upload.status === 'uploading') return true
    }
    return false
  })

  function uploadFile (file: File) {
    // Safety net in case a non-image slips past the type filter
    if (!ALLOWED_TYPES.has(file.type)) {
      uploads.set(file, { status: 'error', progress: 0 })
      return Promise.resolve(false)
    }

    uploads.set(file, { status: 'uploading', progress: 0 })

    const formData = new FormData()
    formData.append('imageFiles', file)

    return new Promise(resolve => {
      apiPostReferenceImage(
        props.referenceTable,
        props.foreignId,
        formData,
        undefined,
        {
          codes: [],
          callback: () => {
            uploads.set(file, { status: 'error', progress: 100 })
            resolve(false)
          },
        },
        percent => uploads.set(file, { status: 'uploading', progress: percent }),
      ).then((response: AxiosResponse<number>) => {
        if (imageTags.value?.length > 0) {
          return apiPatchImageTags(response?.data || -1, imageTags.value, result => {
            uploads.set(file, { status: 'success', progress: 100 })
            resolve(true)
          })
        } else {
          uploads.set(file, { status: 'success', progress: 100 })
          resolve(true)
        }
      })
    })
  }

  // One upload call per image; emits a single event once the whole batch has settled
  async function uploadPending () {
    const batch = [...pending.value]
    const results = await Promise.all(batch.map(async file => ({ file, ok: await uploadFile(file) })))

    emit('finished', {
      succeeded: results.filter(r => r.ok).length,
      failed: results.filter(r => !r.ok).length,
    })
  }

  function statusColor (file: File) {
    switch (uploads.get(file)?.status) {
      case 'success': return 'success'
      case 'error': return 'error'
      default: return 'primary'
    }
  }

  function statusIcon (file: File) {
    switch (uploads.get(file)?.status) {
      case 'success': return '$success'
      case 'error': return '$error'
      default: return '$file'
    }
  }
</script>
