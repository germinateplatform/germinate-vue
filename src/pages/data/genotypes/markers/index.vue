<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pageMarkersTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageMarkersText')" />

    <MarkerTable :get-data="getData" :get-ids="getIds" />
  </v-container>
</template>

<route lang="yaml">
name: markers
</route>

<script setup lang="ts">
  import MarkerTable from '@/components/tables/MarkerTable.vue'
  import { apiPostMarkerTable, apiPostMarkerTableIds } from '@/plugins/api/genotype'
  import type { PaginatedRequest } from '@/plugins/types/germinate'

  function getData (data: PaginatedRequest) {
    return apiPostMarkerTable(data)
  }
  function getIds (data: PaginatedRequest) {
    return apiPostMarkerTableIds(data)
  }
</script>
