<template>
  <div>
    <h1>{{ $t('pageGeographicSearchTitle') }}</h1>
    <b-card no-body class="map-tabs">
      <b-tabs card
              active-nav-item-class="text-primary"
              v-model="tabIndex">
        <!-- Point search -->
        <b-tab active @click="updatePointMap">
          <template v-slot:title>
            <MdiIcon :path="mdiCrosshairsGps" /> {{ $t('pageGeographicSearchPointSearchTitle') }}
          </template>
          <b-card-body>
            <div>{{ $t('pageGeographicSearchPointSearchText') }}</div>
          </b-card-body>
          <!-- Point search map -->
          <LocationMap :locations="[]" selectionMode="point" @map-loaded="updatePolygonMap" ref="pointMap" />
          <b-card-body v-if="point">
            <Collapse :icon="mdiMapMarker" :title="$t('pageGeographicSearchPointLocationResultTitle')" :visible="false" no-body class="my-2">
              <template v-slot:content="slotProps">
                <!-- Locations ordered by distance -->
                <LocationTable tableMode="distance" :getData="getLocationData" :getIds="getLocationIds" ref="locationPointTable" orderBy="distance" v-on:data-changed="slotProps.update"/>
              </template>
            </Collapse>
            <Collapse :icon="mdiSprout" :title="$t('pageGeographicSearchPointGermplasmResultTitle')" :visible="false" class="mt-2 mb-0" no-body>
              <template v-slot:content="slotProps">
                <!-- Germplasm ordered by distance -->
                <GermplasmTable tableMode="distance" :getData="getGermplasmData" :getIds="getGermplasmIds" ref="germplasmPointTable" orderBy="distance"  v-on:data-changed="slotProps.update"/>
              </template>
            </Collapse>
          </b-card-body>
        </b-tab>
        <!-- Polygon search -->
        <b-tab @click="updatePolygonMap">
          <template v-slot:title>
            <MdiIcon :path="mdiVectorPolygon" /> {{ $t('pageGeographicSearchPolygonSearchTitle') }}
          </template>
          <b-card-body>
            <div>{{ $t('pageGeographicSearchPolygonSearchText') }}</div>
          </b-card-body>
          <!-- Polygon map -->
          <LocationMap selectionMode="polygon" :locations="polygonLocations" ref="polygonMap" />
          <b-card-body v-if="polygons && polygons.length > 0">
            <Collapse :icon="mdiMapMarker" :title="$t('pageGeographicSearchPolygonLocationResultTitle')" :visible="false" no-body class="my-2">
              <template v-slot:content="slotProps">
                <!-- Locations inside the polygons -->
                <LocationTable :getData="getLocationData" :getIds="getLocationIds" ref="locationPolygonTable"  v-on:data-changed="slotProps.update"/>
              </template>
            </Collapse>
            <Collapse :icon="mdiSprout" :title="$t('pageGeographicSearchPolygonGermplasmResultTitle')" :visible="false" class="mt-2 mb-0" no-body>
              <template v-slot:content="slotProps">
                <!-- Germplasm inside the polygons -->
                <GermplasmTable :getData="getGermplasmData" :getIds="getGermplasmIds" ref="germplasmPolygonTable" v-on:data-changed="slotProps.update"/>
              </template>
            </Collapse>
          </b-card-body>
        </b-tab>
        <template v-slot:tabs-end>
          <!-- Search button -->
          <b-nav-item href="#" @click="query" class="ml-auto text-primary bg-primary"><span class="text-white"><MdiIcon :path="mdiArrowRightBox" /> {{ $t('pageGeographicSearchButtonRun') }}</span></b-nav-item>
        </template>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import Collapse from '@/components/util/Collapse'
import GermplasmTable from '@/components/tables/GermplasmTable'
import LocationTable from '@/components/tables/LocationTable'
import LocationMap from '@/components/map/LocationMap'
import germplasmApi from '@/mixins/api/germplasm.js'
import locationApi from '@/mixins/api/location.js'

import { mdiCrosshairsGps, mdiVectorPolygon, mdiMapMarker, mdiSprout, mdiArrowRightBox } from '@mdi/js'

export default {
  data: function () {
    return {
      mdiCrosshairsGps,
      mdiVectorPolygon,
      mdiMapMarker,
      mdiSprout,
      mdiArrowRightBox,
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
    LocationMap,
    MdiIcon
  },
  watch: {
    tabIndex: function (newValue) {
      const query = Object.assign({}, this.$route.query)
      query.tabIndex = newValue

      this.$router.replace({ query })
    },
    polygons: function (newValue) {
      if (newValue && newValue.length > 0) {
        const query = Object.assign({}, this.$route.query)

        query.polygons = newValue.map(polygon => polygon.map(l => `${l.lat.toFixed(6)},${l.lng.toFixed(6)}`).join(';')).join('|')

        this.$router.replace({ query })
      }
    },
    point: function (newValue) {
      if (newValue) {
        const query = Object.assign({}, this.$route.query)
        query.latLng = `${newValue.lat.toFixed(6)},${newValue.lng.toFixed(6)}`

        this.$router.replace({ query })
      }
    }
  },
  mixins: [germplasmApi, locationApi],
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

        // Get all locations within the polygon to draw them on the map
        const allData = JSON.parse(JSON.stringify(data))
        allData.page = 1
        allData.limit = this.MAX_JAVA_INTEGER
        this.apiPostLocationPolygonTable(allData, result => {
          this.polygonLocations = result.data
        })

        // Get the actual data for the table
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
        const latlngs = this.$refs.pointMap.getLatLngs()

        if (latlngs !== null && latlngs.length > 0) {
          this.point = latlngs[0]
          this.$nextTick(() => {
            if (this.$refs.locationPointTable) {
              this.$refs.locationPointTable.refresh()
            }
            if (this.$refs.germplasmPointTable) {
              this.$refs.germplasmPointTable.refresh()
            }
          })
        } else {
          this.point = null
          this.$bvToast.toast(this.$t('toastGeographicSearchSelectPointText'), {
            title: this.$t('toastGeographicSearchSelectPointTitle'),
            variant: 'info',
            autoHideDelay: 5000,
            appendToast: true
          })
        }
      } else {
        this.polygons = this.$refs.polygonMap.getPolygons()

        if (this.polygons !== null && this.polygons.length > 0) {
          this.$nextTick(() => {
            if (this.$refs.locationPointTable) {
              this.$refs.locationPointTable.refresh()
            }
            if (this.$refs.germplasmPointTable) {
              this.$refs.germplasmPointTable.refresh()
            }
          })
        } else {
          this.$bvToast.toast(this.$t('toastGeographicSearchSelectPolygonText'), {
            title: this.$t('toastGeographicSearchSelectPolygonTitle'),
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
  },
  mounted: function () {
    if (this.$route.query) {
      if (this.$route.query.tabIndex) {
        this.tabIndex = +this.$route.query.tabIndex
      }

      if (this.$route.query.polygons) {
        const polygons = this.$route.query.polygons.split('|').map(p => p.split(';').map(l => {
          const parts = l.split(',').map(p => +(p.trim()))

          return {
            lat: parts[0],
            lng: parts[1]
          }
        }))

        if (polygons.length > 0) {
          this.$nextTick(() => this.$refs.polygonMap.setPolygons(polygons))
        }
      }

      if (this.$route.query.latLng) {
        const parts = this.$route.query.latLng.split(',').map(p => +(p.trim()))

        if (parts.length === 2) {
          const event = {
            latlng: {
              lat: parts[0],
              lng: parts[1]
            }
          }

          this.$nextTick(() => {
            // Trigger a click manually
            this.$refs.pointMap.onClick(event)
          })
        }
      }
    }
  }
}
</script>

<style>
.map-tabs .tab-content .tab-pane {
  padding: 0;
}
</style>
