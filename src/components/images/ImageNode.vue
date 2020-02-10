<template>
  <b-card no-body class="image-card" v-if="image">
    <a :href="getSrc('large')" class="baguettebox" @click.prevent :data-caption="image.imageDescription">
      <div>
        <img :src="getSrc('small')" class="card-img" style="height: 300px"/>
      </div>
    </a>
    <b-card-body class="card-image-details">
      <div class="mb-2">{{ image.imageDescription }}</div>
      <div class="text-muted mb-2" v-if="image.createdOn"><i class="mdi mdi-18px fix-alignment mdi-calendar-clock" /> {{ image.createdOn | toDateTime }}</div>
      <div v-if="image.tags">
        <b-badge v-for="(tag, index) in image.tags" :key="`image-tag-${image.imageId}-${index}`" class="mr-1">
          {{ tag.tagName }}
        </b-badge>
      </div>
    </b-card-body>
    <b-button :style="`color: white; background-color: ${imageTypes[image.imageRefTable].color()}; border: 1px solid ${imageTypes[image.imageRefTable].color()};`">
      <i :class="`mdi mdi-18px ${imageTypes[image.imageRefTable].icon} fix-alignment`" /> {{ image.referenceName }}
    </b-button>
  </b-card>
</template>

<script>
export default {
  props: {
    image: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      src: null,
      largeSrc: null
    }
  },
  methods: {
    getSrc: function (size) {
      var params = {
        name: this.image.imagePath,
        token: this.token ? this.token.imageToken : null,
        type: 'database',
        size: size
      }
      var paramString = this.toUrlString(params)

      return this.baseUrl + 'image/src?' + paramString
    }
  }
}
</script>

<style>
.image-card .card-img {
  width: 100%;
  object-fit: cover;
  transition: transform .2s ease-in-out;
}
.image-card .btn {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
