<template>
  <v-toolbar
    flat
    density="compact"
    class="justify-space-between pa-2"
  >
    <div class="d-flex flex-row align-center">
      <v-toolbar-title class="flex-unset ms-2">
        <v-icon :icon="compProps.headerIcon" :color="headerIconColor || 'medium-emphasis'" size="x-small" start />
        {{ compProps.headerTitle }}
      </v-toolbar-title>
      <v-btn-toggle
        v-if="compProps.supportsGridCards"
        v-model="displayType"
        density="compact"
        color="primary"
        mandatory
        class="ms-3"
      >
        <v-btn value="table" v-tooltip:top="$t('tooltipTableTypeSwitchTable')"><v-icon icon="mdi-table" /></v-btn>
        <v-btn value="grid" v-tooltip:top="$t('tooltipTableTypeSwitchGrid')"><v-icon icon="mdi-view-grid" /></v-btn>
      </v-btn-toggle>
    </div>

    <slot name="header" />

    <div>
      <v-btn-group density="compact">
        <v-menu :close-on-content-click="false" v-if="displayType === 'table'">
          <template #activator="{ props }">
            <v-btn v-tooltip:top="$t('tooltipTableColumnSelector')" v-bind="props" :append-icon="props['aria-expanded'] === 'true' ? 'mdi-menu-up' : 'mdi-menu-down'"><v-icon icon="mdi-view-column" /></v-btn>
          </template>
          <v-list max-height="75vh">
            <v-list-item v-for="header in dropdownHeaders" :key="`table-header-${compProps.tableKey}-${header.key}`">
              <template #prepend>
                <v-list-item-action start>
                  <v-checkbox-btn :model-value="selectedHeaderKeys.has(header.key || '')" @update:model-value="emit('toggle-header', header)" />
                </v-list-item-action>
              </template>
              {{ header.title }}
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn @click="emit('show-filter')" :color="filtered ? 'success' : undefined" v-tooltip:top="$t('tooltipTableFilter')"><v-icon icon="mdi-filter" /></v-btn>
        <v-btn v-if="filtered" color="error" v-tooltip:top="$t('tooltipTableClearFilter')" @click="emit('clear-filter')"><v-icon icon="mdi-delete" /></v-btn>
      </v-btn-group>
      <v-btn-group class="ms-2" density="compact" v-if="markedItemConfig">
        <v-btn v-tooltip:top="$t('tooltipTableMarkedItems')"><v-chip size="small" label>{{ getNumberWithSuffix(markedItemConfig.count, 1) }}</v-chip></v-btn>
        <v-btn v-tooltip:top="$t('tooltipTableMarkedItemsClear')" @click="clearMarkedItems"><v-icon icon="mdi-delete" /></v-btn>
      </v-btn-group>
    </div>
  </v-toolbar>
</template>

<script setup lang="ts">
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import { coreStore } from '@/stores/app'
  import type { DisplayType, MarkedItemConfig } from '@/components/tables/BaseTable.vue'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import type { DataTableHeader } from 'vuetify'

  const store = coreStore()

  const compProps = defineProps<{
    modelValue: DisplayType
    filtered: boolean
    markedItemType?: string
    markedItemConfig?: MarkedItemConfig
    tableKey: string
    headerIcon: string
    headerIconColor?: string
    headerTitle: string
    supportsGridCards?: boolean
    headers: DataTableHeader[]
  }>()

  const emit = defineEmits([
    'update:model-value',
    'clear-filter',
    'show-filter',
    'toggle-header',
  ])

  const displayType = ref<DisplayType>('table')

  watch(() => compProps.modelValue, async (newValue: DisplayType) => {
    displayType.value = newValue
  })

  watch(displayType, async (newValue: DisplayType) => {
    emit('update:model-value', newValue)
  })

  const selectedHeaderKeys: ComputedRef<Set<string>> = computed(() => {
    const result = new Set<string>()

    const headers = (compProps.headers || []).concat()

    const hiddenColumns = store.storeHiddenColumns[compProps.tableKey]
    headers.forEach(h => {
      if (h.key && !hiddenColumns.includes(h.key)) {
        result.add(h.key)
      }
    })

    return result
  })

  const dropdownHeaders: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    return ((compProps.headers || []) as ExtendedDataTableHeader[]).concat().filter(h => h.title && h.visibleInTable !== false)
  })

  function clearMarkedItems () {
    if (compProps.markedItemType) {
      store.clearMarkedIds(compProps.markedItemType)
    }
  }

  onMounted(() => {
    displayType.value = compProps.modelValue
  })
</script>
