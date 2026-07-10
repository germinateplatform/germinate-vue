<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageDataResourcesTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageDataResourcesText')" />

    <FileResourceTable :get-data="getData" />
  </v-container>
</template>

<route lang="yaml">
name: dataResources
</route>

<script setup lang="ts">
  import FileResourceTable from '@/components/tables/FileResourceTable.vue'
  import { apiPostFileResourceTable } from '@/plugins/api/dataset'
  import type { PaginatedRequest } from '@/plugins/types/germinate'

  function getData (data: PaginatedRequest) {
    return apiPostFileResourceTable(data)
  }
</script>
