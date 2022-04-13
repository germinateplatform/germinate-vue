<template>
  <div>
    <h1>{{ $t('pageClimatesTitle') }}</h1>
    <ClimateTable :getData="getData" />
  </div>
</template>

<script>
import ClimateTable from '@/components/tables/ClimateTable'
import climateApi from '@/mixins/api/climate.js'

export default {
  components: {
    ClimateTable
  },
  mixins: [climateApi],
  methods: {
    getData: function (data, callback) {
      return this.apiPostClimateTable(data, callback)
    }
  }
}
</script>

<style>

</style>
