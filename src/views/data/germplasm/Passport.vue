<template>
  <div>
    <h1 class="mdi-heading">
      <i :class="'mdi mdi-36px text-primary passport-checkbox ' + getMarkedStyle()" @click="onToggleMarked()"/>
      <span> Passport</span>
    </h1>
    <hr />
    <b-row>
      <b-col cols=12 lg=6>
        <Mcpd :germplasmId="$route.params.germplasmId"/>
      </b-col>
    </b-row>
    <hr />
  </div>
</template>

<script>
import Mcpd from '@/components/germplasm/Mcpd'
import { mapState } from 'vuex'

export default {
  data: function () {
    return {
      germplasmId: null
    }
  },
  computed: {
    ...mapState([
      'markedIds'
    ])
  },
  components: {
    Mcpd
  },
  methods: {
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
  }
}
</script>

<style scoped>
.passport-checkbox:hover {
  cursor: pointer;
}
</style>
