<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageStoriesTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageStoriesText')" />

    <StoryTable
      :get-data="getStories"
      display-type="grid"
      ref="storyTable"
    />

    <StoryCard
      v-if="store.storeUserIsDataCurator"
      :story="exampleStory"
      class="my-5"
      is-placeholder
      @create="storyTable?.createStory()"
    />
  </v-container>
</template>

<route lang="yaml">
name: dataStories
</route>

<script setup lang="ts">
  import { apiPostStoryTable } from '@/plugins/api/misc'
  import type { PaginatedRequest } from '@/plugins/types/germinate'
  import { coreStore } from '@/stores/app'
  import { useI18n } from 'vue-i18n'

  const store = coreStore()
  const { t } = useI18n()

  const storyTable = useTemplateRef('storyTable')

  const exampleStory = computed(() => {
    return {
      storyId: -1,
      storyName: t('widgetCreateStoryStoryName'),
      storyDescription: t('widgetCreateStoryStoryDescription'),
      storyImageName: 'img/misc/story-banner.svg',
      storySteps: [{
        id: -1,
        storyIndex: 0,
        name: t('widgetCreateStoryStoryStepOneName'),
        description: t('widgetCreateStoryStoryStepOneDescription'),
      }, {
        id: -2,
        storyIndex: 1,
        name: t('widgetCreateStoryStoryStepTwoName'),
        description: t('widgetCreateStoryStoryStepTwoDescription'),
      }, {
        id: -3,
        storyIndex: 2,
        name: t('widgetCreateStoryStoryStepThreeName'),
        description: t('widgetCreateStoryStoryStepThreeDescription'),
      }],
    }
  })

  function getStories (data: PaginatedRequest) {
    return apiPostStoryTable(data)
  }
</script>
