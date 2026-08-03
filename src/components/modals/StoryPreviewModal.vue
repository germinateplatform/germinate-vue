<template>
  <v-dialog v-model="dialog" scrollable max-width="min(1024px, 75vw)">
    <v-card
      class="text-wrap"
      :title="localCopy.storyName"
      :subtitle="localCopy.storyDescription"
      v-if="localCopy"
    >
      <v-card-text>
        <v-alert color="warning" class="mb-3" border="start" variant="tonal" :icon="mdiInformation" v-if="editable">{{ $t('modalTextStoryAddSteps') }}</v-alert>

        <div :class="lgAndUp ? 'd-flex flex-row' : undefined">
          <v-tabs
            v-model="tab"
            color="primary"
            :direction="lgAndUp ? 'vertical' : 'horizontal'"
            class="story-step-tabs"
          >
            <v-tab
              v-for="step in sortedSteps"
              :key="`story-step-${step.storyIndex}`"
              :value="step.storyIndex"
              :text="truncateAfterChars(step.name, 20)"
            >
              <template #prepend>
                <v-avatar size="small" :color="step.storyIndex === tab ? 'primary' : 'muted'" :text="`${step.storyIndex + 1}`" />
              </template>
            </v-tab>
          </v-tabs>

          <v-tabs-window v-model="tab" class="flex-grow-1">
            <v-tabs-window-item
              v-for="step in sortedSteps"
              :key="`story-step-${step.storyIndex}`"
              :value="step.storyIndex"
              eager
              :transition="false"
              :reverse-transition="false"
            >
              <v-card flat>
                <v-img
                  height="200px"
                  :src="getSrcForStep('small', step.imageId)"
                  contain
                  :alt="step.name"
                  v-if="step.imageId"
                />
                <v-card-title>
                  <v-text-field
                    v-model="step.name"
                    :label="$t('formLabelStoryStepName')"
                    required
                    hide-details
                    v-if="isEdit"
                  />
                  <span v-else>{{ step.name }}</span>
                </v-card-title>
                <v-card-text>
                  <v-textarea
                    v-model="step.description"
                    :label="$t('formLabelStoryStepDescription')"
                    required
                    hide-details
                    v-if="isEdit"
                  />
                  <span v-html="toParagraphs(step.description)" v-else />
                </v-card-text>
                <v-card-actions v-if="editable">
                  <div class="d-flex flex-wrap">
                    <v-btn spaced="end" class="me-1 my-1" :prepend-icon="mdiArrowUp" @click="delta(step, -1)" :disabled="step.storyIndex === 0" variant="tonal" :text="$t('buttonShiftUp')" />
                    <v-btn spaced="end" class="me-1 my-1" :prepend-icon="mdiArrowDown" @click="delta(step, 1)" :disabled="step.storyIndex === localCopy.storySteps.length - 1" variant="tonal" :text="$t('buttonShiftDown')" />
                    <v-btn spaced="end" class="me-1 my-1" :prepend-icon="mdiDelete" @click="deleteStep(step)" color="error" variant="tonal" :text="$t('buttonDelete')" />
                  </div>
                </v-card-actions>
              </v-card>
            </v-tabs-window-item>
          </v-tabs-window>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="hide" :text="$t('buttonClose')" />
        <v-btn @click="start" color="success" :prepend-icon="isEdit ? mdiContentSave : mdiPlay" variant="tonal" :text="$t(isEdit ? 'buttonSave' : 'buttonStart')" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { IndexedViewTableStoriesEnriched } from '@/plugins/types/client'
  import type { Storysteps, ViewTableStoriesEnriched } from '@/plugins/types/germinate'
  import { toParagraphs, truncateAfterChars } from '@/plugins/util/formatting'
  import { getImageUrl, getImageUrlById } from '@/plugins/util/image'
  import { coreStore } from '@/stores/app'
  import { mdiArrowDown, mdiArrowUp, mdiContentSave, mdiDelete, mdiInformation, mdiPlay } from '@mdi/js'
  import { useDisplay } from 'vuetify'

  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'
  import { apiPatchStorySteps } from '@/plugins/api/story'

  const compProps = defineProps<{
    story: ViewTableStoriesEnriched
    isEdit?: boolean
  }>()

  const tab = ref(1)

  const { t } = useI18n()
  const { lgAndUp } = useDisplay()

  const store = coreStore()
  const dialog = ref(false)
  const errors = ref<string[]>([])

  const editable = computed(() => store.storeUserIsDataCurator && compProps.isEdit === true)

  const localCopy = ref<ViewTableStoriesEnriched>({ storyId: -1, storyName: '', storyDescription: '', storySteps: [] })

  const sortedSteps = computed(() => (localCopy.value.storySteps || []).concat().filter(s => s.name !== undefined && s.name !== null).sort((a, b) => a.storyIndex - b.storyIndex) || [])

  function deleteStep (step: Storysteps) {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirm'),
      message: t('modalTitleSure'),
      okTitle: t('genericYes'),
      cancelTitle: t('genericNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          const indexInArray = localCopy.value.storySteps.findIndex(s => step.storyIndex === s.storyIndex)
          const storyIndex = step.storyIndex

          localCopy.value.storySteps.splice(indexInArray, 1)

          localCopy.value.storySteps.forEach(s => {
            if (s.storyIndex > storyIndex) {
              s.storyIndex--
            }
          })

          tab.value = Math.min(tab.value, localCopy.value.storySteps.length - 1)
        }
      },
    })
  }

  function delta (step: Storysteps, delta: number) {
    // Get their indices
    const currentIndex = step.storyIndex
    const currentItem = localCopy.value.storySteps.find(i => i.storyIndex === currentIndex)
    const toSwapIndex = currentIndex + delta
    const toSwapItem = localCopy.value.storySteps.find(i => i.storyIndex === toSwapIndex)

    if (!currentItem || !toSwapItem) {
      return
    }

    // Swap their indices
    currentItem.storyIndex = toSwapIndex
    toSwapItem.storyIndex = currentIndex
    // Then physically swap the items
    ;[localCopy.value.storySteps[currentIndex], localCopy.value.storySteps[toSwapIndex]] = [localCopy.value.storySteps[toSwapIndex], localCopy.value.storySteps[currentIndex]]

    nextTick(() => {
      if (tab.value == currentIndex) {
        // Update current tab index if required.
        tab.value = toSwapIndex
      }
    })
  }

  function start () {
    errors.value = []
    if (compProps.isEdit) {
      const formErrors = new Set<string>()

      localCopy.value.storySteps.forEach(step => {
        if (!step.name || step.name.trim().length === 0) {
          formErrors.add('errorMessageStoryStepNameEmpty')
        }
      })

      if (formErrors.size > 0) {
        errors.value = [...formErrors]
        return
      } else {
        apiPatchStorySteps(localCopy.value.storyId, localCopy.value.storySteps, () => {
          emit('updated')
          hide()
        })
      }
    } else {
      const indexed: IndexedViewTableStoriesEnriched = Object.assign({ index: 0, isEdit: false }, localCopy.value)
      store.setActiveStory(indexed)
      hide()
    }
  }

  function getSrcForStep (size: string, stepId: number) {
    return getImageUrlById(stepId, {
      type: 'storysteps',
      size: size,
      token: store.storeToken ? store.storeToken.imageToken : '',
    })
  }

  function getSrc (size: string) {
    return getImageUrl(localCopy.value.storyImageName || '', {
      name: localCopy.value.storyImageName,
      type: 'storysteps',
      size: size,
      token: store.storeToken ? store.storeToken.imageToken : '',
    })
  }

  function show () {
    tab.value = 0
    errors.value = []
    localCopy.value = JSON.parse(JSON.stringify(compProps.story))
    dialog.value = true
  }
  function hide () {
    dialog.value = false
  }

  defineExpose({
    show,
    hide,
  })

  const emit = defineEmits(['updated'])
</script>
