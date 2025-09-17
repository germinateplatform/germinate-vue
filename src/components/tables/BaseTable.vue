<template>
  <v-card>
    <div
      v-if="filters !== undefined && localDisplayType === 'grid'"
      class="v-table v-table--has-top v-table--has-bottom v-table--striped-odd v-table--density-default v-data-table base-table"
    >
      <TableToolbar
        v-model="localDisplayType"
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
        :disabled="componentProps.disabled"
      >
        <template #header>
          <v-text-field
            v-if="searchVisible"
            v-model="searchTerm"
            type="search"
            width="min(50vw, 250px)"
            prepend-inner-icon="mdi-magnify"
            :placeholder="$t('inputPlaceholderSearch')"
            append-inner-icon="mdi-arrow-right"
            @click:append-inner="runSearch"
            @keyup.enter="runSearch"
            hide-details
            density="compact"
          />
          <slot name="header" />
        </template>
      </TableToolbar>

      <slot name="card-text" />

      <v-card-text>
        <!-- @vue-ignore -->
        <DataGrid
          v-model="selected"
          v-model:items-per-page="itemsPerPage"
          v-model:sort-by="localSortByColumns"
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
      v-if="filters !== undefined && localDisplayType === 'table'"
      v-model="selected"
      v-model:items-per-page="itemsPerPage"
      v-model:sort-by="localSortByColumns"
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
      :disable-sort="componentProps.disabled"
      striped="odd"
      hover
      :show-select="componentProps.selectionType !== undefined"
      :select-strategy="componentProps.selectionType"
      @update:options="loadItems"
      :items-per-page-options="perPageOptions"
    >
      <template #top>
        <TableToolbar
          v-model="localDisplayType"
          :headers="componentProps.headers"
          :marked-item-type="componentProps.markedItemType"
          @clear-filter="clearFilter"
          @show-filter="tableFilterModal?.show()"
          @toggle-header="toggleHeader"
          :filtered="filters !== undefined && filters.length > 0"
          :marked-item-config="markedItemConfig"
          :table-key="componentProps.tableKey"
          :header-icon="componentProps.headerIcon"
          :header-icon-color="componentProps.headerIconColor"
          :header-title="componentProps.headerTitle"
          :supports-grid-cards="componentProps.supportsGridCards"
          :disabled="componentProps.disabled"
        >
          <template #header>
            <div>
              <v-text-field
                v-if="searchVisible"
                v-model="searchTerm"
                type="search"
                width="min(50vw, 250px)"
                prepend-inner-icon="mdi-magnify"
                :placeholder="$t('inputPlaceholderSearch')"
                append-inner-icon="mdi-arrow-right"
                @click:append-inner="runSearch"
                @keyup.enter="runSearch"
                hide-details
                density="compact"
              />
              <slot name="header" />
            </div>
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
            <v-list-item :title="$t('tableItemMarkingCreateGroup')" prepend-icon="mdi-group" @click="addGroup" v-if="store.storeUserIsAuthenticated" :disabled="!markedItemConfig || markedItemConfig.count === 0" />
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

    <!-- @vue-generic {import('@/plugins/types/germinate').ViewTableGroups} -->
    <GenericAddEditFormModal
      title="modalTitleEditGroup"
      :item="newGroup"
      :notify="onSendGroup"
      :fields="groupFields"
      @items-changed="redirectToGroup"
      ref="groupModal"
      v-if="newGroup && markedItemConfig"
    />
  </v-card>
</template>

<script setup lang="ts" generic="T">
  import { type ViewTableGroups, type FilterGroup, type PaginatedResult, type Grouptypes, FilterOperator, FilterComparator } from '@/plugins/types/germinate'
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
  import { apiGetGroupTypes, apiPatchGroupMembers, apiPutGroup } from '@/plugins/api/group'
  import { groupTypes } from '@/plugins/util/types'
  import { Pages } from '@/plugins/pages'

  export type DisplayType = 'table' | 'grid'

  export interface MarkedItemConfig {
    type: string
    count: number
    markedIds: Set<number>
  }

  const componentProps = withDefaults(defineProps<BaseTableProps<T>>(), {
    showDetails: false,
    storeUrlParameters: true,
    displayType: 'table',
  })

  const emit = defineEmits(['data-changed', 'selection-changed', 'update:bottomSheetVisible', 'filter-changed'])

  const router = useRouter()
  const route = useRoute()
  const store = coreStore()
  const { t } = useI18n()

  const searchTerm = ref<string>()
  const newGroup = ref<ViewTableGroups>({})
  const urlPageToForce = ref()
  const localBottomSheetVisible = ref(false)
  const currentPage = ref(1)
  const itemsPerPage = ref(store.storeTablePerPage || 12)
  const localSortByColumns = ref<DataTableSortItem[] | undefined>([])
  const selected = ref<number[]>([])
  const serverItems = ref<T[]>([])
  const filters = ref<FilterGroup[] | undefined>(undefined)
  const loading = ref(true)
  const totalItems = ref(-1)
  const search = ref('')
  const isResetCall = ref(true)
  const tableFilterModal = useTemplateRef('tableFilterModal')
  const groupModal = useTemplateRef('groupModal')
  const localDisplayType = ref<DisplayType>('table')
  const localGroupTypes = ref<Grouptypes[]>([])

  const groupFields = computed(() => {
    return [{
      key: 'groupTypeId',
      title: 'formLabelGroupType',
      hint: 'formDescriptionGroupTypeDisabled',
      type: 'select' as const,
      required: true,
      width: 2,
      disabled: true,
      selectOptions: localGroupTypes.value?.map(gt => {
        return {
          value: gt.id,
          title: groupTypes[gt.targetTable].text(),
        }
      }),
    }, {
      key: 'groupName',
      title: 'formLabelGroupName',
      hint: 'formDescriptionGroupName',
      type: 'text' as const,
      required: true,
      width: 2,
      valid: (value: string) => value !== undefined && value !== null && value.trim().length > 0,
    }, {
      key: 'groupDescription',
      title: 'formLabelGroupDescription',
      hint: 'formDescriptionGroupDescription',
      type: 'textarea' as const,
      required: false,
      width: 2,
    }]
  })

  const perPageOptions = computed(() => {
    return [
      { value: 12, title: '12' },
      { value: 24, title: '24' },
      { value: 48, title: '48' },
      { value: 96, title: '96' },
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

  const searchVisible = computed(() => (componentProps.headers || []).some(h => h.quickSearchable === true))

  const filterColumns: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    return ((componentProps.headers || []) as ExtendedDataTableHeader[]).concat().filter(h => h.title && h.visibleInFilter !== false && h.dataType !== undefined)
  })

  const allHeaders: ComputedRef<ExtendedDataTableHeader[]> = computed(() => {
    let headers = ((componentProps.headers || []) as ExtendedDataTableHeader[]).concat().filter(h => h.visibleInTable !== false)

    const hiddenColumns = store.storeHiddenColumns[componentProps.tableKey]

    if (componentProps.selectionType !== undefined) {
      headers.unshift({ title: '', key: 'item-selected', width: '1em', cellProps: { class: 'ma-0 pa-0' }, sortable: false, headerProps: { class: 'ma-0 pa-0' }, dataType: 'boolean', visibleInFilter: false })
    }
    if (markedItemConfig.value) {
      headers.push({ title: '', key: 'marked-items', width: '1em', dataType: 'boolean', sortable: false, visibleInFilter: false, align: 'end' as 'start' | 'end' | 'center' })
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

  function runSearch () {
    const trimmed = searchTerm.value?.trim() || ''

    if (trimmed.length === 0) {
      tableFilterModal.value?.loadFilters()
    } else {
      const quickSearchable = componentProps.headers.filter(h => h.quickSearchable === true)
      const filters: FilterGroup[] = [{
        // @ts-ignore
        filters: quickSearchable.map(qs => {
          let comp: FilterComparator

          switch (qs.dataType) {
            case 'string':
            case 'integer':
            case 'float':
              comp = FilterComparator.contains
              break
            case 'json':
              comp = FilterComparator.jsonSearch
              break
            default:
              comp = FilterComparator.equals
              break
          }

          return {
            column: qs.key || '',
            comparator: comp,
            values: [searchTerm.value],
          }
        }),
        operator: FilterOperator.or,
      }]

      tableFilterModal.value?.forceFilters(filters)
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
      orderBy: (localSortByColumns.value && localSortByColumns.value.length > 0) ? localSortByColumns.value[0].key : undefined,
      ascending: +((localSortByColumns.value && localSortByColumns.value.length > 0) ? localSortByColumns.value[0].order === 'asc' : false),
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

    searchTerm.value = undefined

    refresh()

    emit('filter-changed', JSON.parse(JSON.stringify(newFilters)))
  }

  function refresh (readFilter = false) {
    if (readFilter) {
      tableFilterModal.value?.loadFilters()
    } else {
      isResetCall.value = true
      selected.value = []
      search.value = `${Date.now()}`
    }
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
        orderBy: (localSortByColumns.value && localSortByColumns.value.length > 0) ? localSortByColumns.value[0].key : undefined,
        ascending: +((localSortByColumns.value && localSortByColumns.value.length > 0) ? localSortByColumns.value[0].order === 'asc' : false),
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
        orderBy: (localSortByColumns.value && localSortByColumns.value.length > 0) ? localSortByColumns.value[0].key : undefined,
        ascending: +((localSortByColumns.value && localSortByColumns.value.length > 0) ? localSortByColumns.value[0].order === 'asc' : false),
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

        emit('data-changed', request, result.data)

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
      if (localSortByColumns.value && localSortByColumns.value.length > 0) {
        query[`${componentProps.tableKey}-sort`] = localSortByColumns.value[0].key
        query[`${componentProps.tableKey}-sort-desc`] = `${localSortByColumns.value[0].order === 'desc'}`
      } else {
        delete query[`${componentProps.tableKey}-sort`]
        delete query[`${componentProps.tableKey}-sort-desc`]
      }

      // TODO: ADD FILTERING!!!!

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
        localSortByColumns.value = [sortItem]
      }
    }
  }

  function onSendGroup (item: ViewTableGroups) {
    return new Promise<boolean>(resolve => {
      apiPutGroup({
        id: item.groupId,
        grouptypeId: item.groupTypeId,
        name: item.groupName,
        description: item.groupDescription,
        visibility: item.groupVisibility,
        createdBy: store.storeToken?.id,
        createdOn: item.createdOn,
        updatedOn: item.updatedOn,
      }, (id: number) => {
        newGroup.value.groupId = id

        const data = {
          ids: store.storeMarkedGermplasm,
          addition: true,
        }

        // Now add the group members
        apiPatchGroupMembers(id, newGroup.value.groupType || '', data, () => {
          resolve(true)
        })
      })
    })
  }

  function addGroup () {
    newGroup.value = {}
    if (!localGroupTypes.value || localGroupTypes.value.length === 0) {
      apiGetGroupTypes<PaginatedResult<Grouptypes[]>>(result => {
        localGroupTypes.value = result.data
        const tableGroupType = Object.values(groupTypes).find(gt => gt.itemType === componentProps.markedItemType)
        const match = localGroupTypes.value.find(gt => groupTypes[gt.targetTable].id === tableGroupType?.id)
        newGroup.value.groupTypeId = match?.id
        newGroup.value.groupType = tableGroupType?.apiName

        nextTick(() => groupModal.value?.show())
      })
    } else {
      const tableGroupType = Object.values(groupTypes).find(gt => gt.itemType === componentProps.markedItemType)
      const match = localGroupTypes.value.find(gt => groupTypes[gt.targetTable].id === tableGroupType?.id)
      newGroup.value.groupTypeId = match?.id
      newGroup.value.groupType = tableGroupType?.apiName

      nextTick(() => groupModal.value?.show())
    }
  }

  function redirectToGroup () {
    if (newGroup.value && newGroup.value.groupId) {
      router.push(Pages.getPath(Pages.groupDetails, `${newGroup.value.groupId}`))
    }
  }

  function setOverallOperator (operator: FilterOperator) {
    tableFilterModal.value?.setOverallOperator(operator)
  }

  watch(itemsPerPage, (newValue: number) => {
    updateUrlParameters()
    store.setTablePerPage(newValue)
  })
  watch(currentPage, async () => updateUrlParameters())
  watch(localSortByColumns, async () => updateUrlParameters())
  watch(() => componentProps.displayType, (newValue: DisplayType) => {
    localDisplayType.value = newValue
  })

  onBeforeMount(() => {
    readUrlParams()
  })

  onMounted(() => {
    localDisplayType.value = componentProps.displayType
    localSortByColumns.value = componentProps.sortBy || []
  })

  defineExpose({
    refresh,
    setSelection,
    getSelection,
    setOverallOperator,
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
