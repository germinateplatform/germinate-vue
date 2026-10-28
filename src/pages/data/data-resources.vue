<template>
  <v-container fluid>
    <p v-html="$t('pageDataResourcesText')" />

    <FileresourceTable :get-data="getData" />
  </v-container>
</template>

<route lang="yaml">
name: dataResources
</route>

<script setup lang="ts">
  import { apiPostFileResourceTable } from '@/plugins/api/dataset'
  import type { PaginatedRequest } from '@/plugins/types/germinate'

  function getData (data: PaginatedRequest) {
    return apiPostFileResourceTable(data)
  }
</script>
