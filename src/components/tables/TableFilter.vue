<template>
  <div>
    <b-button-group class="table-filter">
      <b-dropdown left text="Menu" v-if="columns && columns.length > 0">
        <b-dropdown-form>
          <b-form-checkbox v-for="column in getColumns" :key="'table-filter-' + column" @change="toggleColumn($event, column)" class="my-2" :checked="getValue(column)">{{ getText(column) }}</b-form-checkbox>
        </b-dropdown-form>
      </b-dropdown>
      <b-button :variant="filter ? 'success' : ''" v-b-modal.table-filter-modal>Filter</b-button>
      <b-button v-if="filter" variant="danger">Clear filter</b-button>
    </b-button-group>

    <b-modal id="table-filter-modal" title="BootstrapVue">
      <p class="my-4">Hello from modal!</p>
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data: function () {
    return {
      filter: null
    }
  },
  props: {
    columns: {
      type: Array,
      default: function () {
        return []
      }
    },
    texts: {
      type: Object,
      default: null
    },
    itemType: {
      type: String,
      default: null
    }
  },
  computed: {
    ...mapState([
      'hiddenColumns'
    ]),
    // Only get the columns that have a text that isn't empty
    getColumns: function () {
      var vm = this
      return this.columns.filter(function (c) {
        return vm.texts[c] ? (vm.texts[c]() !== '') : false
      })
    }
  },
  methods: {
    getText: function (column) {
      if (this.texts && this.texts[column]) {
        return this.texts[column]()
      } else {
        return column
      }
    },
    getValue: function (column) {
      return this.hiddenColumns[this.itemType].indexOf(column) === -1
    },
    toggleColumn: function (value, column) {
      if (value) {
        this.$store.dispatch('ON_HIDDEN_COLUMNS_REMOVE', { type: this.itemType, columns: [column] })
      } else {
        this.$store.dispatch('ON_HIDDEN_COLUMNS_ADD', { type: this.itemType, columns: [column] })
      }
      this.$emit('on-column-toggle', column)
    }
  }
}
</script>

<style>
.table-filter .btn {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-bottom: 0;
}
</style>
