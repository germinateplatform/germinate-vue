<template>
  <div>
    <h1>{{ $t('pageMarkersTitle') }}</h1>
    <p>{{ $t('pageMapsText') }}</p>
    <MarkerTable :getData="getData" :getIds="getIds"/>
  </div>
</template>

<script>
import MarkerTable from '@/components/tables/MarkerTable'
export default {
  components: {
    MarkerTable
  },
  methods: {
    getData: function (data, callback) {
      return this.apiPostMarkerTable(data, callback)
    },
    getIds: function (data, callback) {
      return this.apiPostMarkerTableIds(data, callback)
    }
  }
}
</script>

<style>

</style>
