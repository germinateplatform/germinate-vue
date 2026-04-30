<template>
  <div>
    <div class="text-title-small mt-3">{{ $t('widgetHighlightSelectionTitle') }}</div>

    <p>{{ $t('widgetTraitStatsHighlightSelectionText') }}</p>
    <v-btn-toggle
      v-model="selectionMode"
      color="primary"
      variant="tonal"
      class="d-flex mb-5"
    >
      <v-btn class="flex-grow-1" value="germplasm" :prepend-icon="mdiSprout" :text="$t('widgetHighlightSelectionGermplasm')" />
      <v-btn class="flex-grow-1" value="group" :prepend-icon="mdiGroup" :text="$t('widgetHighlightSelectionGroup')">
        <template #append><v-badge inline :content="getNumberWithSuffix((allGroups|| []).length, 0)" /></template>
      </v-btn>
    </v-btn-toggle>

    <GermplasmSelection
      v-if="selectionMode === 'germplasm'"
      v-model="selectedGermplasm"
      :germplasm="allGermplasm"
      :label="$t('formLabelHighlightGermplasm')"
      :hint="$t('formDescriptionHighlightGermplasm')"
      persistent-hint
      multiple
    />

    <GroupSelection
      v-else-if="selectionMode === 'group'"
      v-model="selectedGroups"
      :groups="allGroups"
      marked-item-type="germplasm"
      :label="$t('formLabelHighlightGroups')"
      :hint="$t('formDescriptionHighlightGroups')"
      type="groups"
      persistent-hint
      multiple
    />
  </div>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostGermplasmTable } from '@/plugins/api/germplasm'
  import { apiPostGroupTable } from '@/plugins/api/group'
  import { FilterComparator, FilterOperator, type ViewTableGermplasm, type ViewTableGroups } from '@/plugins/types/germinate'
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { mdiGroup, mdiSprout } from '@mdi/js'

  export interface UserSelection {
    type: 'group' | 'germplasm'
    selectedItems: string[]
  }

  const selectionMode = ref<'group' | 'germplasm'>()

  const selectedGermplasm = ref<ViewTableGermplasm[]>([])
  const selectedGroups = ref<ViewTableGroups[]>([])

  const allGermplasm = ref<ViewTableGermplasm[]>([])
  const allGroups = ref<ViewTableGroups[]>([])

  const valid = computed(() => {
    if (!userSelection.value) {
      return false
    } else {
      return userSelection.value.selectedItems.length > 0
    }
  })

  const userSelection: ComputedRef<UserSelection | undefined> = computed(() => {
    switch (selectionMode.value) {
      case 'group':
        return {
          type: selectionMode.value,
          selectedItems: (selectedGroups.value || []).map(g => `${g.groupId}`),
        }
      case 'germplasm':
        return {
          type: selectionMode.value,
          selectedItems: (selectedGermplasm.value || []).map(g => `${g.germplasmId}`),
        }
      default:
        return undefined
    }
  })

  watch(selectionMode, async () => {
    selectedGroups.value = []
    selectedGermplasm.value = []
  })

  function update () {
    apiPostGermplasmTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      minimal: true,
    }, result => {
      if (result && result.data) {
        allGermplasm.value = result.data
      } else {
        allGermplasm.value = []
      }
    })

    // Get groups
    apiPostGroupTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filters: [{
        operator: FilterOperator.and,
        filters: [{
          column: 'groupTypeId',
          values: ['3'],
          comparator: FilterComparator.equals,
        }],
      }],
    }, result => {
      if (result && result.data) {
        allGroups.value = result.data
      } else {
        allGroups.value = []
      }
    })
  }

  onMounted(() => update())

  defineExpose({
    userSelection,
    valid,
  })
</script>
