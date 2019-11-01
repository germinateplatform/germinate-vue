<template>
  <div>
    <p class="text-info"><i class="mdi mdi-18px fix-alignment mdi-information-outline" /> {{ $t('pageMapExportOptionDescription') }}</p>
    <b-card no-body v-if="chromosomes && chromosomes.length > 0">
      <b-tabs card v-model="tabIndex">
        <b-tab :title="$t('pageMapExportOptionChromosomes')">
          <b-form-group
            :label="$t('formLabelMapExportChromosomeSelection')"
            label-for="chromosomes">
            <b-form-checkbox-group id="chromosomes" v-model="selectedChromosomes" :options="chromosomes" stacked/>
          </b-form-group>
        </b-tab>
        <b-tab :title="$t('pageMapExportOptionRegions')">
          <p>{{ $t('pageMapExportRegionDescription') }}</p>
          <v-client-table :columns="columns" :options="options" v-model="regions">
            <b-select slot="chromosome" slot-scope="{row, update}"  :options="chromosomes" v-model="row.chromosome" @change="update" />
            <b-input slot="start" type="number" :min="0" slot-scope="{row, update}" v-model.number="row.start" @change="update" />
            <b-input slot="end" type="number" :min="0" slot-scope="{row, update}" v-model.number="row.end" @change="update" />
            <b-button slot="delete" slot-scope="props" variant="outline-danger" size="sm" v-b-tooltip.hover :title="$t('buttonDelete')" @click="deleteRegion(props.row)"><i class="mdi mdi-18px mdi-delete" /></b-button>
          </v-client-table>
          <b-button @click="addRegion()" v-b-tooltip.hover :title="$t('tooltipMapExportRegionAdd')"><i class="mdi mdi-18px mdi-table-row-plus-after" /></b-button>
        </b-tab>
        <b-tab :title="$t('pageMapExportOptionMarkerInterval')">
          <p>{{ $t('pageMapExportMarkerIntervalDescription') }}</p>
          <b-row>
            <b-col xs=12 sm=6>
              <b-form-group
                :label="$t('formLabelMapExportIntervalFirstMarker')"
                label-for="first-marker">
                <Autocomplete id="first-marker" :search="getMarkers" :placeholder="$t('inputPlaceholderMarkerNameAutocomplete')" :get-result-value="extractMarkerName" @submit="setIntervalMarkerOne" />
              </b-form-group>
            </b-col>
            <b-col xs=12 sm=6>
              <b-form-group
                :label="$t('formLabelMapExportIntervalSecondMarker')"
                label-for="second-marker">
                <Autocomplete id="second-marker" :search="getMarkers" :placeholder="$t('inputPlaceholderMarkerNameAutocomplete')" :get-result-value="extractMarkerName" @submit="setIntervalMarkerTwo" />
              </b-form-group>
            </b-col>
          </b-row>
        </b-tab>
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
                <Autocomplete id="radius-marker" :search="getMarkers" :placeholder="$t('inputPlaceholderMarkerNameAutocomplete')" :get-result-value="extractMarkerName" @submit="setRadiusMarker" />
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
    </b-card>
  </div>
</template>

<script>
import Autocomplete from '@trevoreyre/autocomplete-vue'

export default {
  props: {
    mapId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      tabIndex: 0,
      chromosomes: [],
      selectedChromosomes: [],
      regions: [],
      radius: {
        markerId: null,
        left: 0,
        right: 0
      },
      intervalMarkerIdOne: null,
      intervalMarkerIdTwo: null,
      columns: ['chromosome', 'start', 'end', 'delete'],
      options: {
        skin: 'table table-striped table-hover',
        texts: this.getPaginationTexts(),
        filterByColumn: true,
        perPage: 1000,
        headings: {
          chromosome: () => this.$t('tableColumnMapExportRegionChromosome'),
          start: () => this.$t('tableColumnMapExportRegionStart'),
          end: () => this.$t('tableColumnMapExportRegionEnd'),
          delete: () => this.$t('tableColumnMapExportRegionDelete')
        },
        perPageValues: [],
        pagination: {
          chunk: 5
        },
        multiSorting: {
          chromosome: [
            {
              column: 'start',
              matchDir: true
            }
          ]
        },
        orderBy: {
          column: 'chromosome'
        }
      }
    }
  },
  components: {
    Autocomplete
  },
  methods: {
    setRadiusMarker: function (marker) {
      this.radius.markerId = marker.markerId
    },
    setIntervalMarkerOne: function (marker) {
      this.intervalMarkerIdOne = marker.markerId
    },
    setIntervalMarkerTwo: function (marker) {
      this.intervalMarkerIdTwo = marker.markerId
    },
    getMethod: function () {
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
    },
    getExportOptions: function () {
      var result = {
        method: this.getMethod()
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
      const id = this.regions.length < 1 ? 1 : (Math.max.apply(Math, this.regions.map(r => r.id)) + 1)
      if (region) {
        region.id = id
        this.regions = this.regions.filter(r => r.start !== r.end)
        this.regions.push(region)

        this.$nextTick(() => {
          this.tabIndex = 1
        })
      } else {
        this.regions.push({
          id: id,
          chromosome: this.chromosomes[0],
          start: 0,
          end: 0
        })
      }
    },
    extractMarkerName: function (result) {
      return result.markerName
    },
    getMarkers: function (input) {
      if (input.length < 3) {
        return []
      } else {
        return new Promise(resolve => {
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
            resolve(result.data)
          })
        })
      }
    }
  },
  mounted: function () {
    this.apiGetMapChromosomes(this.mapId, result => {
      this.chromosomes = result

      if (result && result.length > 0) {
        this.addRegion()
      }
    })
  }
}
</script>

<style>

</style>
