<template>
  <div>
    <h1>Locations</h1>
    <LocationsTable :getData="getData"
                    :getIds="getIds"
                    v-on:data-changed="onDataChanged" />

    <h1>Maps</h1>
    <p class="text-info">Filtering the table will adjust the maps below. You can use this to, e.g., only look at trial sites or only locations from a specific country.</p>
    <b-row>
      <b-col cols=12 xl=6>
        <h2>Clustered locations</h2>
        <p>This map shows the locations clustered into groups. The numbers on the cluster nodes as well as their size and color represent the number of clustered locations. Clicking on a cluster node will expand this cluster and zoom in.</p>
        <LocationMap v-if="locations && locations.length > 0" :locations="locations" mapType="cluster" class="mb-3" v-on:map-loaded="map => { clusteredMap = map }" />
      </b-col>
      <b-col cols=12 xl=6>
        <h2>Heatmapped locations</h2>
        <p>The map below represents the density of locations with colors on a gradient. The gradient ranges from a low density (represented by the color black) to a high density (represented by the color white). Zooming in will cause the density to dissipate.</p>
        <LocationMap v-if="locations && locations.length > 0" :locations="locations" mapType="heatmap" class="mb-3" v-on:map-loaded="map => { heatmappedMap = map }" />
      </b-col>
    </b-row>
  </div>
</template>

<script>
import _ from 'lodash'
import LocationMap from '@/components/map/LocationMap'
import LocationsTable from '@/components/tables/LocationsTable'

export default {
  data: function () {
    return {
      tableFilter: null,
      locations: null,
      clusteredMap: null,
      heatmappedMap: null,
      synced: false
    }
  },
  watch: {
    clusteredMap: function (oldValue, newValue) {
      if (this.synced === false && this.clusteredMap && this.heatmappedMap) {
        this.synced = true
        this.clusteredMap.sync(this.heatmappedMap)
        this.heatmappedMap.sync(this.clusteredMap)
      }
    },
    heatmappedMap: function (oldValue, newValue) {
      if (this.synced === false && this.clusteredMap && this.heatmappedMap) {
        this.synced = true
        this.heatmappedMap.sync(this.clusteredMap)
        this.clusteredMap.sync(this.heatmappedMap)
      }
    }
  },
  components: {
    LocationMap,
    LocationsTable
  },
  methods: {
    getData: function (data, callback) {
      return this.apiPostLocationTable(data, callback)
    },
    getIds: function (data, callback) {
      return this.apiPostLocationTableIds(data, callback)
    },
    onDataChanged: function (request, data) {
      if (!this.locations || !_.isEqual(request.filter, this.tableFilter)) {
        this.tableFilter = request.filter

        // Create a custom request based on the one from the table, but change limit and page to get all the locations
        var customRequest = Object.assign({}, request)
        customRequest.limit = this.MAX_JAVA_INTEGER
        customRequest.page = 1
        this.apiPostLocationTable(customRequest, result => {
          this.locations = result.data
        })
      }
    }
  }
}
</script>

<style>

</style>
