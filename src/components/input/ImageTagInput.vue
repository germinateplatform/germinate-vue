<template>
  <v-combobox
    class="mb-3"
    v-model="tags"
    v-bind="$attrs"
    clearable
    chips
    multiple
    counter
    return-object
    item-value="tagId"
    item-title="tagName"
    :items="allTags"
    :delimiters="['\n']"
    :prepend-inner-icon="mdiTagMultiple"
    persistent-hint
    ref="tagInput"
    @update:model-value="handleUpdate"
  />
</template>

<script setup lang="ts">
  import { apiGetImageTags } from '@/plugins/api/image'
  import type { ImageTag } from '@/plugins/types/germinate'
  import { mdiTagMultiple } from '@mdi/js'

  const allTags = ref<ImageTag[]>([])

  const allTagMap = ref<Record<string, ImageTag>>({})
  const counter = ref(1)

  const tags = defineModel<ImageTag[]>({
    default: () => [],
  })

  const tagInput = useTemplateRef('tagInput')

  function handleUpdate (newVal: any[]) {
    if (!newVal) {
      tags.value = []
      return
    }

    tags.value = newVal.map(item => {
      if (typeof item === 'string') {
        const match = allTagMap.value[item.toLocaleLowerCase()]

        return match ?? {
          tagId: -(counter.value++),
          tagName: item.trim(),
        }
      }
      return item
    })
  }

  onMounted(() => {
    // Listen for paste events on the categories
    tagInput.value?.addEventListener('paste', (event: ClipboardEvent) => {
      if (event.clipboardData?.getData('text')?.includes('\n')) {
        event.preventDefault()

        if (!tags.value) {
          tags.value = []
        }

        tags.value.push(...(event.clipboardData!.getData('text')!.split('\n').map(x => x.trim()).filter(x => x.length > 0) || []).map(t => {
          return {
            tagId: -(counter.value++),
            tagName: t,
          }
        }))
      }
    })

    apiGetImageTags(result => {
      allTags.value = result?.data ?? []

      allTags.value.forEach(tag => {
        allTagMap.value[tag.tagName.toLocaleLowerCase()] = tag
      })
    })
  })
</script>
