<template>
  <BaseTable v-bind="$props"
            :columns="columns"
            :options="options"
            itemType="locations"
            ref="climateDataTable"
            v-on="$listeners">
    <!-- Country name represented by a flag icon -->
    <template v-slot:cell(countryName)="data">
      <span class="table-country text-nowrap" v-b-tooltip.hover :title="data.item.countryName"><i :class="'flag-icon flag-icon-' + data.item.countryCode2.toLowerCase()" v-if="data.item.countryCode2"/> <span> {{ data.item.countryCode2 }}</span></span>
    </template>
    <!-- Location type with icon -->
    <template v-slot:cell(locationType)="data">
      <span><i :class="`mdi mdi-18px ${locationTypes[data.item.locationType].icon} fix-alignment`" :style="`color: ${locationTypes[data.item.locationType].color()};`" /> {{ locationTypes[data.item.locationType].text() }}</span>
    </template>
  </BaseTable>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import typesMixin from '@/mixins/types.js'

export default {
  name: 'LocationTable',
  props: {
    ...defaultProps.FULL
  },
  data: function () {
    return {
      options: {
        idColumn: 'locationId',
        tableName: 'climateData'
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
          class: `${this.isTableColumnHidden(this.options.tableName, 'locationId')}`,
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
          label: this.$t('tableColumnLocationLatitude'),
          formatter: value => value !== null ? value.toFixed(2) : null
        }, {
          key: 'locationLongitude',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'locationLongitude')}`,
          label: this.$t('tableColumnLocationLongitude'),
          formatter: value => value !== null ? value.toFixed(2) : null
        }, {
          key: 'locationElevation',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'locationElevation')}`,
          label: this.$t('tableColumnLocationElevation'),
          formatter: value => value !== null ? value.toFixed(2) : null
        }, {
          key: 'countryName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'countryName')}`,
          label: this.$t('tableColumnLocationCountryName')
        }, {
          key: 'climateId',
          type: Number,
          sortable: true,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'climateId')}`,
          label: this.$t('tableColumnClimateId')
        }, {
          key: 'climateName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'climateName')}`,
          label: this.$t('tableColumnClimateName')
        }, {
          key: 'unitName',
          type: String,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'unitName')}`,
          label: this.$t('tableColumnClimateUnitName')
        }, {
          key: 'recordingDate',
          type: Date,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'recordingDate')}`,
          label: this.$t('tableColumnClimateDataRecordingDate'),
          formatter: this.$options.filters.toDate
        }, {
          key: 'climateValue',
          type: Number,
          sortable: true,
          class: `${this.isTableColumnHidden(this.options.tableName, 'climateValue')}`,
          label: this.$t('tableColumnClimateDataClimateValue'),
          formatter: value => value !== null ? value.toFixed(2) : null
        }, {
          key: 'marked',
          type: null,
          sortable: false,
          class: `text-right ${this.isTableColumnHidden(this.options.tableName, 'marked')}`,
          label: ''
        }
      ]

      if (this.selectable === true) {
        result.unshift({
          key: 'selected',
          type: undefined,
          sortable: false,
          class: 'bg-primary',
          label: ''
        })
      }

      return result
    }
  },
  components: {
    BaseTable
  },
  mixins: [ typesMixin ],
  methods: {
    refresh: function () {
      this.$refs.climateDataTable.refresh()
    }
  }
}
</script>

<style>

</style>
