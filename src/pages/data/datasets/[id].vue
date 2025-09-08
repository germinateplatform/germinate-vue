<template>
  <Datasets :dataset-id="datasetId" />
</template>

<script setup lang="ts">
  import Datasets from '@/components/widgets/Datasets.vue'

  const route = useRoute('/data/datasets/[id]')

  const datasetId = ref<number>()

  onBeforeMount(() => {
    if (route.params && route.params.id) {
      datasetId.value = +route.params.id
    }
  })
</script>
