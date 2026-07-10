<template>
  <v-container fluid>
    <SearchWidget :search-term="searchTerm" />
  </v-container>
</template>

<route lang="yaml">
name: searchQuery
</route>

<script setup lang="ts">
  const route = useRoute('searchQuery')

  const searchTerm = ref<string>()

  onMounted(() => {
    if (route.params && route.params.id) {
      searchTerm.value = `${route.params.id}`
    }
  })
</script>
