<template>
  <div>
    <v-server-table :url="''" :columns="columns.map(c => c.name)" :options="tableOptions" @loaded="$emit('loaded')" ref="table" class="table-overflow-fix">
      <!-- Pass on all named slots -->
      <slot v-for="slot in Object.keys($slots)" :name="slot" :slot="slot"/>
      <!-- Pass on all scoped slots -->
      <template v-for="slot in Object.keys($scopedSlots)" :slot="slot" slot-scope="scope"><slot :name="slot" v-bind="scope"/></template>

      <b-row slot="beforeTable" class="align-items-end">
        <b-col cols=9 sm=6>
          <TableFilter :columns="columns"
                      :texts="tableOptions.headings"
                      :tableName="tableOptions.tableName"
                      :filterOn="filterOn"
                      ref="tableFilter"
                      v-on:on-filter-changed="onFilterChanged"
                      v-on:on-column-toggle="onToggleColumn" />
        </b-col>
        <b-col cols=3 sm=6>
          <b-button-group class="float-right per-page-dropdown">
            <b-dropdown>
              <template slot="button-content"><i class="mdi mdi-18px mdi-book-open-page-variant"/><span> {{ tablePerPage }}</span></template>
              <b-dropdown-item v-for="value in perPageValues" @click="onPerPageChanged(value)" :key="'table-per-page-' + value">{{ value }}</b-dropdown-item>
            </b-dropdown>
            <MarkedItems class="float-right" :itemType="itemType" />
          </b-button-group>
        </b-col>
      </b-row>

      <div slot="h__selected" v-if="columns.map(c => c.name).indexOf('selected') !== -1 && getIds">
        <b-form-checkbox :checked="allSelected" @change="onSelectionHeaderClicked"/>
      </div>
      <b-form-checkbox slot="selected" slot-scope="props" :value="props.row[tableOptions.idColumn]" v-model="selectedItems" v-if="columns.map(c => c.name).indexOf('selected') !== -1 && getIds"/>

      <div slot="h__marked">
        <b-dropdown size="sm" dropleft variant="outline-primary" boundary="window">
          <template slot="button-content">
            <i class="mdi mdi-18px mdi-check-box-multiple-outline" />
          </template>
          <b-dropdown-item @click="markAllItems(true)"><i class="mdi mdi-18px mdi-checkbox-multiple-marked" />Mark all</b-dropdown-item>
          <b-dropdown-item @click="markAllItems(false)"><i class="mdi mdi-18px mdi-checkbox-multiple-blank-outline" />Unmark all</b-dropdown-item>
          <b-dropdown-item v-if="token"><i class="mdi mdi-18px mdi-group" />Create group</b-dropdown-item>
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

      <div slot="afterTable" v-if="columns.map(c => c.name).indexOf('selected') !== -1 || downloadTable !== null">

        <template v-if="downloadTable !== null">
          <b-button @click="onDownloadTableClicked"><i class="mdi mdi-18px fix-alignment mdi-download" /></b-button>
        </template>

        <template v-if="columns.map(c => c.name).indexOf('selected') !== -1">
          <b-button-group v-if="tableActions">
            <b-button v-for="action in tableActions"
                      :key="`base-table-action-${action.id}`"
                      :variant="action.variant"
                      :disabled="action.disabled()"
                      @click="action.callback(selectedItems)"
                      v-b-tooltip.hover
                      :title="action.text">
              <i :class="action.icon" v-if="action.icon" :title="action.text" />
              <span v-else>{{ action.text }}</span>
            </b-button>
          </b-button-group>
          <div>
            <i class="mdi mdi-18px mdi-arrow-up-bold"/><span>{{ $t('widgetTableMultiSelectInfo') }}</span>
          </div>
        </template>
      </div>
    </v-server-table>

    <vue-context ref="menu" v-if="tableOptions.additionalMarkingOptions">
      <template slot-scope="child">
        <li v-for="item in tableOptions.additionalMarkingOptions" :key="item.key">
          <a href="#" @click="item.callback(child.data)"><i :class="`mdi mdi-18px ${item.icon}`" /> {{ item.text() }}</a>
        </li>
      </template>
    </vue-context>
  </div>
</template>

<script>
import TableFilter from '@/components/tables/TableFilter'
import MarkedItems from '@/components/tables/MarkedItems'
import { VueContext } from 'vue-context'
import { EventBus } from '@/plugins/event-bus.js'

export default {
  props: {
    columns: {
      type: Array,
      default: function () {
        return []
      }
    },
    filterOn: {
      type: Array,
      default: null
    },
    options: {
      type: Object,
      default: function () {
        return {}
      }
    },
    itemType: {
      type: String,
      default: null
    },
    downloadTable: {
      type: Function,
      default: null
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
      return this.selectedItems.length === this.prevCount
    }
  },
  watch: {
    locale (newValue, oldValue) {
      this.tableOptions.texts = this.getPaginationTexts()
    },
    token: function (newValue, oldValue) {
      this.refresh()
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
                count: 0
              }
            })
          })
        } else {
          // Request the data as normal otherwise
          var vm = this
          data.prevCount = this.prevCount
          data.filter = this.filter
          this.currentRequestData = data
          return this.tableOptions.requestData(data, function (result) {
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
      perPage: 10,
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
      // allSelected: false,
      perPageValues: [10, 25, 50, 100],
      prevCount: -1,
      currentRequestData: null,
      filter: null,
      tableOptions: tableOptions
    }
  },
  components: {
    TableFilter,
    MarkedItems,
    VueContext
  },
  methods: {
    onDownloadTableClicked: function () {
      if (this.downloadTable !== null) {
        this.downloadTable(this.currentRequestData, result => {
          this.downloadBlob({
            blob: result,
            filename: 'germplasm-table',
            extension: 'txt'
          })
        })
      }
    },
    contextMenu: function (event, row) {
      if (this.tableOptions.additionalMarkingOptions) {
        this.$refs.menu.open(event, row)
      }
    },
    onContextClicked: function (row) {
      console.log(row)
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
      if (value) {
        EventBus.$emit('show-loading', true)
        this.getIds(this.currentRequestData, result => {
          this.selectedItems = result.data
          EventBus.$emit('show-loading', false)
        })
      } else {
        this.selectedItems = []
      }
    },
    getCurrentRequestData: function () {
      return this.currentRequestData
    },
    markAllItems: function (mark) {
      EventBus.$emit('show-loading', true)
      this.getIds(this.currentRequestData, result => {
        if (mark) {
          this.$store.dispatch('ON_MARKED_IDS_ADD', { type: this.itemType, ids: result.data })
        } else {
          this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: this.itemType, ids: result.data })
        }
        EventBus.$emit('show-loading', false)
      })
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
      this.filter = filter
      this.prevCount = -1
      this.$refs.table.refresh()
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
    if (this.tableOptions.perPage !== this.tablePerPage) {
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
</style>
