<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageMapsTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageMapsText')" />

    <MapTable :get-data="getData" />
  </v-container>
</template>

<script setup lang="ts">
  import MapTable from '@/components/tables/MapTable.vue'
  import { apiPostMapsTable } from '@/plugins/api/genotype'
  import type { PaginatedRequest } from '@/plugins/types/germinate'

  function getData (data: PaginatedRequest) {
    return apiPostMapsTable(data)
  }
</script>
