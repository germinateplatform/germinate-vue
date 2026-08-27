<template>
  <v-dialog
    v-model="isOpen"
    max-width="900"
    scrollable
    persistent
  >
    <v-card>
      <v-toolbar color="surface">
        <v-toolbar-title>{{ $t('modalTitleEditCarousel') }}</v-toolbar-title>
        <v-spacer />
        <v-btn :icon="mdiClose" variant="text" @click="handleCancel" />
      </v-toolbar>

      <v-tabs v-model="activeLocale" show-arrows>
        <v-tab v-for="locale in locales" :key="locale.locale" :value="locale.locale">
          {{ locale.name }}
          <v-chip
            v-if="localConfigs[locale.locale]?.length"
            size="x-small"
            class="ml-2"
            variant="tonal"
          >
            {{ localConfigs[locale.locale].length }}
          </v-chip>
        </v-tab>
      </v-tabs>

      <v-divider />

      <v-card-text style="max-height: 65vh;">
        <v-window v-model="activeLocale">
          <v-window-item
            v-for="locale in locales"
            :key="locale.locale"
            :value="locale.locale"
          >
            <v-alert
              v-if="!localConfigs[locale.locale] || localConfigs[locale.locale].length === 0"
              type="info"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              No images configured for this locale yet.
            </v-alert>

            <v-row v-else dense>
              <v-col
                v-for="(image, index) in localConfigs[locale.locale]"
                :key="image._id"
                cols="12"
                sm="6"
                md="4"
              >
                <v-card class="d-flex flex-column h-100">
                  <v-img
                    :src="image.src"
                    height="140"
                    cover
                    class="bg-grey-lighten-2"
                  >
                    <template #placeholder>
                      <v-row class="fill-height ma-0" align="center" justify="center">
                        <v-icon :icon="mdiImageOff" size="32" color="grey" />
                      </v-row>
                    </template>
                  </v-img>

                  <v-card-text class="flex-grow-1">
                    <v-text-field
                      v-model="image.name"
                      readonly
                      :label="$t('tableColumnImagePath')"
                      hide-details
                      class="mb-2"
                    />
                    <v-textarea
                      v-model="image.text"
                      :label="$t('tableColumnImageDescription')"
                      auto-grow
                      rows="2"
                      hide-details
                    />
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer />
                    <v-btn-group>
                      <v-btn
                        :icon="mdiArrowUp"
                        size="small"
                        :disabled="index === 0"
                        @click="moveImage(locale.locale, image._id, -1)"
                      />
                      <v-btn
                        :icon="mdiArrowDown"
                        size="small"
                        :disabled="index === localConfigs[locale.locale].length - 1"
                        @click="moveImage(locale.locale, image._id, 1)"
                      />
                      <v-btn
                        :icon="mdiDelete"
                        color="error"
                        size="small"
                        @click="removeImage(locale.locale, image._id)"
                      />
                    </v-btn-group>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>

            <v-file-input
              class="mt-4"
              :label="$t('formLabelCarouselImageAdd')"
              :prepend-inner-icon="mdiImagePlus"
              prepend-icon=""
              chips
              show-size
              accept="image/*"
              hide-details
              :model-value="[]"
              @update:model-value="(file: File | File[]) => handleFilesSelected(locale.locale, file as File)"
            />
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="handleCancel">Cancel</v-btn>
        <v-btn color="primary" variant="flat" @click="handleSave">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { CarouselConfig, ImageConfig } from '@/components/structure/ImageCarousel.vue'
  import { apiDeleteTemplateImageByName, apiPostCarouselImage } from '@/plugins/api/image'
  import { apiGetLocales, apiPostTemplateCarouselConfig } from '@/plugins/api/setting'
  import type { LocaleConfig } from '@/plugins/types/germinate'
  import { getImageUrl } from '@/plugins/util/image'
  import { coreStore } from '@/stores/app'
  import { mdiArrowDown, mdiArrowUp, mdiClose, mdiDelete, mdiImageOff, mdiImagePlus } from '@mdi/js'

  interface EditableImageConfig extends ImageConfig {
    _id: string
  }

  const props = defineProps<{
    configs?: CarouselConfig
  }>()

  const locales = ref<LocaleConfig[]>([{
    locale: 'en_GB',
    name: 'British English',
    flag: 'gb',
  }])

  const store = coreStore()

  const localeIds = computed(() => locales.value.map(l => l.locale))

  const activeLocale = shallowRef<string>(locales.value[0].locale ?? '')
  const localConfigs = ref<Record<string, EditableImageConfig[]>>({})

  const uploadedImages = ref<string[]>([])

  const isOpen = ref(false)

  function genId (): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  function moveImage (locale: string, id: string, delta: -1 | 1) {
    const list = localConfigs.value[locale]
    if (!list) return

    const index = list.findIndex(image => image._id === id)
    if (index === -1) return

    const targetIndex = index + delta
    if (targetIndex < 0 || targetIndex >= list.length) return // already at an edge

    const [moved] = list.splice(index, 1)
    list.splice(targetIndex, 0, moved)
  }

  function resetFromProps () {
    const next: Record<string, EditableImageConfig[]> = {}
    for (const locale of locales.value) {
      const source = props.configs?.[locale.locale] ?? []
      next[locale.locale] = source.map(image => {
        image.src = getImageUrl(image.name, {
          name: image.name,
          token: store.storeToken ? store.storeToken.imageToken : undefined,
          type: 'template',
          size: 'small',
        })
        return {
          ...image,
          _id: genId(),
        }
      })
    }
    localConfigs.value = next

    if (!localeIds.value.includes(activeLocale.value)) {
      activeLocale.value = locales.value[0].locale ?? ''
    }
  }

  watch(isOpen, open => {
    if (open) {
      resetFromProps()
    }
  }, { immediate: true })

  function removeImage (locale: string, id: string) {
    const list = localConfigs.value[locale]
    if (!list) return

    const index = list.findIndex(image => image._id === id)
    if (index === -1) return

    const [removed] = list.splice(index, 1)

    // Delete from server
    apiDeleteTemplateImageByName(removed.name, () => {}, {
      codes: [404],
      callback: () => {},
    })
  }

  function handleFilesSelected (locale: string, file: File) {
    if (!localConfigs.value[locale]) {
      localConfigs.value[locale] = []
    }

    const formData = new FormData()
    formData.append('imageFile', file)
    formData.append('locale', activeLocale.value)

    apiPostCarouselImage(formData, result => {
      uploadedImages.value.push(result)
      localConfigs.value[locale].push({
        name: result,
        text: '',
        src: getImageUrl(result, {
          name: result,
          token: store.storeToken ? store.storeToken.imageToken : undefined,
          type: 'template',
          size: 'small',
        }),
        _id: genId(),
      })
    })
  }

  function buildSavePayload (): CarouselConfig {
    const configs: CarouselConfig = {}

    for (const locale of locales.value) {
      configs[locale.locale] = (localConfigs.value[locale.locale] ?? []).map(image => {
        const { _id, src, ...rest } = image
        return rest
      })
    }

    return configs
  }

  function handleSave () {
    const payload = buildSavePayload()

    apiPostTemplateCarouselConfig(payload, () => {
      emit('config-changed')
    })

    isOpen.value = false
  }

  function handleCancel () {
    isOpen.value = false

    if (uploadedImages.value.length > 0) {
      uploadedImages.value.forEach(image => {
        apiDeleteTemplateImageByName(image, () => {}, {
          codes: [404],
          callback: () => {},
        })
      })
    }
  }

  function show () {
    isOpen.value = true
  }

  onMounted(() => {
    uploadedImages.value = []
    // Get locales
    apiGetLocales(result => {
      locales.value = result
    })
  })

  const emit = defineEmits(['config-changed'])

  defineExpose({
    show,
  })
</script>
