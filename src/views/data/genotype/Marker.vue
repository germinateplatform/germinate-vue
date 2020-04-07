<template>
  <div>
    <h1>{{ $t('pageMarkerDetailsTitle') }}</h1>
    <hr/>

    <template v-if="marker">
      <h2 class="mdi-heading" id="mcpd">
        <span>{{ marker.markerName }}</span>
        <i :class="'mdi mdi-36px text-primary passport-checkbox ' + getMarkedStyle()" @click="onToggleMarked()" v-b-tooltip.hover :title="$t('tooltipMarkerMarkedItem')"/>
      </h2>
      <p>{{ $t('pageMarkerDetailsText') }}</p>

      <template v-if="marker.markerSynonyms && marker.markerSynonyms.length > 0">
        <h3>{{ $t('pageMarkerDetailsSynonymsTitle') }}</h3>
        <ul>
          <li v-for="(synonym, index) in marker.markerSynonyms" :key="`marker-synonym-${index}`">
            {{ synonym }}
          </li>
        </ul>
      </template>

      <hr/>
      <h3>{{ $t('pageMarkerDetailsDatasetsTitle') }}</h3>
      <p>{{ $t('pageMarkerDetailsDatasetsText') }}</p>
      <!-- Datasets this marker is part of -->
      <DatasetTable :getData="getDatasetData" />

      <hr/>
      <h3>{{ $t('pageMarkerDetailsMapsTitle') }}</h3>
      <p>{{ $t('pageMarkerDetailsMapsText') }}</p>
      <!-- Maps this marker is on -->
      <MapDefinitionTable :filterOn="getFilter()" :getData="getMapDefinitionData" :getIds="getMapDefinitionIds" />

      <hr />
      <h3>{{ $t('pageMarkerDetailsGroupsTitle') }}</h3>
      <p>{{ $t('pageMarkerDetailsGroupsText') }}</p>
      <!-- Groups this marker is in -->
      <GroupTable :getData="getGroupData" />
    </template>
    <h3 v-else-if="noData === true">{{ $t('pageMarkerDetailsNoMarkerWithIdFound', { markerId: currentMarkerId }) }}</h3>
  </div>
</template>

<script>
import DatasetTable from '@/components/tables/DatasetTable'
import GroupTable from '@/components/tables/GroupTable'
import MapDefinitionTable from '@/components/tables/MapDefinitionTable'
import genotypeApi from '@/mixins/api/genotype.js'

export default {
  props: {
    markerId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      currentMarkerId: null,
      marker: null,
      noData: false
    }
  },
  components: {
    DatasetTable,
    GroupTable,
    MapDefinitionTable
  },
  mixins: [ genotypeApi ],
  methods: {
    getMarkedStyle: function () {
      const isMarked = this.markedIds.markers.indexOf(this.currentMarkerId) !== -1
      return isMarked ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'
    },
    onToggleMarked: function () {
      const isMarked = this.markedIds.markers.indexOf(this.currentMarkerId) !== -1
      if (isMarked) {
        this.$store.dispatch('ON_MARKED_IDS_REMOVE', { type: 'markers', ids: [this.currentMarkerId] })
      } else {
        this.$store.dispatch('ON_MARKED_IDS_ADD', { type: 'markers', ids: [this.currentMarkerId] })
      }
    },
    getFilter: function () {
      return [{
        column: {
          name: 'markerId',
          type: Number
        },
        comparator: 'equals',
        operator: 'and',
        canBeChanged: false,
        values: [this.currentMarkerId]
      }]
    },
    getDatasetData: function (data, callback) {
      return this.apiPostMarkerDatasetTable(this.currentMarkerId, data, callback)
    },
    getMapDefinitionData: function (data, callback) {
      return this.apiPostMapdefinitionTable(data, callback)
    },
    getMapDefinitionIds: function (data, callback) {
      return this.apiPostMapdefinitionTableIds(data, callback)
    },
    getGroupData: function (data, callback) {
      return this.apiPostMarkerGroupTable(this.currentMarkerId, data, callback)
    },
    getMarkerIdByName: function (name) {
      const query = {
        filter: [{
          column: 'markerName',
          comparator: 'equals',
          operator: 'and',
          values: [name]
        }],
        page: 1,
        limit: 1
      }
      this.apiPostMarkerTable(query, result => {
        if (result && result.data && result.data.length > 0) {
          this.currentMarkerId = result.data[0].markerId
          this.getMarker()
        }
      })
    },
    getMarker: function () {
      const request = {
        page: 1,
        limit: 1,
        filter: [{
          column: 'markerId',
          comparator: 'equals',
          operator: 'and',
          values: [this.currentMarkerId]
        }]
      }

      this.apiPostMarkerTable(request, result => {
        if (result && result.data && result.data.length > 0) {
          this.marker = result.data[0]
        } else {
          this.noData = true
        }
      })
    }
  },
  created: function () {
    var urlParam = this.$route.params.markerId

    if (this.markerId) {
      this.currentMarkerId = this.markerId
    } else if (urlParam) {
      const int = parseInt(urlParam)

      // If it's not a number, try and check of there's a marker with this name
      if (isNaN(int)) {
        this.getMarkerIdByName(urlParam)
      } else {
        this.currentMarkerId = int
      }
    }
  },
  mounted: function () {
    if (this.currentMarkerId) {
      this.getMarker()
    }
  }
}
</script>

<style>
.passport-checkbox:hover {
  cursor: pointer;
}
</style>
