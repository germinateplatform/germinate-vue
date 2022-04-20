<template>
  <b-img-lazy fluid class="w-100 p-4" :src="storeBaseUrl + 'image/src-svg/logo.svg'" alt="Project logo" />
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

</style>
