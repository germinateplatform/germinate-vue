<template>
  <div>
    <h1>{{ $t('pageLocationsTitle') }}</h1>
    <p>{{ $t('pageLocationsText') }}</p>
    <!-- All locations in a table -->
    <LocationTable :getData="getData"
                    :getIds="getIds"
                    v-on:data-changed="onDataChanged" />

    <h2>{{ $t('pageLocationsMapsTitle') }}</h2>
    <p class="text-info">{{ $t('pageLocationsMapsText') }}</p>

    <template v-if="climates && climates.length > 0">
      <h3>{{ $t('pageLocationsMapsClimateOverlaysTitle') }}</h3>
      <p>{{ $t('pageLocationsMapsClimateOverlaysText') }}</p>
      <!-- Possible climate overlays for the maps -->
      <b-form-select v-model="climate" :options="climateOptions" class="mb-3" />
    </template>

    <b-row>
      <b-col cols=12 xl=6>
        <h3>{{ $t('pageLocationsMapsClusteredTitle') }}</h3>
        <p>{{ $t('pageLocationsMapsClusteredText') }}</p>
        <!-- Clustered location map -->
        <LocationMap v-if="locations && locations.length > 0" :imageOverlays="climateImageOverlays" :locations="locations" mapType="cluster" class="mb-3" v-on:map-loaded="map => { clusteredMap = map }" />
      </b-col>
      <b-col cols=12 xl=6>
        <h3>{{ $t('pageLocationsMapsHeatmappedTitle') }}</h3>
        <p>{{ $t('pageLocationsMapsHeatmappedText') }}</p>
        <!-- Heatmapped location map -->
        <LocationMap v-if="locations && locations.length > 0" :imageOverlays="climateImageOverlays" :locations="locations" mapType="heatmap" class="mb-3" v-on:map-loaded="map => { heatmappedMap = map }" />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { isEqual } from 'lodash'
import LocationMap from '@/components/map/LocationMap'
import LocationTable from '@/components/tables/LocationTable'
import climateApi from '@/mixins/api/climate.js'
import locationApi from '@/mixins/api/location.js'

export default {
  data: function () {
    return {
      climate: null,
      climates: [],
      climateOptions: [{
        value: null,
        text: this.$t('pageLocationsMapsClimateOverlaysSelectText')
      }],
      climateImageOverlays: [],
      tableFilter: null,
      locations: null,
      clusteredMap: null,
      heatmappedMap: null,
      synced: false
    }
  },
  watch: {
    clusteredMap: function (oldValue, newValue) {
      // Synchronize the maps
      if (this.synced === false && this.clusteredMap && this.heatmappedMap) {
        this.synced = true
        this.clusteredMap.sync(this.heatmappedMap)
        this.heatmappedMap.sync(this.clusteredMap)
      }
    },
    heatmappedMap: function (oldValue, newValue) {
      // Synchronize the maps
      if (this.synced === false && this.clusteredMap && this.heatmappedMap) {
        this.synced = true
        this.heatmappedMap.sync(this.clusteredMap)
        this.clusteredMap.sync(this.heatmappedMap)
      }
    },
    climate: function (oldValue, newValue) {
      // When a climate is selected, get the overlays and show them on the map
      if (this.climate !== null) {
        const queryData = {
          filter: [{
            column: 'climateId',
            comparator: 'equals',
            operator: 'and',
            values: [this.climate.climateId]
          }],
          page: 1,
          limit: this.MAX_JAVA_INTEGER
        }
        this.apiPostClimateOverlays(queryData, result => {
          var array = []

          if (result && result.data) {
            result.data.forEach(i => {
              var path = ''

              var params = {
                token: this.token ? this.token.imageToken : null
              }
              var paramString = this.toUrlString(params)

              path = this.baseUrl + `climate/overlay/${i.climateOverlayId}/src?` + paramString

              array.push({
                id: i.climateOverlayId,
                url: path,
                isLegend: i.isLegend,
                bounds: [[i.bottomLeftLatitude, i.bottomLeftLongitude], [i.topRightLatitude, i.topRightLongitude]]
              })
            })
          }

          this.climateImageOverlays = array
        })
      } else {
        this.climateImageOverlays = []
      }
    }
  },
  components: {
    LocationMap,
    LocationTable
  },
  mixins: [ climateApi, locationApi ],
  methods: {
    getData: function (data, callback) {
      return this.apiPostLocationTable(data, callback)
    },
    getIds: function (data, callback) {
      return this.apiPostLocationTableIds(data, callback)
    },
    onDataChanged: function (request, data) {
      const sameAsBefore = isEqual(request.filter, this.tableFilter)
      // If something changed, we're going to only show the locations in the table on the map
      if (!this.locations || !sameAsBefore) {
        this.tableFilter = JSON.parse(JSON.stringify(request.filter))

        // Create a custom request based on the one from the table, but change limit and page to get all the locations
        var customRequest = Object.assign({}, request)
        customRequest.limit = this.MAX_JAVA_INTEGER
        customRequest.page = 1
        this.apiPostLocationTable(customRequest, result => {
          this.locations = result.data
        })
      }
    }
  },
  mounted: function () {
    const queryData = {
      filter: [{
        column: 'overlays',
        comparator: 'greaterThan',
        operator: 'and',
        values: [0]
      }]
    }

    this.apiPostClimates(queryData, result => {
      if (result && result.data) {
        this.climates = result.data

        this.climates.forEach(c => {
          var itemName = c.climateName

          if (c.unitAbbreviation) {
            itemName += ` [${c.unitAbbreviation}]`
          }

          this.climateOptions.push({
            value: c,
            text: itemName
          })

          c.displayName = itemName
        })
      }
    })
  }
}
</script>

<style>

</style>
