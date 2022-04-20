<template>
  <div>
    <p class="text-info"><MdiIcon :path="mdiInformationOutline" /> {{ $t('pageMapExportOptionDescription') }}</p>
    <b-card no-body v-if="chromosomes && chromosomes.length > 0">
      <b-tabs card v-model="tabIndex">
        <!-- Chromosomes -->
        <b-tab :title="$t('pageMapExportOptionChromosomes')">
          <b-form-group
            :label="$t('formLabelMapExportChromosomeSelection')"
            label-for="chromosomes">
            <b-form-select v-model="selectedChromosomes" :options="chromosomes" :select-size="7" multiple />
          </b-form-group>
        </b-tab>
        <!-- Regions -->
        <b-tab :title="$t('pageMapExportOptionRegions')" class="base-table">
          <p>{{ $t('pageMapExportRegionDescription') }}</p>
          <b-table :fields="columns"
                   :items="regions"
                   head-variant="dark"
                   striped
                   responsive
                   hover
                   outlined
                   show-empty
                   sort-by="chromosome">
            <template v-slot:cell(chromosome)="data">
              <b-select :options="chromosomes" v-model="data.item.chromosome" @change="setRegionChromosome($event, props.index)" />
            </template>
            <template v-slot:cell(start)="data">
              <b-input type="number" :min="0" v-model="data.item.start" @change="setRegionStart($event, props.index)" />
            </template>
            <template v-slot:cell(end)="data">
              <b-input type="number" :min="0" v-model="data.item.end" @change="setRegionEnd($event, props.index)"/>
            </template>
            <template v-slot:cell(delete)="data">
              <b-button variant="outline-danger" size="sm" v-b-tooltip.hover :title="$t('buttonDelete')" @click="deleteRegion(data.item)"><MdiIcon :path="mdiDelete" /></b-button>
            </template>
          </b-table>
          <b-button @click="addRegion()" v-b-tooltip.hover :title="$t('tooltipMapExportRegionAdd')"><MdiIcon :path="mdiTableRowPlusAfter" /></b-button>
        </b-tab>
        <!-- Marker interval -->
        <b-tab :title="$t('pageMapExportOptionMarkerInterval')">
          <p>{{ $t('pageMapExportMarkerIntervalDescription') }}</p>
          <b-row>
            <b-col xs=12 sm=6>
              <b-form-group
                :label="$t('formLabelMapExportIntervalFirstMarker')"
                label-for="first-marker">
                <MarkerLookup id="first-marker" @change="markerId => { intervalMarkerIdOne = markerId }"/>
              </b-form-group>
            </b-col>
            <b-col xs=12 sm=6>
              <b-form-group
                :label="$t('formLabelMapExportIntervalSecondMarker')"
                label-for="second-marker">
                <MarkerLookup id="second-marker" @change="markerId => { intervalMarkerIdTwo = markerId }"/>
              </b-form-group>
            </b-col>
          </b-row>
        </b-tab>
        <!-- Marker radius -->
        <b-tab :title="$t('pageMapExportOptionMarkerRadius')">
          <p>{{ $t('pageMapExportMarkerRadiusDescription') }}</p>
          <b-row>
            <b-col xs=12 sm=4>
              <b-form-group
                :label="$t('formLabelMapExportRadiusOffsetLeft')"
                label-for="offset-left">
                <b-input type="number" id="offset-left" :min="0" v-model.number="radius.left" />
              </b-form-group>
            </b-col>
            <b-col xs=12 sm=4>
              <b-form-group
                :label="$t('formLabelMapExportRadiusMarker')"
                label-for="radius-marker">
                <MarkerLookup id="radius-marker" @change="markerId => { radius.markerId = markerId }"/>
              </b-form-group>
            </b-col>
            <b-col xs=12 sm=4>
              <b-form-group
                :label="$t('formLabelMapExportRadiusOffsetRight')"
                label-for="offset-right">
                <b-input type="number" id="offset-right" :min="0" v-model.number="radius.right" />
              </b-form-group>
            </b-col>
          </b-row>
        </b-tab>
      </b-tabs>
      <template v-slot:footer>
        <span class="text-muted">{{ $t('pageMapExportDownloadCloseAdvancedOptions') }}</span>
      </template>
    </b-card>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import MarkerLookup from '@/components/util/MarkerLookup'
import genotypeApi from '@/mixins/api/genotype.js'

import { mdiInformationOutline, mdiDelete, mdiTableRowPlusAfter } from '@mdi/js'

export default {
  props: {
    mapId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      mdiTableRowPlusAfter,
      mdiDelete,
      mdiInformationOutline,
      tabIndex: 0,
      chromosomes: [],
      selectedChromosomes: [],
      regions: [],
      markers: [],
      radius: {
        markerId: null,
        left: 0,
        right: 0
      },
      intervalMarkerIdOne: null,
      intervalMarkerIdTwo: null
    }
  },
  computed: {
    columns: function () {
      return [
        {
          key: 'chromosome',
          sortable: true,
          label: this.$t('tableColumnMapExportRegionChromosome')
        }, {
          key: 'start',
          sortable: true,
          label: this.$t('tableColumnMapExportRegionStart')
        }, {
          key: 'end',
          sortable: true,
          label: this.$t('tableColumnMapExportRegionEnd')
        }, {
          key: 'delete',
          sortable: true,
          label: this.$t('tableColumnMapExportRegionDelete'),
          class: 'text-right'
        }
      ]
    },
    method: function () {
      switch (this.tabIndex) {
        case 0:
          return 'chromosomes'
        case 1:
          return 'regions'
        case 2:
          return 'markerIdInterval'
        case 3:
          return 'radius'
        default:
          return null
      }
    }
  },
  components: {
    MdiIcon,
    MarkerLookup
  },
  mixins: [genotypeApi],
  methods: {
    setRegionChromosome: function (event, index) {
      index -= 1
      this.regions[index].chromosome = event
    },
    setRegionStart: function (event, index) {
      index -= 1
      this.regions[index].start = parseFloat(event)
    },
    setRegionEnd: function (event, index) {
      index -= 1
      this.regions[index].end = parseFloat(event)
    },
    getExportOptions: function () {
      const result = {
        method: this.method
      }

      switch (result.method) {
        case 'regions':
          if (!this.regions || this.regions.length < 1) {
            return null
          }

          result.regions = JSON.parse(JSON.stringify(this.regions))
          result.regions.forEach(r => {
            r.start = parseFloat(r.start)
            r.end = parseFloat(r.end)
            delete r.id
          })
          break
        case 'chromosomes':
          if (!this.selectedChromosomes || this.selectedChromosomes.length < 1) {
            return null
          }

          result.chromosomes = this.selectedChromosomes
          break
        case 'markerIdInterval':
          if (!this.intervalMarkerIdOne || !this.intervalMarkerIdTwo) {
            return null
          }

          result.markerIdInterval = [this.intervalMarkerIdOne, this.intervalMarkerIdTwo]
          break
        case 'radius':
          if (!this.radius || !this.radius.markerId || this.radius.left === null || this.radius.right === null) {
            return null
          }

          result.radius = this.radius
          break
      }

      return result
    },
    deleteRegion: function (row) {
      this.regions = this.regions.filter(r => r.id !== row.id)
    },
    addRegion: function (region) {
      // Set the id (required by the table) to the current maximum plus 1
      const id = this.regions.length < 1 ? 1 : (Math.max.apply(Math, this.regions.map(r => r.id)) + 1)

      if (region) {
        // If a region has been specified, set the id
        region.id = id
        // Then remove regions where start === end (e.g. automatically added ones)
        this.regions = this.regions.filter(r => r.start !== r.end)
        // Add the region
        this.regions.push(region)

        // Activate the tab
        this.$nextTick(() => {
          this.tabIndex = 1
        })
      } else {
        // Just push a new empty region
        this.regions.push({
          id: id,
          chromosome: this.chromosomes[0],
          start: 0,
          end: 0
        })
      }
    },
    getMarkers: function (input) {
      if (input.length < 3) {
        this.markers = []
        return this.markers
      } else {
        return new Promise(resolve => {
          // Ask for markers like the given input
          const query = {
            filter: [{
              column: 'markerName',
              comparator: 'contains',
              operator: 'and',
              values: [input]
            }],
            page: 1,
            ascending: 1,
            orderBy: 'markerName',
            limit: this.MAX_JAVA_INTEGER
          }

          this.apiPostMarkerTable(query, result => {
            // Resolve the result
            this.markers = result.data
            resolve(this.markers)
          })
        })
      }
    }
  },
  mounted: function () {
    this.apiGetMapChromosomes(this.mapId, result => {
      this.chromosomes = result

      // Add an initial region for easier editing
      if (result && result.length > 0) {
        this.addRegion()
      }
    })
  }
}
</script>

<style>
.base-table table th[aria-sort="none"] {
  padding-right: 0.75em !important;
  background-image: none !important;
}

img.mime-icon {
  height: 24px;
  width: 24px;
}
</style>
