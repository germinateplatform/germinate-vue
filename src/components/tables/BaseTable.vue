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
                    itemType="germplasm"
                    ref="tableFilter"
                    v-on:on-filter-changed="onFilterChanged"
                    v-on:on-column-toggle="onToggleColumn" />
      </b-col>
      <b-col cols=6>
        <MarkedItems class="float-right" itemType="germplasm" v-on:items-cleared="onItemsCleared"/>
      </b-col>
    </b-row>

    <div slot="h__selected">
      <b-form-checkbox @change="onSelectionHeaderClicked"/>
    </div>

    <b-form-checkbox slot="selected" slot-scope="props" :checked="getValue(props.row)" @change="markItem(props.row[this.tableOptions.idColumn], $event)"/>
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
        return data
      },
      skin: 'table table-striped table-hover',
      filterByColumn: true,
      perPage: 10,
      pagination: {
        chunk: 5
      }
    }

    return {
      prevCount: -1,
      filter: null,
      tableOptions: Object.assign({}, defaults, this.options)
    }
  },
  computed: {
    ...mapState([
      'markedIds',
      'hiddenColumns'
    ])
  },
  components: {
    TableFilter,
    MarkedItems
  },
  methods: {
    onSelectionHeaderClicked: function (value) {
      console.log(value)
    },
    onItemsCleared: function () {
      this.$nextTick(() => this.$refs.table.refresh())
    },
    getValue: function (row) {
      return this.markedIds.germplasm.indexOf(row[this.tableOptions.idColumn]) !== -1
    },
    isHidden: function (column) {
      return this.$store.getters.hiddenColumns[this.itemType].indexOf(column) !== -1 ? 'd-none' : ''
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
  mounted: function () {
    this.columns.forEach(c => {
      if (this.hiddenColumns[this.itemType].indexOf(c) !== -1) {
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
</style>
