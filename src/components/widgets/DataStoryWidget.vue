<template>
  <v-row v-if="store.token && userIsAtLeast(store.token.userType, UserType.DATA_CURATOR)">
    <v-col cols="12" sm="6" md="4" lg="3">
      <StoryCard :story="exampleStory" is-placeholder />
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" sm="6" md="4" lg="3">
      <StoryCard
        v-for="story in storiesOnPage"
        :key="`story-${story.storyId}`"
        :story="story"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import { userIsAtLeast } from '@/plugins/api/auth'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostStoryTable } from '@/plugins/api/misc'
  import { UserType, type FilterGroup, type ViewTableStoriesEnriched } from '@/plugins/types/germinate'
  import { coreStore } from '@/stores/app'
  import { useI18n } from 'vue-i18n'

  const compProps = defineProps<{
    filterOn?: FilterGroup[]
  }>()

  const page = ref(1)
  const perPage = ref(12)

  const { t } = useI18n()
  const store = coreStore()

  const stories = ref<ViewTableStoriesEnriched[]>([])

  const storiesOnPage = computed(() => {
    const startIndex = Math.min(stories.value.length, (page.value - 1) * perPage.value)
    const endIndex = Math.min(stories.value.length, startIndex + perPage.value)

    return stories.value.slice(startIndex, endIndex)
  })

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

  onMounted(() => {
    apiPostStoryTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filters: compProps.filterOn,
    }, result => {
      if (result && result.data) {
        stories.value = result.data
      }
    })
  })
</script>
