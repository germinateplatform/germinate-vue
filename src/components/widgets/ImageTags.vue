<template>
  <div v-if="imageTags && imageTags.length > 0">
    <h3>{{ $t('widgetImageTagsTitle') }}</h3>

    <v-chip-group
      :model-value="localSelectedTag"
      @update:model-value="notifySelectedTag"
      column
      selected-class="text-primary"
    >
      <v-chip
        v-for="tag in imageTags"
        :key="`image-tag-${compProps.foreignId}-${tag.tagId}`"
        filter
        label
        :text="tag.tagName"
        :value="tag"
      />
    </v-chip-group>
  </div>
</template>

<script setup lang="ts">
  import { apiGetImageTags, apiGetImageTagsForId } from '@/plugins/api/misc'
  import type { ImageTag, PaginatedResult } from '@/plugins/types/germinate'

  const compProps = defineProps<{
    foreignId?: number
    referenceTable?: string
    modelValue: ImageTag | undefined
  }>()

  const emit = defineEmits(['update:model-value'])

  const localSelectedTag = ref<ImageTag>()
  const imageTags = ref<ImageTag[]>([])

  function notifySelectedTag (newSelection: ImageTag) {
    emit('update:model-value', newSelection)
  }

  function update () {
    if (compProps.referenceTable && compProps.foreignId) {
      apiGetImageTagsForId<PaginatedResult<ImageTag[]>>(compProps.referenceTable, compProps.foreignId, result => {
        if (result) {
          imageTags.value = result.data
        }
      })
    } else {
      apiGetImageTags<PaginatedResult<ImageTag[]>>(result => {
        if (result) {
          imageTags.value = result.data
        }
      })
    }
  }

  watch(() => compProps.modelValue, async (newValue: ImageTag | undefined) => {
    localSelectedTag.value = newValue
  })

  onMounted(() => {
    update()
  })
</script>
