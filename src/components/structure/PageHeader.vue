<template>
  <div>
    <div class="mb-3 my-4 d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <b-img-lazy width="48" height="48" :src="`${storeBaseUrl}image/src-svg/crop.svg`" onerror="this.onerror=null;this.src='null';" alt="Crop logo" />
        <h5 class="my-0 ml-3">{{ $t('germinateTitle') }}</h5>
      </div>
      <div class="d-flex flex-row flex-wrap justify-content-end">
        <!-- Badges for marked items -->
        <h5 v-for="itemType in Object.keys(markedItemTypes)"
            :key="`item-type-${itemType}`"
            class="d-flex align-items-stretch mx-1 marked-item-badges">
          <router-link :to="{ name: Pages.markedItemsType, params: { itemType: itemType } }" class="d-flex align-items-stretch" v-b-tooltip="`${markedItemTypes[itemType].text()}: ${storeMarkedIds[itemType].length.toLocaleString()}`">
            <b-badge :style="{ backgroundColor: markedItemTypes[itemType].color(), color: getHighContrastTextColor(markedItemTypes[itemType].color()) }">
              <MdiIcon :path="markedItemTypes[itemType].path" />
            </b-badge>
            <b-badge>{{ getNumberWithSuffix(storeMarkedIds[itemType].length, 1) }}</b-badge>
          </router-link>
          <b-badge :href="storeMarkedIds[itemType].length < 1 ? null : '#'"
                   :disabled="storeMarkedIds[itemType].length < 1"
                   @click.prevent="storeMarkedIds[itemType].length < 1 ? null : clearMarkedItems(itemType)"
                   v-b-tooltip="$t('chartTooltipMarkedItemsClear')">
            <span :class="{ 'text-danger': storeMarkedIds[itemType].length >= 1 }"><MdiIcon :path="mdiDelete" /></span>
          </b-badge>
        </h5>
      </div>
    </div>
    <hr />
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import { getHighContrastTextColor } from '@/mixins/colors'
import { getNumberWithSuffix } from '@/mixins/formatting'
import { markedItemTypes } from '@/mixins/types'
import { Pages } from '@/mixins/pages'

import { mdiDelete } from '@mdi/js'

import { mapGetters } from 'vuex'

export default {
  components: {
    MdiIcon
  },
  data: function () {
    return {
      Pages,
      markedItemTypes,
      mdiDelete
    }
  },
  computed: {
    ...mapGetters([
      'storeBaseUrl',
      'storeServerSettings',
      'storeMarkedIds'
    ])
  },
  methods: {
    getNumberWithSuffix,
    getHighContrastTextColor,
    clearMarkedItems: function (itemType) {
      // Ask for confirmation
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            this.$store.dispatch('clearMarkedIds', itemType)
          }
        })
    }
  }
}
</script>

<style scoped>
.marked-item-badges {
  white-space: nowrap;
}
.marked-item-badges a .badge:first-child {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.marked-item-badges a .badge:last-child {
  border-radius: 0;
}
.marked-item-badges a:hover {
  text-decoration: none;
}
.marked-item-badges > .badge {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
