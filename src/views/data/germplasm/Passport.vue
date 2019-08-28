<template>
  <div v-if="germplasm">
    <h1>Passport</h1>
    <hr />
    <h2 class="mdi-heading">
      <i :class="'mdi mdi-36px text-primary passport-checkbox ' + getMarkedStyle()" @click="onToggleMarked()"/>
      <span> {{ getTitle() }}</span>
      <small v-if="germplasm.entitytype">{{ germplasm.entitytype }}</small>
    </h2>
    <b-row>
      <b-col cols=12 lg=6>
        <Mcpd :germplasm="germplasm"/>
      </b-col>
    </b-row>
    <b-row v-if="germplasm.declatitude && germplasm.declongitude">
      <b-col cols=12>
        <LocationMap :locations="[getLocation()]" />
      </b-col>
    </b-row>
    <hr />
  </div>
</template>

<script>
import Mcpd from '@/components/germplasm/Mcpd'
import LocationMap from '@/components/map/LocationMap'
import { mapState } from 'vuex'

export default {
  data: function () {
    return {
      germplasm: null,
      germplasmId: null
    }
  },
  computed: {
    ...mapState([
      'markedIds'
    ])
  },
  components: {
    LocationMap,
    Mcpd
  },
  methods: {
    getLocation: function () {
      return {
        locationid: -1,
        latitude: this.germplasm.declatitude,
        longitude: this.germplasm.declongitude,
        collsite: this.germplasm.collsite,
        country: {
          countryid: -1,
          code3: this.germplasm.origcty
        }
      }
    },
    getTitle: function () {
      var parts = []
      parts.push(this.germplasm.accenumb)
      parts.push(this.germplasm.accename)

      return parts.filter(p => p !== null).join(' / ')
    },
    getMarkedStyle: function () {
      const isMarked = this.markedIds.germplasm.indexOf(this.germplasmId) !== -1
      return isMarked ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'
    },
    onToggleMarked: function () {
      const isMarked = this.markedIds.germplasm.indexOf(this.germplasmId) !== -1
      if (isMarked) {
        this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: 'germplasm', ids: [this.germplasmId] })
      } else {
        this.$store.dispatch('ON_MARKED_IDS_ADD', { type: 'germplasm', ids: [this.germplasmId] })
      }
    }
  },
  mounted: function () {
    this.germplasmId = parseInt(this.$route.params.germplasmId)

    this.apiGetGermplasmMcpd(this.germplasmId, result => {
      this.germplasm = result
    })
  }
}
</script>

<style scoped>
.passport-checkbox:hover {
  cursor: pointer;
}
</style>
