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
import germplasmApi from '@/mixins/api/germplasm.js'

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
  mixins: [ germplasmApi ],
  methods: {
    updateChildMap: function () {
      this.$nextTick(() => this.$refs.child.invalidateSize())
    },
    updateParentMap: function () {
      this.$nextTick(() => this.$refs.parent.invalidateSize())
    },
    getGermplasm: function () {
      this.apiGetGermplasmMcpd(this.currentGermplasmId, result => {
        this.germplasm = result
      })
    },
    getGermplasmIdByName: function (name) {
      const query = {
        filter: [{
          column: 'germplasmName',
          comparator: 'equals',
          operator: 'and',
          values: [name]
        }],
        page: 1,
        limit: 1
      }
      this.apiPostGermplasmTable(query, result => {
        if (result && result.data && result.data.length > 0) {
          this.currentGermplasmId = result.data[0].germplasmId
          this.getGermplasm()
        }
      })
    }
  },
  created: function () {
    var urlParam = this.$route.params.germplasmId

    if (urlParam) {
      const int = parseInt(urlParam)

      // If it's not a number, try and check if there's an accession with this name
      if (isNaN(int)) {
        this.getGermplasmIdByName(urlParam)
      } else {
        this.currentGermplasmId = parseInt(urlParam)
      }
    } else {
      this.currentGermplasmId = this.germplasmId
    }
  },
  mounted: function () {
    if (this.currentGermplasmId) {
      this.getGermplasm()
    }
  }
}
</script>

<style>
.passport .tab-content .tab-pane {
  padding: 0;
}
</style>
