<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageExperimentsTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageExperimentsText')" />

    <ExperimentTable :get-data="getData" :download="downloadTable" />
  </v-container>
</template>

<script setup lang="ts">
  import ExperimentTable from '@/components/tables/ExperimentTable.vue'
  import { apiPostExperimentTable } from '@/plugins/api/dataset'
  import { apiPostTableExport } from '@/plugins/api/misc'
  import type { PaginatedRequest } from '@/plugins/types/germinate'

  function getData (data: PaginatedRequest) {
    return apiPostExperimentTable(data)
  }
  function downloadTable(data: PaginatedRequest) {
    return apiPostTableExport({ filters: data.filters }, 'experiment')
  }
</script>
