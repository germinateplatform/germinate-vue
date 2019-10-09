<template>
  <div>
    <BaseTable :options="options"
               :columns="columns"
               :getIds="getIds"
               :filterOn="filterOn"
               :tableActions="tableActions"
               itemType="locations"
               ref="locationTable"
               v-on:data-changed="(request, data) => $emit('data-changed', request, data)">
      <template slot="locationName" slot-scope="props">
        <router-link to="/data/datasets" @click.native="navigateToDatasets(props.row)" event="" v-if="props.row.locationType === 'datasets'">{{ props.row.locationName }}</router-link>
        <router-link to="/data/germplasm" @click.native="navigateToGermplasm(props.row)" event="" v-else-if="props.row.locationType === 'collectingsites'">{{ props.row.locationName }}</router-link>
        <span v-else>{{ props.row.locationName }}</span>
      </template>

      <span slot="locationLatitude" slot-scope="props" v-if="props.row.locationLatitude">{{ props.row.locationLatitude.toFixed(2) }}</span>
      <span slot="locationLongitude" slot-scope="props" v-if="props.row.locationLongitude">{{ props.row.locationLongitude.toFixed(2) }}</span>
      <span slot="locationElevation" slot-scope="props" v-if="props.row.locationElevation">{{ props.row.locationElevation.toFixed(2) }}</span>

      <span slot="countryName" slot-scope="props" class="table-country" v-b-tooltip.hover :title="props.row.countryName"><i :class="'flag-icon flag-icon-' + props.row.countryCode2.toLowerCase()" v-if="props.row.countryCode2"/> <span> {{ props.row.countryCode2 }}</span></span>

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
      name: 'distance',
      type: undefined
    }, {
      name: 'marked',
      type: undefined
    }]

    if (this.tableMode !== 'distance') {
      columns = columns.filter(c => c.name !== 'distance')
    }

    if (this.selectable === true) {
      columns.unshift({
        name: 'selected',
        type: undefined
      })
    }

    var options = {
      requestData: (data, callback) => {
        return this.getData(data, callback)
      },
      idColumn: 'locationId',
      tableName: 'locations',
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
        distance: () => 'Distance',
        marked: ''
      },
      columnsClasses: {
        locationId: 'text-right',
        locationLatitude: 'text-right',
        locationLongitude: 'text-right',
        locationElevation: 'text-right',
        distance: 'text-right'
      }
    }

    if (this.orderBy !== null) {
      options.orderBy = {
        column: this.orderBy
      }
    }

    return {
      options: options,
      columns: columns
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
          name: 'location',
          type: String
        },
        comparator: 'equals',
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
