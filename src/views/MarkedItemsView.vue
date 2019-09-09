<template>
  <div>
    <h1>Marked items</h1>
    <b-form-radio-group
        v-model="itemType"
        :options="options"
        button-variant="outline-primary"
        buttons />
    <div v-if="itemType">
      <h2>{{ itemType.text() }}</h2>

      <GermplasmTable v-show="itemType === markedItemTypes.germplasm" :getData="getGermplasmData" :getIds="getGermplasmIds" />
      <MarkerTable    v-show="itemType === markedItemTypes.markers"   :getData="getMarkerData"    :getIds="getMarkerIds"/>
      <LocationsTable v-show="itemType === markedItemTypes.locations" :getData="getLocationData"  :getIds="getLocationIds"/>
    </div>
    <h2 v-else>Unknown item type</h2>
  </div>
</template>

<script>
import GermplasmTable from '@/components/tables/GermplasmTable'
import LocationsTable from '@/components/tables/LocationsTable'
import MarkerTable from '@/components/tables/MarkerTable'

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
        window.history.replaceState({}, null, '#/marked-items/germplasm')
      } else if (newValue === this.markedItemTypes.markers) {
        window.history.replaceState({}, null, '#/marked-items/markers')
      } else if (newValue === this.markedItemTypes.locations) {
        window.history.replaceState({}, null, '#/marked-items/locations')
      }
    }
  },
  components: {
    GermplasmTable,
    LocationsTable,
    MarkerTable
  },
  methods: {
    getGermplasmData: function (data, callback) {
      this.adjustFilter(data, 'germplasmId', 'germplasm')
      return this.apiPostGermplasmTable(data, callback)
    },
    getGermplasmIds: function (data, callback) {
      this.adjustFilter(data, 'germplasmId', 'germplasm')
      return this.apiPostGermplasmTableIds(data, callback)
    },
    getMarkerData: function (data, callback) {
      this.adjustFilter(data, 'markerId', 'markers')
      return this.apiPostMarkerTable(data, callback)
    },
    getMarkerIds: function (data, callback) {
      this.adjustFilter(data, 'markerId', 'markers')
      return this.apiPostMarkerTableIds(data, callback)
    },
    getLocationData: function (data, callback) {
      this.adjustFilter(data, 'locationId', 'locations')
      return this.apiPostLocationTable(data, callback)
    },
    getLocationIds: function (data, callback) {
      this.adjustFilter(data, 'locationId', 'locations')
      return this.apiPostLocationTableIds(data, callback)
    },
    adjustFilter: function (data, id, type) {
      if (!data.filter) {
        data.filter = []
      }
      data.filter.unshift({
        column: id,
        comparator: 'inSet',
        operator: 'and',
        values: this.markedIds[type]
      })
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
