<template>
  <div v-if="store.storeUserIsAdmin || (configs && images && images.length > 0)">
    <v-carousel
      v-model="currentIndex"
      show-arrows="hover"
      progress="primary"
      height="auto"
      hide-delimiters
      cycle
    >
      <v-carousel-item
        v-for="(image, index) in images"
        :key="`image-${index}`"
        :src="image.src"
        :cover="lgAndDown"
        max-height="50vh"
        :contain="!lgAndDown"
      />

      <v-overlay
        :scrim="false"
        content-class="w-100 h-100 d-flex flex-column align-center justify-space-between pointer-pass-through pa-3"
        style="z-index: 1000;"
        contained
        model-value
        no-click-animation
        persistent
        v-if="currentItem"
      >
        <v-chip
          :text="`${ currentIndex + 1 } / ${images.length }`"
          size="small"
          variant="flat"
        />
        <v-scroll-x-transition mode="out-in" appear v-if="currentItem.text">
          <v-sheet
            :key="currentIndex"
            rounded
            border
          >
            <v-list-item
              class="pa-2 px-6 text-wrap"
            >
              <v-list-item-subtitle class="text-wrap">{{ currentItem.text }}</v-list-item-subtitle>
            </v-list-item>
          </v-sheet>
        </v-scroll-x-transition>
      </v-overlay>
    </v-carousel>

    <v-btn
      v-if="store.storeUserIsAdmin"
      :icon="mdiPencil"
      size="small"
      @click="editCarouselConfigModal?.show()"
    />

    <EditCarouselConfigModal
      :configs="configs"
      @config-changed="update"
      ref="editCarouselConfigModal"
    />
  </div>
</template>

<script setup lang="ts">
  import { apiGetTemplateCarouselConfig } from '@/plugins/api/setting'
  import { getImageUrl } from '@/plugins/util/image'
  import { coreStore } from '@/stores/app'
  import { mdiPencil } from '@mdi/js'
  import { useDisplay } from 'vuetify'

  export interface ImageConfig {
    name: string
    text?: string
    src?: string
  }

  export type CarouselConfig = { [key: string]: ImageConfig[] }

  const { lgAndDown } = useDisplay()
  const store = coreStore()
  const currentIndex = shallowRef(0)
  const currentItem = toRef(() => images.value ? images.value[currentIndex.value] : undefined)
  const configs = ref<CarouselConfig>()

  const editCarouselConfigModal = useTemplateRef('editCarouselConfigModal')

  const images: ComputedRef<ImageConfig[]> = computed(() => {
    if (configs.value) {
      const locale = store.storeLocale || 'en_GB'
      return configs.value[locale].map(i => {
        i.src = getImageUrl(i.name, {
          name: i.name,
          token: store.storeToken ? store.storeToken.imageToken : undefined,
          type: 'template',
          size: 'large',
        })
        return i
      })
    } else {
      return []
    }
  })

  function update () {
    apiGetTemplateCarouselConfig((result: CarouselConfig) => {
      configs.value = result
    }, {
      codes: [404],
      callback: () => {
        configs.value = undefined
      },
    })
  }

  onMounted(() => update())
</script>
