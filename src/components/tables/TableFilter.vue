<template>
  <div :class="divClass">
    <div>
      <b-button-group class="table-filter">
        <!-- Help information -->
        <b-button @click="$emit('help-clicked')"
                  v-b-tooltip.hover
                  :title="$t('tooltipTableHelp')">
          <MdiIcon :path="mdiHelpCircleOutline" />
        </b-button>
        <!-- Column visibility dropdown -->
        <b-dropdown left
                    v-if="columns && columns.length > 0"
                    class="overflow-dropdown"
                    id="column-selector"
                    v-b-tooltip.hover
                    :title="$t('tooltipTableColumnSelector')">
          <template slot="button-content">
            <MdiIcon :path="mdiViewColumn" />
          </template>
          <b-dropdown-form>
            <b-form-checkbox v-for="column in getColumnsToToggle"
                             :key="'table-filter-' + column.key"
                             @change="toggleColumn($event, column)"
                             class="my-2"
                             :checked="getValue(column)">
              {{ getText(column) }}
            </b-form-checkbox>
          </b-dropdown-form>
        </b-dropdown>
        <!-- Toggle filter -->
        <b-button :variant="(filter && filter.length > 0) ? 'success' : ''"
                  v-b-modal="'table-filter-modal-' + id"
                  id="filter-toggle"
                  v-b-tooltip.hover
                  :title="$t('tooltipTableFilter')">
          <MdiIcon :path="mdiFilter" />
        </b-button>
        <!-- Clear filter -->
        <b-button v-if="filter && filter.length > 0"
                  variant="danger"
                  @click="clearFilter"
                  v-b-tooltip.hover
                  :title="$t('tooltipTableClearFilter')">
          <MdiIcon :path="mdiDelete" />
        </b-button>
      </b-button-group>

      <!-- Filter modal -->
      <b-modal :id="'table-filter-modal-' + id"
               ref="tableFilterModal"
               :title="$t('modalTitleTableFilter')"
               size="lg"
               @ok="setFilter(false, true)"
               @show="init">
        <p>{{ $t('modalTextTableFilter') }}</p>
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

                <template v-if="f.comparator === 'inSet'">
                  <b-form-input v-model="f.values[0]" @focus.native="$event.target.select()"/>
                </template>
                <template v-else>
                  <!-- JSON columns -->
                  <template v-if="isType(f, String) || isType(f, 'json') || isType(f, 'jsonObject')">
                    <b-form-input v-model="f.values[0]" @focus.native="$event.target.select()" v-if="comparators[f.comparator].values > 0"/>
                    <b-form-input disabled v-else />
                    <b-form-input v-model="f.values[1]" @focus.native="$event.target.select()" v-if="comparators[f.comparator].values === 2" />
                  </template>
                  <!-- Number columns -->
                  <template v-else-if="isType(f, Number)">
                    <b-form-input v-model="f.values[0]" type="number" @focus.native="$event.target.select()" v-if="comparators[f.comparator].values > 0"/>
                    <b-form-input disabled v-else />
                    <b-form-input v-model="f.values[1]" type="number" @focus.native="$event.target.select()" v-if="comparators[f.comparator].values === 2" />
                  </template>
                  <!-- Date columns -->
                  <template v-else-if="isType(f, Date)">
                    <b-form-input v-model="f.values[0]" type="date" @focus.native="$event.target.select()" v-if="comparators[f.comparator].values > 0"/>
                    <b-form-input disabled v-else />
                    <b-form-input v-model="f.values[1]" type="date" @focus.native="$event.target.select()" v-if="comparators[f.comparator].values === 2" />
                  </template>
                  <!-- Boolean columns -->
                  <template v-else-if="isType(f, Boolean)">
                    <b-form-select :options="[{value: 0, text: $t('genericFalse')}, {value: 1, text: $t('genericTrue')}]" v-model="f.values[0]" v-if="comparators[f.comparator].values > 0" />
                    <b-form-select disabled v-else />
                  </template>
                  <!-- Location type columns -->
                  <template v-else-if="isType(f, 'locationType')">
                    <b-form-select :options="getLocationTypeOptions()" v-model="f.values[0]" v-if="comparators[f.comparator].values > 0" />
                    <b-form-select disabled v-else />
                  </template>
                  <!-- Entity type columns -->
                  <template v-else-if="isType(f, 'entityType')">
                    <b-form-select :options="getEntityTypeOptions()" v-model="f.values[0]" v-if="comparators[f.comparator].values > 0" />
                    <b-form-select disabled v-else />
                  </template>
                  <!-- Data type columns -->
                  <template v-else-if="isType(f, 'dataType')">
                    <b-form-select :options="getDataTypeOptions()" v-model="f.values[0]" v-if="comparators[f.comparator].values > 0" />
                    <b-form-select disabled v-else />
                  </template>
                  <!-- Group type columns -->
                  <template v-else-if="isType(f, 'groupType')">
                    <b-form-select :options="getGroupTypeOptions()" v-model="f.values[0]" v-if="comparators[f.comparator].values > 0" />
                    <b-form-select disabled v-else />
                  </template>
                </template>

                <!-- Delete button -->
                <b-input-group-append>
                  <b-button variant="danger" :disabled="index === 0" @click="tempFilter.splice(index, 1)"><MdiIcon :path="mdiDelete" /></b-button>
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
          <b-button @click="addFilter"><MdiIcon :path="mdiPlus" /> <span> {{ $t('genericAdd') }}</span></b-button>
        </b-form>
      </b-modal>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { operators, comparators } from '@/mixins/search'
import { dataTypes, entityTypes, groupTypes, locationTypes } from '@/mixins/types'
import { uuidv4, objectArraysAreSame } from '@/mixins/util'

import MdiIcon from '@/components/icons/MdiIcon'

import { mdiHelpCircleOutline, mdiViewColumn, mdiDelete, mdiFilter, mdiPlus } from '@mdi/js'

export default {
  components: {
    MdiIcon
  },
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
    },
    storeUrlParameters: {
      type: Boolean,
      default: true
    }
  },
  data: function () {
    return {
      comparators,
      mdiHelpCircleOutline,
      mdiViewColumn,
      mdiDelete,
      mdiFilter,
      mdiPlus,
      id: uuidv4(),
      validComparatorsForType: {
        Boolean: ['equals', 'isNull', 'isNotNull'],
        dataType: ['equals', 'isNull', 'isNotNull'],
        locationType: ['equals', 'isNull', 'isNotNull'],
        entityType: ['equals', 'isNull', 'isNotNull'],
        json: ['jsonSearch', 'isNull', 'isNotNull'],
        jsonObject: ['jsonSearch'],
        Number: ['equals', 'between', 'lessThan', 'greaterThan', 'lessOrEquals', 'greaterOrEquals', 'inSet', 'isNull', 'isNotNull'],
        Date: ['equals', 'between', 'lessThan', 'greaterThan', 'lessOrEquals', 'greaterOrEquals', 'isNull', 'isNotNull']
      },
      filter: null,
      tempFilter: [],
      targetFilter: [],
      hasBeenCleared: false
    }
  },
  watch: {
    filterOn: function (newValue) {
      if (!objectArraysAreSame(newValue, this.filter)) {
        this.resetFilter(false)
      }
    },
    storeLocale: function () {
      this.updateOperators()
    },
    targetFilter: function (newValue) {
      this.updateUrl(newValue)
    }
  },
  computed: {
    ...mapGetters([
      'storeHiddenColumns',
      'storeEntityTypeStats',
      'storeLocale'
    ]),
    // Only get the columns that have a text that isn't empty and that have a valid type
    getColumns: function () {
      return this.columns.filter(c => {
        let show = c.label ? (c.label !== '') : false
        show = show && c.type !== undefined
        show = show && !this.tempFilter.some(f => f.column.name === c.key && f.canBeChanged === false)
        return show
      }).sort((a, b) => {
        if (a.preferredSortingColumn === true && !b.preferredSortingColumn) {
          return -1
        } else if (!a.preferredSortingColumn && b.preferredSortingColumn === true) {
          return 1
        } else {
          return 0
        }
      })
    },
    // Only get the columns that have a text that isn't empty
    getColumnsToToggle: function () {
      return this.columns.filter(c => {
        let show = c.label ? (c.label !== '') : false
        show = show && !this.tempFilter.some(f => f.column.name === c.key && f.canBeChanged === false)
        return show
      })
    }
  },
  methods: {
    updateUrl: async function (newValue) {
      if (this.storeUrlParameters) {
        const query = Object.assign({}, this.$route.query)
        if (newValue && newValue.length > 0) {
          query[`${this.tableName}-filter`] = JSON.stringify(newValue)
        } else {
          delete query[`${this.tableName}-filter`]
        }
        await this.$router.replace({ query }).catch(() => true)
      }
    },
    updateOperators: function () {
      this.localOperators = Object.keys(operators).map(o => {
        return {
          text: operators[o].text(),
          value: operators[o].value
        }
      })
    },
    isValidFilter: function (filter) {
      if (filter.column.type === Number) {
        if (filter.comparator !== 'inSet') {
          // Check if it's a number
          return filter.values.filter(v => isNaN(v)).length === 0
        } else {
          return true
        }
      } else if (filter.column.type === Date) {
        // Check if it's a date
        return filter.values.filter(v => isNaN(new Date(v).getTime())).length === 0
      } else {
        return true
      }
    },
    getGroupTypeOptions: function () {
      return Object.keys(groupTypes).map(l => {
        return {
          value: l,
          text: groupTypes[l].text()
        }
      })
    },
    getDataTypeOptions: function () {
      return Object.keys(dataTypes).map(l => {
        return {
          value: l,
          text: dataTypes[l].text()
        }
      })
    },
    getLocationTypeOptions: function () {
      return Object.keys(locationTypes).map(l => {
        return {
          value: l,
          text: locationTypes[l].text()
        }
      })
    },
    getEntityTypeOptions: function () {
      return Object.keys(entityTypes).map(e => {
        const stats = this.storeEntityTypeStats.filter(es => es.entityTypeName === e)
        const enabled = stats && stats.length > 0 && stats[0].count > 0
        return {
          value: e,
          disabled: !enabled,
          text: entityTypes[e].text()
        }
      })
    },
    isDisabled: function (type, comparator) {
      const name = (type instanceof Function) ? type.name : type
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
        if (comparators[f.comparator].value > 0) {
          return f.values.length > 0 && f.values[0] !== undefined
        } else {
          return true
        }
      })
      this.targetFilter = []

      this.filter.forEach(f => {
        const newFilter = {
          column: f.column.key || f.column.name,
          operator: f.operator,
          comparator: f.comparator,
          values: f.values
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
      const validColumns = this.getColumns
      this.tempFilter.push({
        column: validColumns[0],
        comparator: 'equals',
        values: ['', ''],
        operator: operators.and.value
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
      return this.storeHiddenColumns[this.tableName] ? this.storeHiddenColumns[this.tableName].indexOf(column.key) === -1 : false
    },
    toggleColumn: function (value, column) {
      if (value) {
        this.$store.dispatch('removeHiddenColumns', { type: this.tableName, columns: [column.key] })
      } else {
        this.$store.dispatch('addHiddenColumns', { type: this.tableName, columns: [column.key] })
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
      this.tempFilter = []
      if (this.filterOn) {
        this.filterOn.forEach(f => {
          this.tempFilter.push(f)
        })
      }

      this.setFilter(false, trigger)
    },
    refresh: function (concat = true) {
      // Check the URL for filter options
      let urlFilter = null
      if (this.$route.query) {
        if (this.$route.query[`${this.tableName}-filter`]) {
          try {
            urlFilter = JSON.parse(this.$route.query[`${this.tableName}-filter`])

            const columns = this.getColumns
            urlFilter = urlFilter.map(f => {
              const existingColumn = columns.find(c => c.key === f.column)
              const existingFilter = this.filterOn ? this.filterOn.find(of => of.column.name === f.column) : null

              // If there is a matching column at all
              if (existingColumn) {
                // Check if one of the programmatically set filters uses the same column
                if (existingFilter) {
                  f.column = null
                } else {
                  f.column = {
                    name: existingColumn.key,
                    type: existingColumn.type
                  }
                }
              } else {
                f.column = null
              }

              return f
            }).filter(f => f.column)
          } catch {
            // Do nothing here
          }
        }
      }

      if (this.filterOn && this.filterOn.length > 0) {
        this.resetFilter(!urlFilter)
      }

      if (urlFilter) {
        if (concat) {
          this.tempFilter = this.tempFilter.concat(urlFilter)
        } else {
          this.tempFilter = urlFilter
        }

        this.setFilter(false, true)
      }
    }
  },
  mounted: function () {
    this.updateOperators()

    this.refresh()
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
