<template>
  <div>
    <b-row v-if="stats && stats.length > 0">
      <b-col :cols="4" :sm="4" :md="3" :lg="2" v-for="trait in stats" :key="`trait-stats-${trait.traitId}`" >
        <Scale :min="trait.min" :max="trait.max" :marker="trait.avg" :count="trait.count" :heading="trait.traitName" :link="{ name: 'trait-details', params: { traitId: trait.traitId } }" />
      </b-col>
    </b-row>
    <p v-else>{{ $t('toastNoDataFound') }}</p>
  </div>
</template>

<script>
import Scale from '@/components/util/Scale'
import { apiGetGermplasmStatsTraits } from '@/mixins/api/germplasm.js'
const emitter = require('tiny-emitter/instance')

export default {
  props: {
    germplasmId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      stats: null
    }
  },
  watch: {
    germplasmId: function () {
      this.update()
    }
  },
  components: {
    Scale
  },
  methods: {
    update: function () {
      apiGetGermplasmStatsTraits(this.germplasmId, result => {
        this.stats = result

        if (result) {
          this.$emit('has-data', result.length)
        } else {
          this.$emit('has-data', 0)
        }
      })
    }
  },
  mounted: function () {
    emitter.on('license-accepted', this.update)

    if (this.germplasmId) {
      this.update()
    }
  },
  beforeDestroy: function () {
    emitter.off('license-accepted', this.update)
  }
}
</script>

<style>

</style>
