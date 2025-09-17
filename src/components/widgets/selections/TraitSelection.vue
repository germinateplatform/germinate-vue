<template>
  <div>
    <slot name="title"><h3>{{ $t('pageTrialsExportSelectTraitTitle') }}</h3></slot>
    <slot name="text" />
    <v-autocomplete
      v-model="selectedTraits"
      autocomplete="off"
      return-object
      hide-details
      multiple
      chips
      clearable
      :items="compProps.traits"
      :item-title="(item: ViewTableTraits) => item.unitId ? `${item.traitName} [${item.unitAbbreviation || item.unitName}]` : item.traitName"
    />
  </div>
</template>

<script setup lang="ts">
  import type { ViewTableTraits } from '@/plugins/types/germinate'

  const compProps = defineProps<{
    traits: ViewTableTraits[]
  }>()

  const selectedTraits = defineModel<ViewTableTraits[]>()
</script>
