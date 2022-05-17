<template>
  <BaseTable v-bind="$props"
              :columns="columns"
              :options="options"
              primary-key="locationId"
              itemType="locations"
              ref="locationTable"
              v-on="$listeners">
    <!-- Location name link -->
    <template v-slot:cell(locationName)="data">
      <!-- Dataset location -->
      <span v-if="data.item.locationType === 'datasets'">{{ truncateAfterWords(data.item.locationName, 10) }}</span>
      <!-- Collecting site -->
      <router-link :to="{ name: 'germplasm' }" @click.native="navigateToGermplasm(data.item)" event="" v-else-if="data.item.locationType === 'collectingsites'" :title="data.item.locationName">{{ truncateAfterWords(data.item.locationName, 10) }}</router-link>
      <!-- Anything else -->
      <span v-else :title="data.item.locationName">{{ truncateAfterWords(data.item.locationName, 10) }}</span>
    </template>
    <!-- Location latitude -->
    <template v-slot:cell(locationLatitude)="data">
      <span v-if="data.item.locationLatitude !== undefined">{{ data.item.locationLatitude.toFixed(2) }}</span>
    </template>
    <!-- Location longitude -->
    <template v-slot:cell(locationLongitude)="data">
      <span v-if="data.item.locationLongitude !== undefined">{{ data.item.locationLongitude.toFixed(2) }}</span>
    </template>
    <!-- Location elevation -->
    <template v-slot:cell(locationElevation)="data">
      <span v-if="data.item.locationElevation !== undefined">{{ data.item.locationElevation.toFixed(2) }}</span>
    </template>
    <!-- Country name -->
    <template v-slot:cell(countryName)="data">
      <span class="table-country" v-b-tooltip.hover :title="data.item.countryName"><i :class="'fi fi-' + data.item.countryCode2.toLowerCase()" v-if="data.item.countryCode2"/> <span> {{ data.item.countryCode2 }}</span></span>
    </template>
    <!-- Location type -->
    <template v-slot:cell(locationType)="data">
      <span><span :style="`color: ${locationTypes[data.item.locationType].color()};`">
        <MdiIcon :path="locationTypes[data.item.locationType].path" /></span> {{ locationTypes[data.item.locationType].text() }}
      </span>
    </template>
  </BaseTable>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import typesMixin from '@/mixins/types'
import utilMixin from '@/mixins/util'
import formattingMixin from '@/mixins/formatting'

export default {
  name: 'LocationTable',
  props: {
    ...defaultProps.FULL,
    orderBy: {
      type: String,
      default: null
    },
    selectable: {
      type: Boolean,
      default: false
    },
    tableMode: {
      type: String,
      default: 'base'
    },
    selectionMode: {
      type: String,
      default: 'multi'
    }
  },
  data: function () {
    return {
      options: {
        idColumn: 'locationId',
        tableName: 'locations',
        orderBy: this.orderBy
      }
    }
  },
  computed: {
    columns: function () {
      const result = [
        {
          key: 'locationId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'locationId')}`,
          label: this.$t('tableColumnLocationId')
        }, {
          key: 'locationName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'locationName')}`,
          label: this.$t('tableColumnLocationName'),
          preferedSortingColumn: true
        }, {
          key: 'locationRegion',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'locationRegion')}`,
          label: this.$t('tableColumnLocationRegion')
        }, {
          key: 'locationState',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'locationState')}`,
          label: this.$t('tableColumnLocationState')
        }, {
          key: 'locationType',
          type: 'locationType',
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'locationType')}`,
          label: this.$t('tableColumnLocationType')
        }, {
          key: 'locationLatitude',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'locationLatitude')}`,
          label: this.$t('tableColumnLocationLatitude')
        }, {
          key: 'locationLongitude',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'locationLongitude')}`,
          label: this.$t('tableColumnLocationLongitude')
        }, {
          key: 'locationElevation',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'locationElevation')}`,
          label: this.$t('tableColumnLocationElevation')
        }, {
          key: 'countryName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'countryName')}`,
          label: this.$t('tableColumnLocationCountryName')
        }, {
          key: 'distance',
          type: undefined,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'distance') ? 'd-none' : ''}`,
          label: this.$t('tableColumnLocationDistance')
        }, {
          key: 'marked',
          type: undefined,
          sortable: false,
          class: 'text-right',
          label: ''
        }
      ]

      if (this.selectable === true) {
        result.unshift({
          key: 'selected',
          type: undefined,
          sortable: false,
          label: ''
        })
      }

      if (this.tableMode !== 'distance') {
        return result.filter(c => c.key !== 'distance')
      } else {
        return result
      }
    }
  },
  components: {
    BaseTable,
    MdiIcon
  },
  mixins: [typesMixin, utilMixin, formattingMixin],
  methods: {
    navigateToGermplasm: function (location) {
      // Set up the filter
      const filter = [{
        column: 'location',
        comparator: 'equals',
        operator: 'and',
        values: [location.locationName]
      }]
      // Redirect to germplasm page filtered by location
      this.$router.push({
        name: 'germplasm',
        query: {
          'germplasm-filter': JSON.stringify(filter)
        }
      })
    },
    refresh: function () {
      this.$refs.locationTable.refresh()
    }
  }
}
</script>

<style>

</style>
