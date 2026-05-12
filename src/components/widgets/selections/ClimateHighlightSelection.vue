<template>
  <div>
    <div class="text-title-small mt-3">{{ $t('widgetHighlightSelectionTitle') }}</div>
    <v-btn-toggle
      v-model="selectionMode"
      color="primary"
      variant="tonal"
      class="d-flex mb-5"
    >
      <v-btn class="flex-grow-1" value="dataset" :prepend-icon="mdiDatabase" :text="$t('widgetHighlightSelectionDataset')" />
      <v-btn class="flex-grow-1" value="location" :prepend-icon="mdiSprout" :text="$t('widgetHighlightSelectionLocation')" />
      <v-btn class="flex-grow-1" value="group" :prepend-icon="mdiGroup" :text="$t('widgetHighlightSelectionGroup')">
        <template #append><v-badge inline :content="getNumberWithSuffix((groups|| []).length, 0)" /></template>
      </v-btn>
      <v-btn class="flex-grow-1" value="year" :prepend-icon="mdiCalendarWeek" :disabled="!climateYears || climateYears.length === 0" :text="$t('widgetHighlightSelectionYear')">
        <template #append><v-badge inline :content="getNumberWithSuffix((climateYears|| []).length, 0)" /></template>
      </v-btn>
    </v-btn-toggle>

    <LocationSelection
      v-if="selectionMode === 'location'"
      v-model="selectedLocations"
      :locations="climateLocations"
      :label="$t('formLabelHighlightLocations')"
      :hint="$t('formDescriptionHighlightLocations')"
      persistent-hint
      multiple
    />

    <GroupSelection
      v-else-if="selectionMode === 'group'"
      v-model="selectedGroups"
      :groups="compProps.groups"
      marked-item-type="germplasm"
      :label="$t('formLabelHighlightGroups')"
      :hint="$t('formDescriptionHighlightGroups')"
      type="groups"
      persistent-hint
      multiple
    />

    <SelectAllBox
      v-else-if="selectionMode === 'year'"
      :label="$t('formLabelHighlightYears')"
      :hint="$t('formDescriptionHighlightYears')"
      multiple
      clearable
      v-model="selectedYears"
      :items="climateYears"
    >
      <template #selection="{ internalItem: item }">
        <v-chip density="compact" :text="item.title" variant="flat" />
      </template>
    </SelectAllBox>
  </div>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import type { ViewTableLocations, ViewTableGroups } from '@/plugins/types/germinate'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { mdiCalendarWeek, mdiDatabase, mdiGroup, mdiSprout } from '@mdi/js'
  import { apiPostLocationTable } from '@/plugins/api/location'

  export interface UserSelection {
    type: 'group' | 'dataset' | 'location' | 'year'
    selectedItems: string[]
  }

  export interface HighlightSelectionProps {
    datasetIds: number[]
    groups: ViewTableGroups[]
  }

  const compProps = withDefaults(defineProps<HighlightSelectionProps>(), {})

  const selectionMode = ref<'group' | 'dataset' | 'location' | 'year'>()

  const selectedLocations = ref<ViewTableLocations[]>([])
  const selectedGroups = ref<ViewTableGroups[]>([])
  const selectedYears = ref<number[]>([])

  const climateLocations = ref<ViewTableLocations[]>([])
  const climateYears = ref<number[]>([])

  const valid = computed(() => {
    if (!userSelection.value) {
      return false
    } else {
      if (userSelection.value.type === 'dataset') {
        return true
      } else {
        return userSelection.value.selectedItems.length > 0
      }
    }
  })

  const userSelection: ComputedRef<UserSelection | undefined> = computed(() => {
    switch (selectionMode.value) {
      case 'dataset':
        return {
          type: selectionMode.value,
          selectedItems: [],
        }
      case 'group':
        return {
          type: selectionMode.value,
          selectedItems: (selectedGroups.value || []).map(g => `${g.groupId}`),
        }
      case 'location':
        return {
          type: selectionMode.value,
          selectedItems: (selectedLocations.value || []).map(g => `${g.countryName} | ${g.locationName}`),
        }
      case 'year':
        return {
          type: selectionMode.value,
          selectedItems: (selectedYears.value || []).map(y => `${y}`),
        }
      default:
        return undefined
    }
  })

  watch(selectionMode, async () => {
    selectedYears.value = []
  })

  function update () {
    apiPostLocationTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      minimal: true,
    }, result => {
      if (result && result.data) {
        climateLocations.value = result.data
      } else {
        climateLocations.value = []
      }
    })
  }

  onMounted(() => update())

  defineExpose({
    userSelection,
    valid,
    update,
  })
</script>
