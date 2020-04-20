<template>
  <div>
    <template v-if="climates && climates.length > 0">
      <h3>{{ $t('pageLocationsMapsClimateOverlaysTitle') }}</h3>
      <p>{{ $t('pageLocationsMapsClimateOverlaysText') }}</p>
      <!-- Possible climate overlays for the maps -->
      <b-form-select v-model="climate" :options="climateOptions" class="mb-3" />
    </template>

    <LocationMap :imageOverlays="climateImageOverlays" :locations="[]" class="mb-3" ref="map" />
  </div>
</template>

<script>
import LocationMap from '@/components/map/LocationMap'
import climateApi from '@/mixins/api/climate.js'

export default {
  data: function () {
    return {
      climate: null,
      climates: [],
      climateOptions: [{
        value: null,
        text: this.$t('pageLocationsMapsClimateOverlaysSelectText')
      }],
      climateImageOverlays: []
    }
  },
  watch: {
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
    LocationMap
  },
  mixins: [ climateApi ],
  methods: {
    invalidateSize: function () {
      this.$refs.map.invalidateSize()
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
