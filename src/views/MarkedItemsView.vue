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
        <a :href="externalLink" v-if="externalLink">{{ $t('pageMarkedGermplasmExportText') }}</a> <MdiIcon :path="mdiOpenInNew" />
      </template>
    </div>
    <h2 v-else>{{ $t('pageMarkedItemsUnknownType') }}</h2>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MdiIcon from '@/components/icons/MdiIcon'
import GermplasmTable from '@/components/tables/GermplasmTable'
import LocationTable from '@/components/tables/LocationTable'
import MarkerTable from '@/components/tables/MarkerTable'
import { apiPostGermplasmTable, apiPostGermplasmTableIds, apiPostExternalLinkIdentifiers } from '@/mixins/api/germplasm'
import { apiPostMarkerTable, apiPostMarkerTableIds } from '@/mixins/api/genotype'
import { apiPostLocationTable, apiPostLocationTableIds } from '@/mixins/api/location'
import { apiPostTableExport } from '@/mixins/api/misc'
import { markedItemTypes } from '@/mixins/types'

import { mdiOpenInNew } from '@mdi/js'
import { Pages } from '@/mixins/pages'

export default {
  name: 'marked-item-view',
  data: function () {
    return {
      markedItemTypes,
      mdiOpenInNew,
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
        if (newValue === markedItemTypes.germplasm) {
          window.history.replaceState({}, null, this.$router.resolve({ name: Pages.markedItemsType, params: { itemType: 'germplasm' } }).href)
        } else if (newValue === markedItemTypes.markers) {
          window.history.replaceState({}, null, this.$router.resolve({ name: Pages.markedItemsType, params: { itemType: 'markers' } }).href)
        } else if (newValue === markedItemTypes.locations) {
          window.history.replaceState({}, null, this.$router.resolve({ name: Pages.markedItemsType, params: { itemType: 'locations' } }).href)
        }
      }
    },
    storeMarkedGermplasm: function () {
      if (this.itemTypeLocal === markedItemTypes.germplasm) {
        this.$refs.germplasmTable.refresh()
        this.updateExternalIdentifiers()
      }
    },
    storeMarkedMarkers: function () {
      if (this.itemTypeLocal === markedItemTypes.markers) {
        this.$refs.markerTable.refresh()
      }
    },
    storeMarkedLocations: function () {
      if (this.itemTypeLocal === markedItemTypes.locations) {
        this.$refs.locationTable.refresh()
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeServerSettings',
      'storeMarkedGermplasm',
      'storeMarkedMarkers',
      'storeMarkedLocations',
      'storeMarkedIds'
    ]),
    externalLink: function () {
      if (this.storeServerSettings.externalLinkTemplate) {
        return this.storeServerSettings.externalLinkTemplate.replace('{identifiers}', this.externalIdentifiers.join(','))
      } else {
        return null
      }
    }
  },
  components: {
    GermplasmTable,
    LocationTable,
    MarkerTable,
    MdiIcon
  },
  methods: {
    getGermplasmData: function (data, callback) {
      data = this.adjustFilter(data, 'germplasmId', 'germplasm')
      return apiPostGermplasmTable(data, callback)
    },
    getGermplasmIds: function (data, callback) {
      data = this.adjustFilter(data, 'germplasmId', 'germplasm')
      return apiPostGermplasmTableIds(data, callback)
    },
    downloadGermplasm: function (data, callback) {
      data = this.adjustFilter(data, 'germplasmId', 'germplasm')
      return apiPostTableExport(data, 'germplasm', callback)
    },
    getMarkerData: function (data, callback) {
      data = this.adjustFilter(data, 'markerId', 'markers')
      return apiPostMarkerTable(data, callback)
    },
    getMarkerIds: function (data, callback) {
      data = this.adjustFilter(data, 'markerId', 'markers')
      return apiPostMarkerTableIds(data, callback)
    },
    downloadMarkers: function (data, callback) {
      data = this.adjustFilter(data, 'markerId', 'markers')
      return apiPostTableExport(data, 'marker', callback)
    },
    getLocationData: function (data, callback) {
      data = this.adjustFilter(data, 'locationId', 'locations')
      return apiPostLocationTable(data, callback)
    },
    getLocationIds: function (data, callback) {
      data = this.adjustFilter(data, 'locationId', 'locations')
      return apiPostLocationTableIds(data, callback)
    },
    downloadLocations: function (data, callback) {
      data = this.adjustFilter(data, 'locationId', 'locations')
      return apiPostTableExport(data, 'location', callback)
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
        values: this.storeMarkedIds[type]
      })

      return newData
    },
    updateExternalIdentifiers: function () {
      if (this.storeServerSettings && this.storeServerSettings.externalLinkIdentifier && this.storeServerSettings.externalLinkTemplate) {
        const ids = this.storeMarkedGermplasm

        if (this.storeServerSettings.externalLinkIdentifier !== 'id') {
          apiPostExternalLinkIdentifiers(ids, result => {
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
      this.itemTypeLocal = markedItemTypes[urlParam]
      this.isPopup = false
    } else if (this.itemType) {
      this.itemTypeLocal = markedItemTypes[this.itemType]
      this.isPopup = true
    }

    this.options = [{
      value: markedItemTypes.germplasm,
      text: markedItemTypes.germplasm.text()
    }, {
      value: markedItemTypes.markers,
      text: markedItemTypes.markers.text()
    }, {
      value: markedItemTypes.locations,
      text: markedItemTypes.locations.text()
    }]

    this.updateExternalIdentifiers()
  }
}
</script>

<style>

</style>
