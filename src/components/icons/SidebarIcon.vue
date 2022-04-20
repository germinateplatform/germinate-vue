<template>
  <span class="vsm--icon">
    <MdiIcon v-bind="$props" />
  </span>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'

export default {
  components: {
    MdiIcon
  },
  props: {
    path: {
      type: String,
      default: ''
    },
    rotate: {
      type: Number,
      default: null
    }
  }
}
</script>

<style>

</style>
