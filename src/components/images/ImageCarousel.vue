<template>
  <b-carousel
    class="image-carousel"
    v-if="images"
    :interval="5000"
    controls
    :img-height="600"
    indicators>
    <b-carousel-slide
      v-for="image in images[locale]"
      :key="`dashboard-carousel-${image.name}`"
      :caption-html="image.text"
      :img-src="image.src" >
      <template v-slot:img>
        <!-- Add rounded corners to image -->
        <b-img class="rounded w-100" :src="image.src" />
      </template>
    </b-carousel-slide>
  </b-carousel>
</template>

<script>
import miscApi from '@/mixins/api/misc.js'

export default {
  data: function () {
    return {
      images: null
    }
  },
  methods: {
    setImagePath: function (index) {
      var params = {
        name: this.images[this.locale][index].name,
        token: this.token ? this.token.imageToken : null,
        type: 'template',
        size: 'large'
      }

      var paramString = this.toUrlString(params)

      for (var locale in this.images) {
        this.images[locale][index].src = this.baseUrl + 'image/src?' + paramString
      }
    }
  },
  mixins: [ miscApi ],
  mounted: function () {
    // Get carousel configuration file
    this.apiGetSettingsFile({
      'file-type': 'carousel'
    }, result => {
      for (var locale in result) {
        result[locale].forEach(i => {
          i.src = null
        })
      }
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
