<template>
  <b-img-lazy fluid class="sidebar-logo w-100 p-3" :src="storeBaseUrl + 'image/src-svg/logo.svg'" alt="Project logo" />
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters([
      'storeBaseUrl'
    ])
  }
}
</script>

<style>
.vsm_collapsed .sidebar-logo {
  display: none;
}
</style>
