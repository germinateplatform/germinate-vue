<template>
  <v-container fluid>
    <PageHeaderBreadcrumbs :items="[$t('pageMarkersTitle')]" :icon="mdiFormatIndentIncrease" :icon-rotate="90" />
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
  import { mdiFormatIndentIncrease } from '@mdi/js'

  function getData (data: PaginatedRequest) {
    return apiPostMarkerTable(data)
  }
  function getIds (data: PaginatedRequest) {
    return apiPostMarkerTableIds(data)
  }
</script>
