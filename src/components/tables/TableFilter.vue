<template>
  <div>
    <b-button-group class="table-filter">
      <b-dropdown left v-if="columns && columns.length > 0">
        <template slot="button-content"><i class="mdi mdi-18px mdi-view-column"/></template>
        <b-dropdown-form>
          <b-form-checkbox v-for="column in getColumns" :key="'table-filter-' + column" @change="toggleColumn($event, column)" class="my-2" :checked="getValue(column)">{{ getText(column) }}</b-form-checkbox>
        </b-dropdown-form>
      </b-dropdown>
      <b-button :variant="filter ? 'success' : ''" v-b-modal="'table-filter-modal-' + tableName" class="mdi mdi-18px mdi-filter" />
      <b-button v-if="filter" variant="danger" class="mdi mdi-18px mdi-delete" @click="clearFilter"/>
    </b-button-group>

    <b-modal :id="'table-filter-modal-' + tableName" ref="tableFilterModal" :title="$t('modalTitleTableFilter')" size="lg" @ok="setFilter(false)" @show="init">
      <b-form v-on:submit.prevent="setFilter(true)">
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
              <b-dropdown :text="comparators[f.comparator].text" class="overflow-dropdown">
                <b-dropdown-item v-for="(value, name) in comparators"
                                :key="'filter-comparator-' + name"
                                @click="f.comparator = name">
                  {{ value.text }}
                </b-dropdown-item>
              </b-dropdown>
            </b-input-group-prepend>
            <b-form-input v-model="f.values[0]" />
            <b-form-input v-model="f.values[1]" v-if="comparators[f.comparator].values === 2" />
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
      </b-form>
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
    tableName: {
      type: String,
      default: null
    },
    filterOn: {
      type: Array,
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
        equals: {
          text: this.$t('comparatorsEqual'),
          values: 1
        },
        like: {
          text: this.$t('comparatorsLike'),
          values: 1
        },
        between: {
          text: this.$t('comparatorsBetween'),
          values: 2
        }
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
      return this.columns.filter(c => {
        return this.texts[c] ? (this.texts[c]() !== '') : false
      })
    }
  },
  methods: {
    setFilter: function (hideModal) {
      this.filter = this.tempFilter.filter(f => {
        return f.values.length > 0 && f.values[0]
      })
      this.$emit('on-filter-changed', this.filter)

      if (hideModal) {
        this.$refs.tableFilterModal.hide()
      }
    },
    addFilter: function () {
      var validColumns = this.columns.filter(c => {
        return this.texts[c] ? (this.texts[c]() !== '') : false
      })
      this.tempFilter.push({
        column: validColumns[0],
        comparator: 'equals',
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
      return this.hiddenColumns[this.tableName].indexOf(column) === -1
    },
    toggleColumn: function (value, column) {
      if (value) {
        this.$store.dispatch('ON_HIDDEN_COLUMNS_REMOVE', { type: this.tableName, columns: [column] })
      } else {
        this.$store.dispatch('ON_HIDDEN_COLUMNS_ADD', { type: this.tableName, columns: [column] })
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
  },
  mounted: function () {
    if (this.filterOn) {
      this.filterOn.forEach(f => {
        this.tempFilter.push(f)
      })
      this.setFilter(false)
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
