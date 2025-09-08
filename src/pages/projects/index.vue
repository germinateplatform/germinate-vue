<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageProjectsTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageProjectsText')" />

    <ProjectTable :get-data="getData" :get-ids="getIds" />
  </v-container>
</template>

<script setup lang="ts">
  import ProjectTable from '@/components/tables/ProjectTable.vue'
  import { apiPostProjectTable, apiPostProjectTableIds } from '@/plugins/api/project'
  import type { PaginatedRequest } from '@/plugins/types/germinate'

  function getData (data: PaginatedRequest) {
    return apiPostProjectTable(data)
  }
  function getIds (data: PaginatedRequest) {
    return apiPostProjectTableIds(data)
  }
</script>
