<template>
  <div>
    <h1>{{ $t('pageTraitsTitle') }}</h1>
    <TraitTable :getData="getData" />
  </div>
</template>

<script>
import TraitTable from '@/components/tables/TraitTable'
import traitApi from '@/mixins/api/trait.js'

export default {
  components: {
    TraitTable
  },
  mixins: [ traitApi ],
  methods: {
    getData: function (data, callback) {
      return this.apiPostTraitTable(data, callback)
    }
  }
}
</script>

<style>

</style>
