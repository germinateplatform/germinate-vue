<template>
  <div>
    <v-progress-linear v-if="loading" aria-label="Loading map" indeterminate />
    <v-alert v-if="error" :text="error" type="error" variant="tonal" />

    <v-map
      ref="map"
      v-model:zoom="zoom"
      height="600"
      :max-zoom="maxZoom"
      :style="{
        '--v-map-base-stroke-width': `${border / zoom}px`,
        '--v-map-focus-stroke-width': '2px',
      }"
      :svg="svg"
      label="World countries"
      :wheel-zoom="false"
      :regions="regions"
    >
      <template #tooltip="{ region }">
        <strong>{{ region.title }}</strong>
        <v-chip class="ms-3" label :color="region.color" size="small" variant="flat">
          {{
            // @ts-expect-error
            getNumberWithSuffix(region.count ?? 0, 1)
          }}
        </v-chip>
      </template>
    </v-map>

    <p class="mt-3 text-label-small text-medium-emphasis">
      Map by <a href="https://github.com/VictorCazanave/svg-maps/tree/master/packages/world" rel="noopener" target="_blank">SVG Maps</a>
      (<a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener" target="_blank">CC BY 4.0</a>).
    </p>
  </div>
</template>

<script setup lang="ts">
  import { VMap } from 'vuetify/labs/VMap'
  import type { CountryData } from '@/components/charts/GermplasmDensityChoropleth.vue'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'

  const compProps = defineProps<{
    chartData: CountryData[]
  }>()

  const maxZoom = 32
  const zoom = shallowRef(1)
  // on-screen width grows from 1 at the full map to 2 at max zoom; strokes scale with zoom, so divide it back out
  const border = toRef(() => 1 + Math.log(zoom.value) / Math.log(maxZoom))
  const svg = shallowRef()
  const loading = shallowRef(true)
  const error = shallowRef('')

  const regions = computed(() => {
    const result: Record<string, any> = {}

    if (compProps.chartData) {
      compProps.chartData.forEach(c => {
        result[c.code_2.toLowerCase()] = {
          title: c.country,
          color: c.color,
          count: c.count,
        }
      })
    }

    return result
  })

  // async function onLoad () {
  //   await nextTick()
  //   map.value?.reveal('gr', { zoom: true })
  // }

  onMounted(async () => {
    try {
      const response = await fetch('https://cdn.jsdelivr.net/npm/@svg-maps/world@2.0.0/world.svg')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      svg.value = await response.text()
    } catch {
      error.value = 'Could not load the map from jsDelivr.'
    } finally {
      loading.value = false
    }
  })
</script>
