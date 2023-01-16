<template>
  <b-img-lazy fluid-grow class="sidebar-logo p-3" :src="storeBaseUrl + 'image/src-svg/logo.svg'" alt="Project logo" />
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
.sidebar-logo {
  transition: opacity 0.5s linear;
}
.vsm_collapsed .sidebar-logo {
  opacity: 0;
}
</style>
