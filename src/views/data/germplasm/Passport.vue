<template>
  <div>
    <h3 v-if="noGermplasmFound">{{ $t('headingNoData') }}</h3>
    <div v-else-if="germplasm" class="passport">
      <!-- If there is a parent entity, show both as tabs -->
      <template v-if="germplasm.entityparentid">
        <b-tabs active-nav-item-class="text-primary" v-model="tabIndex">
          <!-- Entity child -->
          <b-tab active @click="updateChildMap">
            <template v-slot:title>
              <MdiIcon :path="mdiArrowDownBoldBoxOutline" /> {{ germplasm.accenumb }}
            </template>
            <!-- Passport -->
            <SpecificPassport :germplasmId="germplasm.id" :isPopup="isPopup" ref="child"/>
          </b-tab>
          <!-- Entity parent -->
          <b-tab @click="updateParentMap">
            <template v-slot:title>
              <MdiIcon :path="mdiArrowUpBoldBoxOutline" /> {{ germplasm.entityparentaccenumb }}
            </template>
            <!-- Passport -->
            <SpecificPassport :germplasmId="germplasm.entityparentid" :isPopup="isPopup" v-if="germplasm.entityparentid" ref="parent"/>
          </b-tab>
        </b-tabs>
      </template>
      <!-- Else, just show this one individually -->
      <SpecificPassport :germplasmId="germplasm.id" :isPopup="isPopup" v-else/>
    </div>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import SpecificPassport from '@/components/germplasm/SpecificPassport'
import { apiGetGermplasmMcpd, apiPostGermplasmTable } from '@/mixins/api/germplasm'

import { mdiArrowDownBoldBoxOutline, mdiArrowUpBoldBoxOutline } from '@mdi/js'

export default {
  data: function () {
    return {
      mdiArrowDownBoldBoxOutline,
      mdiArrowUpBoldBoxOutline,
      currentGermplasmId: null,
      noGermplasmFound: false,
      urlParam: null,
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
    MdiIcon,
    SpecificPassport
  },
  methods: {
    updateChildMap: function () {
      this.$nextTick(() => this.$refs.child.invalidateSize())
    },
    updateParentMap: function () {
      this.$nextTick(() => this.$refs.parent.invalidateSize())
    },
    getGermplasm: function () {
      apiGetGermplasmMcpd(this.currentGermplasmId, result => {
        this.germplasm = result
        this.noGermplasmFound = result === null
      })
    },
    getGermplasmIdByName: function (name) {
      const query = {
        filter: [{
          column: 'germplasmName',
          comparator: 'equals',
          operator: 'or',
          values: [name]
        }, {
          column: 'germplasmDisplayName',
          comparator: 'equals',
          operator: 'or',
          values: [name]
        }, {
          column: 'germplasmPuid',
          comparator: 'equals',
          operator: 'or',
          values: [name]
        }],
        page: 1,
        limit: 1
      }
      apiPostGermplasmTable(query, result => {
        if (result && result.data && result.data.length > 0) {
          this.currentGermplasmId = result.data[0].germplasmId
          this.getGermplasm()
        } else {
          this.noGermplasmFound = true
        }
      })
    }
  },
  created: function () {
    this.urlParam = this.$route.params.germplasmId

    if (this.urlParam) {
      // If it's not a number, try and check if there's an accession with this name
      if (isNaN(this.urlParam)) {
        this.getGermplasmIdByName(this.urlParam)
      } else {
        this.currentGermplasmId = parseInt(this.urlParam)
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
