<template>
  <div>
    <slot name="title"><h3>{{ $t('pageTrialsExportSelectPlotsTitle') }}</h3></slot>
    <slot name="text"><p>{{ $t('pageTrialsExportSelectPlotsText') }}</p></slot>
    <!-- @vue-ignore -->
    <v-autocomplete
      v-model="selectedPlots"
      v-model:search="searchTerm"
      autocomplete="off"
      return-object
      hide-details
      multiple
      clearable
      :items="compProps.plots"
      item-value="id"
      :item-title="(pd: PlotDetails) => $t('dropdownLabelPlotSearch', pd)"
    >
      <template #selection="{ item, index }">
        <v-chip size="small" v-if="index < 5" :text="item.title" />

        <span v-if="index === 5" class="text-grey text-caption align-self-center">(+{{ (selectedPlots || []).length - 5 }} others)</span>
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
  import type { PlotDetails } from '@/plugins/types/germinate'

  interface TrialSelectionProps {
    plots: PlotDetails[]
    canSelectAll?: boolean
  }

  const compProps = withDefaults(defineProps<TrialSelectionProps>(), {
    canSelectAll: false,
  })

  const searchTerm = ref<string>()
  const selectedPlots = defineModel<PlotDetails[]>()

  const allSelected = computed(() => (selectedPlots.value || []).length === compProps.plots.length)
  const someSelected = computed(() => (selectedPlots.value || []).length > 0)

  function toggle () {
    if (allSelected.value) {
      selectedPlots.value = []
    } else {
      // Search for the currently filtered items (if any)
      const st = (searchTerm.value || '').trim().toLowerCase()
      selectedPlots.value = compProps.plots.filter(t => t.germplasm.toLowerCase().includes(st))
    }
  }
</script>
