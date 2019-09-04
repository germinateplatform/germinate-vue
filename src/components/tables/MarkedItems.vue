<template>
  <div>
    <b-button-group class="marked-items" v-if="itemType && markedIds && markedIds[itemType]">
      <b-button @click="clear" class="mdi mdi-18px mdi-delete" />
      <b-button><b-badge pill variant="light">{{ markedIds[itemType].length }}</b-badge></b-button>
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
    clear: function () {
      this.$store.dispatch('ON_MARKED_IDS_CLEAR', this.itemType)
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
