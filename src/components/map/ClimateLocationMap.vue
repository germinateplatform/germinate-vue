<template>
  <div>
    <LocationMap map-type="cluster" :locations="locations" ref="map" @location-updated="update" />
  </div>
</template>

<script setup lang="ts">
  import LocationMap from '@/components/map/LocationMap.vue'
  import { apiPostClimateLocations } from '@/plugins/api/climate'
  import type { ViewTableLocations } from '@/plugins/types/germinate'

  import emitter from 'tiny-emitter/instance'

  const cdStore = climateDataStore()

  const locations = ref<ViewTableLocations[]>([])
  const map = useTemplateRef('map')

  function update () {
    if (!cdStore.storeDatasetIds || cdStore.storeDatasetIds.length === 0) {
      return
    }

    const query = {
      datasetIds: cdStore.storeDatasetIds,
    }

    emitter.emit('show-loading', true)

    apiPostClimateLocations(query, result => {
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
