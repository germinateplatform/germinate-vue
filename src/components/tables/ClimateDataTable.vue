<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               v-bind="$props"
               itemType="locations"
               ref="climateDataTable"
               v-on="$listeners">
      <span slot="locationLatitude" slot-scope="props" v-if="props.row.locationLatitude !== undefined">{{ props.row.locationLatitude.toFixed(2) }}</span>
      <span slot="locationLongitude" slot-scope="props" v-if="props.row.locationLongitude !== undefined">{{ props.row.locationLongitude.toFixed(2) }}</span>
      <span slot="locationElevation" slot-scope="props" v-if="props.row.locationElevation !== undefined">{{ props.row.locationElevation.toFixed(2) }}</span>
      <span slot="climateValue" slot-scope="props" v-if="props.row.climateValue !== undefined">{{ props.row.climateValue.toFixed(2) }}</span>

      <span slot="countryName" slot-scope="props" class="table-country" v-b-tooltip.hover :title="props.row.countryName"><i :class="'flag-icon flag-icon-' + props.row.countryCode2.toLowerCase()" v-if="props.row.countryCode2"/> <span> {{ props.row.countryCode2 }}</span></span>

      <span slot="locationType" slot-scope="props"><i :class="`mdi mdi-18px ${locationTypes[props.row.locationType].icon} fix-alignment`" :style="`color: ${locationTypes[props.row.locationType].color()};`" /> {{ locationTypes[props.row.locationType].text() }}</span>
      <!-- Formatted date -->
      <span slot="recordingDate" slot-scope="props" v-if="props.row.recordingDate">{{ props.row.recordingDate | toDate }}</span>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'
import defaultProps from '@/const/table-props.js'

export default {
  name: 'ClimateDataTable',
  props: {
    ...defaultProps.FULL
  },
  data: function () {
    const columns = [
      {
        name: 'locationId',
        type: Number
      }, {
        name: 'locationName',
        type: String
      }, {
        name: 'locationRegion',
        type: String
      }, {
        name: 'locationState',
        type: String
      }, {
        name: 'locationType',
        type: 'locationType'
      }, {
        name: 'locationLatitude',
        type: Number
      }, {
        name: 'locationLongitude',
        type: Number
      }, {
        name: 'locationElevation',
        type: Number
      }, {
        name: 'countryName',
        type: String
      }, {
        name: 'climateId',
        type: Number
      }, {
        name: 'climateName',
        type: String
      }, {
        name: 'unitName',
        type: String
      }, {
        name: 'recordingDate',
        type: Date
      }, {
        name: 'climateValue',
        type: Number
      }, {
        name: 'marked',
        type: null
      }
    ]
    return {
      options: {
        idColumn: 'locationId',
        tableName: 'climateData',
        sortable: ['locationId', 'locationName', 'locationRegion', 'locationState', 'locationType', 'locationLatitude', 'locationLongitude', 'locationElevation', 'countryName', 'climateId', 'climateName', 'unitName', 'recordingDate', 'climateValue'],
        filterable: [],
        headings: {
          locationId: () => this.$t('tableColumnLocationId'),
          locationName: () => this.$t('tableColumnLocationName'),
          locationRegion: () => this.$t('tableColumnLocationRegion'),
          locationState: () => this.$t('tableColumnLocationState'),
          locationType: () => this.$t('tableColumnLocationType'),
          locationLatitude: () => this.$t('tableColumnLocationLatitude'),
          locationLongitude: () => this.$t('tableColumnLocationLongitude'),
          locationElevation: () => this.$t('tableColumnLocationElevation'),
          countryName: () => this.$t('tableColumnLocationCountryName'),
          climateId: () => this.$t('tableColumnClimateId'),
          climateName: () => this.$t('tableColumnClimateName'),
          unitName: () => this.$t('tableColumnClimateUnitName'),
          recordingDate: () => this.$t('tableColumnClimateDataRecordingDate'),
          climateValue: () => this.$t('tableColumnClimateDataClimateValue')
        },
        columnsClasses: {
          locationId: 'text-right',
          marked: 'text-right'
        }
      },
      columns: columns
    }
  },
  components: {
    BaseTable
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
