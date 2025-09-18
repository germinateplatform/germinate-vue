<template>
  <div>
    <slot name="title"><h3>{{ $t('pageTrialsExportSelectGermplasmTitle') }}</h3></slot>
    <slot name="text"><p>{{ $t('pageTrialsExportSelectGermplasmText') }}</p></slot>
    <v-autocomplete
      v-model="selectedGermplasm"
      autocomplete="off"
      return-object
      hide-details
      multiple
      chips
      clearable
      :items="compProps.germplasm"
      item-value="germplasmId"
      :item-title="(item: ViewTableGermplasm) => [item.germplasmDisplayName, item.germplasmName, item.germplasmNumber].filter(i => i !== undefined && i !== null && i.trim().length > 0).join(' | ')"
    >
      <template #selection="{ item, index }">
        <v-chip v-if="index < 2" :text="item.title" />

        <span v-if="index === 2" class="text-grey text-caption align-self-center">(+{{ (selectedGermplasm || []).length - 2 }} others)</span>
      </template>

      <template #prepend-item v-if="canSelectAll">
        <v-list-item
          :title="$t('buttonSelectAll')"
          @click="toggle"
        >
          <template #prepend>
            <v-checkbox-btn
              :indeterminate="someSelected && !allSelected"
              :model-value="allSelected"
            />
          </template>
        </v-list-item>

        <v-divider class="mt-2" />
      </template>
    </v-autocomplete>
  </div>
</template>

<script setup lang="ts">
  import type { ViewTableGermplasm } from '@/plugins/types/germinate'

  interface TrialSelectionProps {
    germplasm: ViewTableGermplasm[]
    canSelectAll?: boolean
  }

  const compProps = withDefaults(defineProps<TrialSelectionProps>(), {
    canSelectAll: false,
  })

  const selectedGermplasm = defineModel<ViewTableGermplasm[]>()

  const allSelected = computed(() => (selectedGermplasm.value || []).length === compProps.germplasm.length)
  const someSelected = computed(() => (selectedGermplasm.value || []).length > 0)

  function toggle () {
    if (allSelected.value) {
      selectedGermplasm.value = []
    } else {
      selectedGermplasm.value = compProps.germplasm
    }
  }
</script>
