<template>
  <StatsBarChart
    :data="data"
    :user-selection="userSelection"
    :title="title"
    :x-value="xValue"
    :filename="xValue"
    :x-values="xValues"
    :x-labels="xLabels"
    :sort-by-x="sortByX"
    v-if="data"
  >
    <template #card-text>
      <v-card-text>
        <slot name="text" />
        <StatsHighlightSelection :selection-modes="selectionModes" ref="highlightSelection" />
      </v-card-text>
    </template>
  </StatsBarChart>
</template>

<script setup lang="ts">
  import StatsHighlightSelection, { type StatsUserSelectionMode } from '@/components/widgets/selections/StatsHighlightSelection.vue'
  import type HighlightSelection from '@/components/widgets/selections/StatsHighlightSelection.vue'
  import type { GermplasmMetaStats } from '@/plugins/types/germinate'

  const compProps = defineProps<{
    data: GermplasmMetaStats[]
    xValue: string
    title: string
    filename: string
    xLabels?: string[]
    xValues?: number[]
    selectionModes?: StatsUserSelectionMode[]
    sortByX?: boolean
  }>()

  const highlightSelection = ref<InstanceType<typeof HighlightSelection>>()
  const userSelection = computed(() => highlightSelection.value?.userSelection)
</script>
