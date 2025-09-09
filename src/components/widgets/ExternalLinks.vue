<template>
  <ul v-if="links && links.length > 0">
    <template v-for="(link, index) in links">
      <li :key="`link-widget-${index}`" v-if="link.hyperlink">
        <a :href="link.hyperlink" target="_blank" rel="noopener noreferrer">{{ link.linktypeDescription }}</a> <v-icon icon="mdi-open-in-new" />
      </li>
    </template>
  </ul>
</template>

<script setup lang="ts">
  import { apiPostLinks } from '@/plugins/api/misc'
  import type { ViewTableLinks } from '@/plugins/types/germinate'

  const compProps = defineProps<{
    foreignId: number
    targetTable: string
  }>()

  const links = ref<ViewTableLinks[]>()

  watchEffect(() => {
    // Set up the query
    const query = {
      targetTable: compProps.targetTable,
      foreignId: compProps.foreignId,
    }

    // Query the API
    apiPostLinks<ViewTableLinks[]>(query, result => {
      links.value = result
    })
  })
</script>
