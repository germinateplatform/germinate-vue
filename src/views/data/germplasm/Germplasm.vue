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
    <Collapse icon="mdi-map-marker-multiple" :title="$t('widgetGermplasmMapTitle')" :visible="false" :showLoading="false" class="my-3" @toggle="collapseVisible = !collapseVisible">
      <template v-slot:content>
        <p>{{ $t('widgetGermplasmMapText') }}</p>
        <GermplasmLocationMap :locations="germplasmLocations" :germplasmData="germplasm" ref="germplasmMap" />
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
import germplasmApi from '@/mixins/api/germplasm.js'
import locationApi from '@/mixins/api/location.js'
import miscApi from '@/mixins/api/misc.js'

export default {
  data: function () {
    return {
      collapseVisible: false,
      filterOn: [],
      germplasmLocations: null,
      germplasm: null
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
  mixins: [ germplasmApi, locationApi, miscApi ],
  watch: {
    collapseVisible: function (newValue) {
      if (newValue && !this.germplasm || !this.germplasmLocations) {
        this.getGermplasmMapData()

        this.$refs.germplasmMap.invalidateSize()
      }
    }
  },
  methods: {
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
      return this.apiPostTableExport(data, 'germplasm', callback)
    },
    getData: function (data, callback) {
      return this.apiPostGermplasmTable(data, callback)
    },
    getIds: function (data, callback) {
      return this.apiPostGermplasmTableIds(data, callback)
    },
    getGermplasmMapData: function () {
      this.apiPostLocationTable({
        page: 1,
        limit: this.MAX_JAVA_INTEGER,
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
        if (result && result.data && result.data.length > 0) {
          const locations = result.data
          Object.freeze(locations)
          this.germplasmLocations = locations
        } else {
          this.germplasmLocations = []
        }
      })

      this.apiPostGermplasmTable({
        page: 1,
        limit: this.MAX_JAVA_INTEGER,
        filter: [{
          column: 'locationId',
          comparator: 'isNotNull',
          operator: 'and',
          values: null
        }]
      }, result => {
        if (result && result.data && result.data.length > 0) {
          const data = result.data
          Object.freeze(data)
          this.germplasm = data
        } else {
          this.germplasm = []
        }
      })
    }
  },
  created: function () {
    if (this.tableFiltering && this.tableFiltering.length > 0) {
      this.filterOn = this.filterOn.concat(this.tableFiltering)
      this.$store.dispatch('ON_TABLE_FILTERING_CHANGED', null)
    }
  },
  mounted: function () {
    this.$store.dispatch('ON_HELP_KEY_CHANGED', 'helpGermplasm')
  }
}
</script>

<style>
</style>
