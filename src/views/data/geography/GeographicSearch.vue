<template>
  <div>
    <h1>{{ $t('pageGeographicSearchTitle') }}</h1>
    <b-card no-body class="map-tabs">
      <b-tabs card
              active-nav-item-class="text-primary"
              v-model="tabIndex">
        <b-tab active @click="updatePointMap">
          <template v-slot:title>
            <i class="mdi mdi-18px mdi-crosshairs-gps" /> {{ $t('pageGeographicSearchPointSearchTitle') }}
          </template>
          <PointSearchMap ref="pointMap" v-on:map-loaded="updatePolygonMap" />
          <b-card-body v-if="point">
            <Collapse icon="mdi-map-marker" :title="$t('pageGeographicSearchPointLocationResultTitle')" :visible="false" no-body class="my-2">
              <template v-slot:default="slotProps">
                <LocationTable tableMode="distance" :getData="getLocationData" :getIds="getLocationIds" ref="locationPointTable" orderBy="distance" v-on:data-changed="slotProps.update"/>
              </template>
            </Collapse>
            <Collapse icon="mdi-sprout" :title="$t('pageGeographicSearchPointGermplasmResultTitle')" :visible="false" class="mt-2 mb-0" no-body>
              <template v-slot:default="slotProps">
                <GermplasmTable tableMode="distance" :getData="getGermplasmData" :getIds="getGermplasmIds" ref="germplasmPointTable" orderBy="distance"  v-on:data-changed="slotProps.update"/>
              </template>
            </Collapse>
          </b-card-body>
        </b-tab>
        <b-tab @click="updatePolygonMap">
          <template v-slot:title>
            <i class="mdi mdi-18px mdi-vector-polygon" /> {{ $t('pageGeographicSearchPolygonSearchTitle') }}
          </template>
          <LocationMap selectionMode="polygon" :locations="polygonLocations" ref="polygonMap" />
          <b-card-body v-if="polygons && polygons.length > 0">
            <Collapse icon="mdi-map-marker" :title="$t('pageGeographicSearchPolygonLocationResultTitle')" :visible="false" no-body class="my-2">
              <template v-slot:default="slotProps">
                <LocationTable :getData="getLocationData" :getIds="getLocationIds" ref="locationPolygonTable"  v-on:data-changed="slotProps.update"/>
              </template>
            </Collapse>
            <Collapse icon="mdi-sprout" :title="$t('pageGeographicSearchPolygonGermplasmResultTitle')" :visible="false" class="mt-2 mb-0" no-body>
              <template v-slot:default="slotProps">
                <GermplasmTable :getData="getGermplasmData" :getIds="getGermplasmIds" ref="germplasmPolygonTable" v-on:data-changed="slotProps.update"/>
              </template>
            </Collapse>
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
import Collapse from '@/components/util/Collapse'
import GermplasmTable from '@/components/tables/GermplasmTable'
import LocationTable from '@/components/tables/LocationTable'
import PointSearchMap from '@/components/map/PointSearchMap'
import LocationMap from '@/components/map/LocationMap'
import germplasmApi from '@/mixins/api/germplasm.js'
import locationApi from '@/mixins/api/location.js'

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
    Collapse,
    GermplasmTable,
    LocationTable,
    PointSearchMap,
    LocationMap
  },
  mixins: [ germplasmApi, locationApi ],
  methods: {
    getGermplasmData: function (data, callback) {
      if (this.tabIndex === 0) {
        data.latitude = this.point.lat
        data.longitude = this.point.lng
        return this.apiPostGermplasmDistanceTable(data, callback)
      } else {
        data.polygons = this.polygons
        return this.apiPostGermplasmPolygonTable(data, callback)
      }
    },
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
    getGermplasmIds: function (data, callback) {
      if (this.tabIndex === 0) {
        return this.apiPostGermplasmDistanceTableIds(data, callback)
      } else {
        return this.apiPostGermplasmPolygonTableIds(data, callback)
      }
    },
    getLocationIds: function (data, callback) {
      if (this.tabIndex === 0) {
        return this.apiPostLocationDistanceTableIds(data, callback)
      } else {
        return this.apiPostLocationPolygonTableIds(data, callback)
      }
    },
    query: function () {
      if (this.tabIndex === 0) {
        this.point = this.$refs.pointMap.markAndGetCenter()

        if (this.point !== null) {
          this.$nextTick(() => {
            this.$refs.locationPointTable.refresh()
            this.$refs.germplasmPointTable.refresh()
          })
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
          this.$nextTick(() => {
            this.$refs.locationPolygonTable.refresh()
            this.$refs.germplasmPolygonTable.refresh()
          })
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
.map-tabs .tab-content .tab-pane {
  padding: 0;
}
</style>
