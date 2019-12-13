<template>
  <div>
    <h1>{{ $t('pageCompoundsTitle') }}</h1>
    <CompoundTable :getData="getData" />
  </div>
</template>

<script>
import CompoundTable from '@/components/tables/CompoundTable'
import compoundApi from '@/mixins/api/compound.js'

export default {
  components: {
    CompoundTable
  },
  mixins: [ compoundApi ],
  methods: {
    getData: function (data, callback) {
      return this.apiPostCompoundTable(data, callback)
    }
  }
}
</script>

<style>

</style>
