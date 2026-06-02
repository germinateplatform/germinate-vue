<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pagePedigreeDefinitionsTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pagePedigreeDefinitionsText')" />

    <PedigreeTable
      class="mb-5"
      :get-data="getPedigreeData"
    />

    <PedigreeDefinitionTable
      class="mb-5"
      :get-data="getPedigreedefinitionData"
    />
  </v-container>
</template>

<script setup lang="ts">
  import { apiPostPedigreedefinitionTable, apiPostPedigreeTable } from '@/plugins/api/germplasm'
  import type { PaginatedRequest } from '@/plugins/types/germinate'

  function getPedigreeData (data: PaginatedRequest) {
    return apiPostPedigreeTable(data)
  }
  function getPedigreedefinitionData (data: PaginatedRequest) {
    return apiPostPedigreedefinitionTable(data)
  }
</script>
