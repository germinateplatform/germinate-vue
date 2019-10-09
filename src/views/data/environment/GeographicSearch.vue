<template>
  <div>
    <h1>Geographic search</h1>
    <b-card no-body class="map-tabs">
      <b-tabs card
              active-nav-item-class="text-primary"
              v-model="tabIndex">
        <b-tab active @click="updatePointMap">
          <template v-slot:title>
            <i class="mdi mdi-18px mdi-crosshairs-gps" /> Point search
          </template>
          <PointSearchMap ref="pointMap" v-on:map-loaded="updatePolygonMap" />
          <b-card-body v-if="point">
            <h2>Locations ordered by distance</h2>
            <LocationTable tableMode="distance" :getData="getLocationData" :getIds="getLocationIds" ref="pointTable" orderBy="distance" />
          </b-card-body>
        </b-tab>
        <b-tab @click="updatePolygonMap">
          <template v-slot:title>
            <i class="mdi mdi-18px mdi-vector-polygon" /> Polygon search
          </template>
          <LocationMap selectionMode="polygon" :locations="polygonLocations" ref="polygonMap" />
          <b-card-body v-if="polygons && polygons.length > 0">
            <h2>Locations within the polygons</h2>
            <LocationTable :getData="getLocationData" :getIds="getLocationIds" ref="polygonTable" />
          </b-card-body>
        </b-tab>
        <template v-slot:tabs-end>
          <b-nav-item href="#" @click="query" class="ml-auto text-primary bg-primary"><span class="text-white"><i class="mdi mdi-18px mdi-arrow-right-box" /> Run query</span></b-nav-item>
        </template>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import LocationTable from '@/components/tables/LocationTable'
import PointSearchMap from '@/components/map/PointSearchMap'
import LocationMap from '@/components/map/LocationMap'

export default {
  data: function () {
    return {
      tabIndex: 0,
      point: null,
      polygons: null,
      polygonLocations: null
    }
  },
  components: {
    LocationTable,
    PointSearchMap,
    LocationMap
  },
  methods: {
    getLocationData: function (data, callback) {
      if (this.tabIndex === 0) {
        data.latitude = this.point.lat
        data.longitude = this.point.lng
        return this.apiPostLocationDistanceTable(data, callback)
      } else {
        data.polygons = this.polygons

        var allData = JSON.parse(JSON.stringify(data))
        allData.page = 1
        allData.limit = this.MAX_JAVA_INTEGER
        this.apiPostLocationPolygonTable(allData, result => {
          this.polygonLocations = result.data
        })

        return this.apiPostLocationPolygonTable(data, callback)
      }
    },
    getLocationIds: function (data, callback) {
      if (this.tabIndex === 0) {
        return this.apiPostLocationTableIds(data, callback)
      } else {
        return this.apiPostLocationPolygonTableIds(data, callback)
      }
    },
    query: function () {
      if (this.tabIndex === 0) {
        this.point = this.$refs.pointMap.markAndGetCenter()

        if (this.point !== null) {
          this.$nextTick(() => this.$refs.pointTable.refresh())
        } else {
          this.$bvToast.toast('Please select a point by clicking on the map.', {
            title: 'No point selected',
            variant: 'info',
            autoHideDelay: 5000,
            appendToast: true
          })
        }
      } else {
        this.polygons = this.$refs.polygonMap.getPolygons()

        if (this.polygons !== null && this.polygons.length > 0) {
          this.$nextTick(() => this.$refs.polygonTable.refresh())
        } else {
          this.$bvToast.toast('Please create a polygon by clicking on the map.', {
            title: 'No polygon defined',
            variant: 'info',
            autoHideDelay: 5000,
            appendToast: true
          })
        }
      }
    },
    updatePointMap: function () {
      this.$nextTick(() => this.$refs.pointMap.invalidateSize())
    },
    updatePolygonMap: function () {
      this.$nextTick(() => this.$refs.polygonMap.invalidateSize())
    }
  }
}
</script>

<style>

</style>
