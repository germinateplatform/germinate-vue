<template>
  <div>
    <h1>{{ $t('pageClimatesTitle') }}</h1>
    <ClimateTable :getData="getData" />
  </div>
</template>

<script>
import ClimateTable from '@/components/tables/ClimateTable'
import { apiPostClimateTable } from '@/mixins/api/climate.js'

export default {
  components: {
    ClimateTable
  },
  methods: {
    getData: function (data, callback) {
      return apiPostClimateTable(data, callback)
    }
  }
}
</script>

<style>

</style>
