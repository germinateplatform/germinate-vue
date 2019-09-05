<template>
  <div>
    <b-button-group class="table-filter">
      <b-dropdown left v-if="columns && columns.length > 0">
        <template slot="button-content"><i class="mdi mdi-18px mdi-view-column"/></template>
        <b-dropdown-form>
          <b-form-checkbox v-for="column in getColumns" :key="'table-filter-' + column.name" @change="toggleColumn($event, column)" class="my-2" :checked="getValue(column)">{{ getText(column) }}</b-form-checkbox>
        </b-dropdown-form>
      </b-dropdown>
      <b-button :variant="filter ? 'success' : ''" v-b-modal="'table-filter-modal-' + id" class="mdi mdi-18px mdi-filter" />
      <b-button v-if="filter" variant="danger" class="mdi mdi-18px mdi-delete" @click="clearFilter"/>
    </b-button-group>

    <b-modal :id="'table-filter-modal-' + id" ref="tableFilterModal" :title="$t('modalTitleTableFilter')" size="lg" @ok="setFilter(false)" @show="init">
      <b-form v-on:submit.prevent="setFilter(true)">
        <div v-for="(f, index) in tempFilter" :key="'filter-' + f.column.name + '-' + index">
          <b-form-group :disabled="f.canBeChanged === false">
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <!-- Column selector -->
                <b-dropdown :text="texts[f.column.name]()" class="overflow-dropdown">
                  <b-dropdown-item v-for="column in getColumns"
                                  :key="'filter-column-' + column.name"
                                  @click="switchColumn(f, column)">
                    {{ texts[column.name]() }}
                  </b-dropdown-item>
                </b-dropdown>
                <!-- comparator selector -->
                <b-dropdown :text="comparators[f.comparator].text" class="overflow-dropdown">
                  <b-dropdown-item v-for="(value, name) in comparators"
                                  :disabled="isDisabled(f.column.type, name)"
                                  :key="'filter-comparator-' + name"
                                  @click="switchComparator(f, name)">
                    {{ value.text }}
                  </b-dropdown-item>
                </b-dropdown>
              </b-input-group-prepend>
              <template v-if="isType(f, String)">
                <b-form-input v-model="f.values[0]" @focus.native="$event.target.select()"/>
                <b-form-input v-model="f.values[1]" @focus.native="$event.target.select()" v-if="comparators[f.comparator].values === 2" />
              </template>
              <template v-else-if="isType(f, Number)">
                <b-form-input v-model="f.values[0]" type="number" @focus.native="$event.target.select()"/>
                <b-form-input v-model="f.values[1]" type="number" @focus.native="$event.target.select()" v-if="comparators[f.comparator].values === 2" />
              </template>
              <template v-else-if="isType(f, Date)">
                <b-form-input v-model="f.values[0]" type="date" @focus.native="$event.target.select()"/>
                <b-form-input v-model="f.values[1]" type="date" @focus.native="$event.target.select()" v-if="comparators[f.comparator].values === 2" />
              </template>
              <template v-else-if="isType(f, Boolean)">
                <b-form-select :options="[{value: 0, text: 'False'}, {value: 1, text: 'True'}]" v-model="f.values[0]" />
              </template>
              <template v-else-if="isType(f, 'locationType')">
                <b-form-select :options="getLocationTypeOptions()" v-model="f.values[0]" />
              </template>
              <template v-else-if="isType(f, 'entityType')">
                <b-form-select :options="getEntityTypeOptions()" v-model="f.values[0]" />
              </template>
              <b-input-group-append>
                <b-button variant="danger" class="mdi mdi-18px mdi-delete" :disabled="index === 0" @click="tempFilter.splice(index, 1)"/>
              </b-input-group-append>
            </b-input-group>
            <b-form-radio-group
              :options="operators"
              button-variant="outline-secondary"
              v-model="f.operator"
              buttons
              v-if="index !== tempFilter.length - 1"
            ></b-form-radio-group>
          </b-form-group>
        </div>
        <b-button class="mdi mdi-18px mdi-plus" @click="addFilter"><span> {{ $t('genericAdd') }}</span></b-button>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
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
      id: this.uuidv4(),
      validComparatorsForType: {
        Boolean: ['equals'],
        locationType: ['equals'],
        entityType: ['equals']
      },
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
        },
        greaterThan: {
          text: this.$t('comparatorsGreaterThan'),
          values: 1
        },
        greaterOrEquals: {
          text: this.$t('comparatorsGreaterThanOrEquals'),
          values: 1
        },
        lessThan: {
          text: this.$t('comparatorsLessThan'),
          values: 1
        },
        lessOrEquals: {
          text: this.$t('comparatorsLessThanOrEquals'),
          values: 1
        },
        inSet: {
          text: this.$t('comparatorsInSet'),
          values: 1
        }
      },
      filter: null,
      tempFilter: [],
      operators: operators
    }
  },
  computed: {
    // Only get the columns that have a text that isn't empty
    getColumns: function () {
      return this.columns.filter(c => {
        return this.texts[c.name] ? (this.texts[c.name]() !== '') : false
      })
    }
  },
  methods: {
    getLocationTypeOptions: function () {
      return Object.keys(this.locationTypes).map(l => {
        return {
          value: l,
          text: this.locationTypes[l].text()
        }
      })
    },
    getEntityTypeOptions: function () {
      return Object.keys(this.entityTypes).map(e => {
        return {
          value: e,
          text: this.entityTypes[e].text()
        }
      })
    },
    isDisabled: function (type, comparator) {
      var name = (type instanceof Function) ? type.name : type
      if (this.validComparatorsForType[name]) {
        return this.validComparatorsForType[name].indexOf(comparator) === -1
      } else {
        return false
      }
    },
    switchColumn: function (f, column) {
      f.column = column
      if (this.isType(f, Boolean)) {
        f.values = [0, 0]
      } else {
        f.values = [null, null]
      }
    },
    switchComparator: function (f, name) {
      f.comparator = name
      f.values = [null, null]
    },
    isType: function (filter, type) {
      return filter.column.type === type
    },
    setFilter: function (hideModal) {
      this.filter = this.tempFilter.filter(f => {
        return f.values.length > 0 && f.values[0] !== undefined
      })
      var targetFilter = []

      this.filter.forEach(f => {
        targetFilter.push({
          column: f.column.name,
          operator: f.operator,
          comparator: f.comparator,
          values: f.values
        })
      })

      this.$emit('on-filter-changed', targetFilter)

      if (hideModal) {
        this.$refs.tableFilterModal.hide()
      }
    },
    addFilter: function () {
      var validColumns = this.columns.filter(c => {
        return this.texts[c.name] ? (this.texts[c.name]() !== '') : false
      })
      this.tempFilter.push({
        column: validColumns[0],
        comparator: 'equals',
        values: ['', ''],
        operator: this.operators[0].value
      })
    },
    getText: function (column) {
      if (this.texts && this.texts[column.name]) {
        return this.texts[column.name]()
      } else {
        return column
      }
    },
    getValue: function (column) {
      return this.hiddenColumns[this.tableName].indexOf(column.name) === -1
    },
    toggleColumn: function (value, column) {
      if (value) {
        this.$store.dispatch('ON_HIDDEN_COLUMNS_REMOVE', { type: this.tableName, columns: [column.name] })
      } else {
        this.$store.dispatch('ON_HIDDEN_COLUMNS_ADD', { type: this.tableName, columns: [column.name] })
      }
      this.$emit('on-column-toggle', column.name)
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

.input-group input,
.input-group select {
  height: auto;
}
</style>
