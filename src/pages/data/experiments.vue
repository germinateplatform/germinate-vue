<template>
  <v-container fluid>
    <PageHeaderBreadcrumbs :items="[$t('pageExperimentsTitle')]" :icon="mdiFolderTable" />
    <v-divider class="mb-3" />
    <p v-html="$t('pageExperimentsText')" />

    <ExperimentTable :get-data="getData" />
  </v-container>
</template>

<route lang="yaml">
name: experiments
</route>

<script setup lang="ts">
  import ExperimentTable from '@/components/tables/ExperimentTable.vue'
  import { apiPostExperimentTable } from '@/plugins/api/dataset'
  import type { PaginatedRequest } from '@/plugins/types/germinate'
  import { mdiFolderTable } from '@mdi/js'

  function getData (data: PaginatedRequest) {
    return apiPostExperimentTable(data)
  }
</script>
