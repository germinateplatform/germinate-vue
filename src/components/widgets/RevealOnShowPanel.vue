<template>
  <div>
    <slot v-if="isVisible" />
  </div>
</template>

<script setup lang="ts">
  const compProps = defineProps<{
    showing: boolean
  }>()

  const isVisible = ref(false)

  watch(() => compProps.showing, async newValue => {
    if (newValue) {
      isVisible.value = true
    }
  }, { immediate: true })

  onMounted(() => {
    if (compProps.showing === undefined) {
      isVisible.value = true
    }
  })
</script>
