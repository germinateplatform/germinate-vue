<template>
  <div>
    <h1>{{ $t('pageMarkersTitle') }}</h1>
    <hr />
    <p>{{ $t('pageMapsText') }}</p>

    <RecentItems itemType="markers" />

    <MarkerTable :getData="getData" :getIds="getIds"/>
  </div>
</template>

<script>
import MarkerTable from '@/components/tables/MarkerTable'
import RecentItems from '@/components/util/RecentItems'
import { apiPostMarkerTable, apiPostMarkerTableIds } from '@/mixins/api/genotype.js'

export default {
  components: {
    MarkerTable,
    RecentItems
  },
  methods: {
    getData: function (data, callback) {
      return apiPostMarkerTable(data, callback)
    },
    getIds: function (data, callback) {
      return apiPostMarkerTableIds(data, callback)
    }
  }
}
</script>

<style>

</style>
