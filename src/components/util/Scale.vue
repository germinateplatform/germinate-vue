<template>
  <div>
    <h6 v-if="heading" class="scale-heading" :title="heading">{{ heading }}</h6>
    <div class="d-flex my-2" :id="`scale-${id}`">
      <div class="d-flex align-items-center scale-container w-100">
        <div class="scale-marker" :style="{ marginLeft: `calc(${markerPercentage}% - 1px)`, backgroundColor: getColor(0) }" />
      </div>
    </div>
    <b-tooltip :target="`scale-${id}`" placement="bottom">
      <h6>{{ heading }}</h6>
        <span class="d-block">Min: {{ toFixed(min, 4)}}</span>
        <span class="d-block" :style="{ color: getColor(0) }">Avg: {{ toFixed(marker, 4) }}</span>
        <span class="d-block">Max: {{ toFixed(max, 4) }}</span>
        <span class="d-block">Count: {{ getNumberWithSuffix(count) }}</span>
    </b-tooltip>
  </div>
</template>

<script>
import colorApi from '@/mixins/colors.js'

export default {
  props: {
    heading: {
      type: String,
      default: null
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    marker: {
      type: Number,
      default: 33
    },
    count: {
      type: Number,
      default: 0
    }
  },
  data: function () {
    const id = this.uuidv4()
    return {
      id: id
    }
  },
  computed: {
    markerPercentage: function () {
      return (this.marker - this.min) * (100 - 0) / (this.max - this.min)
    }
  },
  mixins: [ colorApi ]
}
</script>

<style scoped>
.scale-heading {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.scale-container {
  background-color: #f0f3f5;
  border-radius: 0.25rem;
  height: 1rem;
  margin: .25rem 0;
}
.scale-marker {
  width: 2px;
  height: 1.5rem;
}
</style>
