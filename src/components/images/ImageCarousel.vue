<template>
  <div>
    <b-carousel
      class="image-carousel"
      v-if="images"
      :interval="5000"
      controls
      fade
      v-model="slide"
      :img-height="600"
      indicators>
      <b-carousel-slide
        v-for="(image, index) in images[storeLocale]"
        :key="`dashboard-carousel-${index}`"
        :caption-html="image.text"
        :img-src="image.src" >
        <template v-slot:img>
          <!-- Add rounded corners to image -->
          <b-img class="w-100" :src="image.src" :alt="image.text" />
        </template>
      </b-carousel-slide>
    </b-carousel>

    <div v-if="storeToken && userIsAtLeast(storeToken.userType, 'Administrator')">
      <b-button @click="$refs.carouselEditModal.show()">{{ $t('buttonEditCarousel') }}</b-button>

      <CarouselEditModal ref="carouselEditModal" @change="update" />
    </div>
  </div>
</template>

<script>
import CarouselEditModal from '@/components/modals/CarouselEditModal'

import { mapGetters } from 'vuex'

import { userIsAtLeast } from '@/mixins/api/auth'
import { getImageUrl } from '@/mixins/image'
import { apiGetTemplateCarouselConfig } from '@/mixins/api/misc'

export default {
  components: {
    CarouselEditModal
  },
  computed: {
    ...mapGetters([
      'storeLocale',
      'storeToken'
    ])
  },
  data: function () {
    return {
      slide: 0,
      images: null
    }
  },
  methods: {
    userIsAtLeast,
    setImagePath: function (imageIndex) {
      Object.keys(this.images).forEach(storeLocale => {
        this.images[storeLocale][imageIndex].src = getImageUrl(this.images[this.storeLocale][imageIndex].name, {
          name: this.images[this.storeLocale][imageIndex].name,
          token: this.storeToken ? this.storeToken.imageToken : null,
          type: 'template',
          size: 'large'
        })
      })
    },
    update: function () {
      // Get carousel configuration file
      apiGetTemplateCarouselConfig(result => {
        Object.keys(result).forEach(storeLocale => result[storeLocale].forEach(i => { i.src = null }))
        this.images = result
        this.slide = 0

        this.images.en_GB.forEach((image, index) => this.setImagePath(index))
      }, {
        codes: [404],
        callback: () => {
          this.images = []
          this.slide = 0
          // Do nothing here, it just means there is no carousel file
        }
      })
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>
.carousel-caption {
  background-color: rgba(0,0,0,.5);
}
.image-carousel img {
  min-height: 300px;
  object-fit: cover;
}
</style>
