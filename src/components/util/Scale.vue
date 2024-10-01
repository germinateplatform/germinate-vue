<template>
  <div>
    <h6 v-if="heading" class="scale-heading d-flex align-items-center" :title="heading">
      <b-form-checkbox v-if="selectable" :checked="isSelected" @change="$emit('selection-changed', !isSelected)" />
      <router-link class="heading-text" v-if="link" :to="link">{{ heading }}</router-link>
      <span class="heading-text" v-else>{{ heading }}</span>
    </h6>
    <div class="d-flex my-2" :id="`scale-${id}`">
      <div class="d-flex align-items-center scale-container w-100">
        <div class="scale-marker" :style="{ marginLeft: `calc(${markerPercentage}% - 1px)`, backgroundColor: 'var(--primary)' }" />
      </div>
    </div>
    <b-tooltip :target="`scale-${id}`" placement="bottom">
      <h6>{{ heading }}</h6>
      <div class="d-flex justify-content-between">
        <span class="d-block"><MdiIcon :path="mdiArrowDownBold" /> {{ $t('widgetScaleMin') }} </span>
        <span class="ml-2">{{ toFixed(min, 4)}}</span>
      </div>
      <div class="d-flex justify-content-between">
        <span class="d-block" :style="{ color: 'var(--primary)' }"><MdiIcon :path="mdiDiameterVariant" /> {{ $t('widgetScaleAvg') }} </span>
        <span class="ml-2">{{ toFixed(marker, 4) }}</span>
      </div>
      <div class="d-flex justify-content-between">
        <span class="d-block"><MdiIcon :path="mdiArrowUpBold" /> {{ $t('widgetScaleMax') }} </span>
        <span class="ml-2">{{ toFixed(max, 4) }}</span>
      </div>
      <div class="d-flex justify-content-between">
        <span class="d-block"><MdiIcon :path="mdiNumeric" /> {{ $t('widgetScaleCount') }} </span>
        <span class="ml-2">{{ getNumberWithSuffix(count) }}</span>
      </div>
    </b-tooltip>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import { toFixed, getNumberWithSuffix } from '@/mixins/formatting'
import { uuidv4 } from '@/mixins/util'

import { mdiArrowDownBold, mdiArrowUpBold, mdiDiameterVariant, mdiNumeric } from '@mdi/js'

export default {
  components: {
    MdiIcon
  },
  props: {
    heading: {
      type: String,
      default: null
    },
    selectable: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
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
    const id = uuidv4()
    return {
      mdiArrowDownBold,
      mdiArrowUpBold,
      mdiDiameterVariant,
      mdiNumeric,
      id: id
    }
  },
  computed: {
    markerPercentage: function () {
      return (this.marker - this.min) * (100 - 0) / (this.max - this.min)
    }
  },
  methods: {
    toFixed,
    getNumberWithSuffix
  }
}
</script>

<style scoped>
.scale-heading {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.scale-heading .heading-text {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.scale-container {
  border-radius: 0.25rem;
  height: 1rem;
  margin: .25rem 0;
}
.scale-marker {
  width: 2px;
  height: 1.5rem;
}
</style>
<style>
.scale-container {
  background-color: #ddd;
}

.dark-mode .scale-container {
  background-color: #444;
}
</style>
