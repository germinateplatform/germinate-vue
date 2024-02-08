<template>
  <div>
    <h1>{{ $t('pageGermplasmTitle') }}</h1>
    <hr />
    <p v-html="$t('pageGermplasmText')" />

    <GermplasmTableComponent />

    <!-- Germplasm location map -->
    <Collapse :icon="mdiMapMarkerMultiple" :title="$t('widgetGermplasmMapTitle')" :visible="collapseVisible" :showLoading="false" class="my-3" @toggle="collapseVisible = !collapseVisible" @shown="invalidateMapSize" v-if="locationDataAvailable">
      <template v-slot:content>
        <p>{{ $t('widgetGermplasmMapText') }}</p>
        <GermplasmLocationMap ref="germplasmMap" />
      </template>
    </Collapse>

    <!-- Germplasm download options -->
    <GermplasmDownload />
  </div>
</template>

<script>
import Collapse from '@/components/util/Collapse'
import GermplasmDownload from '@/components/germplasm/GermplasmDownload'
import GermplasmLocationMap from '@/components/map/GermplasmLocationMap'
import GermplasmTableComponent from '@/components/germplasm/GermplasmTableComponent'
import { apiPostLocationTable } from '@/mixins/api/location.js'
import { mdiMapMarkerMultiple } from '@mdi/js'

export default {
  data: function () {
    return {
      mdiMapMarkerMultiple,
      collapseVisible: false,
      locationDataAvailable: false
    }
  },
  components: {
    Collapse,
    GermplasmDownload,
    GermplasmLocationMap,
    GermplasmTableComponent
  },
  watch: {
    collapseVisible: function (newValue) {
      this.updateCollapseVisibleUrl(newValue)
    }
  },
  methods: {
    updateCollapseVisibleUrl: async function (newValue) {
      const query = Object.assign({}, this.$route.query)
      if (newValue) {
        query.mapExpanded = true
      } else {
        query.mapExpanded = false
      }

      await this.$router.replace({ query })
    },
    invalidateMapSize: function () {
      this.$nextTick(() => this.$refs.germplasmMap.invalidateSize())
    }
  },
  mounted: function () {
    this.$store.dispatch('setHelpKey', 'helpGermplasm')

    // TODO: Check if location data is available
    apiPostLocationTable({
      page: 1,
      limit: 1,
      filter: [{
        column: 'locationType',
        comparator: 'equals',
        operator: 'and',
        values: ['collectingsites']
      }, {
        column: 'locationLatitude',
        comparator: 'isNotNull',
        operator: 'and',
        values: null
      }, {
        column: 'locationLongitude',
        comparator: 'isNotNull',
        operator: 'and',
        values: null
      }]
    }, result => {
      this.locationDataAvailable = result && result.data && result.data.length > 0

      if (this.$route.query && this.$route.query.mapExpanded === 'true') {
        this.collapseVisible = true
      }
    })
  }
}
</script>

<style>
</style>
