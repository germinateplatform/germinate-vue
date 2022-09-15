<template>
  <BaseTable v-bind="$props"
            :columns="columns"
            :options="options"
            itemType="locations"
            ref="climateDataTable"
            v-on="$listeners">
    <!-- Country name represented by a flag icon -->
    <template v-slot:cell(countryName)="data">
      <span class="table-country text-nowrap" v-b-tooltip.hover :title="data.item.countryName"><i :class="'fi fi-' + data.item.countryCode2.toLowerCase()" v-if="data.item.countryCode2"/> <span> {{ data.item.countryCode2 }}</span></span>
    </template>
    <!-- Location type with icon -->
    <template v-slot:cell(locationType)="data">
      <span><span :style="`color: ${locationTypes[data.item.locationType].color()};`"><MdiIcon :path="locationTypes[data.item.locationType].path"/></span> {{ locationTypes[data.item.locationType].text() }}</span>
    </template>
  </BaseTable>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'
import { locationTypes } from '@/mixins/types.js'

export default {
  name: 'LocationTable',
  props: {
    ...defaultProps.FULL
  },
  data: function () {
    return {
      locationTypes,
      options: {
        idColumn: 'locationId',
        tableName: 'climateData'
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
          label: this.$t('tableColumnLocationId')
        }, {
          key: 'locationName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnLocationName')
        }, {
          key: 'locationRegion',
          type: String,
          sortable: true,
          label: this.$t('tableColumnLocationRegion')
        }, {
          key: 'locationState',
          type: String,
          sortable: true,
          label: this.$t('tableColumnLocationState')
        }, {
          key: 'locationType',
          type: 'locationType',
          sortable: true,
          label: this.$t('tableColumnLocationType')
        }, {
          key: 'locationLatitude',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnLocationLatitude'),
          formatter: value => value !== null ? value.toFixed(2) : null
        }, {
          key: 'locationLongitude',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnLocationLongitude'),
          formatter: value => value !== null ? value.toFixed(2) : null
        }, {
          key: 'locationElevation',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnLocationElevation'),
          formatter: value => value !== null ? value.toFixed(2) : null
        }, {
          key: 'countryName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnLocationCountryName')
        }, {
          key: 'climateId',
          type: Number,
          sortable: true,
          class: 'text-right',
          label: this.$t('tableColumnClimateId')
        }, {
          key: 'climateName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnClimateName'),
          preferedSortingColumn: true
        }, {
          key: 'unitName',
          type: String,
          sortable: true,
          label: this.$t('tableColumnClimateUnitName')
        }, {
          key: 'recordingDate',
          type: Date,
          sortable: true,
          label: this.$t('tableColumnClimateDataRecordingDate'),
          formatter: value => value ? new Date(value).toLocaleDateString() : null
        }, {
          key: 'climateValue',
          type: Number,
          sortable: true,
          label: this.$t('tableColumnClimateDataClimateValue'),
          formatter: value => value !== null ? value.toFixed(2) : null
        }, {
          key: 'marked',
          type: null,
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
          class: 'bg-primary',
          label: ''
        })
      }

      return result
    }
  },
  components: {
    BaseTable,
    MdiIcon
  },
  methods: {
    refresh: function () {
      this.$refs.climateDataTable.refresh()
    }
  }
}
</script>

<style>

</style>
