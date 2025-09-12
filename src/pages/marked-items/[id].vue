<template>
  <MarkedItems :type="itemType" />
</template>

<script setup lang="ts">
  import MarkedItems from '@/components/widgets/MarkedItems.vue'
  import type { MarkedItemType } from '@/plugins/types/MarkedItemType'

  const route = useRoute('/marked-items/[id]')

  const itemType = ref<MarkedItemType>()

  onMounted(() => {
    if (route.params && route.params.id) {
      itemType.value = route.params.id as MarkedItemType
    }
  })
</script>
