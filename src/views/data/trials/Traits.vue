<template>
  <div>
    <h1>{{ $t('pageTraitsTitle') }}</h1>
    <TraitTable :getData="getData" />
  </div>
</template>

<script>
import TraitTable from '@/components/tables/TraitTable'
export default {
  components: {
    TraitTable
  },
  methods: {
    getData: function (data, callback) {
      return this.apiPostTraitTable(data, callback)
    }
  }
}
</script>

<style>

</style>
