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
      :label="$t('pageTrialsExportSelectTraitTitle')"
      chips
      clearable
      :items="compProps.traits"
      item-value="traitId"
      :item-title="(item: ViewTableTraits) => item.unitId ? `${item.traitName} [${item.unitAbbreviation || item.unitName}]` : item.traitName"
    >
      <template #selection="{ item, index }">
        <v-chip v-if="index < 2" :text="item.title" />

        <span v-if="index === 2" class="text-grey text-caption align-self-center">(+{{ (selectedTraits || []).length - 2 }} others)</span>
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
  import type { ViewTableTraits } from '@/plugins/types/germinate'

  interface TrialSelectionProps {
    traits: ViewTableTraits[]
    canSelectAll?: boolean
  }

  const compProps = withDefaults(defineProps<TrialSelectionProps>(), {
    canSelectAll: false,
  })

  const selectedTraits = defineModel<ViewTableTraits[]>()

  const allSelected = computed(() => (selectedTraits.value || []).length === compProps.traits.length)
  const someSelected = computed(() => (selectedTraits.value || []).length > 0)

  function toggle () {
    if (allSelected.value) {
      selectedTraits.value = []
    } else {
      selectedTraits.value = compProps.traits
    }
  }
</script>
