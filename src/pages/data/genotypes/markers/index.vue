<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageMarkersTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageMarkersText')" />

    <MarkerTable :get-data="getData" :get-ids="getIds" />
  </v-container>
</template>

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
