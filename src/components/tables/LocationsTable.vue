<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :getIds="getIds"
               :tableActions="tableActions"
               itemType="locations"
               ref="locationTable"
               v-on:data-changed="(request, data) => $emit('data-changed', request, data)">
      <router-link slot="locationId" slot-scope="props" :to="'/geo/location/' + props.row.locationId">{{ props.row.locationId }}</router-link>
      <router-link slot="locationName" slot-scope="props" :to="'/geo/location/' + props.row.markerId">{{ props.row.locationName }}</router-link>

      <span slot="locationLatitude" slot-scope="props" v-if="props.row.locationLatitude">{{ props.row.locationLatitude.toFixed(2) }}</span>
      <span slot="locationLongitude" slot-scope="props" v-if="props.row.locationLongitude">{{ props.row.locationLongitude.toFixed(2) }}</span>
      <span slot="locationElevation" slot-scope="props" v-if="props.row.locationElevation">{{ props.row.locationElevation.toFixed(2) }}</span>

      <div slot="countryName" slot-scope="props" class="table-country"><i :class="'flag-icon flag-icon-' + props.row.countryCode2.toLowerCase()" v-if="props.row.countryCode2"/> <span> {{ props.row.countryName }}</span></div>

      <span slot="locationType" slot-scope="props"><i :class="`mdi mdi-18px ${locationTypes[props.row.locationType].icon} fix-alignment`" :style="`color: ${locationTypes[props.row.locationType].color()};`" /> {{ locationTypes[props.row.locationType].text() }}</span>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/tables/BaseTable'

export default {
  name: 'LocationTable',
  props: {
    filterOn: {
      type: Array,
      default: null
    },
    getData: {
      type: Function,
      default: () => {}
    },
    getIds: {
      type: Function,
      default: () => []
    },
    selectable: {
      type: Boolean,
      default: true
    },
    tableActions: {
      type: Array,
      default: () => null
    }
  },
  data: function () {
    var columns = [{
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
      type: String
    }, {
      name: 'locationLongitude',
      type: String
    }, {
      name: 'locationElevation',
      type: String
    }, {
      name: 'countryName',
      type: String
    }, {
      name: 'marked',
      type: undefined
    }]

    if (this.selectable === true) {
      columns.unshift({
        name: 'selected',
        type: undefined
      })
    }

    return {
      options: {
        requestData: (data, callback) => {
          return this.getData(data, callback)
        },
        idColumn: 'locationId',
        tableName: 'locations',
        filterOn: this.filterOn,
        sortable: ['locationId', 'locationName', 'locationRegion', 'locationState', 'locationType', 'locationLatitude', 'locationLongitud', 'locationElevation', 'countryName'],
        filterable: [],
        headings: {
          selected: '',
          locationId: () => this.$t('tableColumnLocationId'),
          locationName: () => this.$t('tableColumnLocationName'),
          locationRegion: () => this.$t('tableColumnLocationRegion'),
          locationState: () => this.$t('tableColumnLocationState'),
          locationType: () => this.$t('tableColumnLocationType'),
          locationLatitude: () => this.$t('tableColumnLocationLatitude'),
          locationLongitude: () => this.$t('tableColumnLocationLongitude'),
          locationElevation: () => this.$t('tableColumnLocationElevation'),
          countryName: () => this.$t('tableColumnLocationCountryName'),
          marked: ''
        },
        columnsClasses: {
          locationId: 'text-right',
          locationLatitude: 'text-right',
          locationLongitude: 'text-right',
          locationElevation: 'text-right',
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
      this.$refs.locationTable.refresh()
    }
  }
}
</script>

<style>
</style>
