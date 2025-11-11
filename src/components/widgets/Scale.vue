<template>
  <div>
    <h4 v-if="heading" class="scale-heading d-flex align-center" :title="heading">
      <v-checkbox hide-details density="compact" v-if="selectable" v-model="localSelected">
        <template #label>
          <router-link class="heading-text" v-if="to" :to="to">{{ heading }}</router-link>
          <span class="heading-text" v-else>{{ heading }}</span>
        </template>
      </v-checkbox>
    </h4>

    <v-tooltip text="Tooltip" location="bottom">
      <div>
        <h4>{{ heading }}</h4>
        <div class="d-flex justify-content-between">
          <span class="d-block"><v-icon icon="mdi-arrow-up-bold" /> {{ $t('widgetScaleMax') }} </span>
          <span class="ml-2">{{ toFixed(max, 4) }}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span class="d-block" :style="{ color: 'var(--primary)' }"><v-icon icon="mdi-diameter-variant" /> {{ $t('widgetScaleAvg') }} </span>
          <span class="ml-2">{{ toFixed(marker, 4) }}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span class="d-block"><v-icon icon="mdi-arrow-down-bold" /> {{ $t('widgetScaleMin') }} </span>
          <span class="ml-2">{{ toFixed(min, 4) }}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span class="d-block"><v-icon icon="mdi-numeric" /> {{ $t('widgetScaleCount') }} </span>
          <span class="ml-2">{{ getNumberWithSuffix(count) }}</span>
        </div>
      </div>

      <template #activator="{ props }">
        <div class="d-flex my-2" :id="`scale-${id}`" v-bind="props">
          <div class="d-flex align-center scale-container w-100" :style="{ backgroundColor: store.storeIsDarkMode ? 'rgb(var(--v-theme-surface-light))' : 'rgb(var(--v-theme-surface-dark))' }">
            <div class="scale-marker" :style="{ marginLeft: `calc(${markerPercentage}% - 1px)`, backgroundColor: 'rgb(var(--v-theme-primary))' }" />
          </div>
        </div>
      </template>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
  import { uuidv4 } from '@/plugins/util'
  import { getNumberWithSuffix, toFixed } from '@/plugins/util/formatting'
  import { coreStore } from '@/stores/app'

  export interface ScaleProps {
    heading: string
    selectable?: boolean
    modelValue: boolean
    min?: number
    max?: number
    marker?: number
    count?: number
    to?: string
  }

  const compProps = withDefaults(defineProps<ScaleProps>(), {
    selectable: false,
    min: 0,
    max: 100,
    marker: 33,
    count: 0,
  })

  const store = coreStore()
  const emit = defineEmits(['update:model-value'])

  const id = ref<string>(uuidv4())
  const localSelected = ref<boolean>(false)

  watch(() => compProps.modelValue, async (newValue: boolean) => {
    localSelected.value = newValue
  })
  watch(localSelected, async (newValue: boolean) => emit('update:model-value', newValue))

  const markerPercentage = computed(() => (compProps.marker - compProps.min) * (100 - 0) / (compProps.max - compProps.min))
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
.scale-container {
  background-color: #aaa;
}
</style>
