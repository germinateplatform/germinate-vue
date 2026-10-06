<template>
  <div>
    <TrialLayout
      v-for="(dataset, index) in tdStore.storeDatasets"
      :key="`trial-layout-${dataset.datasetId}`"
      :dataset="dataset"
      :has-layout="hasLayout?.[index] || false"
    />

    <LocationMap class="mt-5" map-type="cluster" :locations="locations" ref="map" @location-updated="update" />
  </div>
</template>

<script setup lang="ts">
  import LocationMap from '@/components/map/LocationMap.vue'
  import { apiPostTrialLocations } from '@/plugins/api/trait'
  import type { ViewTableLocations } from '@/plugins/types/germinate'

  import emitter from 'tiny-emitter/instance'

  const compProps = defineProps<{
    hasLayout?: boolean[]
  }>()

  const locations = ref<ViewTableLocations[]>([])
  const map = useTemplateRef('map')

  const tdStore = useTraitDataStore()

  function update () {
    if (!tdStore.storeDatasetIds || tdStore.storeDatasetIds.length === 0) {
      return
    }

    const query = {
      datasetIds: tdStore.storeDatasetIds,
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
