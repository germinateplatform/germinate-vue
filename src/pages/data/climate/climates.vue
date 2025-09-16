<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageClimatesTitle') }}</h1>
    <v-divider class="mb-3" />

    <ClimateTable :get-data="getData" />
  </v-container>
</template>

<script setup lang="ts">
  import ClimateTable from '@/components/tables/ClimateTable.vue'
  import { apiPostClimateTable } from '@/plugins/api/climate'
  import type { PaginatedRequest } from '@/plugins/types/germinate'

  function getData (data: PaginatedRequest) {
    return apiPostClimateTable(data)
  }
</script>
