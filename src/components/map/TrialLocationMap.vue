<template>
  <div>
    <TrialLayout
      v-for="(dataset, index) in datasets"
      :key="`trial-layout-${dataset.datasetId}`"
      :dataset="dataset"
      :has-layout="hasLayout?.[index] || false"
      :traits="traits"
    />

    <LocationMap class="mt-5" map-type="cluster" :locations="locations" ref="map" @location-updated="update" />
  </div>
</template>

<script setup lang="ts">
  import LocationMap from '@/components/map/LocationMap.vue'
  import { apiPostTrialLocations } from '@/plugins/api/trait'
  import type { ViewTableDatasets, ViewTableLocations, ViewTableTraits } from '@/plugins/types/germinate'

  import emitter from 'tiny-emitter/instance'

  const compProps = defineProps<{
    datasets: ViewTableDatasets[]
    traits: ViewTableTraits[]
    hasLayout?: boolean[]
  }>()

  const locations = ref<ViewTableLocations[]>([])
  const map = useTemplateRef('map')

  function update () {
    if (!compProps.datasets || compProps.datasets.length === 0) {
      return
    }

    const query = {
      datasetIds: compProps.datasets.map(ds => ds.datasetId || -1),
    }

    emitter.emit('show-loading', true)

    apiPostTrialLocations(query, result => {
      if (result) {
        locations.value = result
      } else {
        locations.value = []
      }

      emitter.emit('show-loading', false)
    }, {
      codes: [404],
      callback: () => {
        // Do nothing here, it just means there is no data.
        emitter.emit('show-loading', false)
      },
    })
  }

  function invalidateSize () {
    map.value?.invalidateSize()
  }

  onMounted(() => update())

  defineExpose({
    invalidateSize,
  })
</script>
