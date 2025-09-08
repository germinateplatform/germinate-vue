<template>
  <v-carousel
    v-if="configs && images && images.length > 0"
    v-model="currentIndex"
    show-arrows="hover"
    progress="primary"
    hide-delimiters
    cycle
  >
    <v-carousel-item
      v-for="(image, index) in images"
      :key="`image-${index}`"
      :src="image.src"
      :cover="lgAndDown"
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
      <v-scroll-x-transition mode="out-in" appear>
        <v-sheet
          :key="currentIndex"
          rounded="xl"
          border
        >
          <v-list-item
            class="pa-2 px-6 text-wrap"
          >
            <v-list-item-subtitle class="text-wrap" v-text="currentItem.text" />
          </v-list-item>
        </v-sheet>
      </v-scroll-x-transition>
    </v-overlay>
  </v-carousel>
</template>

<script setup lang="ts">
  import { apiGetTemplateCarouselConfig } from '@/plugins/api/misc'
  import { getImageUrl } from '@/plugins/util/image'
  import { coreStore } from '@/stores/app'
  import { useDisplay } from 'vuetify'

  interface ImageConfig {
    name: string
    text?: string
    src?: string
  }

  type CarouselConfig = { [key: string]: ImageConfig[] }

  const { lgAndDown } = useDisplay()
  const store = coreStore()
  const currentIndex = shallowRef(0)
  const currentItem = toRef(() => images.value ? images.value[currentIndex.value] : undefined)
  const configs = ref<CarouselConfig>()

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

  apiGetTemplateCarouselConfig((result: CarouselConfig) => {
    configs.value = result
  }, {
    codes: [404],
    callback: () => {
      configs.value = undefined
    },
  })
</script>
