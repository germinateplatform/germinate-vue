<template>
  <Datasets :dataset-id="datasetId" />
</template>

<route lang="yaml">
name: datasetDetails
</route>

<script setup lang="ts">
  import Datasets from '@/components/widgets/Datasets.vue'

  const route = useRoute('datasetDetails')

  const datasetId = ref<number>()

  onBeforeMount(() => {
    if (route.params && route.params.id) {
      datasetId.value = +route.params.id
    }
  })
</script>
