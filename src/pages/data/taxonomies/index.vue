<template>
  <v-container fluid>
    <PageHeaderBreadcrumbs :items="[$t('pageTaxonomiesTitle')]" :icon="mdiLan" />
    <v-divider class="mb-3" />
    <p v-html="$t('pageTaxonomiesText')" />

    <TaxonomyTable :get-data="getData" />
  </v-container>
</template>

<route lang="yaml">
name: taxonomies
</route>

<script setup lang="ts">
  import TaxonomyTable from '@/components/tables/TaxonomyTable.vue'
  import { apiPostTaxonomyTable } from '@/plugins/api/germplasm'
  import type { PaginatedRequest } from '@/plugins/types/germinate'
  import { mdiLan } from '@mdi/js'

  function getData (data: PaginatedRequest) {
    return apiPostTaxonomyTable(data)
  }
</script>
