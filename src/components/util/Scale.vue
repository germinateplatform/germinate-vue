<template>
  <div :id="`scale-${id}`">
    <h6 v-if="heading" class="scale-heading" :title="heading">
      <router-link v-if="link" :to="link">{{ heading }}</router-link>
      <template v-else>{{ heading }}</template>
    </h6>
    <div class="d-flex my-2">
      <div class="d-flex align-items-center scale-container w-100">
        <div class="scale-marker" :style="{ marginLeft: `calc(${markerPercentage}% - 1px)`, backgroundColor: getColor(0) }" />
      </div>
    </div>
    <b-tooltip :target="`scale-${id}`" placement="bottom">
      <h6>{{ heading }}</h6>
      <div class="d-flex justify-content-between">
        <span class="d-block"><i class="mdi mdi-arrow-down-bold" /> {{ $t('widgetScaleMin') }} </span>
        <span class="ml-2">{{ toFixed(min, 4)}}</span>
      </div>
      <div class="d-flex justify-content-between">
        <span class="d-block" :style="{ color: getColor(0) }"><i class="mdi mdi-diameter-variant" /> {{ $t('widgetScaleAvg') }} </span>
        <span class="ml-2">{{ toFixed(marker, 4) }}</span>
      </div>
      <div class="d-flex justify-content-between">
        <span class="d-block"><i class="mdi mdi-arrow-up-bold" /> {{ $t('widgetScaleMax') }} </span>
        <span class="ml-2">{{ toFixed(max, 4) }}</span>
      </div>
      <div class="d-flex justify-content-between">
        <span class="d-block"><i class="mdi mdi-numeric" /> {{ $t('widgetScaleCount') }} </span>
        <span class="ml-2">{{ getNumberWithSuffix(count) }}</span>
      </div>
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
    },
    link: {
      type: Object,
      default: null
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
