<template>
  <div>
    <h1>{{ $t('pageMarkedItemsTitle') }}</h1>
    <hr/>
    <p>{{ $t('pageMarkedItemsText') }}</p>
    <b-form-radio-group
        v-model="itemType"
        :options="options"
        button-variant="outline-primary"
        buttons />
    <div v-if="itemType">
      <h2>{{ itemType.text() }}</h2>

      <GermplasmTable v-show="itemType === markedItemTypes.germplasm" :getData="getGermplasmData" :getIds="getGermplasmIds" :downloadTable="downloadGermplasm" ref="germplasmTable" />
      <MarkerTable    v-show="itemType === markedItemTypes.markers"   :getData="getMarkerData"    :getIds="getMarkerIds"    ref="markerTable" />
      <LocationTable  v-show="itemType === markedItemTypes.locations" :getData="getLocationData"  :getIds="getLocationIds"  ref="locationTable" />
    </div>
    <h2 v-else>Unknown item type</h2>
  </div>
</template>

<script>
import GermplasmTable from '@/components/tables/GermplasmTable'
import LocationTable from '@/components/tables/LocationTable'
import MarkerTable from '@/components/tables/MarkerTable'
import germplasmApi from '@/mixins/api/germplasm.js'
import genotypeApi from '@/mixins/api/genotype.js'
import locationApi from '@/mixins/api/location.js'
import miscApi from '@/mixins/api/misc.js'

export default {
  data: function () {
    return {
      itemType: null,
      options: []
    }
  },
  watch: {
    itemType: function (newValue, oldValue) {
      if (newValue === this.markedItemTypes.germplasm) {
        window.history.replaceState({}, null, this.$router.resolve({ name: 'marked-items-type', params: { itemType: 'germplasm' } }).href)
      } else if (newValue === this.markedItemTypes.markers) {
        window.history.replaceState({}, null, this.$router.resolve({ name: 'marked-items-type', params: { itemType: 'markers' } }).href)
      } else if (newValue === this.markedItemTypes.locations) {
        window.history.replaceState({}, null, this.$router.resolve({ name: 'marked-items-type', params: { itemType: 'locations' } }).href)
      }
    },
    markedIds: {
      handler: function (newValue, oldValue) {
        if (this.itemType === this.markedItemTypes.germplasm) {
          this.$refs.germplasmTable.refresh()
        } else if (this.itemType === this.markedItemTypes.markers) {
          this.$refs.markerTable.refresh()
        } else if (this.itemType === this.markedItemTypes.locations) {
          this.$refs.locationTable.refresh()
        }
      },
      deep: true
    }
  },
  components: {
    GermplasmTable,
    LocationTable,
    MarkerTable
  },
  mixins: [ germplasmApi, genotypeApi, locationApi, miscApi ],
  methods: {
    getGermplasmData: function (data, callback) {
      data = this.adjustFilter(data, 'germplasmId', 'germplasm')
      return this.apiPostGermplasmTable(data, callback)
    },
    getGermplasmIds: function (data, callback) {
      data = this.adjustFilter(data, 'germplasmId', 'germplasm')
      return this.apiPostGermplasmTableIds(data, callback)
    },
    downloadGermplasm: function (data, callback) {
      data = this.adjustFilter(data, 'germplasmId', 'germplasm')
      return this.apiPostTableExport(data, 'germplasm', callback)
    },
    getMarkerData: function (data, callback) {
      data = this.adjustFilter(data, 'markerId', 'markers')
      return this.apiPostMarkerTable(data, callback)
    },
    getMarkerIds: function (data, callback) {
      data = this.adjustFilter(data, 'markerId', 'markers')
      return this.apiPostMarkerTableIds(data, callback)
    },
    getLocationData: function (data, callback) {
      data = this.adjustFilter(data, 'locationId', 'locations')
      return this.apiPostLocationTable(data, callback)
    },
    getLocationIds: function (data, callback) {
      data = this.adjustFilter(data, 'locationId', 'locations')
      return this.apiPostLocationTableIds(data, callback)
    },
    adjustFilter: function (data, id, type) {
      const newData = JSON.parse(JSON.stringify(data))

      if (!newData.filter) {
        newData.filter = []
      }
      newData.filter.unshift({
        column: id,
        comparator: 'inSet',
        operator: 'and',
        values: this.markedIds[type]
      })

      return newData
    }
  },
  mounted: function () {
    this.itemType = this.markedItemTypes[this.$route.params.itemType]

    this.options = [{
      value: this.markedItemTypes.germplasm,
      text: this.markedItemTypes.germplasm.text()
    }, {
      value: this.markedItemTypes.markers,
      text: this.markedItemTypes.markers.text()
    }, {
      value: this.markedItemTypes.locations,
      text: this.markedItemTypes.locations.text()
    }]
  }
}
</script>

<style>

</style>
