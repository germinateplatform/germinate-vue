<template>
  <div>
    <b-button-group class="table-filter">
      <b-dropdown left text="Menu" v-if="columns && columns.length > 0">
        <template slot="button-content"><i class="mdi mdi-18px mdi-view-column"/></template>
        <b-dropdown-form>
          <b-form-checkbox v-for="column in getColumns" :key="'table-filter-' + column" @change="toggleColumn($event, column)" class="my-2" :checked="getValue(column)">{{ getText(column) }}</b-form-checkbox>
        </b-dropdown-form>
      </b-dropdown>
      <b-button :variant="filter ? 'success' : ''" v-b-modal.table-filter-modal class="mdi mdi-18px mdi-filter" />
      <b-button v-if="filter" variant="danger" class="mdi mdi-18px mdi-delete" @click="clearFilter"/>
    </b-button-group>

    <b-modal id="table-filter-modal" :title="$t('modalTitleTableFilter')" size="lg" @ok="setFilter" @show="init">
      <div v-for="(f, index) in tempFilter" :key="'filter-' + f.column + '-' + index">
        <b-input-group class="mb-3">
          <b-input-group-prepend>
            <!-- Column selector -->
            <b-dropdown :text="texts[f.column]()" class="overflow-dropdown">
              <b-dropdown-item v-for="column in getColumns"
                              :key="'filter-column-' + column"
                              @click="f.column = column">
                {{ texts[column]() }}
              </b-dropdown-item>
            </b-dropdown>
            <!-- comparator selector -->
            <b-dropdown :text="comparators[f.comparator]" class="overflow-dropdown">
              <b-dropdown-item v-for="(value, name) in comparators"
                              :key="'filter-comparator-' + name"
                              @click="f.comparator = name">
                {{ value }}
              </b-dropdown-item>
            </b-dropdown>
          </b-input-group-prepend>
          <b-form-input v-model="f.values[0]" />
          <b-form-input v-model="f.values[1]" />
          <b-input-group-append>
            <b-button variant="danger" class="mdi mdi-18px mdi-delete" :disabled="index === 0" @click="tempFilter.splice(index, 1)"/>
          </b-input-group-append>
        </b-input-group>
        <b-form-radio-group
          class="mb-3"
          :options="operators"
          button-variant="outline-secondary"
          v-model="f.operator"
          buttons
          v-if="index !== tempFilter.length - 1"
        ></b-form-radio-group>
      </div>
      <b-button class="mdi mdi-18px mdi-plus" @click="addFilter"><span> {{ $t('genericAdd') }}</span></b-button>
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
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
  data: function () {
    var operators = [
      { text: this.$t('operatorsAnd'), value: 'and' },
      { text: this.$t('operatorsOr'), value: 'or' }
    ]
    return {
      comparators: {
        equal: this.$t('comparatorsEqual'),
        like: this.$t('comparatorsLike')
      },
      filter: null,
      tempFilter: [],
      operators: operators
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
    setFilter: function () {
      this.filter = this.tempFilter.filter(f => {
        return f.values.length > 0 && f.values[0]
      })
      this.$emit('on-filter-changed', this.filter)
    },
    addFilter: function () {
      this.tempFilter.push({
        column: this.columns[0],
        comparator: 'equal',
        values: ['', ''],
        operator: this.operators[0].value
      })
    },
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
    },
    clearFilter: function () {
      this.filter = null
      this.tempFilter = []
      this.$emit('on-filter-changed', this.filter)
    },
    init: function () {
      if (this.tempFilter.length < 1) {
        this.addFilter()
      }
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

.overflow-dropdown .dropdown-menu {
    max-height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
}

.input-group input {
  height: auto;
}
</style>
