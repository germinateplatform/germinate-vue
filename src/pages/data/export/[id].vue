<template>
  <DataExportComponent :dataset-type="datasetType" />
</template>

<route lang="yaml">
name: exportType
</route>

<script setup lang="ts">
  import { datasetTypes } from '@/plugins/util/types'

  const route = useRoute('exportType')

  const datasetType = ref<string>()

  onMounted(() => {
    if (route && route.params && route.params.id && datasetTypes[`${route.params.id}`]) {
      datasetType.value = `${route.params.id}`
    }
  })
</script>
