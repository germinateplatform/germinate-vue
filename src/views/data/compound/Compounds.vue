<template>
  <div>
    <h1>{{ $t('pageCompoundsTitle') }}</h1>
    <CompoundTable :getData="getData" />
  </div>
</template>

<script>
import CompoundTable from '@/components/tables/CompoundTable'
import { apiPostCompoundTable } from '@/mixins/api/compound.js'

export default {
  components: {
    CompoundTable
  },
  methods: {
    getData: function (data, callback) {
      return apiPostCompoundTable(data, callback)
    }
  }
}
</script>

<style>

</style>
