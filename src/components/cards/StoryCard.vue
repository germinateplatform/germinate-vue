<template>
  <v-card class="d-flex flex-column w-100">
    <v-img
      height="200px"
      :class="isPlaceholder ? 'ma-5' : undefined"
      :src="isPlaceholder ? story.storyImageName : getSrc('small')"
      contain
      :alt="story.storyName"
      v-if="isPlaceholder || story.storyImageId"
    />
    <v-card-title>{{ story.storyName }}</v-card-title>
    <v-card-subtitle v-if="story.storyCreatedOn">
      <v-chip label :prepend-icon="mdiCalendar" :text="new Date(story.storyCreatedOn).toLocaleDateString()" />
    </v-card-subtitle>

    <v-card-text>
      <p v-if="story.storyDescription">{{ story.storyDescription }}</p>

      <v-divider />

      <h3 class="text-title-medium mb-0">{{ $t('widgetStoryCardSteps') }}</h3>

      <v-list>
        <v-list-item
          v-for="step in sortedSteps"
          :key="`story-${story.storyId}-step-${step.id}`"
          :title="`${ step.storyIndex + 1 }. ${step.name}`"
        >
          <template #subtitle><span v-html="step.description" /></template>
        </v-list-item>
      </v-list>
    </v-card-text>

    <v-card-actions>
      <template v-if="isPlaceholder === true">
        <v-btn variant="tonal" color="primary" :prepend-icon="mdiNotebookPlus" :text="$t('buttonAddStory')" @click="emit('create')" />
      </template>
      <template v-else>
        <v-btn variant="tonal" color="primary" :disabled="story.storySteps.length === 0 && !store.storeUserIsDataCurator" :prepend-icon="mdiFileEye" :text="$t('buttonPreview')" @click="emit('select')" />
        <v-spacer />
        <v-menu v-if="store.storeUserIsDataCurator">
          <template #activator="{ props }">
            <v-btn variant="tonal" :append-icon="mdiMenuDown" v-bind="props"><v-icon :icon="mdiCog" /></v-btn>
          </template>
          <v-list slim>
            <v-list-item :prepend-icon="mdiSquareEditOutline" :title="$t('buttonEdit')" @click="emit('edit')" />
            <v-list-item :prepend-icon="mdiPlaylistEdit" :title="$t('buttonEditStorySteps')" @click="emit('edit-steps')" />
            <v-list-item :prepend-icon="mdiDelete" base-color="error" :title="$t('buttonDelete')" @click="emit('delete')" />
          </v-list>
        </v-menu>
      </template>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import type { ViewTableStoriesEnriched } from '@/plugins/types/germinate'
  import { getImageUrl } from '@/plugins/util/image'
  import { coreStore } from '@/stores/app'
  import { mdiCalendar, mdiCog, mdiDelete, mdiMenuDown, mdiSquareEditOutline, mdiFileEye, mdiNotebookPlus, mdiPlaylistEdit } from '@mdi/js'

  const compProps = defineProps<{
    story: ViewTableStoriesEnriched
    isPlaceholder?: boolean
  }>()

  const store = coreStore()

  const sortedSteps = computed(() => (compProps.story.storySteps || []).concat().filter(s => s.name !== undefined && s.name !== null).sort((a, b) => a.storyIndex - b.storyIndex))

  function getSrc (size: string) {
    return getImageUrl(compProps.story.storyImageName || '', {
      name: compProps.story.storyImageName,
      type: 'storysteps',
      size: size,
      token: store.storeToken ? store.storeToken.imageToken : '',
    })
  }

  const emit = defineEmits(['delete', 'edit', 'edit-steps', 'select', 'create'])
</script>
