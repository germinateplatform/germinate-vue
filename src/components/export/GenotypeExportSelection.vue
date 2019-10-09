<template>
  <div>
    <b-row>
      <b-col cols=12 md=6 v-if="germplasmGroups && germplasmGroups.length > 0">
        <ExportGroupSelection title="pageGenotypesExportSelectGermplasmGroupTitle" text="pageGenotypesExportSelectGermplasmGroupText" tooltip="pageExportSelectGroupTooltip" :groups="germplasmGroups" itemType="germplasm" ref="germplasmGroups"/>
      </b-col>
      <b-col cols=12 md=6 v-if="markerGroups && markerGroups.length > 0">
        <ExportGroupSelection title="pageGenotypesExportSelectMarkerGroupTitle" text="pageGenotypesExportSelectMarkerGroupText" tooltip="pageExportSelectGroupTooltip" :groups="markerGroups" itemType="markers" ref="markerGroups"/>
      </b-col>
    </b-row>
    <b-row class="mt-3">
      <b-col cols=12 md=6>
        <h2>{{ $t('pageGenotypesExportSelectMapTitle') }}</h2>
        <b-form-group
            :label="$t('pageGenotypesExportSelectMapText')"
            label-for="map-selection">
          <b-form-select id="map-selection" v-model="map" :options="maps" />
        </b-form-group>
      </b-col>
      <b-col cols=12 md=6>
        <h2>{{$t('pageGenotypesExportEnableFlapjackTitle') }}</h2>
        <p v-html="$t('pageGenotypesExportEnableFlapjackText')" />
        <b-form-checkbox v-model="generateFlapjackProject" switch>
          {{ generateFlapjackProject === true ? $t('genericYes') : $t('genericNo') }}
        </b-form-checkbox>
      </b-col>
    </b-row>
    <b-button variant="primary" @click="exportData"><i class="mdi mdi-18px mdi-arrow-right-box fix-alignment"/> Export</b-button>
  </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus.js'
import ExportGroupSelection from '@/components/export/ExportGroupSelection'

export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => null
    }
  },
  data: function () {
    return {
      markerGroups: [],
      germplasmGroups: [],
      maps: [],
      map: null,
      generateFlapjackProject: false
    }
  },
  watch: {
    datasetIds: function (newValue, oldValue) {
      this.updateGermplasmGroups()
      this.updateMarkerGroups()
      this.updateMaps()
    }
  },
  components: {
    ExportGroupSelection
  },
  methods: {
    exportData: function () {
      EventBus.$emit('show-loading', true)
      var query = {
        xGroupIds: null,
        xIds: null,
        yGroupIds: null,
        yIds: null,
        datasetIds: this.datasetIds,
        mapId: this.map,
        generateFlapjackProject: this.generateFlapjackProject
      }

      var germplasmSettings = this.$refs.germplasmGroups.getSettings()
      var markedSelectedGermplasm = germplasmSettings.selectedGroups.filter(g => g.isMarkedItem === true)
      if (germplasmSettings.specialGroupSelection !== 'all' && markedSelectedGermplasm.length > 0) {
        query.yIds = this.markedIds.germplasm
      }
      var germplasmGroups = germplasmSettings.selectedGroups.filter(g => g.groupId > 0).map(g => g.groupId)
      if (germplasmSettings.specialGroupSelection !== 'all' && germplasmGroups.length > 0) {
        query.yGroupIds = germplasmGroups
      }

      var markerSettings = this.$refs.germplasmGroups.getSettings()
      var markedSelected = markerSettings.selectedGroups.filter(g => g.isMarkedItem === true)
      if (markerSettings.specialGroupSelection !== 'all' && markedSelected.length > 0) {
        query.xIds = this.markedIds.germplasm
      }
      var markerGroups = markerSettings.selectedGroups.filter(g => g.groupId > 0).map(g => g.groupId)
      if (markerSettings.specialGroupSelection !== 'all' && markerGroups.length > 0) {
        query.xGroupIds = markerGroups
      }

      this.apiPostGenotypeDatasetExport(query, result => {
        this.$store.commit('ON_ASYNC_JOB_UUID_ADD_MUTATION', result.uuid)

        EventBus.$emit('toggle-aside')

        EventBus.$emit('show-loading', false)
      })
    },
    updateMarkerGroups: function () {
      const request = {
        datasetIds: this.datasetIds,
        groupType: 'markers',
        experimentType: 'genotype'
      }
      this.apiPostDatasetGroups(request, result => {
        this.markerGroups = result
      })
    },
    updateGermplasmGroups: function () {
      const request = {
        datasetIds: this.datasetIds,
        groupType: 'germinatebase',
        experimentType: 'genotype'
      }
      this.apiPostDatasetGroups(request, result => {
        this.germplasmGroups = result
      })
    },
    updateMaps: function () {
      const request = {
        datasetIds: this.datasetIds,
        page: 1,
        limit: this.MAX_JAVA_INTEGER
      }
      this.apiPostDatasetMapTable(request, result => {
        this.maps = []
        this.map = null

        if (result.data && result.data.length > 0) {
          result.data.forEach(m => {
            var name = m.mapName

            if (m.markerCount) {
              name += ` (${m.markerCount})`
            }

            this.maps.push({
              text: name,
              value: m.mapId
            })
          })

          this.map = result.data[0].mapId
        }
      })
    }
  },
  mounted: function () {
    if (this.datasetIds) {
      this.updateGermplasmGroups()
      this.updateMarkerGroups()
      this.updateMaps()
    }
  }
}
</script>

<style>
.group-select > option:first-child {
  border-bottom: 1px solid;
}
</style>
