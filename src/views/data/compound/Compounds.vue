<template>
  <div>
    <h1>{{ $t('pageCompoundsTitle') }}</h1>
    <CompoundTable :getData="getData" />
  </div>
</template>

<script>
import CompoundTable from '@/components/tables/CompoundTable'
export default {
  components: {
    CompoundTable
  },
  methods: {
    getData: function (data, callback) {
      return this.apiPostCompoundTable(data, callback)
    }
  }
}
</script>

<style>

</style>
