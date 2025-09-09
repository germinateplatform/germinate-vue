<template>
  <v-card>
    <div
      v-if="displayType === 'grid'"
      class="v-table v-table--has-top v-table--has-bottom v-table--striped-odd v-table--density-default v-data-table base-table"
    >
      <TableToolbar
        v-model="displayType"
        :headers="componentProps.headers"
        :marked-item-type="componentProps.markedItemType"
        @clear-filter="clearFilter"
        @show-filter="tableFilterModal?.show()"
        @toggle-header="toggleHeader"
        :filtered="filters && filters.length > 0"
        :marked-item-config="markedItemConfig"
        :table-key="componentProps.tableKey"
        :header-icon="componentProps.headerIcon"
        :header-icon-color="componentProps.headerIconColor"
        :header-title="componentProps.headerTitle"
        :supports-grid-cards="componentProps.supportsGridCards"
      >
        <template #header>
          <slot name="header" />
        </template>
      </TableToolbar>

      <slot name="card-text" />

      <v-card-text>
        <!-- @vue-ignore -->
        <DataGrid
          v-model="selected"
          v-model:items-per-page="itemsPerPage"
          v-model:sort-by="sortByColumns"
          v-model:page="currentPage"
          :items="serverItems"
          :items-length="totalItems"
          :loading="loading"
          :search="search"
          :item-value="componentProps.itemKey"
          @update:options="loadItems"
        >
          <!-- Pass on all named slots -->
          <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
            <slot :name="slot" v-bind="slotProps" />
          </template>

          <template #footer.prepend>
            <v-btn-group density="compact" class="me-auto ms-2">
              <v-btn v-if="componentProps.download" size="small" @click="downloadTable" variant="tonal" v-tooltip:top="$t('buttonDownload')">
                <v-icon icon="mdi-download" />
              </v-btn>
              <slot name="footer" />
            </v-btn-group>
          </template>
        </DataGrid>
      </v-card-text>
    </div>

    <!-- @vue-ignore -->
    <v-data-table-server
      v-if="displayType === 'table'"
      v-model="selected"
      v-model:items-per-page="itemsPerPage"
      v-model:sort-by="sortByColumns"
      v-model:page="currentPage"
      class="base-table"
      :row-props="componentProps.getRowProps"
      :headers="allHeaders"
      :items="serverItems"
      :items-length="totalItems"
      :loading="loading"
      :search="search"
      :item-value="componentProps.itemKey"
      :show-expand="showDetails"
      striped="odd"
      :show-select="componentProps.selectionType !== undefined"
      :select-strategy="componentProps.selectionType"
      @update:options="loadItems"
      :items-per-page-options="perPageOptions"
    >
      <template #top>
        <TableToolbar
          v-model="displayType"
          :headers="componentProps.headers"
          :marked-item-type="componentProps.markedItemType"
          @clear-filter="clearFilter"
          @show-filter="tableFilterModal?.show()"
          @toggle-header="toggleHeader"
          :filtered="filters && filters.length > 0"
          :marked-item-config="markedItemConfig"
          :table-key="componentProps.tableKey"
          :header-icon="componentProps.headerIcon"
          :header-icon-color="componentProps.headerIconColor"
          :header-title="componentProps.headerTitle"
          :supports-grid-cards="componentProps.supportsGridCards"
        >
          <template #header>
            <slot name="header" />
          </template>
        </TableToolbar>

        <slot name="card-text" />
      </template>

      <template #header.data-table-select="{ allSelected, someSelected }">
        <v-checkbox-btn :indeterminate="!allSelected && someSelected" :model-value="allSelected" @update:model-value="manuallySelectAll(allSelected)" />
      </template>

      <template #header.marked-items>
        <v-menu location="start">
          <template #activator="{ props }">
            <v-btn
              variant="tonal"
              v-bind="props"
              prepend-icon="mdi-menu-left"
            >
              <v-icon icon="mdi-checkbox-multiple-outline" />
            </v-btn>
          </template>
          <v-list>
            <v-list-item :title="$t('tableItemMarkingMarkAll')" prepend-icon="mdi-checkbox-multiple-marked" @click="markAllItems(true)" />
            <v-list-item :title="$t('tableItemMarkingUnmarkAll')" prepend-icon="mdi-checkbox-multiple-blank-outline" @click="markAllItems(false)" />
          </v-list>
        </v-menu>
      </template>

      <template #item.item-selected="{ item }">
        <!-- @vue-ignore -->
        <div v-if="selected.includes(item[componentProps.itemKey])" class="indicator-flag" :style="{ backgroundColor: 'rgb(var(--v-theme-primary))' }" />
      </template>
      <template #item.marked-items="{ item }">
        <!-- @vue-ignore -->
        <v-chip
          :color="isMarked(item[componentProps.itemKey]) ? 'primary' : undefined"
          v-if="componentProps.markedItemType"
          @click="toggleMarkedItem(item[componentProps.itemKey])"
          v-tooltip:top="isMarked(item[componentProps.itemKey]) ? $t('widgetTableMarkingRemoveItemFromList') : $t('widgetTableMarkingAddItemToList')"
        >
          <!-- @vue-ignore -->
          <v-icon :icon="isMarked(item[componentProps.itemKey]) ? 'mdi-bookmark-check' : 'mdi-bookmark-outline'" />
        </v-chip>
      </template>

      <!-- Pass on all named slots -->
      <template v-for="slot in Object.keys($slots)" #[slot]="slotProps">
        <slot :name="slot" v-bind="slotProps" />
      </template>

      <template #footer.prepend>
        <v-btn-group density="compact" class="me-auto ms-2">
          <v-btn v-if="componentProps.download" size="small" @click="downloadTable" variant="tonal" v-tooltip:top="$t('buttonDownload')">
            <v-icon icon="mdi-download" />
          </v-btn>
          <slot name="footer" />
        </v-btn-group>
      </template>
    </v-data-table-server>

    <TableFilterModal :columns="filterColumns" :filter-on="componentProps.filterOn" :table-key="componentProps.tableKey" ref="tableFilterModal" @filter-changed="updateFilters" />

    <v-bottom-sheet
      :model-value="localBottomSheetVisible"
      @update:model-value="notifyBottomSheet"
      inset
      max-height="75vh"
    >
      <v-card
        class="pb-10"
      >
        <v-card-text>
          <slot name="bottom-sheet-content" />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </v-card>
</template>

<script setup lang="ts" generic="T">
  import type { FilterGroup, PaginatedResult } from '@/plugins/types/germinate'
  import type { AxiosResponse } from 'axios'
  import type { DataTableHeader, DataTableSortItem } from 'vuetify'
  import { useI18n } from 'vue-i18n'
  import { coreStore } from '@/stores/app'
  import { getDateTimeString } from '@/plugins/util/formatting'
  import type { ExtendedDataTableHeader } from '@/plugins/types/ExtendedDataTableHeader'
  import TableFilterModal from '@/components/modals/TableFilterModal.vue'

  import emitter from 'tiny-emitter/instance'
  import { downloadBlob } from '@/plugins/util'
  import type { BaseTableProps } from '@/plugins/types/BaseTableProps'
  import DataGrid from '@/components/tables/DataGrid.vue'

  export type DisplayType = 'table' | 'grid'

  export interface MarkedItemConfig {
    type: string
    count: number
    markedIds: Set<number>
  }

  const componentProps = withDefaults(defineProps<BaseTableProps<T>>(), {
    showDetails: false,
    storeUrlParameters: true,
  })

  const emit = defineEmits(['data-changed', 'selection-changed', 'update:bottomSheetVisible', 'filter-changed'])

  const router = useRouter()
  const route = useRoute()
  const store = coreStore()
  const { t } = useI18n()

  const urlPageToForce = ref()
  const localBottomSheetVisible = ref(false)
  const currentPage = ref(1)
  const itemsPerPage = ref(store.storeTablePerPage || 10)
  const sortByColumns = ref<DataTableSortItem[] | undefined>([])
  const selected = ref<number[]>([])
  const serverItems = ref<T[]>([])
  const filters = ref<FilterGroup[]>([])
  const loading = ref(true)
  const totalItems = ref(-1)
  const search = ref('')
  const isResetCall = ref(true)
  const tableFilterModal = useTemplateRef('tableFilterModal')
  const displayType = ref<DisplayType>('table')

  const perPageOptions = computed(() => {
    return [
      { value: 10, title: '10' },
      { value: 25, title: '25' },
      { value: 50, title: '50' },
      { value: 100, title: '100' },
    ]
  })

  const markedItemConfig: ComputedRef<MarkedItemConfig | undefined> = computed(() => {
    if (componentProps.markedItemType) {
      const ids = store.storeMarkedIds[componentProps.markedItemType]

      return {
        type: componentProps.markedItemType,
        markedIds: new Set(ids),
        count: ids.length,
      }
    } else {
      return undefined
    }
  })

  const filterColumns: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    return ((componentProps.headers || []) as ExtendedDataTableHeader[]).concat().filter(h => h.title && h.visibleInFilter !== false && h.dataType !== undefined)
  })

  const allHeaders: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    let headers = ((componentProps.headers || []) as ExtendedDataTableHeader[]).concat().filter(h => h.visibleInTable !== false)

    const hiddenColumns = store.storeHiddenColumns[componentProps.tableKey]

    if (componentProps.selectionType !== undefined) {
      headers.unshift({ title: '', key: 'item-selected', width: '1em', cellProps: { class: 'ma-0 pa-0' }, headerProps: { class: 'ma-0 pa-0' }, dataType: 'boolean', visibleInFilter: false })
    }
    if (markedItemConfig.value) {
      headers.push({ title: '', key: 'marked-items', width: '1em', dataType: 'boolean', visibleInFilter: false, align: 'end' as 'start' | 'end' | 'center' })
    }

    if (hiddenColumns) {
      headers = headers.filter(h => h.key ? !hiddenColumns.includes(h.key) : true)
    }

    return headers
  })

  watch(() => componentProps.bottomSheetVisible, async (newValue: boolean) => {
    localBottomSheetVisible.value = newValue
  })

  watch(selected, async (newValue: number[]) => {
    emit('selection-changed', newValue)
  })

  function notifyBottomSheet (value: boolean) {
    emit('update:bottomSheetVisible', value)
  }

  function isMarked (id: number) {
    return markedItemConfig.value ? markedItemConfig.value.markedIds.has(id) : false
  }

  function setSelection (selection: number[]) {
    selected.value = selection
  }

  function getSelection () {
    return selected.value
  }

  function downloadTable () {
    if (componentProps.download) {
      // Warn user that it's a lot of data and it'll take a while
      if (totalItems.value > 100_000) {
        emitter.emit('show-confirm', {
          title: t('modalTitleWarning'),
          message: t('modalTextWarningLargeAmountOfData', { size: totalItems.value.toLocaleString() }),
          okTitle: t('genericYes'),
          cancelTitle: t('genericNo'),
          okVariant: 'primary',
          callback: (result: boolean) => {
            if (result === true) {
              requestDownload()
            }
          },
        })
      } else {
        requestDownload()
      }
    }
  }

  function requestDownload () {
    if (!componentProps.download) {
      return
    }

    emitter.emit('show-loading', true)
    // Download the current table data
    componentProps.download({
      page: currentPage.value,
      limit: itemsPerPage.value,
      prevCount: isResetCall ? -1 : totalItems.value,
      orderBy: (sortByColumns.value && sortByColumns.value.length > 0) ? sortByColumns.value[0].key : undefined,
      ascending: +((sortByColumns.value && sortByColumns.value.length > 0) ? sortByColumns.value[0].order === 'asc' : false),
      filters: filters.value || [],
    }).then((result: AxiosResponse<Blob>) => {
      downloadBlob({
        blob: result.data,
        filename: `${componentProps.tableKey}-table-${getDateTimeString()}`,
        extension: 'zip',
      })
      emitter.emit('show-loading', false)
    })
  }

  function toggleMarkedItem (id: number) {
    if (componentProps.markedItemType) {
      if (markedItemConfig.value?.markedIds.has(id)) {
        store.removeMarkedIds(componentProps.markedItemType, [id])
      } else {
        store.addMarkedIds(componentProps.markedItemType, [id])
      }
    }
  }

  function toggleHeader (header: DataTableHeader) {
    if (!header.key) {
      return
    }

    const hiddenColumns = store.storeHiddenColumns[componentProps.tableKey]

    const index = hiddenColumns.indexOf(header.key)
    if (index !== -1) {
      hiddenColumns.splice(index, 1)
    } else {
      hiddenColumns.push(header.key)
    }

    store.setHiddenColumnsType(componentProps.tableKey, hiddenColumns)
  }

  function clearFilter () {
    tableFilterModal.value?.clear()
  }

  function updateFilters (newFilters: FilterGroup[]) {
    filters.value = JSON.parse(JSON.stringify(newFilters))

    refresh()

    emit('filter-changed', JSON.parse(JSON.stringify(newFilters)))
  }

  function refresh () {
    isResetCall.value = true
    selected.value = []

    search.value = `${Date.now()}`
  }

  function manuallySelectAll (allSelected: any) {
    if (!componentProps.getIds) {
      return
    }

    if (allSelected) {
      selected.value = []
    } else {
      loading.value = true
      componentProps.getIds({
        page: currentPage.value,
        limit: itemsPerPage.value,
        prevCount: isResetCall ? -1 : totalItems.value,
        orderBy: (sortByColumns.value && sortByColumns.value.length > 0) ? sortByColumns.value[0].key : undefined,
        ascending: +((sortByColumns.value && sortByColumns.value.length > 0) ? sortByColumns.value[0].order === 'asc' : false),
        filters: filters.value || [],
      }).then((result: AxiosResponse<PaginatedResult<number[]>>) => {
        isResetCall.value = false
        if (result && result.data) {
          selected.value = result.data.data || []
        } else {
          selected.value = []
        }
        loading.value = false
      })
    }
  }

  function markAllItems (mark: boolean) {
    if (!componentProps.getIds) {
      return
    }

    if (componentProps.markedItemType) {
      emitter.emit('show-loading', true)
      componentProps.getIds({
        page: currentPage.value,
        limit: itemsPerPage.value,
        prevCount: isResetCall ? -1 : totalItems.value,
        orderBy: (sortByColumns.value && sortByColumns.value.length > 0) ? sortByColumns.value[0].key : undefined,
        ascending: +((sortByColumns.value && sortByColumns.value.length > 0) ? sortByColumns.value[0].order === 'asc' : false),
        filters: filters.value || [],
      })
        .then((result: AxiosResponse<PaginatedResult<number[]>>) => {
          if (mark) {
            store.addMarkedIds(componentProps.markedItemType || '', result.data.data)
          } else {
            store.removeMarkedIds(componentProps.markedItemType || '', result.data.data)
          }
          emitter.emit('show-loading', false)
        })
    }
  }

  function loadItems ({ page, itemsPerPage, sortBy }: { page: number, itemsPerPage: number, sortBy?: DataTableSortItem[] }) {
    const request = {
      page: page,
      limit: itemsPerPage,
      prevCount: isResetCall ? -1 : totalItems.value,
      orderBy: (sortBy && sortBy.length > 0) ? sortBy[0].key : undefined,
      ascending: +((sortBy && sortBy.length > 0) ? sortBy[0].order === 'asc' : false),
      filters: filters.value || [],
    }

    loading.value = true
    componentProps.getData(request).then((result: AxiosResponse<PaginatedResult<T[]>>) => {
      isResetCall.value = false
      loading.value = false
      if (result && result.data) {
        serverItems.value = result.data.data
        totalItems.value = result.data.count

        emit('data-changed', request)

        if (urlPageToForce.value) {
          currentPage.value = urlPageToForce.value
          urlPageToForce.value = undefined
        }
      }
    })
  }

  async function updateUrlParameters () {
    if (componentProps.storeUrlParameters) {
      const query = Object.assign({}, route.query)
      query[`${componentProps.tableKey}-page`] = `${currentPage.value}`
      query[`${componentProps.tableKey}-per-page`] = `${itemsPerPage.value}`
      if (sortByColumns.value && sortByColumns.value.length > 0) {
        query[`${componentProps.tableKey}-sort`] = sortByColumns.value[0].key
        query[`${componentProps.tableKey}-sort-desc`] = `${sortByColumns.value[0].order === 'desc'}`
      } else {
        delete query[`${componentProps.tableKey}-sort`]
        delete query[`${componentProps.tableKey}-sort-desc`]
      }

      await router.replace({ query })
    }
  }

  function readUrlParams () {
    if (route.query) {
      const p = route.query[`${componentProps.tableKey}-page`]
      const s = route.query[`${componentProps.tableKey}-sort`]
      const o = route.query[`${componentProps.tableKey}-sort-desc`]
      const pp = route.query[`${componentProps.tableKey}-per-page`]

      const sortItem: DataTableSortItem = {
        key: '',
      }
      if (p) {
        urlPageToForce.value = +p
      }
      if (pp) {
        itemsPerPage.value = +pp
      }
      if (s) {
        sortItem.key = `${s}`
      }
      if (o) {
        sortItem.order = o === 'true' ? 'desc' : 'asc'
      }

      if (sortItem.key && sortItem.order) {
        sortByColumns.value = [sortItem]
      }
    }
  }

  watch(itemsPerPage, (newValue: number) => {
    updateUrlParameters()
    store.setTablePerPage(newValue)
  })
  watch(currentPage, () => updateUrlParameters())
  watch(sortByColumns, () => updateUrlParameters())

  onBeforeMount(() => {
    readUrlParams()
  })

  defineExpose({
    refresh,
    setSelection,
    getSelection,
  })
</script>

<style scoped>
.indicator-flag {
  height: 100%;
  width: 1em;
}
</style>

<style>
.base-table .v-toolbar__content {
  height: auto !important;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
</style>
