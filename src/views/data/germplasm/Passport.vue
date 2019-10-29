<template>
  <div v-if="germplasm" class="passport">
    <template v-if="germplasm.entityparentid">
      <b-tabs active-nav-item-class="text-primary" v-model="tabIndex">
        <b-tab active @click="updateChildMap">
          <template v-slot:title>
            <i class="mdi mdi-18px mdi-arrow-down-bold-box-outline" /> {{ germplasm.accenumb }}
          </template>
          <SpecificPassport :germplasmId="germplasm.id" :isPopup="isPopup" ref="child"/>
        </b-tab>
        <b-tab @click="updateParentMap">
          <template v-slot:title>
            <i class="mdi mdi-18px mdi-arrow-up-bold-box-outline" /> {{ germplasm.entityparentaccenumb }}
          </template>
          <SpecificPassport :germplasmId="germplasm.entityparentid" :isPopup="isPopup" v-if="germplasm.entityparentid" ref="parent"/>
        </b-tab>
      </b-tabs>
    </template>
    <SpecificPassport :germplasmId="germplasm.id" :isPopup="isPopup" v-else/>
  </div>
</template>

<script>
import SpecificPassport from '@/components/germplasm/SpecificPassport'

export default {
  data: function () {
    return {
      currentGermplasmId: null,
      germplasm: null,
      tabIndex: 0
    }
  },
  props: {
    germplasmId: {
      type: Number,
      default: null
    },
    isPopup: {
      type: Boolean,
      default: false
    }
  },
  components: {
    SpecificPassport
  },
  methods: {
    updateChildMap: function () {
      this.$nextTick(() => this.$refs.child.invalidateSize())
    },
    updateParentMap: function () {
      this.$nextTick(() => this.$refs.parent.invalidateSize())
    }
  },
  created: function () {
    var urlParam = this.$route.params.germplasmId

    if (urlParam) {
      this.currentGermplasmId = parseInt(urlParam)
    } else {
      this.currentGermplasmId = this.germplasmId
    }
  },
  mounted: function () {
    this.apiGetGermplasmMcpd(this.currentGermplasmId, result => {
      this.germplasm = result
    })
  }
}
</script>

<style>
.passport .tab-content .tab-pane {
  padding: 0;
}
</style>
