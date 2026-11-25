<template>
  <v-toolbar
    flat
    density="compact"
    class="justify-space-between pa-2"
  >
    <div class="d-flex flex-row align-center">
      <v-toolbar-title class="flex-unset ms-2">
        <v-icon :icon="compProps.headerIcon" :color="headerIconColor || 'medium-emphasis'" size="x-small" start />
        {{ compProps.headerTitle }} <v-chip size="small" label v-if="totalCount !== undefined && totalCount !== -1" :text="getNumberWithSuffix(totalCount, 1)" />
      </v-toolbar-title>
      <v-btn-toggle
        v-if="compProps.supportsGridCards"
        v-model="displayType"
        density="compact"
        color="primary"
        mandatory
        :disabled="compProps.disabled"
        class="ms-3"
      >
        <v-btn value="table" v-tooltip:top="$t('tooltipTableTypeSwitchTable')"><v-icon :icon="mdiTable" /></v-btn>
        <v-btn value="grid" v-tooltip:top="$t('tooltipTableTypeSwitchGrid')"><v-icon :icon="mdiViewGrid" /></v-btn>
      </v-btn-toggle>
    </div>

    <slot name="header" />

    <div>
      <v-btn-group density="compact" :disabled="compProps.disabled" class="table-toolbar-buttons">
        <v-menu :close-on-content-click="false" v-if="displayType === 'table'">
          <template #activator="{ props }">
            <v-btn :disabled="compProps.disabled" v-tooltip:top="$t('tooltipTableColumnSelector')" v-bind="props" :append-icon="props['aria-expanded'] === 'true' ? mdiMenuUp : mdiMenuDown"><v-icon :icon="mdiViewColumn" /></v-btn>
          </template>
          <v-list max-height="75vh">
            <v-list-item v-for="header in dropdownHeaders" :key="`table-header-${compProps.tableKey}-${header.key}`" @click="emit('toggle-header', header)">
              <template #prepend>
                <v-list-item-action start>
                  <v-checkbox-btn :model-value="selectedHeaderKeys.has(header.key || '')" @update:model-value="emit('toggle-header', header)" />
                </v-list-item-action>
              </template>
              {{ header.title }}
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn :disabled="compProps.disabled" @click="emit('show-filter')" :color="filtered ? 'success' : undefined" v-tooltip:top="$t('tooltipTableFilter')" v-if="compProps.canFilter !== false"><v-icon :icon="mdiFilter" /></v-btn>
        <v-btn :disabled="compProps.disabled" v-if="filtered" color="error" v-tooltip:top="$t('tooltipTableClearFilter')" @click="emit('clear-filter')"><v-icon :icon="mdiDelete" /></v-btn>
      </v-btn-group>
      <v-btn-group class="ms-2 table-toolbar-buttons" density="compact" v-if="markedItemConfig" :disabled="compProps.disabled">
        <v-btn v-tooltip:top="$t('tooltipTableMarkedItemsUpload')" @click="uploadMarkedItems"><v-icon :icon="mdiFileUpload" /></v-btn>
        <v-btn v-tooltip:top="$t('tooltipTableMarkedItems')" :disabled="markedItemsDisabled" :to="Pages.getPath(Pages.markedItemType, compProps.markedItemType || '')"><v-chip size="small" label>{{ getNumberWithSuffix(markedItemConfig.count, 1) }}</v-chip></v-btn>
        <v-btn v-tooltip:top="$t('tooltipTableMarkedItemsClear')" :disabled="markedItemsDisabled" @click="clearMarkedItems"><v-icon :icon="mdiDelete" /></v-btn>
      </v-btn-group>
    </div>

    <InputModal
      v-model="userMarkedItemsText"
      :hint="$t('formDescriptionMarkedItemsPaste')"
      :label="$t('formLabelMarkedItemsPaste')"
      type="textarea"
      :title="$t('tooltipTableMarkedItemsUpload')"
      ref="markedItemsUploadModal"
      :on-save="getMarkedItemMatches"
      show-cancel
      :ok-text="$t('inputPlaceholderSearch')"
    />
  </v-toolbar>
</template>

<script setup lang="ts">
  import { getNumberWithSuffix } from '@/plugins/util/formatting'
  import type { DisplayType, MarkedItemConfig } from '@/components/tables/BaseTable.vue'
  import type { ExtendedDataTableHeader } from '@/plugins/types/client'
  import type { DataTableHeader } from 'vuetify'
  import { Pages } from '@/plugins/pages'
  import { mdiDelete, mdiFileUpload, mdiFilter, mdiMenuDown, mdiMenuUp, mdiTable, mdiViewColumn, mdiViewGrid } from '@mdi/js'
  import type { MarkedItemType } from '@/plugins/types/germinate'
  import emitter from 'tiny-emitter/instance'

  const store = useCoreStore()
  const { t } = useI18n()

  const compProps = defineProps<{
    modelValue: DisplayType
    filtered: boolean
    markedItemType?: MarkedItemType
    markedItemConfig?: MarkedItemConfig
    tableKey: string
    headerIcon: string
    headerIconColor?: string
    headerTitle: string
    supportsGridCards?: boolean
    headers: DataTableHeader[]
    disabled?: boolean
    canFilter?: boolean
    totalCount?: number
  }>()

  const emit = defineEmits([
    'update:model-value',
    'clear-filter',
    'show-filter',
    'toggle-header',
    'force-marked-item-filter',
  ])

  const markedItemsUploadModal = useTemplateRef('markedItemsUploadModal')

  const displayType = ref<DisplayType>('table')
  const userMarkedItemsText = ref<string>('')

  const markedItemsDisabled = computed(() => compProps?.markedItemConfig?.count === 0)

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
      if (h.key && (!hiddenColumns || !hiddenColumns.includes(h.key))) {
        result.add(h.key)
      }
    })

    return result
  })

  const dropdownHeaders: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    return ((compProps.headers || []) as ExtendedDataTableHeader[]).concat().filter(h => h.title && h.visibleInTable !== false)
  })

  async function getMarkedItemMatches () {
    const parts = (userMarkedItemsText.value ?? '').split(/\r?\n/).map(p => p.trim()).filter(p => p.length > 0)

    if (parts.length > 0) {
      emit('force-marked-item-filter', parts)
      return true
    } else {
      return false
    }
  }

  function uploadMarkedItems () {
    userMarkedItemsText.value = ''

    nextTick(() => markedItemsUploadModal.value?.show())
  }

  function clearMarkedItems () {
    if (compProps.markedItemType) {
      emitter.emit('show-confirm', {
        title: t('modalTitleConfirm'),
        message: t('modalTitleSure'),
        okTitle: t('genericYes'),
        cancelTitle: t('genericNo'),
        okVariant: 'error',
        callback: (result: boolean) => {
          if (result === true) {
            store.clearMarkedIds(compProps.markedItemType)
          }
        },
      })
    }
  }

  onMounted(() => {
    displayType.value = compProps.modelValue
  })
</script>

<style scoped>
.table-toolbar-buttons .v-btn {
  padding-right: 12px;
  padding-left: 12px;
  min-width: 42px;
}
</style>
