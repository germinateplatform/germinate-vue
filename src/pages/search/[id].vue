<template>
  <v-container fluid>
    <SearchWidget :search-term="searchTerm" />
  </v-container>
</template>

<script setup lang="ts">
  const route = useRoute('/search/[id]')

  const searchTerm = ref<string>()

  onMounted(() => {
    if (route.params && route.params.id) {
      searchTerm.value = route.params.id
    }
  })
</script>
