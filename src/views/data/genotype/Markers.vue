<template>
  <div>
    <h1>{{ $t('pageMarkersTitle') }}</h1>
    <p>{{ $t('pageMapsText') }}</p>

    <RecentItems itemType="markers" />

    <MarkerTable :getData="getData" :getIds="getIds"/>
  </div>
</template>

<script>
import MarkerTable from '@/components/tables/MarkerTable'
import RecentItems from '@/components/util/RecentItems'
import genotypeApi from '@/mixins/api/genotype.js'

export default {
  components: {
    MarkerTable,
    RecentItems
  },
  mixins: [genotypeApi],
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
