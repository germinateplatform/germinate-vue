<template>
  <div v-if="germplasm">
    <h1>{{ $t('pagePassportTitle') }}</h1>
    <hr />
    <h2 class="mdi-heading">
      <i :class="'mdi mdi-36px text-primary passport-checkbox ' + getMarkedStyle()" @click="onToggleMarked()"/>
      <span> {{ getTitle() }}</span>
      <small v-if="germplasm.entitytype">{{ germplasm.entitytype }}</small>
    </h2>
    <p v-html="$t('pagePassportText')" />
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
    <h2 class="mdi-heading">
      <i class="mdi mdi-36px text-primary mdi-image-multiple"/>
      <span>Images</span>
    </h2>
    <ImageGallery :getImages="getImages" />
    <hr />
  </div>
</template>

<script>
import Mcpd from '@/components/germplasm/Mcpd'
import LocationMap from '@/components/map/LocationMap'
import ImageGallery from '@/components/images/ImageGallery'

export default {
  data: function () {
    return {
      germplasm: null,
      germplasmId: null
    }
  },
  components: {
    ImageGallery,
    LocationMap,
    Mcpd
  },
  methods: {
    getImages: function (data, onSuccess, onError) {
      data.filter = [{
        column: 'imageForeignId',
        comparator: 'equals',
        operator: 'and',
        values: [this.germplasmId]
      }, {
        column: 'imageRefTable',
        comparator: 'equals',
        operator: 'and',
        values: ['germinatebase']
      }]
      this.apiPostImages(data, onSuccess, onError)
    },
    getLocation: function () {
      return {
        locationId: -1,
        locationLatitude: this.germplasm.declatitude,
        locationLongitude: this.germplasm.declongitude,
        locationName: this.germplasm.collsite,
        locationType: 'collectingsites',
        countryName: null,
        countryCode2: null,
        countryCode3: this.germplasm.origcty
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

    this.$store.dispatch('ON_HELP_KEY_CHANGED', 'helpPassport')
  }
}
</script>

<style scoped>
.passport-checkbox:hover {
  cursor: pointer;
}
</style>
