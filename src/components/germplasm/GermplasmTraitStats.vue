<template>
  <div>
    <b-row v-if="stats && stats.length > 0">
      <b-col :cols="6" :sm="4" :md="3" :lg="2" :xl="1" v-for="trait in stats" :key="`trait-stats-${trait.traitId}`" >
        <Scale :min="trait.min" :max="trait.max" :marker="trait.avg" :count="trait.count" :heading="trait.traitName" />
      </b-col>
    </b-row>
    <p v-else>{{ $t('toastNoDataFound') }}</p>
  </div>
</template>

<script>
import Scale from '@/components/util/Scale'
import germplasmApi from '@/mixins/api/germplasm.js'

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
  mixins: [ germplasmApi ],
  methods: {
    update: function () {
      this.apiGetGermplasmStatsTraits(this.germplasmId, result => {
        this.stats = result

        this.$emit('has-data', result && (result.length > 0))
      })
    }
  },
  mounted: function () {
    if (this.germplasmId) {
      this.update()
    }
  }
}
</script>

<style>

</style>
