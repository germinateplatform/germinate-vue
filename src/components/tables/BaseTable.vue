<template>
  <v-server-table :url="''" :columns="columns" :options="tableOptions" @loaded="updateSelectionHeader()" ref="table" class="table-overflow-fix">
    <!-- Pass on all named slots -->
    <slot v-for="slot in Object.keys($slots)" :name="slot" :slot="slot"/>
    <!-- Pass on all scoped slots -->
    <template v-for="slot in Object.keys($scopedSlots)" :slot="slot" slot-scope="scope"><slot :name="slot" v-bind="scope"/></template>

    <b-row slot="beforeTable">
      <b-col cols=6>
        <TableFilter :columns="columns"
                    :texts="tableOptions.headings"
                    :tableName="tableOptions.tableName"
                    :filterOn="tableOptions.filterOn"
                    ref="tableFilter"
                    v-on:on-filter-changed="onFilterChanged"
                    v-on:on-column-toggle="onToggleColumn" />
      </b-col>
      <b-col cols=6>
        <b-button-group class="float-right per-page-dropdown">
          <b-dropdown>
            <template slot="button-content"><i class="mdi mdi-18px mdi-book-open-page-variant"/><span> {{ tablePerPage }}</span></template>
            <b-dropdown-item v-for="value in perPageValues" @click="onPerPageChanged(value)" :key="'table-per-page-' + value">{{ value }}</b-dropdown-item>
          </b-dropdown>
          <MarkedItems class="float-right" :itemType="itemType" />
        </b-button-group>
      </b-col>
    </b-row>

    <!-- <div slot="h__selected">
      <b-form-checkbox :checked="allMarked" @change="onSelectionHeaderClicked"/>
    </div>
    <b-form-checkbox slot="selected" slot-scope="props" :checked="isSelected(props.row)" @change="onItemSelected(props.row, $event)"/> -->

    <div slot="h__selected">
      <b-form-checkbox :checked="allSelected" @change="onSelectionHeaderClicked"/>
    </div>
    <b-form-checkbox slot="selected" slot-scope="props" :value="props.row[tableOptions.idColumn]" v-model="selectedItems" />

    <div slot="h__marked">
      <b-form-checkbox @change="onMarkingHeaderClicked"/>
    </div>
    <b-form-checkbox slot="marked" slot-scope="props" :checked="isMarked(props.row)" @change="markItem(props.row[tableOptions.idColumn], $event)" v-if="itemType"/>

    <div slot="afterTable" v-if="columns.indexOf('selected') !== -1">
      <i class="mdi mdi-18px mdi-arrow-up-bold"/><span>{{ $t('widgetTableMultiSelectInfo') }}</span>
    </div>
  </v-server-table>
</template>

<script>
import { mapState } from 'vuex'
import TableFilter from '@/components/tables/TableFilter'
import MarkedItems from '@/components/tables/MarkedItems'

export default {
  props: {
    columns: {
      type: Array,
      default: function () {
        return []
      }
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
    }
  },
  computed: {
    ...mapState([
      'markedIds',
      'hiddenColumns',
      'tablePerPage',
      'locale'
    ])
  },
  watch: {
    locale (newValue, oldValue) {
      this.tableOptions.texts = this.getPaginationTexts()
    },
    selectedItems: function (newValue, oldValue) {
      this.updateSelectionHeader()
    }
  },
  data: function () {
    var defaults = {
      requestFunction: data => {
        var vm = this
        data.prevCount = this.prevCount
        data.filter = this.filter
        return this.tableOptions.requestData(data, function (result) {
          vm.prevCount = result.count
        })
      },
      responseAdapter: function (data) {
        return data.data
      },
      skin: 'table table-striped table-hover',
      texts: this.getPaginationTexts(),
      filterByColumn: true,
      perPage: 10,
      perPageValues: [],
      pagination: {
        chunk: 5
      }
    }

    return {
      selectedItems: [],
      allSelected: false,
      perPageValues: [10, 25, 50, 100],
      prevCount: -1,
      filter: null,
      tableOptions: Object.assign({}, defaults, this.options)
    }
  },
  components: {
    TableFilter,
    MarkedItems
  },
  methods: {
    onPerPageChanged: function (value) {
      this.$store.dispatch('ON_TABLE_PER_PAGE_CHANGED', value)
      this.$refs.table.setLimit(value)
    },
    onSelectionHeaderClicked: function (value) {
      if (value) {
        // Add all ids of the current page that aren't there already
        this.$refs.table.data.forEach(r => {
          const id = r[this.tableOptions.idColumn]
          if (this.selectedItems.indexOf(id) === -1) {
            this.selectedItems.push(id)
          }
        })
      } else {
        // Remove all ids of the current page that are there
        var pageIds = this.$refs.table.data.map(r => r[this.tableOptions.idColumn])
        this.selectedItems = this.selectedItems.filter(id => pageIds.indexOf(id) === -1)
      }
    },
    onMarkingHeaderClicked: function (value) {
      console.log(value)
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
    updateSelectionHeader: function () {
      var pageIds = this.$refs.table.data.map(r => r[this.tableOptions.idColumn])
      var allSelected = true
      pageIds.forEach(i => {
        allSelected = allSelected && this.selectedItems.indexOf(i) !== -1
      })
      this.allSelected = allSelected
      // TODO: Also reset selected items on filtering.
    },
    isHidden: function (column) {
      return this.$store.getters.hiddenColumns[this.tableOptions.tableName].indexOf(column) !== -1 ? 'd-none' : ''
    },
    refresh: function () {
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

      this.updateSelectionHeader()
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
      if (this.hiddenColumns[this.tableOptions.tableName].indexOf(c) !== -1) {
        try {
          this.$refs.table.toggleColumn(c)
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
