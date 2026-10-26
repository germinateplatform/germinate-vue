<template>
  <v-container fluid>
    <ClimateTable :get-data="getData" />
  </v-container>
</template>

<route lang="yaml">
name: climates
</route>

<script setup lang="ts">
  import ClimateTable from '@/components/tables/ClimateTable.vue'
  import { apiPostClimateTable } from '@/plugins/api/climate'
  import type { PaginatedRequest } from '@/plugins/types/germinate'

  function getData (data: PaginatedRequest) {
    return apiPostClimateTable(data)
  }
</script>
