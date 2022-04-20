<template>
  <div v-if="recentItems && recentItems.length > 0" class="mb-3">
    <h3>{{ $t('widgetRecentItemsTitle') }}</h3>
    <b-badge v-for="item in getItems"
            :key="`recent-items-${itemType}-${item[groupTypes[itemType].idColumn]}`"
            :to="getLink(item[groupTypes[itemType].idColumn])"
            class="mr-1">
      {{ item[groupTypes[itemType].nameColumn] }}
    </b-badge>
    <b-badge href="#" variant="danger" @click.prevent="clearItems"><MdiIcon :path="mdiDelete" /> {{ $t('genericClear')}}</b-badge>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import MdiIcon from '@/components/icons/MdiIcon'

import germplasmApi from '@/mixins/api/germplasm'
import genotypeApi from '@/mixins/api/genotype'
import typesMixin from '@/mixins/types'

import { mdiDelete } from '@mdi/js'

export default {
  components: {
    MdiIcon
  },
  props: {
    itemType: {
      type: String,
      default: 'germinatebase'
    }
  },
  data: function () {
    return {
      mdiDelete,
      recentItems: null
    }
  },
  watch: {
    itemType: function () {
      this.update()
    },
    storeRecentIds: {
      deep: true,
      handler: function () {
        this.update()
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeRecentIds'
    ]),
    getItems: function () {
      // Return them in the reverse order that they were visited in
      return this.storeRecentIds[this.groupTypes[this.itemType].itemType].map(id => {
        return this.recentItems.filter(item => {
          return item[this.groupTypes[this.itemType].idColumn] === id
        })[0]
      }).reverse()
    }
  },
  mixins: [germplasmApi, genotypeApi, typesMixin],
  methods: {
    clearItems: function () {
      this.$store.dispatch('clearRecentIds', this.groupTypes[this.itemType].itemType)
    },
    getLink: function (id) {
      switch (this.itemType) {
        case 'germinatebase':
          return { name: 'passport', params: { germplasmId: id } }
        case 'markers':
          return { name: 'marker', params: { markerId: id } }
      }
    },
    update: function () {
      switch (this.itemType) {
        case 'germinatebase':
          this.updateGermplasm()
          break
        case 'markers':
          this.updateMarkers()
          break
      }
    },
    updateMarkers: function () {
      const query = {
        filter: [{
          column: 'markerId',
          comparator: 'inSet',
          operator: 'and',
          values: this.storeRecentIds.markers
        }]
      }

      this.apiPostMarkerTable(query, result => {
        if (result && result.data) {
          this.recentItems = result.data
        }
      })
    },
    updateGermplasm: function () {
      const query = {
        filter: [{
          column: 'germplasmId',
          comparator: 'inSet',
          operator: 'and',
          values: this.storeRecentIds.germplasm
        }]
      }

      this.apiPostGermplasmTable(query, result => {
        if (result && result.data) {
          this.recentItems = result.data
        }
      })
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>

</style>
