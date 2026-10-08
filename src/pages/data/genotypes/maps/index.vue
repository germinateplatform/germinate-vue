<template>
  <v-container fluid>
    <PageHeaderBreadcrumbs :items="[$t('pageMapsTitle')]" :icon="mdiReorderVertical" />
    <v-divider class="mb-3" />
    <p v-html="$t('pageMapsText')" />

    <MapTable :get-data="getData" />
  </v-container>
</template>

<route lang="yaml">
name: maps
</route>

<script setup lang="ts">
  import MapTable from '@/components/tables/MapTable.vue'
  import { apiPostMapsTable } from '@/plugins/api/genotype'
  import type { PaginatedRequest } from '@/plugins/types/germinate'
  import { mdiReorderVertical } from '@mdi/js'

  function getData (data: PaginatedRequest) {
    return apiPostMapsTable(data)
  }
</script>
