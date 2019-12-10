<template>
  <div class="table-mb-0 table-overflow-fix">
    <v-server-table :url="''" :columns="columns.map(c => c.name)" :options="tableOptions" @loading="isLoading = true" @loaded="notifyLoaded" ref="table">
      <!-- Pass on all named slots -->
      <slot v-for="slot in Object.keys($slots)" :name="slot" :slot="slot"/>
      <!-- Pass on all scoped slots -->
      <template v-for="slot in Object.keys($scopedSlots)" :slot="slot" slot-scope="scope"><slot :name="slot" v-bind="scope"/></template>

      <div slot="beforeTable">
        <div class="d-flex flex-row justify-content-between align-items-end">
          <TableFilter :columns="columns"
                      :texts="tableOptions.headings"
                      :tableName="tableOptions.tableName"
                      :filterOn="filterOn"
                      ref="tableFilter"
                      v-if="filterEnabled"
                      v-on:on-filter-changed="onFilterChanged"
                      v-on:on-column-toggle="onToggleColumn" />

          <div class="flex-grow-1">
            <div class="d-flex flex-row justify-content-between">
              <div class="d-flex align-items-end mx-1 text-info" v-if="filterEnabled && (filter === null || filter.length < 1)">
                <i class="mr-1 mdi mdi-18px fix-alignment mdi-arrow-left-bold"/> <span class="mb-1"> {{ $t('widgetTableFilterInfo') }}</span>
              </div>
              <div v-else />
              <div v-if="currentRequestData !== null && prevCount >= 0" class="d-flex mx-2 mb-1">{{ $tc('paginationCountCustom', prevCount, { from: $options.filters.toThousandSeparators(currentRequestData.page * currentRequestData.limit + 1), to: $options.filters.toThousandSeparators(Math.min((currentRequestData.page + 1) * currentRequestData.limit, prevCount)), count: $options.filters.toThousandSeparators(prevCount) }) }}</div>
            </div>
            <b-progress :value="100" height="6px" variant="primary" v-b-tooltip.hover :title="$t('tooltipTableLoadingIndicator')" striped animated v-if="isLoading" class="table-loading-indicator" />
            <div v-else style="height: 6px;" />
          </div>

          <b-button-group class="per-page-dropdown" v-if="!showAllItems">
            <b-dropdown v-b-tooltip.hover :title="$t('tooltipTableItemsPerPage')">
              <template slot="button-content"><i class="mdi mdi-18px mdi-book-open-page-variant"/><span> {{ tablePerPage }}</span></template>
              <b-dropdown-item v-for="value in perPageValues" @click="onPerPageChanged(value)" :key="'table-per-page-' + value">{{ value }}</b-dropdown-item>
            </b-dropdown>
            <MarkedItems class="float-right" :itemType="itemType" />
          </b-button-group>
        </div>
      </div>

      <div slot="h__selected" v-if="(columns.map(c => c.name).indexOf('selected') !== -1) && (getIds !== null)">
        <b-form-checkbox :checked="allSelected" @change="onSelectionHeaderClicked"/>
      </div>
      <b-form-checkbox slot="selected" slot-scope="props" :value="props.row[tableOptions.idColumn]" v-model="selectedItems" v-if="columns.map(c => c.name).indexOf('selected') !== -1"/>

      <div slot="h__marked">
        <b-dropdown size="sm" dropleft variant="outline-primary" boundary="window">
          <template slot="button-content">
            <i class="mdi mdi-18px mdi-check-box-multiple-outline" />
          </template>
          <b-dropdown-item @click="markAllItems(true)"><i class="mdi mdi-18px mdi-checkbox-multiple-marked" />Mark all</b-dropdown-item>
          <b-dropdown-item @click="markAllItems(false)"><i class="mdi mdi-18px mdi-checkbox-multiple-blank-outline" />Unmark all</b-dropdown-item>
          <b-dropdown-item @click="createGroup" v-if="token" :disabled="!markedIds[itemType] || markedIds[itemType].length < 1"><i class="mdi mdi-18px mdi-group" />Create group</b-dropdown-item>
          <template v-if="tableOptions.additionalMarkingOptions">
            <b-dropdown-divider />
            <b-dropdown-item v-for="item in tableOptions.additionalMarkingOptions" :key="item.key" @click="item.callback(null)">
              <i :class="`mdi mdi-18px ${item.icon}`" />{{ item.text() }}
            </b-dropdown-item>
          </template>
        </b-dropdown>
      </div>

      <div slot="marked" slot-scope="props" @contextmenu.prevent="contextMenu($event, props.row)">
        <b-form-checkbox  :checked="isMarked(props.row)" @change="markItem(props.row[tableOptions.idColumn], $event)" v-if="itemType"/>
      </div>

      <div slot="afterTable" v-if="columns.map(c => c.name).indexOf('selected') !== -1 || downloadTable !== null || tableActions !== null">

        <template v-if="downloadTable !== null">
          <b-button @click="onDownloadTableClicked"><i class="mdi mdi-18px fix-alignment mdi-download" /></b-button>
        </template>

        <template v-if="columns.map(c => c.name).indexOf('selected') !== -1">
          <div>
            <i class="mdi mdi-18px mdi-arrow-up-bold"/><span>{{ $t('widgetTableMultiSelectInfo') }}</span>
          </div>
        </template>

        <b-button-group v-if="tableActions">
          <b-button v-for="action in tableActions"
                    :key="`base-table-action-${action.id}`"
                    :variant="action.variant"
                    :disabled="action.disabled()"
                    @click="action.callback(selectedItems)"
                    v-b-tooltip.hover
                    :title="action.text">
            <i :class="action.icon" v-if="action.icon" />
            <span v-else>{{ action.text }}</span>
          </b-button>
        </b-button-group>
      </div>
    </v-server-table>

    <vue-context ref="menu" v-if="tableOptions.additionalMarkingOptions">
      <template slot-scope="child">
        <li v-for="item in tableOptions.additionalMarkingOptions" :key="item.key">
          <a href="#" @click="item.callback(child.data)"><i :class="`mdi mdi-18px ${item.icon}`" /> {{ item.text() }}</a>
        </li>
      </template>
    </vue-context>

    <GroupEditAddModal v-if="token && markedIds[itemType] && markedIds[itemType].length > 0" :groupToEdit="newGroup" :groupTypeSelect="groupTypeSelect" ref="groupAddModal" v-on:ok="putGroup"/>
  </div>
</template>

<script>
import GroupEditAddModal from '@/components/modals/GroupEditAddModal'
import TableFilter from '@/components/tables/TableFilter'
import MarkedItems from '@/components/tables/MarkedItems'
import { VueContext } from 'vue-context'
import { EventBus } from '@/plugins/event-bus.js'
import { mapFilters } from '@/plugins/map-filters.js'

export default {
  props: {
    showAllItems: {
      type: Boolean,
      default: null
    },
    columns: {
      type: Array,
      default: () => []
    },
    filterOn: {
      type: Array,
      default: null
    },
    filterEnabled: {
      type: Boolean,
      default: true
    },
    options: {
      type: Object,
      default: () => {}
    },
    itemType: {
      type: String,
      default: null
    },
    downloadTable: {
      type: Function,
      default: null
    },
    getData: {
      type: Function,
      default: () => {
        return {
          data: [],
          count: 0
        }
      }
    },
    getIds: {
      type: Function,
      default: null
    },
    tableActions: {
      type: Array,
      default: () => null
    }
  },
  computed: {
    allSelected: function () {
      return this.selectedItems.length > 0 && this.selectedItems.length === this.prevCount
    }
  },
  watch: {
    locale (newValue, oldValue) {
      this.tableOptions.texts = this.getPaginationTexts()
    },
    token: function (newValue, oldValue) {
      this.refresh()
    },
    selectedItems: function (newValue, oldValue) {
      this.$emit('selection-changed', newValue)
    }
  },
  data: function () {
    var isInitialLoad = true

    var defaults = {
      requestFunction: data => {
        // On its initial load, if a filter was specified, but none requested, ignore it.
        // This happens if the TableFilter hasn't been loaded yet when the table has.
        if (isInitialLoad && this.filterOn && !data.filter) {
          isInitialLoad = false
          return new Promise((resolve, reject) => {
            resolve({
              data: {
                data: [],
                count: 0,
                isInitialLoad: true
              }
            })
          })
        } else {
          // Request the data as normal otherwise
          var vm = this
          data.prevCount = this.prevCount
          data.filter = this.filter
          this.currentRequestData = data
          return this.getData(data, function (result) {
            vm.prevCount = result.count
          })
        }
      },
      responseAdapter: data => {
        this.$emit('data-changed', this.currentRequestData, data.data)
        return data.data
      },
      skin: 'table table-striped table-hover',
      texts: this.getPaginationTexts(),
      filterByColumn: true,
      summary: true,
      perPage: this.showAllItems ? 2147483647 : 10,
      perPageValues: [],
      pagination: {
        chunk: 5
      },
      rowClassCallback: row => this.getRowClass(row)
    }

    var tableOptions = Object.assign({}, defaults, this.options)
    if (this.options.rowClassCallback) {
      tableOptions.rowClassCallback = row => {
        return this.options.rowClassCallback(row) + ' ' + this.getRowClass(row)
      }
    }
    if (this.options.columnsClasses) {
      var markingColumn = this.columns.filter(c => c.name === 'marked')
      if (markingColumn && markingColumn.length === 1) {
        tableOptions.columnsClasses.marked = this.options.columnsClasses.marked + ' text-right py-0 align-middle'
      }
      var selectionColumn = this.columns.filter(c => c.name === 'selected')
      if (selectionColumn && selectionColumn.length === 1) {
        tableOptions.columnsClasses.selected = this.options.columnsClasses.selected + ' align-middle'
      }
    }

    return {
      selectedItems: [],
      perPageValues: this.showAllItems ? [this.MAX_JAVA_INTEGER] : [10, 25, 50, 100],
      prevCount: -1,
      currentRequestData: null,
      filter: null,
      tableOptions: tableOptions,
      newGroup: null,
      groupTypeSelect: null,
      isLoading: false
    }
  },
  components: {
    GroupEditAddModal,
    TableFilter,
    MarkedItems,
    VueContext
  },
  methods: {
    ...mapFilters(['toThousandSeparators']),
    notifyLoaded: function (data) {
      this.isLoading = false
      this.$emit('loaded', data)
    },
    putGroup: function () {
      var group = {
        name: this.newGroup.groupName,
        description: this.newGroup.groupDescription,
        grouptypeId: this.newGroup.groupTypeId,
        visibility: true,
        createdBy: this.newGroup.userId
      }

      this.apiPutGroup(group, result => {
        const data = {
          ids: this.markedIds[this.itemType],
          isAddition: true
        }
        this.apiPatchGroupMembers(result, this.itemType, data, result => {
          this.$bvToast.toast(this.$t('toastGroupCreateWithMembers', { count: result }), {
            title: this.$t('genericSuccess'),
            variant: 'success',
            autoHideDelay: 5000,
            appendToast: true
          })
        })
      })
    },
    createGroup: function () {
      // TODO
      this.newGroup = {
        groupId: null,
        groupName: null,
        groupDescription: null,
        userId: this.token.id
      }
      this.apiGetGroupTypes(result => {
        this.groupTypeSelect = result.data.map(g => {
          return {
            value: g.id,
            text: this.groupTypes[g.targetTable].text()
          }
        })
        const groupTypeLocal = Object.keys(this.groupTypes).filter(i => this.groupTypes[i].itemType === this.itemType)[0]
        const groupType = result.data.filter(g => g.targetTable === groupTypeLocal)[0]
        this.newGroup.groupTypeId = groupType.id
        this.newGroup.groupType = groupType.targetTable

        this.$nextTick(() => {
          this.$refs.groupAddModal.show()
        })
      })
    },
    onDownloadTableClicked: function () {
      if (this.downloadTable !== null) {
        if (this.prevCount > 100000) {
          this.$bvModal.msgBoxConfirm(this.$t('modalTextWarningLargeAmountOfData', { size: this.toThousandSeparators(this.prevCount) }), {
            title: this.$t('modalTitleWarning'),
            okTitle: this.$t('genericYes'),
            cancelTitle: this.$t('genericNo'),
            okVariant: 'primary'
          })
            .then(value => {
              if (value === true) {
                this.requestDownload()
              }
            })
        } else {
          this.requestDownload()
        }
      }
    },
    requestDownload: function () {
      EventBus.$emit('show-loading', true)
      this.downloadTable(this.currentRequestData, result => {
        this.downloadBlob({
          blob: result,
          filename: this.tableOptions.tableName + '-table',
          extension: 'zip'
        })
        EventBus.$emit('show-loading', false)
      })
    },
    contextMenu: function (event, row) {
      if (this.tableOptions.additionalMarkingOptions) {
        this.$refs.menu.open(event, row)
      }
    },
    getRowClass: function (row) {
      if (this.selectedItems.indexOf(row[this.tableOptions.idColumn]) !== -1) {
        return 'table-info'
      } else {
        return ''
      }
    },
    onPerPageChanged: function (value) {
      this.$store.dispatch('ON_TABLE_PER_PAGE_CHANGED', value)
      this.$refs.table.setLimit(value)
    },
    onSelectionHeaderClicked: function (value) {
      if (value && this.getIds) {
        EventBus.$emit('show-loading', true)
        this.getIds(this.currentRequestData, result => {
          this.selectedItems = result.data
          EventBus.$emit('show-loading', false)
        })
      } else {
        this.selectedItems = []
      }
    },
    setSelectedItems: function (toSelect) {
      this.selectedItems = toSelect
    },
    getCurrentRequestData: function () {
      return this.currentRequestData
    },
    markAllItems: function (mark) {
      if (this.getIds) {
        EventBus.$emit('show-loading', true)
        this.getIds(this.currentRequestData, result => {
          if (mark) {
            this.$store.dispatch('ON_MARKED_IDS_ADD', { type: this.itemType, ids: result.data })
          } else {
            this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: this.itemType, ids: result.data })
          }
          EventBus.$emit('show-loading', false)
        })
      }
    },
    isSelected: function (row) {
      return this.selectedItems[row[this.tableOptions.idColumn]] !== undefined
    },
    isMarked: function (row) {
      if (this.itemType) {
        return this.markedIds[this.itemType].indexOf(row[this.tableOptions.idColumn]) !== -1
      } else {
        return false
      }
    },
    getSelected: function () {
      return this.selectedItems
    },
    isHidden: function (column) {
      return this.$store.getters.hiddenColumns[this.tableOptions.tableName].indexOf(column) !== -1 ? 'd-none' : ''
    },
    refresh: function () {
      this.prevCount = -1
      this.$refs.table.refresh()
    },
    onFilterChanged: function (filter) {
      this.filter = filter.filter
      this.prevCount = -1

      if (filter.triggerUpdate) {
        this.$refs.table.refresh()
      }
    },
    onToggleColumn: function (column) {
      this.$refs.table.toggleColumn(column)
    },
    onItemSelected: function (item, event) {
      if (event) {
        this.selectedItems[item[this.tableOptions.idColumn]] = item
      } else {
        delete this.selectedItems[item[this.tableOptions.idColumn]]
      }
    },
    markItem: function (id, event) {
      if (event) {
        this.$store.dispatch('ON_MARKED_IDS_ADD', { type: this.itemType, ids: [id] })
      } else {
        this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: this.itemType, ids: [id] })
      }
    }
  },
  created: function () {
    if (!this.showAllItems && this.tableOptions.perPage !== this.tablePerPage) {
      this.tableOptions.perPage = this.tablePerPage
    }
  },
  mounted: function () {
    this.columns.forEach(c => {
      if (this.hiddenColumns[this.tableOptions.tableName].indexOf(c.name) !== -1) {
        try {
          this.$refs.table.toggleColumn(c.name)
        } catch (error) {
          console.log(error)
          // Do nothing here
        }
      }
    })
  }
}
</script>

<style>
.VueTables__filters-row {
  display: none;
}
.table-overflow-fix table {
  margin: 0 -1px;
}
th.VueTables__sortable {
    white-space: nowrap;
}
span.VueTables__heading {
    white-space: initial;
}
span.VueTables__sort-icon.float-right.table-sort {
    float: unset !important;
}
.per-page-dropdown .btn {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-bottom: 0;
}
.table-loading-indicator {
  border-radius: 0;
}
.table-mb-0 .table-responsive {
  margin-bottom: 0;
}
</style>
