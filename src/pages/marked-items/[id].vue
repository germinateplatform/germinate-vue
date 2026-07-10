<template>
  <MarkedItems :type="itemType" />
</template>

<route lang="yaml">
name: markedItemType
</route>

<script setup lang="ts">
  import MarkedItems from '@/components/widgets/MarkedItems.vue'
  import type { MarkedItemType } from '@/plugins/types/MarkedItemType'

  const route = useRoute('markedItemType')

  const itemType = ref<MarkedItemType>()

  onMounted(() => {
    if (route.params && route.params.id) {
      itemType.value = route.params.id as MarkedItemType
    }
  })
</script>
