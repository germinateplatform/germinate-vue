<template>
  <div>
    <div class="text-title-small mt-3">{{ $t('widgetHighlightSelectionTitle') }}</div>
    <v-btn-toggle
      v-model="selectionMode"
      color="primary"
      variant="tonal"
      class="d-flex mb-5"
    >
      <v-btn class="flex-grow-1" value="taxonomies" :prepend-icon="mdiSitemap" :text="$t('widgetHighlightSelectionTaxonomy')" v-if="selectionModes.includes('taxonomies')">
        <template #append><v-badge inline :content="getNumberWithSuffix((taxonomies|| []).length, 0)" /></template>
      </v-btn>
      <v-btn class="flex-grow-1" value="sampstat" :prepend-icon="mdiFormatListChecks" :text="$t('widgetHighlightSelectionBiologicalStatus')" v-if="selectionModes.includes('sampstat')">
        <template #append><v-badge inline :content="getNumberWithSuffix((biologicalStatus|| []).length, 0)" /></template>
      </v-btn>
    </v-btn-toggle>

    <v-select
      v-if="selectionMode === 'taxonomies'"
      :label="$t('formLabelHighlightTaxonomies')"
      :hint="$t('formDescriptionHighlightTaxonomies')"
      persistent-hint
      multiple
      clearable
      item-value="id"
      :item-title="(tax: Taxonomies) => concat(' ', [tax.genus, tax.species, tax.subtaxa])"
      return-object
      v-model="selectedTaxonomies"
      :items="taxonomies"
    >
      <template #selection="{ internalItem: item, index }">
        <v-chip size="small" v-if="index < 4" :text="item.title" />

        <span v-if="index === 4" class="text-grey text-body-small align-self-center">(+{{ (selectedTaxonomies || []).length - 4 }} others)</span>
      </template>
    </v-select>

    <v-select
      v-else-if="selectionMode === 'sampstat'"
      :label="$t('formLabelHighlightBiologicalStatus')"
      :hint="$t('formDescriptionHighlightBiologicalStatus')"
      persistent-hint
      multiple
      clearable
      item-value="id"
      :item-title="(sampstat: BiologicalStatusCount) => sampstat.biologicalstatus"
      return-object
      v-model="selectedBiologicalStatus"
      :items="biologicalStatus"
    >
      <template #selection="{ internalItem: item, index }">
        <v-chip size="small" v-if="index < 4" :text="item.title" />

        <span v-if="index === 4" class="text-grey text-body-small align-self-center">(+{{ (selectedBiologicalStatus || []).length - 4 }} others)</span>
      </template>

      <template #item="{ internalItem: item, props: itemProps }">
        <v-list-item v-bind="itemProps" :disabled="(item.raw.count || 0) === 0">
          <template #prepend="{ isActive }">
            <v-checkbox-btn :model-value="isActive" />
          </template>
          <template #append>
            <v-chip size="small" :text="getNumberWithSuffix(item.raw.count || 0, 0)" />
          </template>
        </v-list-item>
      </template>
    </v-select>
  </div>
</template>

<script setup lang="ts">
  import { apiGetBiologicalStatusCount, apiGetTaxonomies } from '@/plugins/api/stats'
  import type { BiologicalStatusCount, Taxonomies } from '@/plugins/types/germinate'
  import { concat, getNumberWithSuffix } from '@/plugins/util/formatting'
  import { mdiFormatListChecks, mdiSitemap } from '@mdi/js'

  export interface UserSelection {
    type: StatsUserSelectionMode
    selectedItems: string[]
  }

  export type StatsUserSelectionMode = 'taxonomies' | 'sampstat'

  export interface StatsHighlightSelectionProps {
    selectionModes?: StatsUserSelectionMode[]
  }

  const compProps = withDefaults(defineProps<StatsHighlightSelectionProps>(), {
    selectionModes: () => ['taxonomies', 'sampstat'],
  })

  const selectionMode = ref<StatsUserSelectionMode>()

  const selectedTaxonomies = ref<Taxonomies[]>([])
  const selectedBiologicalStatus = ref<BiologicalStatusCount[]>([])

  const taxonomies = ref<Taxonomies[]>([])
  const biologicalStatus = ref<BiologicalStatusCount[]>([])

  const valid = computed(() => {
    if (!selectionMode.value) {
      return true
    } else if (!userSelection.value) {
      return false
    } else {
      return userSelection.value.selectedItems.length > 0
    }
  })

  const userSelection: ComputedRef<UserSelection | undefined> = computed(() => {
    switch (selectionMode.value) {
      case 'taxonomies':
        return {
          type: selectionMode.value,
          selectedItems: (selectedTaxonomies.value || []).map(g => concat(' ', [g.genus, g.species])),
        }
      case 'sampstat':
        return {
          type: selectionMode.value,
          selectedItems: (selectedBiologicalStatus.value || []).map(b => b.biologicalstatus),
        }
      default:
        return undefined
    }
  })

  watch(selectionMode, async () => {
    selectedTaxonomies.value = []
  })

  function update () {
    apiGetBiologicalStatusCount(false, result => {
      result.sort((a, b) => a.biologicalstatus.localeCompare(b.biologicalstatus))
      biologicalStatus.value = result
    })

    apiGetTaxonomies(true, result => {
      taxonomies.value = result
    })
  }

  onMounted(() => update())

  defineExpose({
    userSelection,
    valid,
  })
</script>
