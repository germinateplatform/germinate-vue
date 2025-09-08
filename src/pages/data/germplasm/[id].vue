<template>
  {{ requestedIdentifier }}
</template>

<script setup lang="ts">
  const route = useRoute('/data/germplasm/[id]')

  const requestedIdentifier = ref<string>()

  onBeforeMount(() => {
    if (route.params && route.params.id) {
      requestedIdentifier.value = route.params.id
    }
  })
</script>
