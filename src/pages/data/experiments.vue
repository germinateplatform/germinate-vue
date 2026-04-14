<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageExperimentsTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageExperimentsText')" />

    <ExperimentTable :get-data="getData" />
  </v-container>
</template>

<script setup lang="ts">
  import ExperimentTable from '@/components/tables/ExperimentTable.vue'
  import { apiPostExperimentTable } from '@/plugins/api/dataset'
  import type { PaginatedRequest } from '@/plugins/types/germinate'

  function getData (data: PaginatedRequest) {
    return apiPostExperimentTable(data)
  }
</script>
