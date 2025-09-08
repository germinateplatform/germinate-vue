<template>
  <v-container fluid>
    <h1 class="text-h4 mb-3">{{ $t('pageTaxonomiesTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pageTaxonomiesText')" />

    <TaxonomyTable :get-data="getData" />
  </v-container>
</template>

<script setup lang="ts">
  import TaxonomyTable from '@/components/tables/TaxonomyTable.vue'
  import { apiPostTaxonomyTable } from '@/plugins/api/germplasm'
  import type { PaginatedRequest } from '@/plugins/types/germinate'

  function getData (data: PaginatedRequest) {
    return apiPostTaxonomyTable(data)
  }
</script>
