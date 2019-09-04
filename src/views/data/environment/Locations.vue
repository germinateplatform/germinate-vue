<template>
  <div>
    <h1>Locations</h1>
    <LocationsTable :getData="getData"
                    :getIds="getIds"
                    v-on:data-changed="onDataChanged" />

    <p class="text-info">Filtering the table will adjust the maps below. You can use this to, e.g., only look at trial sites.</p>

    <h2>Clustered locations</h2>
    <LocationMap v-if="locations && locations.length > 0" :locations="locations" mapType="cluster" class="mb-3" />
    <h2>Heatmapped locations</h2>
    <LocationMap v-if="locations && locations.length > 0" :locations="locations" mapType="heatmap" class="mb-3" />
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
      locations: null
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
      return this.apiPostLocationGroupIds(data, callback)
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
