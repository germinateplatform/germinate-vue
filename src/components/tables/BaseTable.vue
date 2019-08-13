<template>
  <v-server-table :url="''" :columns="columns" :options="tableOptions" ref="table" class="table-overflow-fix">
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

    <div slot="h__selected">
      <b-form-checkbox @change="onSelectionHeaderClicked"/>
    </div>

    <b-form-checkbox slot="selected" slot-scope="props" :checked="getValue(props.row)" @change="markItem(props.row[tableOptions.idColumn], $event)" v-if="itemType"/>
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
      'tablePerPage'
    ])
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
      filterByColumn: true,
      perPage: 10,
      perPageValues: [],
      pagination: {
        chunk: 5
      }
    }

    return {
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
      console.log(value)
    },
    getValue: function (row) {
      if (this.itemType) {
        return this.markedIds[this.itemType].indexOf(row[this.tableOptions.idColumn]) !== -1
      } else {
        return false
      }
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
