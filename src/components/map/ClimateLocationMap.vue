<template>
  <div>
    <LocationMap map-type="cluster" :locations="locations" ref="map" />
  </div>
</template>

<script setup lang="ts">
  import LocationMap from '@/components/map/LocationMap.vue'
  import { apiPostClimateLocations } from '@/plugins/api/climate'
  import type { ViewTableLocations } from '@/plugins/types/germinate'

  import emitter from 'tiny-emitter/instance'

  const compProps = defineProps<{
    datasetIds: number[]
  }>()

  const locations = ref<ViewTableLocations[]>([])
  const map = useTemplateRef('map')

  function update () {
    if (!compProps.datasetIds || compProps.datasetIds.length === 0) {
      return
    }

    const query = {
      datasetIds: compProps.datasetIds,
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
