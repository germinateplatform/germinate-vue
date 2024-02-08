<template>
  <div>
    <GermplasmTableFilter @filtering-changed="onFilteringChanged" class="my-3" />
    <RecentItems itemType="germinatebase" />
    <!-- Table showing all germplasm -->
    <GermplasmTable :filterOn="filterOn" :getData="getData" :getIds="getIds" :downloadTable="downloadFunction" @filter-changed="resetFilter" ref="germplasmTable" />
  </div>
</template>

<script>
import GermplasmTable from '@/components/tables/GermplasmTable'
import GermplasmTableFilter from '@/components/tables/GermplasmTableFilter'
import RecentItems from '@/components/util/RecentItems'

import { apiPostGermplasmTable, apiPostGermplasmTableIds } from '@/mixins/api/germplasm.js'
import { apiPostTableExport } from '@/mixins/api/misc.js'

export default {
  components: {
    GermplasmTable,
    GermplasmTableFilter,
    RecentItems
  },
  props: {
    download: {
      type: Function
    }
  },
  data: function () {
    return {
      filterOn: []
    }
  },
  computed: {
    downloadFunction: function () {
      if (this.download) {
        return this.download
      } else {
        return this.downloadTable
      }
    }
  },
  methods: {
    resetFilter: function (update) {
      if (update.filter.length === 0) {
        this.filterOn = []
      }
    },
    onFilteringChanged: function (filters) {
      let copy = this.filterOn.concat().filter(f => !filters.some(ff => ff.column.name === f.column.name))
      copy = copy.concat(filters)
      this.filterOn = copy
      this.$refs.germplasmTable.refresh()
    },
    downloadTable: function (data, callback) {
      return apiPostTableExport({ filter: data.filter }, 'germplasm', callback)
    },
    getData: function (data, callback) {
      return apiPostGermplasmTable(data, callback)
    },
    getIds: function (data, callback) {
      return apiPostGermplasmTableIds(data, callback)
    }
  }
}
</script>

<style>

</style>
