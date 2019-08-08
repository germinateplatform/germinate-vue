<template>
  <div>
    <b-button-group class="marked-items" v-if="itemType && markedIds && markedIds[itemType]">
      <b-button @click="clear">Delete</b-button>
      <b-button><b-badge pill variant="light">{{ markedIds[itemType].length }}</b-badge></b-button>
    </b-button-group>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    itemType: {
      type: String,
      default: null
    }
  },
  computed: {
    ...mapState([
      'markedIds'
    ])
  },
  methods: {
    clear: function () {
      this.$store.dispatch('ON_MARKED_IDS_CLEAR', this.itemType)
      this.$emit('items-cleared')
    }
  }
}
</script>

<style>
.marked-items .btn {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
  border-bottom: 0;
}
</style>
