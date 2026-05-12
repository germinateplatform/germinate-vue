<template>
  <div>
    <slot name="title"><h3>{{ $t('pageTrialsExportSelectLocationTitle') }}</h3></slot>
    <slot name="text"><p>{{ $t('pageTrialsExportSelectLocationText') }}</p></slot>
    <v-autocomplete
      v-model="selectedLocations"
      v-model:search="searchTerm"
      autocomplete="off"
      return-object
      hide-details
      multiple
      clearable
      :items="compProps.locations"
      item-value="locationId"
      :item-title="(item: ViewTableLocations) => [item.countryName, item.locationName].filter(i => i !== undefined && i !== null && i.trim().length > 0).join(' | ')"
    >
      <template #selection="{ internalItem: item, index }">
        <v-chip size="small" v-if="index < 5" :text="item.title" />

        <span v-if="index === 5" class="text-grey text-body-small align-self-center">(+{{ (selectedLocations || []).length - 5 }} others)</span>
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
  import type { ViewTableLocations } from '@/plugins/types/germinate'

  interface TrialSelectionProps {
    locations: ViewTableLocations[]
    canSelectAll?: boolean
  }

  const compProps = withDefaults(defineProps<TrialSelectionProps>(), {
    canSelectAll: false,
  })

  const searchTerm = ref<string>()
  const selectedLocations = defineModel<ViewTableLocations[]>()

  const allSelected = computed(() => (selectedLocations.value || []).length === compProps.locations.length)
  const someSelected = computed(() => (selectedLocations.value || []).length > 0)

  function toggle () {
    if (allSelected.value) {
      selectedLocations.value = []
    } else {
      // Search for the currently filtered items (if any)
      const st = (searchTerm.value || '').trim().toLowerCase()
      selectedLocations.value = compProps.locations.filter(t => {
        const dpn = [t.countryName, t.locationName].filter(i => i !== undefined && i !== null && i.trim().length > 0).join(' | ')
        return dpn.toLowerCase().includes(st)
      })
      selectedLocations.value = compProps.locations
    }
  }
</script>
