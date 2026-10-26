<template>
  <div>
    <div class="text-title-small mt-3">{{ $t('widgetHighlightSelectionTitle') }}</div>
    <v-btn-toggle
      v-model="selectionMode"
      color="primary"
      variant="tonal"
      class="d-flex mb-3"
    >
      <v-btn class="flex-grow-1" value="colldate" :prepend-icon="mdiCalendar" :text="$t('widgetHighlightSelectionColldate')" />
      <v-btn class="flex-grow-1" value="elevation" :prepend-icon="mdiSummit" :text="$t('widgetHighlightSelectionElevation')" />
      <v-btn class="flex-grow-1" value="pdci" :prepend-icon="mdiCounter" :text="$t('widgetHighlightSelectionPdci')" />
      <v-btn class="flex-grow-1" value="taxonomy" :prepend-icon="mdiSitemap" :text="$t('widgetHighlightSelectionTaxonomy')" />
      <v-btn class="flex-grow-1" value="biologicalstatus" :prepend-icon="mdiSitemap" :text="$t('widgetHighlightSelectionBiologicalStatus')" />
      <v-btn class="flex-grow-1" value="country" :prepend-icon="mdiMapLegend" :text="$t('widgetHighlightSelectionCountry')" />
    </v-btn-toggle>

    <v-select
      v-if="selectionMode === 'taxonomy'"
      :label="$t('formLabelHighlightTaxonomies')"
      :hint="$t('formDescriptionHighlightTaxonomies')"
      persistent-hint
      multiple
      clearable
      item-value="id"
      :item-title="(tax: Taxonomies) => concat(' ', [tax.genus, tax.species, tax.subtaxa])"
      return-object
      class="mb-3"
      v-model="selectedTaxonomies"
      :items="allTaxonomies"
    >
      <template #selection="{ internalItem: item }">
        <v-chip density="compact" :text="item.title" variant="flat" />
      </template>
    </v-select>

    <SelectAllBox
      v-else-if="selectionMode === 'biologicalstatus'"
      :label="$t('formLabelHighlightBiologicalStatus')"
      :hint="$t('formDescriptionHighlightBiologicalStatus')"
      persistent-hint
      multiple
      clearable
      autocomplete="off"
      item-value="id"
      :item-title="(bs: BiologicalStatusCount) => bs.biologicalstatus || 'N/A'"
      :is-disabled="(bs: BiologicalStatusCount) => bs.count < 1"
      return-object
      class="mb-3"
      v-model="selectedBiologicalStatus"
      :items="allBiologicalStatus"
    >
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
    </SelectAllBox>

    <SelectAllBox
      v-else-if="selectionMode === 'country'"
      :label="$t('formLabelHighlightCountry')"
      :hint="$t('formDescriptionHighlightCountry')"
      persistent-hint
      multiple
      clearable
      autocomplete="off"
      item-value="id"
      :item-title="(bs: CountryCount) => bs.countryName || 'N/A'"
      :is-disabled="(bs: CountryCount) => bs.count < 1"
      return-object
      class="mb-3"
      v-model="selectedCountries"
      :items="allCountries"
    >
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
    </SelectAllBox>
  </div>
</template>

<script setup lang="ts">
  import { apiGetCountries } from '@/plugins/api/location'
  import { apiGetBiologicalStatusCount, apiGetTaxonomies } from '@/plugins/api/stats'
  import type { BiologicalStatusCount, CountryCount, Taxonomies } from '@/plugins/types/germinate'
  import { concat, getNumberWithSuffix } from '@/plugins/util/formatting'
  import { mdiCalendar, mdiCounter, mdiMapLegend, mdiSitemap, mdiSummit } from '@mdi/js'

  export type SelectionType = 'colldate' | 'elevation' | 'pdci' | 'taxonomy' | 'biologicalstatus' | 'country'

  export interface UserSelection {
    type: SelectionType
    selectedItems: string[]
  }

  const selectionMode = ref<SelectionType>()
  const userSelection = defineModel<UserSelection>()

  const selectedTaxonomies = ref<Taxonomies[]>([])
  const allTaxonomies = ref<Taxonomies[]>([])

  const selectedBiologicalStatus = ref<BiologicalStatusCount[]>([])
  const allBiologicalStatus = ref<BiologicalStatusCount[]>([])

  const selectedCountries = ref<CountryCount[]>([])
  const allCountries = ref<CountryCount[]>([])

  onMounted(() => {
    apiGetTaxonomies(false, result => {
      allTaxonomies.value = result
    })
    apiGetBiologicalStatusCount(true, result => {
      result.sort((a, b) => a.biologicalstatus.localeCompare(b.biologicalstatus))
      allBiologicalStatus.value = result
    })
    apiGetCountries(result => {
      result.sort((a, b) => a.countryName.localeCompare(b.countryName))
      allCountries.value = result
    })
  })

  watchEffect(() => {
    switch (selectionMode.value) {
      case 'taxonomy':
        userSelection.value = {
          type: selectionMode.value,
          selectedItems: (selectedTaxonomies.value || []).map(g => concat(' ', [g.genus, g.species, g.subtaxa])),
        }
        break
      case 'biologicalstatus':
        userSelection.value = {
          type: selectionMode.value,
          selectedItems: (selectedBiologicalStatus.value || []).map(bs => bs.biologicalstatus),
        }
        break
      case 'country':
        userSelection.value = {
          type: selectionMode.value,
          selectedItems: (selectedCountries.value || []).map(bs => bs.countryName),
        }
        break
      case 'colldate':
      case 'elevation':
      case 'pdci':
        userSelection.value = {
          type: selectionMode.value,
          selectedItems: [],
        }
        break
      default:
        userSelection.value = undefined
    }
  })
</script>
