<template>
  <div v-if="recentItems && recentItems.length > 0" class="mb-3">
    <h3>{{ $t('widgetRecentItemsTitle') }}</h3>
    <b-badge v-for="item in getItems"
            :key="`recent-items-${itemType}-${item[groupTypes[itemType].idColumn]}`"
            :to="getLink(item[groupTypes[itemType].idColumn])"
            class="mr-1">
      {{ item[groupTypes[itemType].nameColumn] }}
    </b-badge>
    <b-badge href="#" variant="danger" @click.prevent="clearItems"><i class="mdi mdi-delete" /> {{ $t('genericClear')}}</b-badge>
  </div>
</template>

<script>
import germplasmApi from '@/mixins/api/germplasm.js'
import genotypeApi from '@/mixins/api/genotype.js'
import typesMixin from '@/mixins/types.js'

export default {
  props: {
    itemType: {
      type: String,
      default: 'germinatebase'
    }
  },
  data: function () {
    return {
      recentItems: null
    }
  },
  watch: {
    itemType: function () {
      this.update()
    },
    recentIds: {
      deep: true,
      handler: function () {
        this.update()
      }
    }
  },
  computed: {
    getItems: function () {
      // Return them in the reverse order that they were visited in
      return this.recentIds[this.groupTypes[this.itemType].itemType].map(id => {
        return this.recentItems.filter(item => {
          return item[this.groupTypes[this.itemType].idColumn] === id
        })[0]
      }).reverse()
    }
  },
  mixins: [germplasmApi, genotypeApi, typesMixin],
  methods: {
    clearItems: function () {
      this.$store.dispatch('ON_RECENT_IDS_CLEAR', this.groupTypes[this.itemType].itemType)
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
          values: this.recentIds.markers
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
          values: this.recentIds.germplasm
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
