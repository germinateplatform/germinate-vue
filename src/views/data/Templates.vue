<template>
  <div>
  </div>
</template>

<script>
export default {
  mounted () {
    let url = ''
    if (this.$te('menuDataTemplatesURL')) {
      url = this.$t('menuDataTemplatesURL')
    }
    if (!url || url.trim() === '') {
      url = 'https://github.com/germinateplatform/germinate-data-templates'
    }
    window.location.href = url
  }
}
</script>

<style>

</style>
