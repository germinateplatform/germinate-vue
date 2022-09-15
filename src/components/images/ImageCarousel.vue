<template>
  <b-carousel
    class="image-carousel"
    v-if="images"
    :interval="5000"
    controls
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
</template>

<script>
import { mapGetters } from 'vuex'

import { getImageUrl } from '@/mixins/image'
import { apiGetSettingsFile } from '@/mixins/api/misc'

export default {
  computed: {
    ...mapGetters([
      'storeLocale',
      'storeToken'
    ])
  },
  data: function () {
    return {
      images: null
    }
  },
  methods: {
    setImagePath: function (imageIndex) {
      Object.keys(this.images).forEach(storeLocale => {
        this.images[storeLocale][imageIndex].src = getImageUrl(this.images[this.storeLocale][imageIndex].name, {
          name: this.images[this.storeLocale][imageIndex].name,
          token: this.storeToken ? this.storeToken.imageToken : null,
          type: 'template',
          size: 'large'
        })
      })
    }
  },
  mounted: function () {
    // Get carousel configuration file
    apiGetSettingsFile({
      'file-type': 'carousel'
    }, result => {
      Object.keys(result).forEach(storeLocale => result[storeLocale].forEach(i => { i.src = null }))
      this.images = result

      this.images.en_GB.forEach((image, index) => this.setImagePath(index))
    }, {
      codes: [404],
      callback: () => {
        // Do nothing here, it just means there is no carousel file
      }
    })
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
