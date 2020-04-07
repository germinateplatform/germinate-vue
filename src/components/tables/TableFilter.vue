<template>
  <div :class="divClass">
    <div>
      <b-button-group class="table-filter">
        <!-- Help information -->
        <b-button @click="$emit('help-clicked')" class="mdi mdi-18px mdi-help-circle-outline" v-b-tooltip.hover :title="$t('tooltipTableHelp')" />
        <!-- Column visibility dropdown -->
        <b-dropdown left v-if="columns && columns.length > 0" class="overflow-dropdown" id="column-selector" v-b-tooltip.hover :title="$t('tooltipTableColumnSelector')">
          <template slot="button-content"><i class="mdi mdi-18px mdi-view-column"/></template>
          <b-dropdown-form>
            <b-form-checkbox v-for="column in getColumns" :key="'table-filter-' + column.key" @change="toggleColumn($event, column)" class="my-2" :checked="getValue(column)">{{ getText(column) }}</b-form-checkbox>
          </b-dropdown-form>
        </b-dropdown>
        <!-- Toggle filter -->
        <b-button :variant="(filter && filter.length > 0) ? 'success' : ''" v-b-modal="'table-filter-modal-' + id" class="mdi mdi-18px mdi-filter" id="filter-toggle" v-b-tooltip.hover :title="$t('tooltipTableFilter')" />
        <!-- Clear filter -->
        <b-button v-if="filter && filter.length > 0" variant="danger" class="mdi mdi-18px mdi-delete" @click="clearFilter" v-b-tooltip.hover :title="$t('tooltipTableClearFilter')"/>
      </b-button-group>

      <!-- Filter modal -->
      <b-modal :id="'table-filter-modal-' + id" ref="tableFilterModal" :title="$t('modalTitleTableFilter')" size="lg" @ok="setFilter(false, true)" @show="init">
        <b-form v-on:submit.prevent="setFilter(true, true)">
          <!-- Each row -->
          <div v-for="(f, index) in tempFilter" :key="'filter-' + f.column.name + '-' + index">
            <b-form-group :disabled="f.canBeChanged === false">
              <b-input-group class="mb-3">
                <b-input-group-prepend>
                  <!-- Column selector -->
                  <b-dropdown :text="getText(f.column)" class="overflow-dropdown">
                    <b-dropdown-item v-for="column in getColumns"
                                    :key="'filter-column-' + column.key"
                                    @click="switchColumn(f, column)">
                      {{ getText(column) }}
                    </b-dropdown-item>
                  </b-dropdown>
                  <!-- Comparator selector -->
                  <b-dropdown :text="comparators[f.comparator].text()" class="overflow-dropdown">
                    <b-dropdown-item v-for="(value, name) in comparators"
                                    :disabled="isDisabled(f.column.type, name)"
                                    :key="'filter-comparator-' + name"
                                    @click="switchComparator(f, name)">
                      {{ value.text() }}
                    </b-dropdown-item>
                  </b-dropdown>
                </b-input-group-prepend>

                <!-- JSON columns -->
                <template v-if="isType(f, String) || isType(f, 'json')">
                  <b-form-input v-model="f.values[0]" @focus.native="$event.target.select()"/>
                  <b-form-input v-model="f.values[1]" @focus.native="$event.target.select()" v-if="comparators[f.comparator].values === 2" />
                </template>
                <!-- Number columns -->
                <template v-else-if="isType(f, Number)">
                  <b-form-input v-model="f.values[0]" type="number" @focus.native="$event.target.select()"/>
                  <b-form-input v-model="f.values[1]" type="number" @focus.native="$event.target.select()" v-if="comparators[f.comparator].values === 2" />
                </template>
                <!-- Date columns -->
                <template v-else-if="isType(f, Date)">
                  <b-form-input v-model="f.values[0]" type="date" @focus.native="$event.target.select()"/>
                  <b-form-input v-model="f.values[1]" type="date" @focus.native="$event.target.select()" v-if="comparators[f.comparator].values === 2" />
                </template>
                <!-- Boolean columns -->
                <template v-else-if="isType(f, Boolean)">
                  <b-form-select :options="[{value: 0, text: $t('genericFalse')}, {value: 1, text: $t('genericTrue')}]" v-model="f.values[0]" />
                </template>
                <!-- Location type columns -->
                <template v-else-if="isType(f, 'locationType')">
                  <b-form-select :options="getLocationTypeOptions()" v-model="f.values[0]" />
                </template>
                <!-- Entity type columns -->
                <template v-else-if="isType(f, 'entityType')">
                  <b-form-select :options="getEntityTypeOptions()" v-model="f.values[0]" />
                </template>
                <!-- Data type columns -->
                <template v-else-if="isType(f, 'dataType')">
                  <b-form-select :options="getDataTypeOptions()" v-model="f.values[0]" />
                </template>
                <!-- Group type columns -->
                <template v-else-if="isType(f, 'groupType')">
                  <b-form-select :options="getGroupTypeOptions()" v-model="f.values[0]" />
                </template>

                <!-- Delete button -->
                <b-input-group-append>
                  <b-button variant="danger" class="mdi mdi-18px mdi-delete" :disabled="index === 0" @click="tempFilter.splice(index, 1)"/>
                </b-input-group-append>
              </b-input-group>
              <!-- AND / OR operator -->
              <b-form-radio-group
                :options="localOperators"
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
    tableName: {
      type: String,
      default: null
    },
    filterOn: {
      type: Array,
      default: null
    },
    divClass: {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {
      id: this.uuidv4(),
      validComparatorsForType: {
        Boolean: ['equals'],
        dataType: ['equals'],
        locationType: ['equals'],
        entityType: ['equals'],
        json: ['contains']
      },
      filter: null,
      tempFilter: [],
      targetFilter: [],
      hasBeenCleared: false
    }
  },
  watch: {
    filterOn: function (newValue, oldValue) {
      this.resetFilter(false)
    },
    locale: function (newValue, oldValue) {
      this.updateOperators()
    }
  },
  computed: {
    // Only get the columns that have a text that isn't empty
    getColumns: function () {
      return this.columns.filter(c => {
        var show = c.label ? (c.label !== '') : false
        show = show && c.type !== undefined
        show = show && !this.tempFilter.filter(f => f.column.name === c.name && f.canBeChanged === false).length > 0
        return show
      })
    }
  },
  methods: {
    updateOperators: function () {
      this.localOperators = Object.keys(this.operators).map(o => {
        return {
          text: this.operators[o].text(),
          value: this.operators[o].value
        }
      })
    },
    isValidFilter: function (filter) {
      if (filter.column.type === Number) {
        // Check if it's a number
        return filter.values.filter(v => isNaN(v)).length === 0
      } else if (filter.column.type === Date) {
        // Check if it's a date
        return filter.values.filter(v => isNaN(new Date(v).getTime())).length === 0
      } else {
        return true
      }
    },
    getGroupTypeOptions: function () {
      return Object.keys(this.groupTypes).map(l => {
        return {
          value: l,
          text: this.groupTypes[l].text()
        }
      })
    },
    getDataTypeOptions: function () {
      return Object.keys(this.dataTypes).map(l => {
        return {
          value: l,
          text: this.dataTypes[l].text()
        }
      })
    },
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
        var stats = this.entityTypeStats.filter(es => es.entityTypeName === e)
        var enabled = stats && stats.length > 0 && stats[0].count > 0
        return {
          value: e,
          disabled: !enabled,
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

      // Check if the currently/previously selected comparator is also valid for the new data type
      if (this.validComparatorsForType[column.type]) {
        if (this.validComparatorsForType[column.type].indexOf(f.comparator) === -1) {
          f.comparator = this.validComparatorsForType[column.type][0]
        }
      }
    },
    switchComparator: function (f, name) {
      f.comparator = name
      f.values = [null, null]
    },
    isType: function (filter, type) {
      return filter.column.type === type
    },
    setFilter: function (hideModal, trigger) {
      this.filter = this.tempFilter.filter(f => {
        return f.values.length > 0 && f.values[0] !== undefined
      })
      this.targetFilter = []

      this.filter.forEach(f => {
        var newFilter = {
          column: f.column.key || f.column.name,
          operator: f.operator,
          comparator: f.comparator,
          values: f.values
        }

        if (f.column.type === 'datatype') {
          newFilter.values = newFilter.values.filter(v => v !== null).map(v => {
            if (this.dataTypes[v].databaseValue) {
              return this.dataTypes[v].databaseValue
            } else {
              return v
            }
          })
        }

        if (this.isValidFilter(f)) {
          this.targetFilter.push(newFilter)
        }
      })

      this.$emit('filter-changed', {
        filter: this.targetFilter,
        triggerUpdate: trigger
      })

      if (hideModal) {
        this.$refs.tableFilterModal.hide()
      }
    },
    addFilter: function () {
      var validColumns = this.getColumns
      this.tempFilter.push({
        column: validColumns[0],
        comparator: 'equals',
        values: ['', ''],
        operator: this.operators.and.value
      })
    },
    getText: function (column) {
      if (column.label) {
        return column.label
      } else if (column.name) {
        const matches = this.columns.filter(c => c.key === column.name)
        if (matches && matches.length > 0) {
          return matches[0].label
        } else {
          return column.name
        }
      } else {
        return column.key
      }
    },
    getValue: function (column) {
      return this.hiddenColumns[this.tableName].indexOf(column.key) === -1
    },
    toggleColumn: function (value, column) {
      if (value) {
        this.$store.dispatch('ON_HIDDEN_COLUMNS_REMOVE', { type: this.tableName, columns: [column.key] })
      } else {
        this.$store.dispatch('ON_HIDDEN_COLUMNS_ADD', { type: this.tableName, columns: [column.key] })
      }
      this.$emit('on-column-toggle', column.key)
    },
    clearFilter: function () {
      this.hasBeenCleared = true
      this.filter = this.filter.filter(f => {
        if (f.canBeChanged !== undefined) {
          return !f.canBeChanged
        } else {
          return false
        }
      })
      this.tempFilter = this.tempFilter.filter(f => {
        if (f.canBeChanged !== undefined) {
          return !f.canBeChanged
        } else {
          return false
        }
      })

      this.targetFilter = []

      this.filter.forEach(f => {
        this.targetFilter.push({
          column: f.column.name,
          operator: f.operator,
          comparator: f.comparator,
          values: f.values
        })
      })
      this.$emit('filter-changed', {
        filter: this.targetFilter,
        triggerUpdate: true
      })
    },
    init: function () {
      if (this.tempFilter.length < 1) {
        this.addFilter()
      }
    },
    resetFilter: function (trigger) {
      this.$nextTick(() => {
        this.tempFilter = []
        if (this.filterOn) {
          this.filterOn.forEach(f => {
            this.tempFilter.push(f)
          })
        }

        this.setFilter(false, trigger)
      })
    }
  },
  mounted: function () {
    this.updateOperators()

    if (this.filterOn) {
      this.resetFilter(true)
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
    max-height: 50vh;
    overflow-y: auto;
    overflow-x: hidden;
}
</style>
