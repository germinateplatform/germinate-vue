<template>
  <v-banner
    :bg-color="story.isEdit ? 'warning': 'info'"
    :icon="mdiBookOpenPageVariant"
    lines="one"
    sticky
    class="story-banner"
    v-if="story"
  >
    <template #text>
      <div class="d-flex justify-space-between">
        <v-menu v-model="menuExpanded" v-if="story.storySteps.length > 0">
          <template #activator="{ props }">
            <v-btn variant="outlined" v-bind="props" :text="currentStep?.name" :append-icon="menuExpanded ? mdiMenuUp : mdiMenuDown">
              <template #prepend>{{ story.index + 1 }}/{{ story.storySteps.length }}</template>
            </v-btn>
          </template>
          <v-list slim max-width="300px">
            <v-list-item
              v-for="step in sortedSteps"
              :key="`story-step-${step.storyIndex}`"
              :title="step.name"
              :subtitle="step.description"
              :append-icon="step.storyIndex === story.index ? mdiCircleMedium : undefined"
              @click="store.setActiveStoryStep(step.storyIndex)"
            />
            <v-divider />
            <v-list-item
              :title="$t('buttonCloseStory')"
              :append-icon="mdiClose"
              base-color="error"
              @click="endStory"
            />
          </v-list>
        </v-menu>
        <v-menu v-if="store.storeUserIsDataCurator">
          <template #activator="{ props }">
            <v-btn class="ms-3" variant="outlined" v-bind="props" :prepend-icon="mdiPlus" :text="$t('widgetCreateStoryStoryStepTwoName')" />
          </template>
          <v-list slim max-width="300px">
            <v-list-item
              :title="$t('buttonAddStepHere')"
              :prepend-icon="mdiArrowLeft"
              @click="addStep(0)"
            />
            <v-list-item
              :title="$t('buttonAddStepAfter')"
              :prepend-icon="mdiArrowLeftBottom"
              @click="addStep(1)"
            />
          </v-list>
        </v-menu>
      </div>
    </template>
    <template #actions>
      <v-btn color="white" :disabled="story.index === 0" @click="delta(-1)" :prepend-icon="mdiArrowLeft">{{ $t('buttonBack') }}</v-btn>
      <v-btn color="white" @click="delta(1)" :append-icon="isLastStep ? mdiCheck : mdiArrowRight">{{ $t(isLastStep ? 'buttonCloseStory' : 'buttonNext') }}</v-btn>
    </template>
  </v-banner>

  <!-- @vue-generic {import('@/plugins/types/client').ExtendedStorysteps} -->
  <GenericAddEditFormModal
    title="modalTitleAddStoryStep"
    v-model="newStoryStep"
    :fields="storyStepFields"
    :notify="sendNewStoryStep"
    ref="addStoryStepModal"
  />

  <v-bottom-sheet
    v-model="bottomSheetVisible"
    :scrim="false"
    persistent
    scroll-strategy="none"
    :capture-focus="false"
    :close-on-back="false"
    :close-on-content-click="false"
    disabled
    no-click-animation
    max-height="50vh"
    width="auto"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div>{{ currentStep.name }}</div>
        <v-btn :icon="mdiClose" variant="text" @click="bottomSheetVisible = false" />
      </v-card-title>
      <v-card-text>{{ currentStep.description }}</v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup lang="ts">
  import { Pages } from '@/plugins/pages'
  import type { ExtendedStorysteps, IndexedViewTableStoriesEnriched } from '@/plugins/types/client'
  import { coreStore } from '@/stores/app'
  import { mdiArrowLeft, mdiArrowLeftBottom, mdiArrowRight, mdiBookOpenPageVariant, mdiCheck, mdiCircleMedium, mdiClose, mdiMenuDown, mdiMenuUp, mdiPlus } from '@mdi/js'
  import type { FieldConfig } from '@/components/modals/GenericAddEditFormModal.vue'
  import { FilterComparator, FilterOperator, type StoryStepConfig } from '@/plugins/types/germinate'
  import { apiPostStoryStepUpload, apiPostStoryTable } from '@/plugins/api/story'

  const router = useRouter()
  const route = useRoute()
  const store = coreStore()

  const menuExpanded = ref(false)
  const bottomSheetVisible = ref(false)

  const newStoryStep = ref<ExtendedStorysteps>({ name: '', description: '', storyIndex: 0 })

  const story = computed(() => store.storeActiveStory)
  const sortedSteps = computed(() => (story.value?.storySteps || []).concat().filter(s => s.name !== undefined && s.name !== null).sort((a, b) => a.storyIndex - b.storyIndex) || [])
  const currentStep = computed(() => sortedSteps.value[story.value?.index || 0])
  const isLastStep = computed(() => story.value?.index === sortedSteps.value.length - 1)

  const addStoryStepModal = useTemplateRef('addStoryStepModal')

  const storyStepFields = computed(() => {
    const result: FieldConfig<ExtendedStorysteps>[] = [{
      key: 'name',
      title: 'formLabelStoryStepName',
      type: 'text' as const,
      required: true,
      width: 2,
    }, {
      key: 'description',
      title: 'formLabelStoryStepDescription',
      type: 'textarea' as const,
      required: true,
      width: 2,
    }, {
      key: 'file',
      title: 'formLabelStoryStepImage',
      type: 'file' as const,
      required: false,
      width: 2,
      accepts: '.jpeg, .png, .jpg',
    }]

    return result
  })

  function sendNewStoryStep () {
    return new Promise<boolean>(resolve => {
      const formData = new FormData()
      formData.append('storyId', `${story.value?.storyId}`)
      formData.append('stepName', newStoryStep.value.name)
      formData.append('stepDescription', newStoryStep.value.description)
      formData.append('storyIndex', `${newStoryStep.value.storyIndex || 0}`)
      const config: StoryStepConfig = {
        router: {
          name: route.name,
          // @ts-expect-error
          query: route.query,
          params: route.params,
        },
      }
      formData.append('pageConfig', JSON.stringify(config))

      if (newStoryStep.value.file) {
        formData.append('image', newStoryStep.value.file)
      }

      apiPostStoryStepUpload(story.value?.storyId || -1, formData, () => {
        apiPostStoryTable({
          page: 1,
          limit: 1,
          filters: [{
            operator: FilterOperator.and,
            filters: [{
              column: 'storyId',
              comparator: FilterComparator.equals,
              values: [`${story.value?.storyId}`],
            }],
          }],
        }, result => {
          if (result && result.data && result.data.length > 0) {
            const indexed: IndexedViewTableStoriesEnriched = Object.assign({ index: story.value?.index || 0, isEdit: true }, result.data[0])
            store.setActiveStory(indexed)
          }
        })
        resolve(true)
      }).catch(() => resolve(false))
    })
  }

  function endStory () {
    store.setActiveStory(undefined)
    router.push(Pages.stories.path)
  }

  function addStep (delta: number) {
    if (story.value) {
      const index = story.value.index + delta

      newStoryStep.value = {
        name: '',
        description: '',
        storyIndex: index,
      }

      nextTick(() => addStoryStepModal.value?.show())
    }
  }

  function delta (delta: number) {
    if (story.value) {
      const index = story.value.index + delta

      if (index === sortedSteps.value.length) {
        endStory()
      } else {
        store.setActiveStoryStep(index)
      }
    }
  }

  watch(() => story.value?.index, async () => {
    const r = currentStep.value?.pageConfig?.router

    if (r) {
      const idParam = r.params ? Object.values(r.params)[0] : undefined
      const params = { name: r.name, params: { id: idParam, datasetId: idParam, datasetIds: idParam }, query: r.query }
      // @ts-expect-error
      router.push(params)

      nextTick(() => {
        bottomSheetVisible.value = true
      })
    }
  }, { immediate: true })
</script>

<style scoped>
.story-banner {
  top: 64px;
  z-index: 1001;
}
</style>
