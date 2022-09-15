<template>
  <div>
    <h1>{{ $t('pageGermplasmTitle') }}</h1>
    <hr />
    <p v-html="$t('pageGermplasmText')" />

    <GermplasmTableFilter @filtering-changed="onFilteringChanged" class="my-3" />

    <RecentItems itemType="germinatebase" />

    <!-- Table showing all germplasm -->
    <GermplasmTable :filterOn="filterOn" :getData="getData" :getIds="getIds" :downloadTable="downloadTable" @filter-changed="resetFilter" ref="germplasmTable" />

    <!-- Germplasm location map -->
    <Collapse :icon="mdiMapMarkerMultiple" :title="$t('widgetGermplasmMapTitle')" :visible="false" :showLoading="false" class="my-3" @toggle="collapseVisible = !collapseVisible" @shown="invalidateMapSize" v-if="locationDataAvailable">
      <template v-slot:content>
        <p>{{ $t('widgetGermplasmMapText') }}</p>
        <GermplasmLocationMap ref="germplasmMap" />
      </template>
    </Collapse>

    <!-- Germplasm download options -->
    <GermplasmDownload />
  </div>
</template>

<script>
import Collapse from '@/components/util/Collapse'
import GermplasmTable from '@/components/tables/GermplasmTable'
import GermplasmTableFilter from '@/components/tables/GermplasmTableFilter'
import GermplasmDownload from '@/components/germplasm/GermplasmDownload'
import GermplasmLocationMap from '@/components/map/GermplasmLocationMap'
import RecentItems from '@/components/util/RecentItems'
import { apiPostGermplasmTable, apiPostGermplasmTableIds } from '@/mixins/api/germplasm.js'
import { apiPostLocationTable } from '@/mixins/api/location.js'
import { apiPostTableExport } from '@/mixins/api/misc.js'

import { mdiMapMarkerMultiple } from '@mdi/js'

export default {
  data: function () {
    return {
      mdiMapMarkerMultiple,
      collapseVisible: false,
      filterOn: [],
      locationDataAvailable: false
    }
  },
  components: {
    Collapse,
    GermplasmTable,
    GermplasmTableFilter,
    GermplasmDownload,
    GermplasmLocationMap,
    RecentItems
  },
  methods: {
    invalidateMapSize: function () {
      this.$nextTick(() => this.$refs.germplasmMap.invalidateSize())
    },
    resetFilter: function (update) {
      if (update.filter.length === 0) {
        this.filterOn = []
      }
    },
    onFilteringChanged: function (column, type, value, operator) {
      const copy = this.filterOn.concat().filter(f => f.column.name !== column)
      if (value !== undefined && value !== null) {
        copy.push({
          column: {
            name: column,
            type: type
          },
          comparator: operator || 'equals',
          operator: 'and',
          values: [value]
        })
      }
      this.filterOn = copy

      // Update the table according to new filtering
      this.$refs.germplasmTable.refresh()
    },
    downloadTable: function (data, callback) {
      return apiPostTableExport(data, 'germplasm', callback)
    },
    getData: function (data, callback) {
      return apiPostGermplasmTable(data, callback)
    },
    getIds: function (data, callback) {
      return apiPostGermplasmTableIds(data, callback)
    }
  },
  mounted: function () {
    this.$store.dispatch('setHelpKey', 'helpGermplasm')

    // TODO: Check if location data is available
    apiPostLocationTable({
      page: 1,
      limit: 1,
      filter: [{
        column: 'locationType',
        comparator: 'equals',
        operator: 'and',
        values: ['collectingsites']
      }, {
        column: 'locationLatitude',
        comparator: 'isNotNull',
        operator: 'and',
        values: null
      }, {
        column: 'locationLongitude',
        comparator: 'isNotNull',
        operator: 'and',
        values: null
      }]
    }, result => {
      this.locationDataAvailable = result && result.data && result.data.length > 0
    })
  }
}
</script>

<style>
</style>
