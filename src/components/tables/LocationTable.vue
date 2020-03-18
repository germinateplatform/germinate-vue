<template>
  <BaseTable v-bind="$props"
              :columns="columns"
              :options="options"
              itemType="locations"
              ref="locationTable"
              v-on="$listeners">
    <template v-slot:cell(locationName)="data">
      <router-link to="/data/datasets" @click.native="navigateToDatasets(data.item)" event="" v-if="data.item.locationType === 'datasets'" :title="data.item.locationName">{{ data.item.locationName | truncateAfterWords(10) }}</router-link>
      <router-link to="/data/germplasm" @click.native="navigateToGermplasm(data.item)" event="" v-else-if="data.item.locationType === 'collectingsites'" :title="data.item.locationName">{{ data.item.locationName | truncateAfterWords(10) }}</router-link>
      <span v-else :title="data.item.locationName">{{ data.item.locationName | truncateAfterWords(10) }}</span>
    </template>

    <template v-slot:cell(locationLatitude)="data">
      <span v-if="data.item.locationLatitude !== undefined">{{ data.item.locationLatitude.toFixed(2) }}</span>
    </template>
    <template v-slot:cell(locationLongitude)="data">
      <span v-if="data.item.locationLongitude !== undefined">{{ data.item.locationLongitude.toFixed(2) }}</span>
    </template>
    <template v-slot:cell(locationElevation)="data">
      <span v-if="data.item.locationElevation !== undefined">{{ data.item.locationElevation.toFixed(2) }}</span>
    </template>
    <template v-slot:cell(countryName)="data">
      <span class="table-country" v-b-tooltip.hover :title="data.item.countryName"><i :class="'flag-icon flag-icon-' + data.item.countryCode2.toLowerCase()" v-if="data.item.countryCode2"/> <span> {{ data.item.countryCode2 }}</span></span>
    </template>
    <template v-slot:cell(locationType)="data">
      <span><i :class="`mdi mdi-18px ${locationTypes[data.item.locationType].icon} fix-alignment`" :style="`color: ${locationTypes[data.item.locationType].color()};`" /> {{ locationTypes[data.item.locationType].text() }}</span>
    </template>
  </BaseTable>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

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
      var result = [
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
          label: this.$t('tableColumnLocationName')
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
    BaseTable
  },
  methods: {
    navigateToGermplasm: function (location) {
      this.$store.commit('ON_TABLE_FILTERING_CHANGED_MUTATION', [{
        column: {
          name: 'location',
          type: String
        },
        comparator: 'equals',
        operator: 'and',
        values: [location.locationName]
      }])
      this.$router.push({ path: '/data/germplasm' })
    },
    navigateToDatasets: function (location) {
      this.$store.commit('ON_TABLE_FILTERING_CHANGED_MUTATION', [{
        column: {
          name: 'locations',
          type: 'json'
        },
        comparator: 'contains',
        operator: 'and',
        values: [location.locationName]
      }])
      this.$router.push({ path: '/data/datasets' })
    },
    refresh: function () {
      this.$refs.locationTable.refresh()
    }
  }
}
</script>

<style>

</style>
