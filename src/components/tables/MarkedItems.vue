<template>
  <div>
    <b-button-group class="marked-items" v-if="itemType && markedIds && markedIds[itemType]">
      <b-button @click="clear" class="mdi mdi-18px mdi-delete" :disabled="markedIds[itemType].length < 1" id="marked-items-clear"/>
      <b-button @click="navigate" id="marked-items-count"><b-badge pill variant="light">{{ markedIds[itemType].length }}</b-badge></b-button>
    </b-button-group>
  </div>
</template>

<script>
export default {
  props: {
    itemType: {
      type: String,
      default: null
    }
  },
  methods: {
    navigate: function () {
      this.$router.push({ path: `/marked-items/${this.itemType}` })
    },
    clear: function () {
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
.marked-items .btn {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-top-left-radius: 0;
  border-bottom: 0;
}
</style>
