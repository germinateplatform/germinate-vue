<template>
  <v-container fluid>
    <h1 class="text-headline-large mb-3">{{ $t('pagePublicationsTitle') }}</h1>
    <v-divider class="mb-3" />
    <p v-html="$t('pagePublicationsText')" />

    <PublicationTable :get-data="getData" />
  </v-container>
</template>

<route lang="yaml">
name: publications
</route>

<script setup lang="ts">
  import { apiPostPublicationsTable } from '@/plugins/api/publication'
  import type { PaginatedRequest } from '@/plugins/types/germinate'

  function getData (data: PaginatedRequest) {
    return apiPostPublicationsTable(data, result => {
      if (result && result.data && result.data.length > 0) {
        result.data.forEach(p => {
          try {
            p.publicationFallbackCache = JSON.parse(p.publicationFallbackCache)
          } catch {
            //
          }
        })
      }
    })
  }
</script>
