<template>
  <div>
    <b-row>
      <b-col cols=12 md=6 >
        <!-- Germplasm group selection -->
        <ExportGroupSelection title="pageGenotypesExportSelectGermplasmGroupTitle"
                              text="pageGenotypesExportSelectGermplasmGroupText"
                              tooltip="pageExportSelectGroupTooltip"
                              :groups="germplasmGroups"
                              itemType="germplasm"
                              ref="germplasmGroups"
                              @change="updateGenotypeDatasetTable"/>
      </b-col>
      <b-col cols=12 md=6 >
        <!-- Marker group selection -->
        <ExportGroupSelection title="pageGenotypesExportSelectMarkerGroupTitle"
                              text="pageGenotypesExportSelectMarkerGroupText"
                              tooltip="pageExportSelectGroupTooltip"
                              :groups="markerGroups"
                              itemType="markers"
                              ref="markerGroups"
                              @change="updateGenotypeDatasetTable"/>
      </b-col>
    </b-row>
    <template v-if="datasetType === 'genotype' && datasetIds && datasetIds.length > 1">
      <h2 class="mt-3">{{ $t('pageGenotypesExportMultipleSubselectTitle') }}</h2>
      <p>{{ $t('pageGenotypesExportMultipleSubselectText') }}</p>
      <!-- Table showing the dataset summary table -->
      <GenotypeDatasetTable :getData="getGenotypeSummaryData" :getIds="null" :selectable="true" v-on:selection-changed="onSelectionChanged" ref="genotypeDatasetTable" />
    </template>
    <template v-if="(datasetIds && datasetIds.length === 1) || selectedDatasetIds.length > 0 || datasetType !== 'genotype'">
      <b-row class="mt-3">
        <b-col cols=12 md=6>
          <h2>{{ $t('pageGenotypesExportSelectMapTitle') }}</h2>
          <!-- Maps -->
          <b-form-group
              :label="$t('pageGenotypesExportSelectMapText')"
              label-for="map-selection"
              :class="maps === null ? 'loading-select' : ''">
            <b-progress :value="100" height="5px" variant="primary" striped animated v-if="maps === null" />
            <b-form-select id="map-selection" v-model="map" :options="mapOptions" />
          </b-form-group>
        </b-col>
        <b-col cols=12 md=6>
          <!-- Export Flapjack file? -->
          <h2>{{$t('pageGenotypesExportEnableFlapjackTitle') }}</h2>
          <p v-html="$t('pageGenotypesExportEnableFlapjackText')" />
          <b-form-checkbox v-model="generateFlapjackProject" switch>
            {{ generateFlapjackProject === true ? $t('genericYes') : $t('genericNo') }}
          </b-form-checkbox>
          <p><span class="text-muted" v-html="$t('pageExportFormatsFlapjackText')" />&nbsp;<router-link :to="{ name: 'about-export-formats-specific', params: { format: 'genotype' } }" v-b-modal.exportFormatModal @click.native.prevent.stop event="" v-b-tooltip.hover :title="$t('tooltipExportFormatLearnMore')"> <i class="mdi mdi-18px fix-alignment mdi-information-outline"/></router-link> </p>
          <template v-if="datasetType === 'genotype'">
            <h2>{{$t('pageGenotypesExportEnableHapmapTitle') }}</h2>
            <p><span v-html="$t('pageGenotypesExportEnableHapmapText')" /> &nbsp;<router-link :to="{ name: 'about-export-formats-specific', params: { format: 'genotype' } }" v-b-modal.exportFormatModal @click.native.prevent.stop event="" v-b-tooltip.hover :title="$t('tooltipExportFormatLearnMore')"> <i class="mdi mdi-18px fix-alignment mdi-information-outline"/></router-link></p>
            <b-form-checkbox v-model="generateHapMap" switch>
              {{ generateHapMap === true ? $t('genericYes') : $t('genericNo') }}
            </b-form-checkbox>
          </template>
        </b-col>
      </b-row>
      <b-button variant="primary" @click="exportData()"><i class="mdi mdi-18px mdi-arrow-right-box fix-alignment"/> {{ datasetType === 'allelefreq' ? $t('buttonBinData') : $t('buttonExport') }}</b-button>
    </template>
    <h2 class="text-info" v-if="datasetType === 'genotype' && selectedDatasetIds.length < 1">{{ $t('widgetGenotypeDatasetSelectionSelect') }}</h2>

    <!-- Optional content goes here -->
    <slot name="optionalContent" />

    <template v-if="exportStarted">
      <DatasetMetadataDownload :datasetIds="selectedDatasetIds" datasetType="genotype" />
    </template>

    <!-- Modal showing information about export formats -->
    <b-modal id="exportFormatModal" size=xl hide-footer>
      <ExportFormats tag="genotype" />
    </b-modal>
  </div>
</template>

<script>
import { EventBus } from '@/plugins/event-bus.js'
import DatasetMetadataDownload from '@/components/util/DatasetMetadataDownload'
import ExportFormats from '@/views/about/ExportFormats'
import ExportGroupSelection from '@/components/export/ExportGroupSelection'
import GenotypeDatasetTable from '@/components/tables/GenotypeDatasetTable'
import datasetApi from '@/mixins/api/dataset.js'
import groupApi from '@/mixins/api/group.js'
import genotypeApi from '@/mixins/api/genotype.js'

export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => null
    },
    datasetType: {
      type: String,
      default: null
    }
  },
  data: function () {
    return {
      markerGroups: null,
      germplasmGroups: null,
      maps: null,
      mapOptions: [],
      map: null,
      generateFlapjackProject: false,
      generateHapMap: false,
      selectedDatasetIds: [],
      exportStarted: false
    }
  },
  watch: {
    datasetIds: function () {
      this.updateGermplasmGroups()
      this.updateMarkerGroups()
      this.updateMaps()
    }
  },
  components: {
    DatasetMetadataDownload,
    ExportFormats,
    ExportGroupSelection,
    GenotypeDatasetTable
  },
  mixins: [ datasetApi, groupApi, genotypeApi ],
  methods: {
    onSelectionChanged: function (selectedIds) {
      this.selectedDatasetIds = selectedIds
    },
    updateGenotypeDatasetTable: function () {
      if (this.$refs.genotypeDatasetTable) {
        this.$nextTick(() => this.$refs.genotypeDatasetTable.refresh())
      }
    },
    getGenotypeSummaryData: function (query) {
      const combinedQuery = Object.assign({}, query, this.getQuery(false))

      return this.apiPostGenotypeDatasetSummary(combinedQuery, result => {
        if (this.$refs.genotypeDatasetTable) {
          this.$nextTick(() => this.$refs.genotypeDatasetTable.setSelectedItems(result.data.map(d => d.datasetId)))
        }
      })
    },
    downloadMetadata: function () {
      EventBus.$emit('show-loading', true)
      const request = {
        datasetIds: this.selectedDatasetIds
      }
      this.apiPostDatasetAttributeExport(request, result => {
        const downloadRequext = {
          blob: result,
          filename: this.datasetType + '-dataset-metadata-' + this.selectedDatasetIds.join('-'),
          extension: 'txt'
        }

        this.downloadBlob(downloadRequext)
        EventBus.$emit('show-loading', false)
      })
    },
    getQuery: function (isFinal) {
      let query = {
        xGroupIds: null,
        xIds: null,
        yGroupIds: null,
        yIds: null,
        datasetIds: isFinal ? this.selectedDatasetIds : this.datasetIds,
        mapId: this.map,
        generateFlapjackProject: this.generateFlapjackProject,
        generateHapMap: this.generateHapMap
      }

      const germplasmSettings = this.$refs.germplasmGroups.getSettings()
      const markedSelectedGermplasm = germplasmSettings.selectedGroups.filter(g => g === null)
      if (germplasmSettings.specialGroupSelection !== 'all' && markedSelectedGermplasm.length > 0) {
        query.yIds = this.markedGermplasm
      }
      const germplasmGroups = germplasmSettings.selectedGroups.filter(g => g !== null && g.groupId > 0).map(g => g.groupId)
      if (germplasmSettings.specialGroupSelection !== 'all' && germplasmGroups.length > 0) {
        query.yGroupIds = germplasmGroups
      }

      const markerSettings = this.$refs.markerGroups.getSettings()
      const markedSelectedMarkers = markerSettings.selectedGroups.filter(g => g === null)
      if (markerSettings.specialGroupSelection !== 'all' && markedSelectedMarkers.length > 0) {
        query.xIds = this.markedMarkers
      }
      const markerGroups = markerSettings.selectedGroups.filter(g => g !== null && g.groupId > 0).map(g => g.groupId)
      if (markerSettings.specialGroupSelection !== 'all' && markerGroups.length > 0) {
        query.xGroupIds = markerGroups
      }

      return query
    },
    exportData: function (binningConfig) {
      EventBus.$emit('show-loading', true)
      const query = this.getQuery(true)

      if (this.datasetType === 'genotype') {
        this.$ga.event('export', 'async', 'genotype', query.datasetIds.join('-'))
        this.apiPostGenotypeDatasetExport(query, result => {
          if (result) {
            result.forEach(r => this.$store.commit('ON_ASYNC_JOB_UUID_ADD_MUTATION', r.uuid))
          }

          EventBus.$emit('toggle-aside', 'download')
          EventBus.$emit('show-loading', false)
          this.exportStarted = true
        })
      } else if (this.datasetType === 'allelefreq') {
        if (binningConfig) {
          query.config = binningConfig
          this.$ga.event('export', 'async', 'allelefreq', query.datasetIds.join('-'))
          this.apiPostAlleleFrequencyDatasetExport(query, result => {
            this.$store.commit('ON_ASYNC_JOB_UUID_ADD_MUTATION', result.uuid)

            EventBus.$emit('toggle-aside', 'download')
            EventBus.$emit('show-loading', false)
            this.exportStarted = true
          })
        } else {
          this.apiPostDatasetExport('allelefreq/histogram', query, result => {
            this.$emit('on-file-loaded', result)

            EventBus.$emit('show-loading', false)
          })
        }
      }
    },
    updateMarkerGroups: function () {
      const request = {
        datasetIds: this.datasetIds,
        groupType: 'markers',
        datasetType: this.datasetType
      }
      this.apiPostDatasetGroups(request, result => {
        this.markerGroups = result
      })
    },
    updateGermplasmGroups: function () {
      const request = {
        datasetIds: this.datasetIds,
        groupType: 'germinatebase',
        datasetType: this.datasetType
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
        this.maps = result
        this.mapOptions = []
        this.map = null

        if (result && result.length > 0) {
          result.forEach(m => {
            let name = m.mapName

            if (m.markerCount) {
              name += ` (${m.markerCount})`
            }

            this.mapOptions.push({
              text: name,
              value: m.mapId
            })
          })

          // Pre-select the map with the highest number of markers
          this.map = result.reduce((max, map) => max.markerCount > map.markerCount ? max : map).mapId
        }
      })
    }
  },
  mounted: function () {
    if (this.datasetIds) {
      if (this.datasetIds.length === 1) {
        this.selectedDatasetIds = this.datasetIds
      }
      this.updateGermplasmGroups()
      this.updateMarkerGroups()
      this.updateMaps()
    }
  }
}
</script>

<style>
.loading-select > div > *:first-child {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.loading-select > div > *:last-child {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.group-select > option:first-child {
  border-bottom: 1px solid;
}
</style>
