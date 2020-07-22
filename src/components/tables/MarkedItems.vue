<template>
  <div>
    <b-button-group class="marked-items" v-if="itemType && markedIds && markedIds[itemType]">
      <!-- Button to clear the marked items -->
      <b-button @click="clear" class="mdi mdi-18px mdi-delete" :disabled="markedIds[itemType].length < 1" id="marked-items-clear" v-b-tooltip.hover :title="$t('tooltipTableMarkedItemsClear')"/>
      <!-- Button to navigate to the  -->

      <b-button v-if="showPopup" id="marked-items-count" v-b-tooltip.hover :title="$t('tooltipTableMarkedItems')" @click="$refs.markedItemModal.show()"><b-badge pill variant="light">{{ markedIds[itemType].length }}</b-badge></b-button>
      <b-button :to="{ name: 'marked-items-type', params: { itemType: itemType } }" id="marked-items-count" v-b-tooltip.hover :title="$t('tooltipTableMarkedItems')" v-else><b-badge pill variant="light">{{ markedIds[itemType].length }}</b-badge></b-button>
    </b-button-group>

    <b-modal ok-only :ok-title="$t('buttonClose')" v-if="showPopup" ref="markedItemModal" size="xl">
      <MarkedItemsView :itemType="itemType" />
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'marked-items',
  props: {
    itemType: {
      type: String,
      default: null
    }
  },
  computed: {
    showPopup: function () {
      // Are we on the marked item page?
      if (this.$router.currentRoute.name === 'marked-items' || this.$router.currentRoute.name === 'marked-items-type') {
        return false
      }

      // Else, check if any of our parents is of the same type, hence recursive element.
      let current = this.$parent
      while (current !== null && current !== undefined) {
        if (current.$options.name === 'marked-items') {
          return false
        }

        current = current.$parent
      }

      // Otherwise it's safe to show the popup.
      return true
    }
  },
  components: {
    MarkedItemsView: () => import('@/views/MarkedItemsView')
  },
  methods: {
    clear: function () {
      // Ask for confirmation
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            this.$store.dispatch('ON_MARKED_IDS_CLEAR', this.itemType)
          }
        })
    }
  }
}
</script>

<style>
</style>
