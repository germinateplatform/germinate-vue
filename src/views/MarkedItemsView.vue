<template>
  <div>
    <h1>{{ $t('pageMarkedItemsTitle') }}</h1>
    <hr/>
    <p>{{ $t('pageMarkedItemsText') }}</p>
    <b-form-radio-group
        v-model="itemTypeLocal"
        :options="options"
        button-variant="outline-primary"
        buttons />
    <div v-if="itemTypeLocal">
      <h2 class="mt-3">{{ itemTypeLocal.text() }}</h2>

      <!-- Depending on the selected type, show the corresponding table here -->
      <GermplasmTable v-show="itemTypeLocal === markedItemTypes.germplasm" :getData="getGermplasmData" :getIds="getGermplasmIds" :downloadTable="downloadGermplasm" ref="germplasmTable" />
      <MarkerTable    v-show="itemTypeLocal === markedItemTypes.markers"   :getData="getMarkerData"    :getIds="getMarkerIds"    :downloadTable="downloadMarkers"   ref="markerTable" />
      <LocationTable  v-show="itemTypeLocal === markedItemTypes.locations" :getData="getLocationData"  :getIds="getLocationIds"  :downloadTable="downloadLocations" ref="locationTable" />

      <template v-if="(itemTypeLocal === markedItemTypes.germplasm) && externalIdentifiers && (externalIdentifiers.length > 0)">
        <h3 class="mt-3">{{ $t('pageMarkedGermplasmExportTitle') }}</h3>
        <a :href="externalLink" v-if="externalLink">{{ $t('pageMarkedGermplasmExportText') }}</a> <i class="mdi mdi-open-in-new" />
      </template>
    </div>
    <h2 v-else>{{ $t('pageMarkedItemsUnknownType') }}</h2>
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
import typesMixin from '@/mixins/types.js'

export default {
  name: 'marked-item-view',
  data: function () {
    return {
      itemTypeLocal: null,
      options: [],
      externalIdentifiers: null,
      isPopup: false
    }
  },
  props: {
    itemType: {
      type: String,
      default: 'germplasm'
    }
  },
  watch: {
    itemTypeLocal: function (newValue) {
      // Update the URL
      if (this.isPopup === false) {
        if (newValue === this.markedItemTypes.germplasm) {
          window.history.replaceState({}, null, this.$router.resolve({ name: 'marked-items-type', params: { itemType: 'germplasm' } }).href)
        } else if (newValue === this.markedItemTypes.markers) {
          window.history.replaceState({}, null, this.$router.resolve({ name: 'marked-items-type', params: { itemType: 'markers' } }).href)
        } else if (newValue === this.markedItemTypes.locations) {
          window.history.replaceState({}, null, this.$router.resolve({ name: 'marked-items-type', params: { itemType: 'locations' } }).href)
        }
      }
    },
    markedGermplasm: function () {
      if (this.itemTypeLocal === this.markedItemTypes.germplasm) {
        this.$refs.germplasmTable.refresh()
        this.updateExternalIdentifiers()
      }
    },
    markedMarkers: function () {
      if (this.itemTypeLocal === this.markedItemTypes.markers) {
        this.$refs.markerTable.refresh()
      }
    },
    markedLocations: function () {
      if (this.itemTypeLocal === this.markedItemTypes.locations) {
        this.$refs.locationTable.refresh()
      }
    }
  },
  computed: {
    externalLink: function () {
      if (this.serverSettings.externalLinkTemplate) {
        return this.serverSettings.externalLinkTemplate.replace('{identifiers}', this.externalIdentifiers.join(','))
      } else {
        return null
      }
    }
  },
  components: {
    GermplasmTable,
    LocationTable,
    MarkerTable
  },
  mixins: [ germplasmApi, genotypeApi, locationApi, miscApi, typesMixin ],
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
    downloadMarkers: function (data, callback) {
      data = this.adjustFilter(data, 'markerId', 'markers')
      return this.apiPostTableExport(data, 'marker', callback)
    },
    getLocationData: function (data, callback) {
      data = this.adjustFilter(data, 'locationId', 'locations')
      return this.apiPostLocationTable(data, callback)
    },
    getLocationIds: function (data, callback) {
      data = this.adjustFilter(data, 'locationId', 'locations')
      return this.apiPostLocationTableIds(data, callback)
    },
    downloadLocations: function (data, callback) {
      data = this.adjustFilter(data, 'locationId', 'locations')
      return this.apiPostTableExport(data, 'location', callback)
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
    },
    updateExternalIdentifiers: function () {
      if (this.serverSettings && this.serverSettings.externalLinkIdentifier && this.serverSettings.externalLinkTemplate) {
        const ids = this.markedGermplasm

        if (this.serverSettings.externalLinkIdentifier !== 'id') {
          this.apiPostExternalLinkIdentifiers(ids, result => {
            this.externalIdentifiers = result
          })
        } else {
          this.externalIdentifiers = ids
        }
      }
    }
  },
  mounted: function () {
    const urlParam = this.$route.params.itemType

    if (urlParam) {
      this.itemTypeLocal = this.markedItemTypes[urlParam]
      this.isPopup = false
    } else if (this.itemType) {
      this.itemTypeLocal = this.markedItemTypes[this.itemType]
      this.isPopup = true
    }

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

    this.updateExternalIdentifiers()
  }
}
</script>

<style>

</style>
